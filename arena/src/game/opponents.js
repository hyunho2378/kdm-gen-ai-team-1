// 책임: AI 대전자 유파 파라미터. 행동은 상태 기반 확률 테이블이다.
// 색은 blue.light 고정(DESIGN 2절: 블루는 상대의 색이고 내 것에 쓰지 않는다).

import { colors } from '../tokens.js';
import { RULES, AI_MODE, ATTACK_KIND } from './judge.js';

/**
 * 유파 2종. 필드 의미:
 * - attackIntervalMs: 다음 공격까지 대기 분포 [min, max)
 * - feintRatio: 예고 중 페인트 비율
 * - preferredD: 이 유파가 끌고 가려는 간합 근접도
 * - stepSpeed: 초당 d 변화량
 */
export const SCHOOLS = [
  {
    key: 'italian-saber',
    name: '이탈리아 세이버',
    rhythm: '빠르고 잦은 공격',
    attackIntervalMs: { min: 900, max: 1700 },
    feintRatio: 0.3,
    preferredD: 52,
    stepSpeed: 20,
    color: colors.blue.light,
  },
  {
    key: 'french-epee',
    name: '프랑스 에페',
    rhythm: '먼 간합과 잦은 페인트',
    attackIntervalMs: { min: 1500, max: 2600 },
    feintRatio: 0.55,
    preferredD: 38,
    stepSpeed: 15,
    color: colors.blue.light,
  },
];

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
export function stepOpponent(state, school, nowMs, dtSec, rng) {
  const ai = state.ai;

  if (ai.nextAttackAt === 0) {
    ai.nextAttackAt = nowMs + rng.range(school.attackIntervalMs.min, school.attackIntervalMs.max);
  }

  // 선호 간합으로 당기고 민다. 플레이어 입력과 합산되어 최종 d가 정해진다.
  const drift = Math.sign(school.preferredD - state.d) * school.stepSpeed * dtSec;
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
    ai.nextAttackAt = nowMs + rng.range(school.attackIntervalMs.min, school.attackIntervalMs.max);
  }

  return false;
}
