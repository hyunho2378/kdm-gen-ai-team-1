// 책임: 경기 상태머신. shared/protocol.js의 PHASE 전이만 관리한다.
// IDLE > PAIRING > CALIBRATION > EN_GARDE > EXCHANGE > JUDGE > SCORE > MATCH_END
// 전이는 순수 함수다. 판정 계산은 judge.js, 그리기는 renderer가 맡는다.

import { PHASE } from '../../../shared/protocol.js';

export { PHASE };

/** 전이 이벤트. 문자열 리터럴을 직접 쓰지 마라. */
export const EV = {
  START: 'START',                   // IDLE에서 경기 시작(서버 경로)
  START_KEYBOARD: 'START_KEYBOARD', // IDLE에서 키보드 모드로 직행
  PAIRED: 'PAIRED',
  CALIBRATED: 'CALIBRATED',
  ENGAGE: 'ENGAGE',                 // EN_GARDE에서 교환 시작
  RESOLVED: 'RESOLVED',             // 교환 결과 확정, 판정 연출 진입
  JUDGE_DONE: 'JUDGE_DONE',
  SCORE_DONE: 'SCORE_DONE',
  MATCH_OVER: 'MATCH_OVER',
  RESET: 'RESET',                   // 처음으로
  REMATCH: 'REMATCH',               // 다시
};

// 키보드 모드는 PAIRING과 CALIBRATION을 건너뛰고 EN_GARDE로 직행한다.
const TABLE = {
  [PHASE.IDLE]: {
    [EV.START]: PHASE.PAIRING,
    [EV.START_KEYBOARD]: PHASE.EN_GARDE,
  },
  [PHASE.PAIRING]: {
    [EV.PAIRED]: PHASE.CALIBRATION,
    [EV.START_KEYBOARD]: PHASE.EN_GARDE,
    [EV.RESET]: PHASE.IDLE,
  },
  [PHASE.CALIBRATION]: {
    [EV.CALIBRATED]: PHASE.EN_GARDE,
    [EV.START_KEYBOARD]: PHASE.EN_GARDE,
    [EV.RESET]: PHASE.IDLE,
  },
  [PHASE.EN_GARDE]: {
    [EV.ENGAGE]: PHASE.EXCHANGE,
    [EV.RESET]: PHASE.IDLE,
  },
  [PHASE.EXCHANGE]: {
    [EV.RESOLVED]: PHASE.JUDGE,
    [EV.RESET]: PHASE.IDLE,
  },
  [PHASE.JUDGE]: {
    [EV.JUDGE_DONE]: PHASE.SCORE,
    [EV.RESET]: PHASE.IDLE,
  },
  [PHASE.SCORE]: {
    [EV.SCORE_DONE]: PHASE.EN_GARDE,
    [EV.MATCH_OVER]: PHASE.MATCH_END,
    [EV.RESET]: PHASE.IDLE,
  },
  [PHASE.MATCH_END]: {
    [EV.REMATCH]: PHASE.EN_GARDE,
    [EV.RESET]: PHASE.IDLE,
  },
};

/**
 * 순수 전이 함수. 현재 phase와 이벤트를 받아 다음 phase를 돌려준다.
 * 정의되지 않은 전이는 현재 phase를 그대로 돌려준다(무시). 예외를 던지지 않는다.
 */
export function nextPhase(phase, event) {
  const row = TABLE[phase];
  if (!row) return phase;
  return row[event] ?? phase;
}

/** 전이 가능 여부. UI가 버튼 활성화를 판단할 때 쓴다. */
export function canTransition(phase, event) {
  return nextPhase(phase, event) !== phase;
}

/**
 * phase별 진입과 이탈 훅을 붙인 상태머신 인스턴스.
 * hooks: { [phase]: { enter?(ctx, from), exit?(ctx, to) } }
 */
export function createMachine({ initial = PHASE.IDLE, hooks = {}, onChange } = {}) {
  let phase = initial;

  function apply(to, event, ctx) {
    hooks[phase]?.exit?.(ctx, to);
    const from = phase;
    phase = to;
    hooks[to]?.enter?.(ctx, from);
    onChange?.(to, from, event);
    return phase;
  }

  return {
    send(event, ctx) {
      const to = nextPhase(phase, event);
      if (to === phase) return phase;
      return apply(to, event, ctx);
    },
    get phase() {
      return phase;
    },
    /** 전이표를 우회한다. F9 키보드 모드 토글처럼 어느 phase에서든 꽂아야 하는 경우 전용. */
    force(to, ctx) {
      if (to === phase) return phase;
      return apply(to, 'FORCE', ctx);
    },
  };
}
