// 책임: AI 대전자 유파 파라미터. 행동은 상태 기반 확률 테이블이다.
// 색은 blue.light 고정(DESIGN 2절: 블루는 상대의 색이고 내 것에 쓰지 않는다).

import { colors } from '../tokens.js';
import { SCHOOL } from '../../../shared/protocol.js';
import { RULES, AI_MODE, ATTACK_KIND, moveOpponent } from './judge.js';

/**
 * 무기 계열 (R4, FENCING_RULES 판정표). 락아웃 동시타 규칙과 시각 기술(베기 호/플런지)이
 * 계열을 공유한다. 유파가 늘어도 계열은 둘뿐이라 규칙을 유파마다 베끼지 않고 여기 한곳에 둔다.
 *
 * - 사브르계: 우선권 종목이라 동시 개시가 무득점(시뮬타네). 락아웃 창은 실측 170ms.
 *   이탈리아 세이버와 **헝가리안(라다엘리 사브르 계승)**이 함께 여기에 속한다.
 * - 에페계: 우선권이 없어 양쪽 다 득점(더블 투셰). 창은 실측 40ms로 훨씬 좁다.
 */
export const FAMILY = {
  sabre: { lockoutMs: 170, doubleTouch: false },
  epee: { lockoutMs: 40, doubleTouch: true },
};

/** 유파의 계열 락아웃 규칙. judge는 유파도 계열도 모르고 이 창 길이와 더블 인정 여부만 받는다. */
export function lockoutOf(school) {
  return FAMILY[school?.family] ?? { lockoutMs: 0, doubleTouch: false };
}

/**
 * 유파 3종. 세 유파가 "다르게 싸운다"는 것이 체감되어야 한다(D3, ARENA_AI_SCHOOLS).
 *
 * - attackIntervalMs: 폴백 대기 분포. 템포 구간이 없을 때만 쓴다
 * - tempoBands: 공격 간격 분포를 구간별로 갈아탄다. **같은 리듬이 계속되면 읽혀 버린다**
 * - tempoShiftEvery: 몇 번 공격하면 다음 구간으로 넘어가는가
 * - comboChance / comboGapMs: 회복 직후 곧바로 두 번째 공격을 낼 확률과 그 짧은 간격
 * - stepFeintChance: 대치 중 앞으로 훅 들어왔다 빠지는 거리 흔들기 확률
 * - ripostePressure: 내가 패리해 리포스트 창이 열렸을 때 곧바로 되받아치려 들 확률
 * - feintRatio / preferredD / stepSpeed: 기존 의미 그대로
 * - family: 무기 계열(FAMILY). 락아웃과 시각 기술이 계열을 공유한다
 * - styleName: 통합 모드 HUD가 "MIXED 세이버 스타일"처럼 짧게 부를 때 쓰는 스타일명
 *
 * 이탈리아 세이버는 콤보와 빠른 템포로 몰아친다(공격형). 프랑스 에페는 거리를 흔들며 재고
 * 패리를 당하면 즉시 되받아 온다(카운터형). 헝가리안은 페인트와 템포 브레이크로 판단을
 * 교란한다(심리전형). 난수는 전부 주입된 rng를 거친다.
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
    // 사브르계. 우선권 종목이라 동시 개시는 무득점(시뮬타네), 창 170ms(FAMILY)
    family: 'sabre',
    styleName: '세이버',
    // 라인 몰기 성향. 세이버는 몰아치는 유파라 높다
    lineDrive: 0.55,
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
    // 에페계. 우선권이 없어 양쪽 다 득점(더블 투셰), 창 40ms(FAMILY)
    family: 'epee',
    styleName: '에페',
    // 거리를 재는 유파라 몰아붙이는 성향이 낮다
    lineDrive: 0.22,
    color: colors.blue.light,
  },
  {
    key: 'hungarian',
    name: '헝가리안',
    rhythm: '급변하는 템포와 페인트',
    attackIntervalMs: { min: 1000, max: 2400 },
    // **템포 브레이크.** 느린 밴드와 빠른 밴드가 멀리 떨어져 있고, 매 공격마다 갈아탄다
    // (tempoShiftEvery 1). 리듬을 읽으려는 순간 리듬이 뒤집힌다 — 심리전형의 정체성이다.
    tempoBands: [
      { min: 2000, max: 2800 },
      { min: 700, max: 1150 },
    ],
    tempoShiftEvery: 1,
    // 콤보 최저. 몰아치지 않고 단발로 교란한다
    comboChance: 0.08,
    comboGapMs: { min: 300, max: 480 },
    // 거리 흔들기 최다(세이버 0.12 < 에페 0.45 < 헝가리안). 간합을 끊임없이 흔든다
    stepFeintChance: 0.55,
    // 리포스트 압박은 중간(세이버 0.25 < 헝가리안 < 에페 0.55)
    ripostePressure: 0.4,
    // 페인트 비율 최고(세이버 0.3 < 에페 0.55 < 헝가리안). 진짜와 가짜를 못 가르게 한다
    feintRatio: 0.6,
    // 선호 간합 중간~원거리(세이버 52 근접, 에페 38 원거리 사이)
    preferredD: 43,
    stepSpeed: 16,
    // 사브르계(라다엘리 계승). 락아웃 170ms 시뮬타네를 세이버와 공유한다(FAMILY)
    family: 'sabre',
    styleName: '헝가리안',
    // 몰아붙이기보다 흔들기 위주라 라인 몰기는 중간 이하
    lineDrive: 0.3,
    color: colors.blue.light,
  },
];

/** 거리 흔들기 한 걸음의 속도와 길이. 앞으로 훅 들어왔다 선호 간합으로 되돌아간다. */
const STEP_FEINT_SPEED = 30;
const STEP_FEINT_MS = 420;

/**
 * 라인 몰기 (R3). 상대를 피스트 뒤로 밀어붙이는 전술이다.
 * 흔들기보다 느리고 길게 민다. 내가 간합을 지키려고 물러나면 그만큼 뒤가 줄어든다.
 * 판단은 전부 주입된 rng를 거친다.
 */
const DRIVE_SPEED = 12;
const DRIVE_MS = { min: 700, max: 1500 };
const DRIVE_GAP = { min: 1800, max: 3600 };

export function getSchool(key) {
  return SCHOOLS.find((s) => s.key === key) ?? SCHOOLS[0];
}

/** 시드로 유파를 고른다. 같은 시드는 같은 상대를 준다. */
export function pickSchool(rng) {
  return SCHOOLS[Math.floor(rng.next() * SCHOOLS.length) % SCHOOLS.length];
}

/** 선택값(protocol SCHOOL) → SCHOOLS 유파 키. mixed와 미지정은 여기 없다(스케줄러가 처리). */
const SELECT_KEY = {
  [SCHOOL.SABRE]: 'italian-saber',
  [SCHOOL.EPEE]: 'french-epee',
  [SCHOOL.HUNGARIAN]: 'hungarian',
};

/**
 * 통합 모드 난이도 계수(+@). "세 스타일을 조합하고 진화시키는 코치이자 상대"의 구현이다.
 * 공격 간격을 0.9배로 줄여(빨라지고) 페인트를 조금 더 낸다. 전부 소폭이고 상한을 둔다.
 */
const MIX_BOOST = { interval: 0.9, feint: 1.12, feintCap: 0.72 };
const scaleRange = (r, f) => ({ min: r.min * f, max: r.max * f });

/** 유파 프로필에 난이도 계수를 곱한 통합 모드 프로필. 이름은 활성 스타일로 바꾼다. */
function intensify(school) {
  return {
    ...school,
    name: `MIXED ${school.styleName} 스타일`,
    attackIntervalMs: scaleRange(school.attackIntervalMs, MIX_BOOST.interval),
    tempoBands: school.tempoBands.map((b) => scaleRange(b, MIX_BOOST.interval)),
    comboGapMs: scaleRange(school.comboGapMs, MIX_BOOST.interval),
    feintRatio: Math.min(MIX_BOOST.feintCap, school.feintRatio * MIX_BOOST.feint),
  };
}

/**
 * 유파 스케줄러. 진입점이 넘긴 선택값(protocol SCHOOL) 하나로 네 모드를 모두 처리한다.
 *
 * - 특정 유파(sabre/epee/hungarian): 고정. advance는 no-op.
 * - mixed: 득점(라운드)마다 3유파 프로필 중 하나로 전환한다. **직전과 다른 유파 우선**(항상
 *   나머지 둘 중에서 뽑는다). 각 프로필에 난이도 계수를 곱한다(강화 +@).
 * - 미지정(기본): pickSchool(rng)로 한 번 뽑고 고정한다. **기준 서명 경로다.**
 *
 * 난수는 주입된 rng만 쓴다. 고정/기본 경로의 advance는 rng를 건드리지 않으므로
 * 스케줄러 도입이 기준 서명에 영향을 주지 않는다.
 */
export function createSchoolScheduler(select, rng) {
  const isMixed = select === SCHOOL.MIXED;
  const fixedKey = SELECT_KEY[select] ?? null;
  let idx = 0;
  let current = null;

  function setIndex(i) {
    idx = i;
    current = isMixed ? intensify(SCHOOLS[i]) : SCHOOLS[i];
  }
  function init() {
    if (isMixed) {
      setIndex(Math.floor(rng.next() * SCHOOLS.length) % SCHOOLS.length);
    } else if (fixedKey) {
      const s = getSchool(fixedKey);
      idx = SCHOOLS.indexOf(s);
      current = s;
    } else {
      const s = pickSchool(rng); // 기본 경로: 기존과 동일한 rng 소비
      idx = SCHOOLS.indexOf(s);
      current = s;
    }
  }
  init();

  return {
    mixed: isMixed,
    get school() {
      return current;
    },
    /** 득점마다 호출. mixed면 직전과 다른 유파로 바꾸고 true, 아니면 no-op false. */
    advance() {
      if (!isMixed) return false;
      const others = [];
      for (let i = 0; i < SCHOOLS.length; i += 1) if (i !== idx) others.push(i);
      setIndex(others[Math.floor(rng.next() * others.length) % others.length]);
      return true;
    },
    reset() {
      init();
    },
  };
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

  // 라인 몰기. 이따금 길게 밀어붙여 상대 뒤를 줄인다(R3)
  if (ai.mode === AI_MODE.IDLE && nowMs >= ai.driveAt) {
    ai.driveAt = nowMs + rng.range(DRIVE_GAP.min, DRIVE_GAP.max);
    ai.driveUntil = rng.chance(school.lineDrive ?? 0) ? nowMs + rng.range(DRIVE_MS.min, DRIVE_MS.max) : 0;
  }

  // 선호 간합으로 당기고 민다. 플레이어 입력과 합산되어 최종 d가 정해진다.
  const surge = nowMs < ai.stepUntil ? STEP_FEINT_SPEED : 0;
  const drive = nowMs < ai.driveUntil ? DRIVE_SPEED : 0;
  const drift = (Math.sign(school.preferredD - state.d) * school.stepSpeed + surge + drive) * dtSec;
  // **d를 직접 더하지 않는다.** 같은 변화량을 상대 위치에 실어 d가 간격에서 유도되게 한다(R3-1).
  // 경계에 닿지 않는 한 이 경로는 `state.d += drift`와 완전히 같은 값을 낸다.
  moveOpponent(state, drift);

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
