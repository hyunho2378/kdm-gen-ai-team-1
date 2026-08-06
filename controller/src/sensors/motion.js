// 책임: DeviceMotion 구독과 이산 이벤트 감지 (C2-1).
//
// 보안 컨텍스트(https) 전용이라 실기 테스트는 배포 URL로만 한다. LAN IP로는 권한이 안 뜬다.
// 출력은 ARENA_INPUT 1절의 **이산 채널**이다. 연속 자세는 orientation.js가 따로 낸다.
// 폰에서 이미 둘을 갈라 보내므로 arena가 연속 스트림에서 THRUST를 재추론할 필요가 없다.
// 그래서 **여기 감지 품질이 곧 판정 품질**이다.
//
// ── 전방 축을 하드코딩하지 않는 이유 ────────────────────────────────────────
// DeviceMotion 가속도는 기기 좌표계다. 폰을 검처럼 쥐었을 때 "전방"이 +y인지 -z인지는
// 파지법과 기기와 브라우저마다 다르다. 상수로 박으면 반드시 어딘가에서 틀린다.
// 그래서 전방 축을 정하지 않고 **중력 기준 수평 성분이 지배적인가**로만 판정한다.
//   - 중력 방향은 캘리브레이션에서 재고 이후에도 아주 느린 EMA로 따라간다(기기 좌표계 기준)
//   - 찌르기는 수평이고 크다. 걷기는 수직 성분이 지배적이라 여기서 걸러진다
//   - 폰 고쳐잡기는 크기가 작고 지속이 짧아 최소 지속 필터에 걸린다
// 이러면 어떤 파지법에서도 같은 규칙이 돈다.

const G = 9.80665;

/** 기본 임계. 캘리브레이션에서 개인 보정으로 덮인다. */
export const DEFAULTS = {
  thrust: 18,          // m/s^2. 수평 성분 크기
  horizRatio: 1.25,    // 수평이 수직보다 이만큼 커야 찌르기다. 걷기를 여기서 자른다
  minHoldMs: 40,       // 단일 스파이크 무시. 이만큼은 임계 위에 머물러야 한다
  cooldownMs: 350,     // arena judge.js의 THRUST_COOLDOWN_MS와 같은 값
  // **가드는 기준 자세 안쪽이다.** 기준이 "폰 세로, 단자 아래"라 세워 둔 상태가 곧 가드다.
  // 전에는 부등호가 반대여서(기준에서 35도 이상 기울면 가드) 눕힐수록 가드가 켜졌다.
  // 눕히는 것은 찌르기 방향이라 두 동작이 같은 구간에서 싸웠다.
  guardZoneDeg: 20,     // 기준 자세에서 이 안이면 폰이 서 있는 것으로 본다
  guardReleaseDeg: 30,  // 풀리는 각. 문턱이 하나면 경계에서 on/off가 떨며 판정에 이벤트가 쏟아진다
  guardStillMs: 150,   // 그 자세로 이만큼 정지해야 가드다
  guardStillAcc: 3.0,  // 정지 판정 가속 상한
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

export function createMotion(opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
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
  let stillSince = 0;
  // 캘리브레이션 기준 중력. 가드 판정의 기준 자세다
  const baseGravity = { x: 0, y: -1, z: 0 };
  let baseSet = false;

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
   * 가드. **기준 자세(폰 세로)를 유지하고 잠깐 멈추면 켜진다.**
   * 앞으로 눕히면(찌르기 방향) 풀린다. 켜지는 각과 풀리는 각을 벌려 경계 떨림을 막는다.
   */
  function detectGuard(now, total) {
    if (!baseSet) return;
    const cosTilt = Math.min(1, Math.max(-1, dot(gravity, baseGravity)));
    const tilt = (Math.acos(cosTilt) * 180) / Math.PI;
    const still = total <= cfg.guardStillAcc;
    if (tilt <= cfg.guardZoneDeg && still) {
      if (!stillSince) stillSince = now;
      if (!guarding && now - stillSince >= cfg.guardStillMs) {
        guarding = true;
        cb.guard?.(true);
      }
      return;
    }
    stillSince = 0;
    if (guarding && tilt > cfg.guardReleaseDeg) {
      guarding = false;
      cb.guard?.(false);
    }
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
    detectGuard(now, len(acc));

    cb.sample?.({ horiz, vert: vertAbs, total: len(acc), dt, support, guarding, threshold: cfg.thrust });
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
    /** 캘리브레이션이 기준 자세를 박는다. 가드 판정의 기준이 된다. */
    setBaseline() {
      baseGravity.x = gravity.x;
      baseGravity.y = gravity.y;
      baseGravity.z = gravity.z;
      baseSet = true;
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
