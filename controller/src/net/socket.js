// 책임: Socket.io 연결과 메시지 송수신. controller 역할로 접속한다 (C3).
//
// 서버 주소는 import.meta.env.VITE_SERVER_URL에서만 읽는다. 폴백 하드코딩을 두지 않는다.
// 주소가 비어 있으면 조용히 로컬로 붙는 대신 화면에 그 사실을 띄운다. 배포에서 틀린 주소로
// 붙는 것보다 안 붙는 것이 낫고, 안 붙는 이유가 보여야 고칠 수 있다.
//
// 메시지 타입은 shared/protocol.js의 MSG 상수만 쓴다. 문자열 리터럴 금지.
// 방 코드는 URL 파라미터와 메모리에만 둔다. localStorage 금지.
//
// **끊긴 동안의 입력은 버린다.** 큐에 쌓아 두었다가 재연결 때 쏟으면 낡은 찌르기가
// 몇 초 뒤에 판정에 꽂힌다. 그것이 사용자가 이해할 수 없는 유일한 실패 모드다.

import { io } from 'socket.io-client';
import { MSG, ROLE, toWireAction } from '../../../shared/protocol.js';
// cb 키에 result가 있어야 arena의 경기 결과를 받는다(B4).

/** 연결 상태. 화면 칩이 이 값 하나만 본다. */
export const LINK = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  JOINED: 'joined',
  PAIRED: 'paired',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};

/** 색 단독 구분 금지라 칩이 이 텍스트를 그대로 낸다. */
export const LINK_LABEL = {
  [LINK.IDLE]: '대기',
  [LINK.CONNECTING]: '연결 중',
  [LINK.JOINED]: '연결됨',
  [LINK.PAIRED]: '연결됨',
  [LINK.RECONNECTING]: '재접속 중',
  [LINK.ERROR]: '끊김',
};

/** 실패 사유. 화면이 사람 말로 바꿔 낸다. */
export const LINK_ERROR = {
  NO_URL: 'no_url',
  UNREACHABLE: 'unreachable',
  NOT_FOUND: 'not_found',
  BAD_ROLE: 'bad_role',
};

/**
 * 첫 연결 상한. 이걸 넘기면 스피너를 접고 실패로 확정한다.
 * socket.io는 기본값으로 영원히 재시도하는데 화면에서는 그것이 무한 스피너로 보인다.
 */
const CONNECT_TIMEOUT_MS = 8000;

export function serverUrl() {
  const v = import.meta.env.VITE_SERVER_URL;
  return typeof v === 'string' ? v.trim() : '';
}

export function createLink() {
  let socket = null;
  let room = '';
  let status = LINK.IDLE;
  let error = null;
  let timer = 0;
  const cb = { status: null, haptic: null, result: null };

  function setStatus(next, err = null) {
    if (status === next && error === err) return;
    status = next;
    error = err;
    cb.status?.(status, error);
  }

  function stopTimer() {
    if (timer) clearTimeout(timer);
    timer = 0;
  }

  /** 연결을 접고 실패로 확정한다. 재시도는 사용자가 누른다. */
  function fail(reason) {
    stopTimer();
    socket?.close();
    socket = null;
    setStatus(LINK.ERROR, reason);
  }

  function hello() {
    socket?.emit(MSG.HELLO, { role: ROLE.CONTROLLER, room });
  }

  /** 붙어 있고 방에 들어간 상태에서만 보낸다. 그 외에는 조용히 버린다. */
  function live() {
    return socket?.connected === true && (status === LINK.JOINED || status === LINK.PAIRED);
  }

  return {
    connect(code) {
      const url = serverUrl();
      room = String(code ?? '').trim().toUpperCase();
      if (!url) {
        setStatus(LINK.ERROR, LINK_ERROR.NO_URL);
        return;
      }
      stopTimer();
      socket?.close();
      setStatus(LINK.CONNECTING);

      socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnectionDelay: 800,
        reconnectionDelayMax: 4000,
        timeout: 5000,
      });

      timer = setTimeout(() => {
        if (status !== LINK.JOINED && status !== LINK.PAIRED) fail(LINK_ERROR.UNREACHABLE);
      }, CONNECT_TIMEOUT_MS);

      // 재연결도 같은 경로다. 붙을 때마다 hello를 다시 보내 같은 방에 재합류한다
      socket.on('connect', hello);
      socket.on('disconnect', () => {
        if (status !== LINK.ERROR) setStatus(LINK.RECONNECTING);
      });

      socket.on(MSG.ROOM, (p) => {
        stopTimer();
        room = p?.code ?? room;
        setStatus(LINK.JOINED);
      });
      socket.on(MSG.PAIRED, () => {
        stopTimer();
        setStatus(LINK.PAIRED);
      });
      // arena가 나갔다. 방이 사라졌으므로 같은 코드로 재시도해도 못 들어간다
      socket.on(MSG.PEER_LEFT, () => fail(LINK_ERROR.NOT_FOUND));
      socket.on(MSG.ERROR, (p) => fail(p?.reason ?? LINK_ERROR.UNREACHABLE));
      socket.on(MSG.HAPTIC, (p) => {
        if (p?.pattern) cb.haptic?.(p.pattern);
      });
      // 경기 결과(B4). arena가 MATCH_END에 보낸다. 표시용 데이터다
      socket.on(MSG.RESULT, (p) => cb.result?.(p));
    },

    /** 이산 이벤트. 스로틀하지 않는다. 판정으로 가는 것은 이 경로뿐이다. */
    sendAction(ev) {
      if (!live()) return;
      const wire = toWireAction(ev);
      if (wire) socket.emit(MSG.ACTION, wire);
    },

    /** 연속 채널. 30Hz 스로틀은 orientation.js가 이미 걸어 두었다(SEND_HZ). */
    sendMotion(q) {
      if (!live()) return;
      socket.emit(MSG.MOTION, { q: [q[0], q[1], q[2], q[3]], ts: Math.round(performance.now()) });
    },

    /** 유파 선택 통지. arena가 A3의 진입점으로 유파를 세운다. school은 SCHOOL 값이다. */
    sendSelect(school) {
      if (!live()) return;
      socket.emit(MSG.SELECT, { school });
    },

    /** 캘리브레이션 완료 통지. arena가 이걸 받고 EN_GARDE로 넘어간다. */
    sendCalib(q) {
      if (!live()) return;
      socket.emit(MSG.CALIB, { q: Array.isArray(q) ? [q[0], q[1], q[2], q[3]] : null });
    },

    on(name, fn) {
      if (name in cb) cb[name] = typeof fn === 'function' ? fn : null;
    },

    getStatus() {
      return status;
    },
    getError() {
      return error;
    },
    getRoom() {
      return room;
    },

    close() {
      stopTimer();
      socket?.close();
      socket = null;
      setStatus(LINK.IDLE);
    },
  };
}
