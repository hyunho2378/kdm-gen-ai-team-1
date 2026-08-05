// 책임: Socket.io 연결과 메시지 송수신. arena 역할로 접속한다 (C3).
//
// 서버 주소는 import.meta.env.VITE_SERVER_URL에서만 읽는다. 폴백 하드코딩을 두지 않는다.
// 메시지 타입은 shared/protocol.js의 MSG 상수만 쓴다. 문자열 리터럴 금지.
// 방 코드는 서버 회신값과 URL 파라미터로만 유지한다. localStorage 금지.
//
// **소켓이 죽어도 경기는 돈다.** arena의 기본 모드는 키보드이고 소켓은 입력 소스가
// 하나 더 생기는 것뿐이다. 서버가 없으면 없는 대로 키보드로 완주한다.

import { io } from 'socket.io-client';
import { MSG, ROLE, fromWireAction } from '../../../shared/protocol.js';
import { SOURCE } from '../game/input.js';

/** 연결 상태. StatusChip이 이 값 하나만 본다. */
export const LINK = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  WAITING: 'waiting',
  PAIRED: 'paired',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};

/** 색 단독 구분 금지라 칩이 이 텍스트를 그대로 낸다. */
export const LINK_LABEL = {
  [LINK.IDLE]: '없음',
  [LINK.CONNECTING]: '서버 연결 중',
  [LINK.WAITING]: '폰 대기',
  [LINK.PAIRED]: '연결됨',
  [LINK.RECONNECTING]: '재접속 중',
  [LINK.ERROR]: '없음',
};

/** 첫 연결 상한. 넘기면 스피너를 접고 실패로 확정한다. 키보드 모드는 그대로 살아 있다. */
const CONNECT_TIMEOUT_MS = 8000;

export function serverUrl() {
  const v = import.meta.env.VITE_SERVER_URL;
  return typeof v === 'string' ? v.trim() : '';
}

/** QR이 가리킬 controller 주소. 없으면 QR을 안 그리고 코드만 크게 낸다. */
export function controllerUrl() {
  const v = import.meta.env.VITE_CONTROLLER_URL;
  return typeof v === 'string' ? v.trim() : '';
}

export function createLink() {
  let socket = null;
  let code = '';
  let status = LINK.IDLE;
  let timer = 0;
  const cb = { status: null, action: null, motion: null, calib: null, peerLeft: null, select: null };

  function setStatus(next) {
    if (status === next) return;
    status = next;
    cb.status?.(status, code);
  }

  function stopTimer() {
    if (timer) clearTimeout(timer);
    timer = 0;
  }

  function live() {
    return socket?.connected === true && (status === LINK.WAITING || status === LINK.PAIRED);
  }

  return {
    /** 서버 주소가 없으면 아무 일도 하지 않는다. 경기는 키보드로 그대로 돈다. */
    connect() {
      const url = serverUrl();
      if (!url) {
        setStatus(LINK.ERROR);
        return false;
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
        if (status === LINK.CONNECTING) setStatus(LINK.ERROR);
      }, CONNECT_TIMEOUT_MS);

      // arena는 붙을 때마다 새 방을 받는다(SERVER.md 방 생명주기 1). 재연결이면 코드가 바뀐다
      socket.on('connect', () => socket.emit(MSG.HELLO, { role: ROLE.ARENA }));
      socket.on('disconnect', () => {
        if (status !== LINK.ERROR) setStatus(LINK.RECONNECTING);
      });

      socket.on(MSG.ROOM, (p) => {
        stopTimer();
        code = p?.code ?? '';
        setStatus(LINK.WAITING);
      });
      socket.on(MSG.PAIRED, () => {
        stopTimer();
        setStatus(LINK.PAIRED);
      });
      socket.on(MSG.PEER_LEFT, () => {
        setStatus(LINK.WAITING);
        cb.peerLeft?.();
      });

      // 아래 넷이 arena가 실제로 소비하는 전부다. 이산과 연속이 여기서 갈린 뒤 다시 안 만난다.
      // select는 유파 선택(로비 단계). 판정 경로가 아니라 경기 시작 전 설정이라 결정성과 무관하다
      socket.on(MSG.ACTION, (p) => cb.action?.(p));
      socket.on(MSG.MOTION, (p) => cb.motion?.(p));
      socket.on(MSG.CALIB, (p) => cb.calib?.(p));
      socket.on(MSG.SELECT, (p) => cb.select?.(p?.school));
      return true;
    },

    /** 명중과 패리에서 폰에 보낸다. 안 붙어 있으면 조용히 버린다. */
    sendHaptic(pattern) {
      if (!live() || !pattern) return;
      socket.emit(MSG.HAPTIC, { pattern });
    },

    on(name, fn) {
      if (name in cb) cb[name] = typeof fn === 'function' ? fn : null;
    },

    getStatus() {
      return status;
    },
    getCode() {
      return code;
    },

    close() {
      stopTimer();
      socket?.close();
      socket = null;
      code = '';
      setStatus(LINK.IDLE);
    },
  };
}

/**
 * 소스 어댑터 (ARENA_INPUT 3절). **판정 경로와 렌더 경로가 여기서 갈린 뒤 다시 만나지 않는다.**
 *
 *   MSG.ACTION → queue.emit(...)              → 판정 (키보드와 완전히 같은 진입점)
 *   MSG.MOTION → poseChannel.setQuaternion(q) → 렌더만
 *   MSG.CALIB  → 캘리브레이션 완료 통지        → phase 전이만
 *
 * **연속 스트림에서 THRUST를 재추론하지 않는다.** 폰이 1차 감지한 action만 판정에 들어간다.
 * 재추론하면 아날로그 값이 판정에 새어 같은 시드가 같은 결과를 못 낸다(이중 판정 금지).
 *
 * **캘리브레이션은 폰이 이미 적용했다.** orientation.js가 기준 자세의 켤레를 곱해 상대 회전을
 * 보내므로 여기서 poseChannel.setCalibration을 또 부르면 두 번 보정되어 검이 엉뚱한 데를 본다.
 * MSG.CALIB의 q는 통지와 기록용이고 보정에 쓰지 않는다.
 */
export function attachSocket(link, queue, poseChannel, { onCalibrated, onAction, onSelect } = {}) {
  link.on('action', (msg) => {
    const ev = fromWireAction(msg);
    if (!ev) return;
    queue.emit({ ...ev, ts: performance.now(), source: SOURCE.CONTROLLER });
    onAction?.(ev);
  });

  // 유파 선택. 경기 밖 로비 신호라 판정 큐를 거치지 않는다(결정성 무관, ARENA_INPUT과 별개).
  link.on('select', (school) => onSelect?.(school));

  link.on('motion', (msg) => {
    if (Array.isArray(msg?.q)) poseChannel.setQuaternion(msg.q);
  });

  link.on('calib', (msg) => onCalibrated?.(msg?.q ?? null));

  // 폰이 나갔다. 검 자세를 프리셋으로 되돌리고 컨트롤러 소스의 홀드를 푼다.
  // 안 풀면 마지막으로 누른 가드가 영원히 켜진 채로 남는다.
  link.on('peerLeft', () => {
    poseChannel.fallbackToPreset();
    queue.clearSource(SOURCE.CONTROLLER);
  });

  return () => {
    link.on('action', null);
    link.on('motion', null);
    link.on('calib', null);
    link.on('peerLeft', null);
    link.on('select', null);
  };
}
