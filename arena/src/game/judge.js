// 책임: 명중과 패링 판정. 순수 함수만 둔다.
// 부수 효과 금지. DOM과 캔버스에 접근하지 않는다. 난수는 호출자가 주입한다.
// 같은 입력에 같은 결과를 낸다(결정적). 판정 루프에 LLM 호출 금지.

import { motion } from '../tokens.js';

/**
 * 간합 d는 0~100의 근접도다. 전진하면 오르고 후퇴하면 내린다(P-C 사양 "전진 +, 후퇴 -").
 * 거리가 아니라 근접도이므로 값이 클수록 가깝다. 양쪽 입력이 합산되어 d를 움직인다.
 * 유효 범위를 벗어난 찌르기는 사유와 함께 헛침 처리한다.
 */
export const RULES = {
  D_MIN: 0,
  D_MAX: 100,
  D_START: 45,
  VALID_MIN: 35,
  VALID_MAX: 55,
  /** 키보드 한 스텝이 움직이는 d 양(초당). 홀드 시 연속 적용된다. */
  STEP_PER_SEC: 26,
  THRUST_COOLDOWN_MS: 350,
  RIPOSTE_WINDOW_MS: 600,
  /** AI 공격 예고 길이. 이 구간에 가드해야 패리가 선다. */
  TELEGRAPH_MS: 340,
  /** 예고 후 회복 구간. 이때는 AI가 무방비다. */
  RECOVER_MS: 420,
  MATCH_POINT: 5,
  HIT_POINTS: 1,
  RIPOSTE_POINTS: 2,
  /** 시간 팽창 판단에 쓰는 직전 교환 표본 수 */
  FORM_WINDOW: 3,
  /** 표본 중 성공이 이 수 이상이면 "좋은 흐름"으로 본다 */
  FORM_THRESHOLD: 2,
};

/** 판정 문구 4종. PATTERNS 6절 고정 목록이다. 여기 없는 문구를 만들지 마라. */
export const OUTCOME = {
  HIT: 'HIT',
  MISS: 'MISS',
  PARRY: 'PARRY',
  RIPOSTE: 'RIPOSTE',
};

export const OWNER = { ME: 'ME', AI: 'AI' };

/** 헛침 사유. PATTERNS 6절에 따라 6자 이내로 유지한다. */
export const MISS_REASON = {
  OUT_OF_RANGE: '거리 밖',
  COOLDOWN: '쿨다운',
  INTO_ATTACK: '상대 공격',
  BLOCKED: '막힘',
};

export const AI_MODE = { IDLE: 'IDLE', TELEGRAPH: 'TELEGRAPH', RECOVER: 'RECOVER' };
export const ATTACK_KIND = { FEINT: 'FEINT', REAL: 'REAL' };

/** 판정 상태 초기값. engine이 보유하고 judge는 읽기만 한다. */
export function createJudgeState({ d = RULES.D_START } = {}) {
  return {
    d,
    score: { me: 0, ai: 0 },
    lastThrustAt: -Infinity,
    guarding: false,
    ai: { mode: AI_MODE.IDLE, kind: null, until: 0, nextAttackAt: 0 },
    riposteUntil: 0,
    /** 최근 교환 성공 여부. true가 성공(명중, 패리, 리포스트) */
    form: [],
    dilation: { activeUntil: 0, cooldownUntil: 0 },
  };
}

export function clampD(d) {
  return Math.min(RULES.D_MAX, Math.max(RULES.D_MIN, d));
}

export function inValidRange(d) {
  return d >= RULES.VALID_MIN && d <= RULES.VALID_MAX;
}

/**
 * 찌르기 판정. 순수 함수다.
 * 우선순위: 쿨다운 > 리포스트 윈도우 > 거리 > 상대 공격 상태.
 * 리포스트 윈도우 안에서는 거리 판정을 면제한다(패리 직후 붙어 있는 상태를 인정).
 */
export function resolveThrust(state, nowMs) {
  if (nowMs - state.lastThrustAt < RULES.THRUST_COOLDOWN_MS) {
    return { outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0, reason: MISS_REASON.COOLDOWN, counted: false };
  }
  if (nowMs < state.riposteUntil) {
    return { outcome: OUTCOME.RIPOSTE, owner: OWNER.ME, points: RULES.RIPOSTE_POINTS, reason: null, counted: true };
  }
  if (!inValidRange(state.d)) {
    return { outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0, reason: MISS_REASON.OUT_OF_RANGE, counted: true };
  }

  // 상대가 열리는 순간에만 명중한다.
  // 사양에는 "유효 범위 안이면 명중 판정 진입"까지만 있고 그 다음이 비어 있었다.
  // 무조건 명중으로 두면 스페이스 연타로 7초 만에 5점이 나고 AI가 공격할 틈이 없어
  // FEINT 판독, 가드, 리포스트, 시간 팽창이 전부 죽는다(실측 확인).
  // 그래서 펜싱의 기본 논리를 그대로 쓴다. 이 블록이 사양 보강분이다.
  switch (state.ai.mode) {
    case AI_MODE.RECOVER:
      // 공격을 내지른 직후는 무방비다. 준비 동작에 찔러 넣는 정석 득점 경로.
      return { outcome: OUTCOME.HIT, owner: OWNER.ME, points: RULES.HIT_POINTS, reason: null, counted: true };
    case AI_MODE.TELEGRAPH:
      // 페인트는 검이 궤도를 벗어난 상태라 읽어내면 득점이다.
      if (state.ai.kind === ATTACK_KIND.FEINT) {
        return { outcome: OUTCOME.HIT, owner: OWNER.ME, points: RULES.HIT_POINTS, reason: null, counted: true };
      }
      // 진짜 공격에 맞불을 놓으면 얻어맞는다. 가드로 받아야 한다.
      return { outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0, reason: MISS_REASON.INTO_ATTACK, counted: true };
    default:
      // 대치 중에는 상대 검이 선을 잡고 있어 그냥 들어가지 않는다.
      return { outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0, reason: MISS_REASON.BLOCKED, counted: true };
  }
}

/**
 * AI 예고가 끝나는 순간의 판정. 순수 함수다.
 * FEINT면 아무 일도 없다(헛가드해도 무페널티). REAL은 가드 여부로 갈린다.
 * 반환 null은 "판정 연출 없음"을 뜻한다.
 */
export function resolveTelegraphEnd(state) {
  if (state.ai.kind === ATTACK_KIND.FEINT) return null;
  if (state.guarding) {
    return { outcome: OUTCOME.PARRY, owner: OWNER.ME, points: 0, reason: null, counted: true, opensRiposte: true };
  }
  return { outcome: OUTCOME.HIT, owner: OWNER.AI, points: RULES.HIT_POINTS, reason: null, counted: true, opensRiposte: false };
}

/** 교환 성공 여부. 시간 팽창의 흐름 판단에 쓴다. */
export function isSuccess(result) {
  if (!result) return false;
  if (result.outcome === OUTCOME.MISS) return false;
  return result.owner === OWNER.ME;
}

/** 최근 FORM_WINDOW 표본 중 성공이 임계 이상인가. */
export function inGoodForm(form) {
  const recent = form.slice(-RULES.FORM_WINDOW);
  if (recent.length < RULES.FORM_WINDOW) return false;
  return recent.filter(Boolean).length >= RULES.FORM_THRESHOLD;
}

/**
 * 시간 팽창 발동 판정. C4에서 웹캠 지표로 교체될 자리다.
 * trigger 소스를 주입 가능하게 두어 판정 본체는 그대로 둔다.
 * @param extra 웹캠 등 외부 지표. null이면 성공률 근사만 쓴다
 */
export function shouldDilate(state, nowMs, extra = null) {
  if (nowMs < state.dilation.cooldownUntil) return false;
  if (nowMs < state.dilation.activeUntil) return false;
  if (extra && typeof extra.focused === 'boolean') return extra.focused;
  return inGoodForm(state.form);
}

export const DILATION = motion.timeDilation;

/** 승패 확정. 5점 선취. */
export function matchWinner(score) {
  if (score.me >= RULES.MATCH_POINT) return OWNER.ME;
  if (score.ai >= RULES.MATCH_POINT) return OWNER.AI;
  return null;
}
