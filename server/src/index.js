// 책임: HTTP 헬스체크와 Socket.io 릴레이. 판정 로직은 넣지 않는다.
// 상태는 rooms.js의 메모리 Map에만 든다.

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { MSG, ROLE } from '../../shared/protocol.js';
import { createRoom, joinRoom, leaveRoom, getRoom, peerOf, isPaired, roomCount, sweep } from './rooms.js';

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

const RELAY_TYPES = [MSG.CALIB, MSG.MOTION, MSG.ACTION, MSG.HAPTIC, MSG.STATE];
const SWEEP_INTERVAL_MS = 1000 * 60 * 10;

const app = express();
app.use(cors({ origin: ORIGINS }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ORIGINS } });

io.on('connection', (socket) => {
  socket.data.role = null;
  socket.data.code = null;

  socket.on(MSG.HELLO, (payload = {}) => {
    const role = payload.role;

    if (role === ROLE.ARENA) {
      const room = createRoom(socket.id);
      socket.data.role = ROLE.ARENA;
      socket.data.code = room.code;
      socket.join(room.code);
      socket.emit(MSG.ROOM, { ok: true, code: room.code });
      return;
    }

    if (role === ROLE.CONTROLLER) {
      const { room, reason } = joinRoom(payload.code, socket.id);
      if (!room) {
        socket.emit(MSG.ROOM, { ok: false, code: payload.code ?? null, reason });
        return;
      }
      socket.data.role = ROLE.CONTROLLER;
      socket.data.code = room.code;
      socket.join(room.code);
      socket.emit(MSG.ROOM, { ok: true, code: room.code });
      io.to(room.code).emit(MSG.PAIRED, { paired: isPaired(room), code: room.code });
      return;
    }

    socket.emit(MSG.ROOM, { ok: false, code: null, reason: 'bad_role' });
  });

  // 같은 방 상대에게 그대로 중계한다. 내용을 해석하지 않는다.
  for (const type of RELAY_TYPES) {
    socket.on(type, (payload) => {
      const code = socket.data.code;
      if (!code) return;
      const room = getRoom(code);
      if (!peerOf(room, socket.id)) return;
      socket.to(code).emit(type, payload);
    });
  }

  socket.on('disconnect', () => {
    const { room, closed } = leaveRoom(socket.id);
    if (!room) return;
    if (closed) {
      io.to(room.code).emit(MSG.PAIRED, { paired: false, code: room.code, reason: 'arena_left' });
      return;
    }
    io.to(room.code).emit(MSG.PAIRED, { paired: false, code: room.code, reason: 'controller_left' });
  });
});

const sweeper = setInterval(() => {
  const removed = sweep();
  if (removed > 0) console.log(`[rooms] 만료 방 ${removed}개 정리. 남은 방 ${roomCount()}개`);
}, SWEEP_INTERVAL_MS);
sweeper.unref();

server.listen(PORT, () => {
  console.log(`[server] 포트 ${PORT} 대기중`);
  console.log(`[server] 허용 오리진: ${ORIGINS.join(', ')}`);
});
