// 책임: AI 대전자 유파 파라미터. 행동은 상태 기반 확률 테이블이다.
// 색은 blue.light 고정(DESIGN 2절: 블루는 상대의 색이고 내 것에 쓰지 않는다).

import { colors } from '../tokens.js';
import { RULES, AI_MODE, ATTACK_KIND } from './judge.js';

/**
 * 유파 2종. 두 유파가 "다르게 싸운다"는 것이 체감되어야 하므로 파라미터가 넷 늘었다(D3).
 *
 * - attackIntervalMs: 폴백 대기 분포. 템포 구간이 없을 때만 쓴다
 * - tempoBands: 공격 간격 분포를 구간별로 갈아탄다. **같은 리듬이 계속되면 읽혀 버린다**
 * - tempoShiftEvery: 몇 번 공격하면 다음 구간으로 넘어가는가
 * - comboChance / comboGapMs: 회복 직후 곧바로 두 번째 공격을 낼 확률과 그 짧은 간격
 * - stepFeintChance: 대치 중 앞으로 훅 들어왔다 빠지는 거리 흔들기 확률
 * - ripostePressure: 내가 패리해 리포스트 창이 열렸을 때 곧바로 되받아치려 들 확률
 * - feintRatio / preferredD / stepSpeed: 기존 의미 그대로
 *
 * 이탈리아 세이버는 콤보와 빠른 템포로 몰아친다. 프랑스 에페는 거리를 흔들며 재고
 * 패리를 당하면 즉시 되받아 온다. 난수는 전부 주입된 rng를 거친다.
 */
export const SCHOOLS = [
  {
    key: 'italian-saber',
    name: '이탈리아 세이버',
    rhythm: '연속 공격과 빠른 템포',
    attackIntervalMs: { min: 900, max: 1700 },
    tempoBands: [
      { min: 620, max: 1050 },
      { min: 1250, max: 2000 },
    ],
    tempoShiftEvery: 3,
    comboChance: 0.45,
    comboGapMs: { min: 260, max: 420 },
    stepFeintChance: 0.12,
    ripostePressure: 0.25,
    feintRatio: 0.3,
    preferredD: 52,
    stepSpeed: 20,
    color: colors.blue.light,
  },
  {
    key: 'french-epee',
    name: '프랑스 에페',
    rhythm: '거리 흔들기와 되받아치기',
    attackIntervalMs: { min: 1500, max: 2600 },
    tempoBands: [
      { min: 1500, max: 2400 },
      { min: 2100, max: 3200 },
    ],
    tempoShiftEvery: 2,
    comboChance: 0.10,
    comboGapMs: { min: 420, max: 700 },
    stepFeintChance: 0.45,
    ripostePressure: 0.55,
    feintRatio: 0.55,
    preferredD: 38,
    stepSpeed: 15,
    color: colors.blue.light,
  },
];

/** 거리 흔들기 한 걸음의 속도와 길이. 앞으로 훅 들어왔다 선호 간합으로 되돌아간다. */
const STEP_FEINT_SPEED = 30;
const STEP_FEINT_MS = 420;

export function getSchool(key) {
  return SCHOOLS.find((s) => s.key === key) ?? SCHOOLS[0];
}

/** 시드로 유파를 고른다. 같은 시드는 같은 상대를 준다. */
export function pickSchool(rng) {
  return SCHOOLS[Math.floor(rng.next() * SCHOOLS.length) % SCHOOLS.length];
}

/**
 * AI 한 스텝. state.ai를 제자리에서 갱신하고 예고 종료 시 true를 돌려준다.
 * 난수는 전부 주입된 rng를 쓴다. Math.random 직접 호출 금지.
 */
/** 다음 공격까지의 대기. 콤보면 짧은 간격, 아니면 현재 템포 구간에서 뽑는다. */
function nextGap(school, ai, rng, combo) {
  if (combo) return rng.range(school.comboGapMs.min, school.comboGapMs.max);
  const bands = school.tempoBands;
  if (!bands || bands.length === 0) {
    return rng.range(school.attackIntervalMs.min, school.attackIntervalMs.max);
  }
  const band = bands[ai.band % bands.length];
  return rng.range(band.min, band.max);
}

export function stepOpponent(state, school, nowMs, dtSec, rng) {
  const ai = state.ai;

  if (ai.nextAttackAt === 0) {
    ai.nextAttackAt = nowMs + nextGap(school, ai, rng, false);
  }

  // 거리 흔들기. 대치 중 이따금 앞으로 훅 들어왔다 빠진다.
  // 플레이어가 간합을 고정된 것으로 읽지 못하게 만드는 것이 목적이다.
  if (ai.mode === AI_MODE.IDLE && nowMs >= ai.stepAt) {
    ai.stepAt = nowMs + rng.range(700, 1400);
    ai.stepUntil = rng.chance(school.stepFeintChance) ? nowMs + STEP_FEINT_MS : 0;
  }

  // 리포스트 압박. 패리를 당해 창이 열리면 곧바로 되받아치려 든다.
  if (nowMs < state.riposteUntil) {
    if (!ai.pressured) {
      ai.pressured = true;
      if (rng.chance(school.ripostePressure)) {
        ai.nextAttackAt = Math.min(ai.nextAttackAt, nowMs + 260);
      }
    }
  } else {
    ai.pressured = false;
  }

  // 선호 간합으로 당기고 민다. 플레이어 입력과 합산되어 최종 d가 정해진다.
  const surge = nowMs < ai.stepUntil ? STEP_FEINT_SPEED : 0;
  const drift = (Math.sign(school.preferredD - state.d) * school.stepSpeed + surge) * dtSec;
  state.d += drift;

  if (ai.mode === AI_MODE.IDLE && nowMs >= ai.nextAttackAt) {
    ai.mode = AI_MODE.TELEGRAPH;
    ai.kind = rng.chance(school.feintRatio) ? ATTACK_KIND.FEINT : ATTACK_KIND.REAL;
    ai.until = nowMs + RULES.TELEGRAPH_MS;
    return false;
  }

  if (ai.mode === AI_MODE.TELEGRAPH && nowMs >= ai.until) {
    ai.mode = AI_MODE.RECOVER;
    ai.until = nowMs + RULES.RECOVER_MS;
    return true;
  }

  if (ai.mode === AI_MODE.RECOVER && nowMs >= ai.until) {
    ai.mode = AI_MODE.IDLE;
    ai.kind = null;
    ai.attacks += 1;
    // 같은 리듬이 이어지면 플레이어가 박자를 세고 만다. 몇 합마다 템포 구간을 갈아탄다
    if (school.tempoShiftEvery > 0 && ai.attacks % school.tempoShiftEvery === 0) ai.band += 1;
    ai.nextAttackAt = nowMs + nextGap(school, ai, rng, rng.chance(school.comboChance ?? 0));
  }

  return false;
}
