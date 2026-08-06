// 책임: HTTP 헬스체크와 Socket.io 릴레이, 그리고 경기 기록 append. 판정 로직은 넣지 않는다.
// 방 상태는 rooms.js의 메모리 Map에만 들고, 기록만 db.js를 통해 남는다.
//
// **기록 쓰기는 서버가 한다.** 폰이 점수를 직접 써넣는 경로를 열지 않는다. 서버는 arena가
// 이미 확정해 보낸 RESULT를 중계하는 김에 그대로 받아 적기만 한다(계산하지 않는다).
// 신원은 그 방 컨트롤러 소켓의 httpOnly 쿠키에서 온다.

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { MSG, ROLE } from '../../shared/protocol.js';
import { createRoom, joinRoom, leaveRoom, getRoom, peerOf, isPaired, roomCount, sweep, touch } from './rooms.js';
import { dbEnabled, initDb, insertRecord, listRecords } from './db.js';
import { ensureIdentity, identityFromHeaders } from './identity.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// dotenv 의존성 없이 .env를 읽는다. 파일이 없으면 조용히 넘어간다.
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.join(HERE, '..', '.env'));
  } catch {
    // .env 없음. 환경 변수와 기본값으로 진행한다.
  }
}

const PORT = Number(process.env.PORT) || 3001;
const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);
const ORIGINS = CORS_ORIGINS.length > 0 ? CORS_ORIGINS : DEFAULT_ORIGINS;

// SELECT(폰 유파 선택), FOCUS(훑는 중인 유파), RESULT(경기 결과)도 그대로 상대에게 중계한다.
// 서버는 내용을 해석하지 않는다.
const RELAY_TYPES = [MSG.CALIB, MSG.MOTION, MSG.ACTION, MSG.HAPTIC, MSG.STATE, MSG.SELECT, MSG.FOCUS, MSG.RESULT];
// 유휴 방 TTL이 10분이므로 스윕은 그보다 촘촘해야 실제 회수 지연이 짧다
const SWEEP_INTERVAL_MS = 1000 * 60;

const app = express();
// **프록시 뒤에서 secure 쿠키를 내려면 필요하다.** Render는 TLS를 앞단이 끝내고
// 뒤로는 평문으로 넘기므로, 이게 없으면 Express가 접속을 http로 보고 Secure를 거부한다
app.set('trust proxy', 1);
// credentials가 켜져야 쿠키가 오간다. origin이 정확히 일치해야 하므로 목록은 그대로 쓴다
app.use(cors({ origin: ORIGINS, credentials: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, records: dbEnabled() });
});

// 신원 발급. **앱이 소켓을 붙이기 전에 한 번 부른다.** 핸드셰이크는 이미 있는 쿠키만
// 실어 나르므로 여기서 먼저 쿠키가 생겨야 기록이 주인을 찾는다
app.get('/api/me', (req, res) => {
  ensureIdentity(req, res);
  res.json({ ok: true, records: dbEnabled() });
});

// 내 누적 기록. 신원은 쿠키에서만 읽는다(질의로 남의 것을 부를 방법이 없다)
app.get('/api/records', async (req, res) => {
  const id = ensureIdentity(req, res);
  if (!dbEnabled()) {
    res.json({ ok: true, records: [], enabled: false });
    return;
  }
  try {
    res.json({ ok: true, records: await listRecords(id), enabled: true });
  } catch (err) {
    console.log(`[db] 조회 실패 ${err.message}`);
    res.status(500).json({ ok: false, records: [], enabled: true });
  }
});

const server = http.createServer(app);
// 핸드셰이크가 쿠키를 실어 와야 기록이 주인을 찾는다. credentials가 그 스위치다
const io = new Server(server, { cors: { origin: ORIGINS, credentials: true } });

// socketId -> 쿠키 신원. 핸드셰이크에서 한 번 읽어 두고 끊길 때 지운다.
// **소켓에 신원을 실어 나르는 유일한 통로다.** 앱이 보내는 값이 아니라 쿠키에서 온다
const identityOf = new Map();

io.on('connection', (socket) => {
  socket.data.role = null;
  socket.data.code = null;
  const who = identityFromHeaders(socket.handshake.headers);
  if (who) identityOf.set(socket.id, who);

  socket.on(MSG.HELLO, (payload = {}) => {
    const role = payload.role;

    if (role === ROLE.ARENA) {
      const room = createRoom(socket.id);
      socket.data.role = ROLE.ARENA;
      socket.data.code = room.code;
      socket.join(room.code);
      socket.emit(MSG.ROOM, { code: room.code });
      return;
    }

    if (role === ROLE.CONTROLLER) {
      // SERVER.md는 hello의 방 코드 필드를 room으로 규정한다. code는 기존 골격 호환용.
      const { room, reason } = joinRoom(payload.room ?? payload.code, socket.id);
      if (!room) {
        socket.emit(MSG.ERROR, { reason });
        return;
      }
      socket.data.role = ROLE.CONTROLLER;
      socket.data.code = room.code;
      socket.join(room.code);
      socket.emit(MSG.ROOM, { code: room.code });
      if (isPaired(room)) io.to(room.code).emit(MSG.PAIRED, {});
      return;
    }

    socket.emit(MSG.ERROR, { reason: 'bad_role' });
  });

  // 같은 방 상대에게 그대로 중계한다. 내용을 해석하지 않는다.
  for (const type of RELAY_TYPES) {
    socket.on(type, (payload) => {
      const code = socket.data.code;
      if (!code) return;
      const room = getRoom(code);
      if (!peerOf(room, socket.id)) return;
      touch(room);
      socket.to(code).emit(type, payload);
      // **중계가 먼저다.** 기록은 그 뒤의 부수효과라 실패해도 화면이 멈추지 않는다
      if (type === MSG.RESULT && socket.data.role === ROLE.ARENA) saveResult(room, payload);
    });
  }

  // 재접속에 밀려난 소켓은 leaveRoom이 방을 못 찾으므로 peer_left가 새 소켓을 끊지 않는다.
  socket.on('disconnect', () => {
    identityOf.delete(socket.id);
    const { room } = leaveRoom(socket.id);
    if (!room) return;
    io.to(room.code).emit(MSG.PEER_LEFT, {});
  });
});

/**
 * 경기 결과 한 판을 그 방 플레이어(컨트롤러)의 이름으로 남긴다.
 * **arena가 보낸 것만 받는다.** 폰이 RESULT를 흉내 내도 위 호출 조건에서 걸러진다.
 * 실패는 로그로 끝낸다. 기록이 안 남는 것이 경기를 끊는 것보다 낫다.
 */
function saveResult(room, payload) {
  if (!dbEnabled() || !room) return;
  const id = identityOf.get(room.controllerId);
  if (!id) return;
  insertRecord(id, payload).catch((err) => console.log(`[db] 기록 실패 ${err.message}`));
}

const sweeper = setInterval(() => {
  const removed = sweep();
  if (removed > 0) console.log(`[rooms] 만료 방 ${removed}개 정리. 남은 방 ${roomCount()}개`);
}, SWEEP_INTERVAL_MS);
sweeper.unref();

await initDb();

server.listen(PORT, () => {
  console.log(`[server] 포트 ${PORT} 대기중`);
  console.log(`[server] 허용 오리진: ${ORIGINS.join(', ')}`);
});
