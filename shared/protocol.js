// 간합 실시간 프로토콜 상수. 지침 4.5절 메시지 타입의 실체.
// arena, controller, server가 이 파일 하나만 참조한다. 문자열 리터럴 직접 사용 금지.

export const MSG = {
  HELLO: 'hello', ROOM: 'room', PAIRED: 'paired', PEER_LEFT: 'peer_left', ERROR: 'error',
  CALIB: 'calib',
  MOTION: 'motion', ACTION: 'action', HAPTIC: 'haptic', STATE: 'state',
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
