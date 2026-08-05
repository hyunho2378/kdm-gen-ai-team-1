// VORTEX 실시간 프로토콜 상수. 지침 4.5절 메시지 타입의 실체.
// arena, controller, server가 이 파일 하나만 참조한다. 문자열 리터럴 직접 사용 금지.

export const MSG = {
  HELLO: 'hello', ROOM: 'room', PAIRED: 'paired', PEER_LEFT: 'peer_left', ERROR: 'error',
  CALIB: 'calib',
  MOTION: 'motion', ACTION: 'action', HAPTIC: 'haptic', STATE: 'state',
  // SELECT: 폰이 고른 유파를 arena로. { school: SCHOOL 값 }. arena는 A3의 진입점으로 유파를 세운다.
  // RESULT: 경기 종료 시 arena가 폰으로 보내는 결과 요약(B4). 판정 변경이 아니라 표시용 데이터다.
  SELECT: 'select', RESULT: 'result',
};
export const ACTION = { THRUST: 'thrust', GUARD: 'guard', ADVANCE: 'advance', RETREAT: 'retreat' };
export const HAPTIC = { HIT: 'hit', PARRY: 'parry', LOSE: 'lose' };
export const PHASE = {
  IDLE: 'IDLE', PAIRING: 'PAIRING', CALIBRATION: 'CALIBRATION',
  EN_GARDE: 'EN_GARDE', EXCHANGE: 'EXCHANGE', JUDGE: 'JUDGE',
  SCORE: 'SCORE', MATCH_END: 'MATCH_END',
};

// 접속 역할. hello 메시지의 role 값
export const ROLE = { ARENA: 'arena', CONTROLLER: 'controller' };

// AI 대전자 유파 선택 값. arena 경기 진입점이 받는 단일 인자이고,
// 로컬 키보드 선택(1/2/3/4)과 앱 select 메시지가 같은 값을 쓴다.
// mixed는 세 유파를 라운드마다 갈아타는 통합 모드다.
export const SCHOOL = { SABRE: 'sabre', EPEE: 'epee', HUNGARIAN: 'hungarian', MIXED: 'mixed' };

// 이산 입력 소스. judge는 이 값을 절대 읽지 않는다(ARENA_INPUT 2절).
// 존재 이유는 디버깅 로그와 HUD 표시 둘뿐이다.
export const SOURCE = { KEYBOARD: 'keyboard', CONTROLLER: 'controller' };

/**
 * 이산 채널 이벤트 타입 (ARENA_INPUT 2절 스키마).
 * 컨트롤러 파이프라인과 arena 입력 큐가 이 이름으로 말한다.
 *
 * **선 위의 이름과 다르다.** SERVER.md는 `action.kind`를 넷(thrust, guard, advance, retreat)으로
 * 규정하고 on/off를 `power`로 표현한다. 가드도 같은 규칙을 따르므로 여기 다섯이 저기 넷으로 접힌다.
 * 두 이름을 손으로 옮기지 않게 아래 두 매퍼가 유일한 변환 통로다.
 */
export const INPUT_EVENT = {
  THRUST: 'thrust',
  GUARD_ON: 'guard_on',
  GUARD_OFF: 'guard_off',
  ADVANCE: 'advance',
  RETREAT: 'retreat',
};

/** 이산 이벤트를 선 위 형식으로. `{ kind, power }`이고 나머지는 로컬 정보라 안 싣는다. */
export function toWireAction(ev) {
  if (!ev || typeof ev.type !== 'string') return null;
  const power = Number.isFinite(ev.power) ? ev.power : 1;
  switch (ev.type) {
    case INPUT_EVENT.THRUST:
      return { kind: ACTION.THRUST, power };
    case INPUT_EVENT.GUARD_ON:
      return { kind: ACTION.GUARD, power: 1 };
    case INPUT_EVENT.GUARD_OFF:
      return { kind: ACTION.GUARD, power: 0 };
    case INPUT_EVENT.ADVANCE:
      return { kind: ACTION.ADVANCE, power };
    case INPUT_EVENT.RETREAT:
      return { kind: ACTION.RETREAT, power };
    default:
      return null;
  }
}

/**
 * 선 위 형식을 이산 이벤트로. 모르는 kind는 null이라 큐에 안 들어간다.
 * **여기서 THRUST를 만들어 내지 않는다.** 폰이 1차 감지한 것만 넘어오고
 * arena는 연속 스트림에서 재추론하지 않는다(이중 판정 금지, ARENA_INPUT 4절).
 */
export function fromWireAction(msg) {
  if (!msg || typeof msg.kind !== 'string') return null;
  const power = Number.isFinite(msg.power) ? msg.power : 1;
  switch (msg.kind) {
    case ACTION.THRUST:
      return { type: INPUT_EVENT.THRUST, power };
    case ACTION.GUARD:
      return { type: power > 0 ? INPUT_EVENT.GUARD_ON : INPUT_EVENT.GUARD_OFF, power };
    case ACTION.ADVANCE:
      return { type: INPUT_EVENT.ADVANCE, power };
    case ACTION.RETREAT:
      return { type: INPUT_EVENT.RETREAT, power };
    default:
      return null;
  }
}
