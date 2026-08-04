// 책임: 자세 융합과 연속 채널 (C2-1). psiphi75/ahrs의 Madgwick 필터를 쓴다.
//
// 출력은 ARENA_INPUT 1절의 **연속 채널**이다. 판정에 절대 쓰이지 않고
// C3에서 arena의 `setSwordPose({ kind:'quaternion', value:[x,y,z,w] })`로 직결된다.
//
// ── 단위 함정 둘 ────────────────────────────────────────────────────────────
// 1. **자이로 단위.** ahrs의 Madgwick은 rad/s를 받는데 DeviceMotion rotationRate는 **deg/s**다.
//    변환을 빼먹는 것이 이 라이브러리에서 가장 흔한 버그다. DEG2RAD를 반드시 거친다.
// 2. **샘플 주기.** 기기마다 60Hz거나 그 이하이고 프레임마다도 흔들린다.
//    고정 상수를 넣으면 필터가 서서히 어긋난다. **이벤트 간 dt를 실측해 update의 마지막 인자로 넘긴다.**
//
// 송신은 30Hz로 스로틀한다. 센서는 60Hz 이상으로 오는데 그대로 쏘면 C3에서 대역과 배터리를 태운다.
// 이산 이벤트는 스로틀하지 않는다(motion.js가 즉시 낸다).

import AHRS from 'ahrs';

const DEG2RAD = Math.PI / 180;
/** 송신 주기. SERVER.md 프로토콜의 MOTION 스트림 주기와 같다. */
export const SEND_HZ = 30;
const SEND_MS = 1000 / SEND_HZ;

/** 쿼터니언 곱. [x, y, z, w] 순서다(three.js와 같은 관례). */
function mul(a, b, out) {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  out[0] = aw * bx + ax * bw + ay * bz - az * by;
  out[1] = aw * by - ax * bz + ay * bw + az * bx;
  out[2] = aw * bz + ax * by - ay * bx + az * bw;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}

export function createOrientation() {
  // sampleInterval은 초기값일 뿐이다. 실제 적분은 update의 deltaTimeSec가 쥔다
  const ahrs = new AHRS({ sampleInterval: 60, algorithm: 'Madgwick', beta: 0.4 });

  let attached = false;
  let lastAt = 0;
  let lastSendAt = 0;
  let hz = 0;
  // 캘리브레이션 기준의 켤레. 상대 회전을 만들 때 쓴다
  let baseConj = null;
  const raw = [0, 0, 0, 1];
  const rel = [0, 0, 0, 1];
  const cb = { pose: null };

  function handle(e) {
    const r = e.rotationRate;
    const a = e.accelerationIncludingGravity;
    if (!r || r.alpha === null || !a || a.x === null) return;

    const now = performance.now();
    // dt 실측. 첫 이벤트만 1/60으로 가정하고 이후는 전부 측정값이다
    const dt = lastAt ? Math.min(0.1, (now - lastAt) / 1000) : 1 / 60;
    lastAt = now;
    if (dt > 0) hz += (1 / dt - hz) * 0.05;

    // **deg/s → rad/s.** 이 줄이 빠지면 필터가 57배 빠른 회전을 보고 자세가 튄다
    ahrs.update(
      r.beta * DEG2RAD,
      r.gamma * DEG2RAD,
      r.alpha * DEG2RAD,
      a.x,
      a.y,
      a.z,
      undefined,
      undefined,
      undefined,
      dt
    );

    const q = ahrs.getQuaternion();
    raw[0] = q.x;
    raw[1] = q.y;
    raw[2] = q.z;
    raw[3] = q.w;

    // 기준 자세를 원점으로 옮긴다. 보정은 여기서만 하고 소비처는 결과만 받는다
    if (baseConj) mul(baseConj, raw, rel);
    else rel.splice(0, 4, ...raw);

    // 30Hz 스로틀. 연속 채널만 조인다
    if (now - lastSendAt >= SEND_MS) {
      lastSendAt = now;
      cb.pose?.(rel);
    }
  }

  return {
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
    /** 캘리브레이션. 지금 자세를 원점으로 삼는다(켤레를 저장). */
    setBaseline() {
      baseConj = [-raw[0], -raw[1], -raw[2], raw[3]];
    },
    /** 마지막 상대 자세. debug 화면이 읽는다. */
    read() {
      return rel;
    },
    /** 실측 이벤트 주기. 고정 상수를 쓰지 않는다는 증거이자 튜닝 지표다. */
    getHz() {
      return hz;
    },
  };
}
