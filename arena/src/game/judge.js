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
  /**
   * 런지. 전진을 홀드한 채 찌르면 한 걸음 더 뻗는다.
   * 유효 범위가 먼 쪽으로 조금 넓어지는 대신 쿨다운이 길다. 거리를 사는 대가로 템포를 낸다.
   * 가까운 쪽 상한은 넓히지 않는다. 붙어 있을 때 런지가 더 유리할 이유가 없다.
   */
  LUNGE_VALID_MIN: 32,
  LUNGE_COOLDOWN_MS: 500,
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

/**
 * 피스트 (R3). FENCING_RULES 5절. 길이 14m, 앙가르드 라인은 중앙 양쪽 2m라 시작 간격 4m,
 * 각 선수 뒤에 5m씩 남는다. 후방 경계를 넘으면 상대 득점이고 끝 2m 지점이 경고선이다.
 *
 * **폭 1.5m가 측면 이동을 봉쇄해 모든 전술이 전진과 후퇴 1차원으로 압축된다.**
 * 그래서 절대 위치를 도입해도 차원이 늘지 않는다. d 하나가 두 위치의 간격으로 바뀔 뿐이다.
 */
export const PISTE = {
  LENGTH: 14,
  ME_START: 5.0,
  AI_START: 9.0,
  /** 경고선. 각 끝에서 이만큼 안쪽이다 */
  WARN: 2.0,
  /**
   * **결정성 보존의 핵심 상수.** d 한 칸이 몇 미터인가.
   *
   * 위치를 도입해도 기존 입력 시퀀스가 만들던 d 변화는 그대로여야 한다. 그래서
   * 위치를 먼저 정하고 d를 유도하는 것이 아니라, **기존 d 변화량을 그대로 받아
   * 이 상수로 미터로 환산해 위치에 싣는다.** 그러면 경계에 닿지 않는 한
   *   Δgap = -(Δd_나 + Δd_AI) x METERS_PER_D,   d = D_START + (GAP_START - gap) / METERS_PER_D
   * 가 항등식이라 d 동역학이 한 자리도 안 바뀐다.
   *
   * 값은 유효 범위 d 35~55(20칸)가 1m 폭이 되게 잡았다.
   * 그러면 내 이동 속도가 STEP_PER_SEC x METERS_PER_D = 26 x 0.05 = 1.3 m/s로
   * 실제 펜싱 어드밴스 속도와 같은 자리에 앉는다.
   */
  METERS_PER_D: 0.05,
};

const GAP_START = PISTE.AI_START - PISTE.ME_START;
/** 두 선수가 더 붙을 수 없는 간격. d 100에 해당한다(교차 방지) */
const GAP_MIN = GAP_START - (RULES.D_MAX - RULES.D_START) * PISTE.METERS_PER_D;

/**
 * 동시타 해소 (R3-2). FENCING_RULES 3절 락아웃 실측값을 유파 파라미터로 받는다.
 * judge는 유파를 모른다. 호출자가 창 길이와 더블 인정 여부를 넘긴다.
 */
export const LOCKOUT_DEFAULT = { lockoutMs: 0, doubleTouch: false };

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

/**
 * 득점과 무득점에 붙는 사유 (R3). 헛침 사유와 달리 명중에도 붙는다.
 * OUTCOME 4종은 그대로 두고 사유 문구만 늘린다. 6자 이내 규칙은 같이 지킨다.
 */
export const SCORE_REASON = {
  PISTE_OUT: '피스트 밖',
  DOUBLE: '더블 투셰',
  SIMULTANEOUS: '시뮬타네',
  DOUBLE_VOID: '더블 무효',
};

/** 심판기 램프. 좌 red가 나, 우 blue가 상대다. 초록은 쓰지 않는다(FENCING_RULES 판정표). */
export const LAMP = { ME: 'ME', AI: 'AI', BOTH: 'BOTH' };

export const AI_MODE = { IDLE: 'IDLE', TELEGRAPH: 'TELEGRAPH', RECOVER: 'RECOVER' };
export const ATTACK_KIND = { FEINT: 'FEINT', REAL: 'REAL' };

/** 판정 상태 초기값. engine이 보유하고 judge는 읽기만 한다. */
export function createJudgeState({ d = RULES.D_START } = {}) {
  // 위치는 시작 라인에서 잡고, d가 지정되면 그만큼 상대를 당겨 간격을 맞춘다.
  // 위치가 진실이고 d는 유도값이다(R3).
  const mePos = PISTE.ME_START;
  const aiPos = mePos + gapFromD(d);
  return {
    d,
    mePos,
    aiPos,
    score: { me: 0, ai: 0 },
    /** 내가 상대 진짜 공격에 맞불을 놓은 시각. 동시타 창 판정에 쓴다(R3-2) */
    counterAt: -Infinity,
    lastThrustAt: -Infinity,
    /** 직전 찌르기가 건 쿨다운. 런지면 더 길다 */
    thrustCooldownMs: RULES.THRUST_COOLDOWN_MS,
    guarding: false,
    ai: {
      mode: AI_MODE.IDLE,
      kind: null,
      until: 0,
      nextAttackAt: 0,
      // 유파 다양화용. 전부 시드 난수로만 움직인다(D3)
      attacks: 0,      // 지금까지 낸 공격 수. 템포 구간 전환의 기준
      band: 0,         // 현재 템포 구간 인덱스
      stepAt: 0,       // 다음 거리 흔들기 판정 시각
      stepUntil: 0,    // 흔들기 진행 종료 시각
      pressured: false, // 이번 리포스트 윈도우에 이미 반응했는가
      driveAt: 0,      // 다음 라인 몰기 판정 시각(R3)
      driveUntil: 0,   // 몰기 진행 종료 시각
    },
    riposteUntil: 0,
    /** 최근 교환 성공 여부. true가 성공(명중, 패리, 리포스트) */
    form: [],
    dilation: { activeUntil: 0, cooldownUntil: 0 },
  };
}

export function clampD(d) {
  return Math.min(RULES.D_MAX, Math.max(RULES.D_MIN, d));
}

/** 간합 d → 두 선수의 간격(m). */
export function gapFromD(d) {
  return GAP_START - (d - RULES.D_START) * PISTE.METERS_PER_D;
}

/** 간격(m) → 간합 d. 위치가 진실이고 이 함수가 유도한다. */
export function dFromGap(gap) {
  return clampD(RULES.D_START + (GAP_START - gap) / PISTE.METERS_PER_D);
}

function syncD(state) {
  state.d = dFromGap(state.aiPos - state.mePos);
}

/**
 * 내 이동. **인자는 기존 d 동역학이 만들던 변화량 그대로다.**
 * 전진이면 양수이고 앞으로 나간다. 경계와 교차만 막고 나머지는 항등 변환이다.
 */
export function movePlayer(state, deltaD) {
  const next = state.mePos + deltaD * PISTE.METERS_PER_D;
  state.mePos = Math.min(state.aiPos - GAP_MIN, Math.max(0, next));
  syncD(state);
}

/** 상대 이동. 상대가 붙으면(+d) 내 쪽으로 오므로 좌표는 줄어든다. */
export function moveOpponent(state, deltaD) {
  const next = state.aiPos - deltaD * PISTE.METERS_PER_D;
  state.aiPos = Math.min(PISTE.LENGTH, Math.max(state.mePos + GAP_MIN, next));
  syncD(state);
}

/** 경고선 안에 들어왔는가. HUD가 경고를 띄우는 조건이다. */
export function pisteWarning(state) {
  return { me: state.mePos <= PISTE.WARN, ai: state.aiPos >= PISTE.LENGTH - PISTE.WARN };
}

/**
 * 후방 경계 실점 (R3-1). 실룰에서 두 발로 넘으면 상대 득점이다.
 * 위치가 경계에 물려 있으므로 한 번 판정한 뒤 호출자가 앙가르드로 되돌린다(연속 발화 방지).
 */
export function resolvePisteOut(state) {
  if (state.mePos <= 0) {
    return {
      outcome: OUTCOME.HIT,
      owner: OWNER.AI,
      points: RULES.HIT_POINTS,
      reason: SCORE_REASON.PISTE_OUT,
      counted: true,
      lamp: LAMP.AI,
    };
  }
  if (state.aiPos >= PISTE.LENGTH) {
    return {
      outcome: OUTCOME.HIT,
      owner: OWNER.ME,
      points: RULES.HIT_POINTS,
      reason: SCORE_REASON.PISTE_OUT,
      counted: true,
      lamp: LAMP.ME,
    };
  }
  return null;
}

/** 득점 후 앙가르드 복귀. 실룰대로 두 선수가 시작 라인으로 돌아간다. */
export function resetPositions(state) {
  state.mePos = PISTE.ME_START;
  state.aiPos = PISTE.AI_START;
  syncD(state);
}

export function inValidRange(d, lunge = false) {
  const min = lunge ? RULES.LUNGE_VALID_MIN : RULES.VALID_MIN;
  return d >= min && d <= RULES.VALID_MAX;
}

/**
 * 찌르기 판정. 순수 함수다.
 * 우선순위: 쿨다운 > 리포스트 윈도우 > 거리 > 상대 공격 상태.
 * 리포스트 윈도우 안에서는 거리 판정을 면제한다(패리 직후 붙어 있는 상태를 인정).
 */
export function resolveThrust(state, nowMs, { lunge = false } = {}) {
  // 쿨다운은 **직전 찌르기가 건 길이**로 잰다. 런지를 냈으면 다음 한 발이 늦다.
  if (nowMs - state.lastThrustAt < state.thrustCooldownMs) {
    return { outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0, reason: MISS_REASON.COOLDOWN, counted: false, lunge };
  }
  if (nowMs < state.riposteUntil) {
    return { outcome: OUTCOME.RIPOSTE, owner: OWNER.ME, points: RULES.RIPOSTE_POINTS, reason: null, counted: true, lunge, lamp: LAMP.ME };
  }
  // 런지만 진입 조건이 다르다. 이 아래 4분기 판정은 손대지 않는다.
  if (!inValidRange(state.d, lunge)) {
    return { outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0, reason: MISS_REASON.OUT_OF_RANGE, counted: true, lunge };
  }

  // 상대가 열리는 순간에만 명중한다.
  // 사양에는 "유효 범위 안이면 명중 판정 진입"까지만 있고 그 다음이 비어 있었다.
  // 무조건 명중으로 두면 스페이스 연타로 7초 만에 5점이 나고 AI가 공격할 틈이 없어
  // FEINT 판독, 가드, 리포스트, 시간 팽창이 전부 죽는다(실측 확인).
  // 그래서 펜싱의 기본 논리를 그대로 쓴다. 이 블록이 사양 보강분이다.
  switch (state.ai.mode) {
    case AI_MODE.RECOVER:
      // 공격을 내지른 직후는 무방비다. 준비 동작에 찔러 넣는 정석 득점 경로.
      return { outcome: OUTCOME.HIT, owner: OWNER.ME, points: RULES.HIT_POINTS, reason: null, counted: true, lunge, lamp: LAMP.ME };
    case AI_MODE.TELEGRAPH:
      // 페인트는 검이 궤도를 벗어난 상태라 읽어내면 득점이다.
      if (state.ai.kind === ATTACK_KIND.FEINT) {
        return { outcome: OUTCOME.HIT, owner: OWNER.ME, points: RULES.HIT_POINTS, reason: null, counted: true, lunge, lamp: LAMP.ME };
      }
      // 진짜 공격에 맞불을 놓으면 얻어맞는다. 가드로 받아야 한다.
      return { outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0, reason: MISS_REASON.INTO_ATTACK, counted: true, lunge };
    default:
      // 대치 중에는 상대 검이 선을 잡고 있어 그냥 들어가지 않는다.
      return { outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0, reason: MISS_REASON.BLOCKED, counted: true, lunge };
  }
}

/**
 * AI 예고가 끝나는 순간의 판정. 순수 함수다.
 * FEINT면 아무 일도 없다(헛가드해도 무페널티). REAL은 가드 여부로 갈린다.
 * 반환 null은 "판정 연출 없음"을 뜻한다.
 *
 * **동시타 해소가 여기 붙는다(R3-2).** 내가 진짜 공격에 맞불을 놓으면 기존대로 헛침이지만,
 * 그 맞불이 상대 공격이 닿는 순간과 락아웃 창 안에 겹치면 유파 규칙으로 다시 푼다.
 * 창 길이와 더블 인정 여부는 호출자가 넘긴다. judge는 유파를 모른다.
 *
 * 세이버는 우선권 종목이라 동시 개시가 무득점(시뮬타네)이고,
 * 에페는 우선권이 없어 양쪽 다 득점(더블 투셰)이다.
 * 단 **동점 매치포인트의 더블은 무효**다(FENCING_RULES 2절 null and void).
 */
export function resolveTelegraphEnd(state, nowMs = 0, lockout = LOCKOUT_DEFAULT) {
  if (state.ai.kind === ATTACK_KIND.FEINT) return null;
  if (state.guarding) {
    return { outcome: OUTCOME.PARRY, owner: OWNER.ME, points: 0, reason: null, counted: true, opensRiposte: true, lamp: LAMP.ME };
  }

  const simultaneous = nowMs - state.counterAt <= (lockout.lockoutMs ?? 0);
  if (simultaneous) {
    if (!lockout.doubleTouch) {
      // 우선권 종목의 동시 개시. 아무도 못 가져간다
      return {
        outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0,
        reason: SCORE_REASON.SIMULTANEOUS, counted: true, opensRiposte: false, lamp: LAMP.BOTH,
      };
    }
    const matchPoint = state.score.me === RULES.MATCH_POINT - 1 && state.score.ai === RULES.MATCH_POINT - 1;
    if (matchPoint) {
      // 동점 매치포인트에서는 더블로 경기가 끝나지 않는다
      return {
        outcome: OUTCOME.MISS, owner: OWNER.ME, points: 0,
        reason: SCORE_REASON.DOUBLE_VOID, counted: true, opensRiposte: false, lamp: LAMP.BOTH,
      };
    }
    return {
      outcome: OUTCOME.HIT, owner: OWNER.ME, points: RULES.HIT_POINTS, aiPoints: RULES.HIT_POINTS,
      reason: SCORE_REASON.DOUBLE, counted: true, opensRiposte: false, lamp: LAMP.BOTH,
    };
  }

  return { outcome: OUTCOME.HIT, owner: OWNER.AI, points: RULES.HIT_POINTS, reason: null, counted: true, opensRiposte: false, lamp: LAMP.AI };
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
