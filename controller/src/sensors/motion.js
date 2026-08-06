// 책임: DeviceMotion 구독과 이산 이벤트 감지 (C2-1).
//
// 보안 컨텍스트(https) 전용이라 실기 테스트는 배포 URL로만 한다. LAN IP로는 권한이 안 뜬다.
// 출력은 ARENA_INPUT 1절의 **이산 채널**이다. 연속 자세는 orientation.js가 따로 낸다.
// 폰에서 이미 둘을 갈라 보내므로 arena가 연속 스트림에서 THRUST를 재추론할 필요가 없다.
// 그래서 **여기 감지 품질이 곧 판정 품질**이다.
//
// ── 두 이산 이벤트가 서로 다른 것을 본다 ────────────────────────────────────
// **찌르기는 가속이 내고 가드는 자세가 낸다.** 축도 다르다(앞뒤 대 좌우).
// 하나가 다른 하나의 궤적에 얹히면 두 동작이 같은 구간에서 싸우므로 소스부터 갈라 둔다.
// 자세는 자이로가 아는 것이라 여기서 만들지 않고 orientation.js가 준 것을 받아 쓴다.
//
// ── 전방 축을 하드코딩하지 않는 이유 ────────────────────────────────────────
// DeviceMotion 가속도는 기기 좌표계다. 폰을 검처럼 쥐었을 때 "전방"이 +y인지 -z인지는
// 파지법과 기기와 브라우저마다 다르다. 상수로 박으면 반드시 어딘가에서 틀린다.
// 그래서 전방 축을 정하지 않고 **중력 기준 수평 성분이 지배적인가**로만 판정한다.
//   - 중력 방향은 캘리브레이션에서 재고 이후에도 아주 느린 EMA로 따라간다(기기 좌표계 기준)
//   - 찌르기는 수평이고 크다. 걷기는 수직 성분이 지배적이라 여기서 걸러진다
//   - 폰 고쳐잡기는 크기가 작고 지속이 짧아 최소 지속 필터에 걸린다
// 이러면 어떤 파지법에서도 같은 규칙이 돈다.

import { nextGuardTwist } from '../../../shared/pose.js';

const G = 9.80665;

/** 최근 최대 수평 가속을 붙들어 두는 시간. 실기에서 자기 손목 값을 읽으라고 있는 값이다. */
const PEAK_HOLD_MS = 2000;

/** 기본 임계. 캘리브레이션에서 개인 보정으로 덮인다. */
export const DEFAULTS = {
  // **손목 스케일.** 여기 값은 EMA를 지난 뒤의 크기라 손이 낸 실제 피크보다 훨씬 작다.
  // 아래 EMA 0.2는 120ms짜리 찌르기 펄스를 **원 피크의 56%까지 깎는다**(합성 신호 실측).
  // 그래서 예전 18은 실제로 **원 피크 37 m/s^2 = 3.77G**를 요구했다. 손목으로 낼 수 있는
  // 값이 아니라 팔을 휘둘러야 나오는 값이고, 그것이 "몇 판 만에 지친다"의 정체였다.
  //
  // 8이면 원 피크 17 = 1.73G다. 앉아서 손목 스냅으로 닿는 범위이면서 툭 건드리는 수준은 아니다.
  // **크기 관문을 내려도 오탐이 안 늘어난다**(실측). 걷기와 고쳐잡기를 자르는 것은
  // 크기가 아니라 수평비와 최소지속이고, 그 둘은 그대로 두었다.
  // 캘리브레이션이 개인 노이즈의 2.4배로 이 값을 밀어 올리는 바닥 보정도 그대로 산다.
  // **최종 확정은 실기다.** ?debug=1의 "수평 최대"로 자기 손목 값을 읽고 맞춘다
  thrust: 8,           // m/s^2. 수평 성분 크기(EMA 통과 후)
  horizRatio: 1.25,    // 수평이 수직보다 이만큼 커야 찌르기다. 걷기를 여기서 자른다
  minHoldMs: 40,       // 단일 스파이크 무시. 이만큼은 임계 위에 머물러야 한다
  cooldownMs: 350,     // arena judge.js의 THRUST_COOLDOWN_MS와 같은 값
};

/** power 정규화. 임계에서 0, 임계의 2.5배에서 1이다(ARENA_INPUT 8절 미해결 해소). */
export const POWER_SPAN = 2.5;
export function normalizePower(peak, threshold) {
  const hi = threshold * POWER_SPAN;
  return Math.min(1, Math.max(0, (peak - threshold) / (hi - threshold)));
}

const len = (v) => Math.hypot(v.x, v.y, v.z);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

/** 지원 수준. 화면이 이 값으로 폴백을 고른다. */
export const SUPPORT = {
  FULL: 'full',                 // acceleration(중력 제거)이 온다
  GRAVITY_ONLY: 'gravityOnly',  // includingGravity만. 하이패스로 분리한다
  NONE: 'none',                 // 센서 없음. 탭 버튼 모드로 내려간다
};

/**
 * @param opts.readTwist 지금 폰이 장축 둘레로 얼마나 비틀렸는지(누수 적분값, 도)를 돌려주는 함수.
 *   **가드는 비틀림이 낸다(GUARD_TWIST).** 비틀림은 자이로가 알고 여기는 가속만 안다. 그래서 **주입받는다.**
 *   pipeline이 orientation.twistDeg를 물려 준다. 없으면 가드가 안 나가고 찌르기만 산다(우아한 저하).
 * @param opts.readTilt 기준 대비 기울기(pitch/roll). **더는 가드를 내지 않는다.** ?debug 표시 전용이다.
 */
export function createMotion(opts = {}) {
  const { readTilt = null, readTwist = null, ...rest } = opts;
  const cfg = { ...DEFAULTS, ...rest };
  let support = SUPPORT.NONE;
  let attached = false;

  // 기기 좌표계 기준 중력 방향. 아주 느린 EMA로 따라간다
  const gravity = { x: 0, y: -1, z: 0 };
  let gravitySeen = false;
  const acc = { x: 0, y: 0, z: 0 };
  const EMA = 0.2;
  const GRAV_EMA = 0.02;   // 중력은 아주 느리게. 빠르면 찌르기가 중력으로 흡수된다

  let lastAt = 0;
  let overSince = 0;
  let peak = 0;
  let lastThrustAt = -Infinity;
  let guarding = false;
  // 최근 최대 수평 가속. 실기 튜닝용 표시값이고 판정에 쓰지 않는다
  let holdPeak = 0;
  let holdAt = 0;
  let tilt = { pitchDeg: 0, rollDeg: 0 };
  // 비틀림 누수 적분값(도). 가드 소스이자 ?debug 표시값이다. 판정에는 이 값이 아니라 가드 불리언만 간다
  let twist = 0;

  const cb = { thrust: null, guard: null, sample: null };

  function trackGravity(withG) {
    const m = len(withG) || 1;
    const nx = withG.x / m;
    const ny = withG.y / m;
    const nz = withG.z / m;
    if (!gravitySeen) {
      gravity.x = nx;
      gravity.y = ny;
      gravity.z = nz;
      gravitySeen = true;
      return;
    }
    gravity.x += (nx - gravity.x) * GRAV_EMA;
    gravity.y += (ny - gravity.y) * GRAV_EMA;
    gravity.z += (nz - gravity.z) * GRAV_EMA;
    const n = len(gravity) || 1;
    gravity.x /= n;
    gravity.y /= n;
    gravity.z /= n;
  }

  /**
   * 피크 감지. 네 관문을 전부 통과해야 찌르기다.
   * 크기 / 수평 지배 / 최소 지속 / 쿨다운. 하나라도 빼면 걷기와 고쳐잡기가 샌다.
   */
  function detectThrust(now, horiz, vertAbs) {
    const strongEnough = horiz >= cfg.thrust;
    const horizontal = horiz >= vertAbs * cfg.horizRatio;

    if (strongEnough && horizontal) {
      if (!overSince) overSince = now;
      peak = Math.max(peak, horiz);
      return;
    }
    if (!overSince) return;

    const held = now - overSince;
    const p = peak;
    overSince = 0;
    peak = 0;
    if (held < cfg.minHoldMs) return;                       // 단일 스파이크
    if (now - lastThrustAt < cfg.cooldownMs) return;        // 쿨다운
    lastThrustAt = now;
    cb.thrust?.(normalizePower(p, cfg.thrust), p);
  }

  /**
   * 가드. **장축 둘레로 비틀면 켜지고 풀면 풀린다 (GUARD_TWIST, 길 B).**
   *
   * 이전(길 A)은 좌우로 기울이기(roll)였다. 그 전(더 이전)은 "기준 자세 부근이면 가드"라
   * **상시로 켜졌고** AI가 공격으로 득점하지 못했다. 그래서 가드를 능동적 동작으로 옮겼고,
   * 이제 사용자가 실제로 하는 동작인 "잡은 채 화면이 몸을 보게 비틀기"로 소스를 바꿨다.
   *
   * **소스는 비틀림 각속도의 누수 적분이다.** 비틀림은 swing에서 구조적으로 잘려 있어(트위스트 제거)
   * 절대각으로 재면 드리프트한다. orientation.js가 각속도를 누수 적분해 드리프트 면역인 값을 주고,
   * 여기서는 그 **크기**로 히스테리시스를 건다. 히스테리시스 규칙은 `shared/pose.js`의 `nextGuardTwist`가
   * 쥐고, arena의 `?posetest=1` 미리보기가 같은 함수를 읽어 미리보기와 실기가 같은 말을 한다.
   *
   * **roll 기반 가드는 더 이상 라이브 가드를 내지 않는다.** 두 소스가 동시에 가드를 내면 기울임과
   * 비틀림이 싸운다. 세로 정지에서는 비틀림 적분이 0 근처라 아무 이벤트도 안 낸다(세로 중립 불변식).
   * 비틀기는 자이로 각속도라 thrust의 가속 채널과 축, 소스가 완전히 직교해 서로 싸우지 않는다.
   */
  function detectGuard() {
    if (!readTwist) return;
    twist = readTwist();
    const next = nextGuardTwist(guarding, Math.abs(twist));
    if (next === guarding) return;
    guarding = next;
    cb.guard?.(guarding);
  }

  function handle(e) {
    const now = performance.now();
    // **dt를 실측한다.** 이벤트 주기는 기기마다 60Hz거나 그 이하다. 상수로 두면 안 된다
    const dt = lastAt ? Math.min(0.1, (now - lastAt) / 1000) : 1 / 60;
    lastAt = now;

    const raw = e.acceleration;
    const withG = e.accelerationIncludingGravity;
    let lin = null;

    if (raw && raw.x !== null && (raw.x || raw.y || raw.z)) {
      support = SUPPORT.FULL;
      lin = { x: raw.x, y: raw.y, z: raw.z };
      // 중력 방향은 includingGravity에서만 얻는다. 없으면 직전 값을 유지한다
      if (withG && withG.x !== null) trackGravity(withG);
    } else if (withG && withG.x !== null) {
      // **중력 제거 폴백.** 자이로 없는 기기는 acceleration이 null로 온다.
      // 느린 EMA로 중력을 추정해 빼는 하이패스다
      support = SUPPORT.GRAVITY_ONLY;
      trackGravity(withG);
      lin = {
        x: withG.x - gravity.x * G,
        y: withG.y - gravity.y * G,
        z: withG.z - gravity.z * G,
      };
    } else {
      return;
    }

    acc.x += (lin.x - acc.x) * EMA;
    acc.y += (lin.y - acc.y) * EMA;
    acc.z += (lin.z - acc.z) * EMA;

    // 중력 기준 수직과 수평으로 가른다. 전방 축을 가정하지 않는다
    const vert = dot(acc, gravity);
    const h = {
      x: acc.x - gravity.x * vert,
      y: acc.y - gravity.y * vert,
      z: acc.z - gravity.z * vert,
    };
    const horiz = len(h);
    const vertAbs = Math.abs(vert);

    detectThrust(now, horiz, vertAbs);
    detectGuard();
    // 자세는 가드 결정에서 빠졌지만 ?debug 표시용으로 계속 읽는다(가드 소스는 위 twist다)
    if (readTilt) tilt = readTilt();

    // 최근 최대 수평. 실기에서 자기 손목 스냅이 임계에 닿는지 눈으로 재는 값이다
    if (horiz > holdPeak || now - holdAt > PEAK_HOLD_MS) {
      holdPeak = horiz;
      holdAt = now;
    }

    cb.sample?.({
      horiz,
      vert: vertAbs,
      total: len(acc),
      dt,
      support,
      guarding,
      threshold: cfg.thrust,
      peak: holdPeak,
      tilt,
      twist,
    });
  }

  return {
    /** 권한은 화면이 이미 받았다. 여기서는 구독만 한다. */
    attach() {
      if (attached) return;
      attached = true;
      window.addEventListener('devicemotion', handle);
    },
    detach() {
      if (!attached) return;
      attached = false;
      window.removeEventListener('devicemotion', handle);
    },
    on(name, fn) {
      if (name in cb) cb[name] = typeof fn === 'function' ? fn : null;
    },
    /** 개인 임계. 캘리브레이션 중 관측한 정지 노이즈 위로 올려 잡는다. */
    setThreshold(v) {
      cfg.thrust = Math.max(6, v);
    },
    getConfig() {
      return { ...cfg };
    },
    getSupport() {
      return support;
    },
    isGuarding() {
      return guarding;
    },
  };
}
