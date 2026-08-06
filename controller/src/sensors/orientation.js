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
import { tiltFromQuaternion } from '../../../shared/pose.js';

const DEG2RAD = Math.PI / 180;

/**
 * 중력 추정 시정수(초). **상보 필터의 느린 쪽이다.**
 * 짧으면 찌를 때의 선형 가속이 축을 흔들고, 길면 자세를 바꿨을 때 축이 늦게 따라온다.
 * 손맛이 굼뜨면 내리고 흔들리면 올린다(구조 변경 없는 강도 한 단계).
 */
const G_TAU_SEC = 0.9;
/**
 * 비틀림 누수 적분 시정수(초) (GUARD_TWIST, 길 B). **손맛의 첫 레버다.**
 * 빠른 비틀기는 쌓이기 전에 새지 못해 문턱을 넘고, 느린 드리프트는 쌓이기 전에 새어 0으로 돌아온다.
 * 짧으면 예민하고(작은 흔들림도 가드) 길면 둔하다(정지 바이어스가 정상상태 bias x TAU만큼 쌓인다).
 * 100~200ms 스냅이 TWIST.onDeg를 넘기고 정지 드리프트가 수 초 안에 0으로 새는 값으로 잡는다.
 * G_TAU_SEC와 같은 계수식 dt 보정이라 샘플 주기가 흔들려도 같은 시정수를 낸다. `?debug`로 확정한다.
 */
const TWIST_TAU_SEC = 2.5;
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

/** 벡터를 쿼터니언으로 돌린다. v' = q v q^-1. */
function rotate(q, v, out) {
  const [x, y, z, w] = q;
  const [vx, vy, vz] = v;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  out[0] = vx + w * tx + (y * tz - z * ty);
  out[1] = vy + w * ty + (z * tx - x * tz);
  out[2] = vz + w * tz + (x * ty - y * tx);
  return out;
}

/**
 * 트위스트(축 회전) 제거. **`rel`에서 월드 up 둘레 회전을 잘라내고 기울기만 남긴다.**
 *
 * ── 왜 필요한가 ─────────────────────────────────────────────────────────────
 * 자기계 없는 AHRS는 heading(yaw)을 관측할 수 없어 세션 내내 드리프트한다.
 * 그 드리프트는 **월드 up 둘레 회전**이고, 기준 켤레를 곱해도 사라지지 않는다.
 *   rel_측정 = T(u, 표류각) * rel_참
 * 폰이 정확히 세로가 아닐 때(즉 거의 항상) 이 T가 칼끝 벡터를 up 둘레로 돌려
 * pitch를 roll로 흘린다. 그래서 "그때그때 다름"이 시간에 비례해 커진다.
 *
 * ── 왜 이 방법이 통하는가 ───────────────────────────────────────────────────
 * 왼쪽 인수분해 `rel = 트위스트 * 스윙`(트위스트 축은 base 좌표계에 고정된 u)에서
 * 표류 트위스트와 참 트위스트는 **같은 축이라 서로 교환되고 하나로 합쳐진다.**
 * 그래서 스윙은 표류에 영향을 받지 않는다. yaw를 추정해 빼는 것이 아니라
 * 구조적으로 스윙만 꺼내는 것이라 추정 오차가 개입할 여지가 없다.
 *
 * 남은 스윙을 **기존 `tiltFromQuaternion`에 그대로 통과**시키므로
 * pitch/roll의 단위도 가드 문턱도 하나도 안 바뀐다.
 */
function swingAbout(q, u, out) {
  // q의 벡터부를 축 u에 정사영한 것이 트위스트 성분이다
  const d = q[0] * u[0] + q[1] * u[1] + q[2] * u[2];
  let tx = u[0] * d;
  let ty = u[1] * d;
  let tz = u[2] * d;
  let tw = q[3];
  const n = Math.hypot(tx, ty, tz, tw);
  // 스윙이 180도에 가까우면 트위스트가 퇴화한다. 그때는 자를 것이 없으므로 원본을 그대로 둔다
  if (n < 1e-6) {
    out[0] = q[0];
    out[1] = q[1];
    out[2] = q[2];
    out[3] = q[3];
    return out;
  }
  tx /= n;
  ty /= n;
  tz /= n;
  tw /= n;
  // swing = conj(twist) * q
  return mul([-tx, -ty, -tz, tw], q, out);
}

export function createOrientation() {
  // sampleInterval은 초기값일 뿐이다. 실제 적분은 update의 deltaTimeSec가 쥔다
  const ahrs = new AHRS({ sampleInterval: 60, algorithm: 'Madgwick', beta: 0.4 });

  let attached = false;
  let lastAt = 0;
  let lastSendAt = 0;
  let hz = 0;
  /**
   * 비틀림 누수 적분값(도) (GUARD_TWIST). **자이로 장축 각속도를 누수 적분한 값이다.**
   * 절대 트위스트각이 아니라 각속도의 적분이라 드리프트에 면역이다. motion.js가 크기로 받아
   * 가드 히스테리시스를 건다. swing과 완전히 별개이고 판정에는 이 값이 아니라 가드 불리언만 간다.
   */
  let twist = 0;
  // 캘리브레이션 기준의 켤레. 상대 회전을 만들 때 쓴다
  let baseConj = null;
  // 기준 자세 원본. MSG.CALIB이 이 값을 싣는다(ARENA_INPUT 4절의 기준 쿼터니언)
  let base = null;
  const raw = [0, 0, 0, 1];
  const rel = [0, 0, 0, 1];
  /** 트위스트(yaw)를 잘라낸 상대 자세. 소비처는 전부 이것을 본다. */
  const swing = [0, 0, 0, 1];
  /**
   * 기기 좌표계에서 본 중력 방향(정규화). **상보 필터의 느린 쪽이다.**
   * AHRS가 짧은 시간의 자이로 적분을 이미 쥐고 있으므로 여기서는 가속도의 저주파만 뽑는다.
   * 중력은 up 둘레 회전에 불변이라 이 축 자체가 표류에 면역이다.
   */
  const gDev = [0, 1, 0];
  /** base 좌표계에서 본 월드 up. 스윙-트위스트의 축이다. */
  const up = [0, 1, 0];
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

    // ── 비틀림 채널 (GUARD_TWIST, 길 B) ──────────────────────────────────────
    // 자이로 각속도를 칼날 장축(기기 좌표계 BLADE_REST=(0,1,0), 곧 기기 Y축)에 정사영한 성분이
    // 폰을 자기 장축 둘레로 도는 속도다. DeviceMotion rotationRate에서 Y축 둘레 회전은 gamma다
    // (ahrs.update의 둘째 인자와 같은 축). BLADE_REST=(0,1,0)과의 내적이 곧 이 성분이다.
    // **부호는 ?debug로 검증한다.** 가드는 크기 기준이라 부호가 틀려도 동작은 같다.
    //
    // **누수 적분.** 빠른 비틀기는 새기 전에 쌓여 문턱을 넘고, 느린 드리프트는 쌓이기 전에 새어
    // 0으로 돌아온다. 절대 트위스트각은 자기계 없는 세션에서 드리프트하므로 각속도로만 잡는다.
    const twistRate = r.gamma;                 // deg/s. 장축(기기 Y) 둘레 회전 성분
    twist += twistRate * dt;
    twist *= Math.exp(-dt / TWIST_TAU_SEC);

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

    // 기기 좌표계 중력. **가속도의 저주파만 남긴다.** 찌를 때의 선형 가속이 섞이면
    // 축이 흔들리므로 시정수를 길게 잡는다. 계수는 dt에 맞춰 보정해 샘플 주기가 흔들려도
    // 같은 시정수를 낸다
    const k = 1 - Math.exp(-dt / G_TAU_SEC);
    const gn = Math.hypot(a.x, a.y, a.z);
    if (gn > 1e-3) {
      gDev[0] += (a.x / gn - gDev[0]) * k;
      gDev[1] += (a.y / gn - gDev[1]) * k;
      gDev[2] += (a.z / gn - gDev[2]) * k;
    }

    // 기준 자세를 원점으로 옮긴다. 보정은 여기서만 하고 소비처는 결과만 받는다
    if (baseConj) mul(baseConj, raw, rel);
    else rel.splice(0, 4, ...raw);

    // **월드 up을 base 좌표계로 옮겨 스윙 축으로 쓴다.**
    // rel이 표류를 품고 있어도 이 축은 표류 회전의 축 자신이라 그 회전에 불변이다.
    updateUp();
    swingAbout(rel, up, swing);

    // 30Hz 스로틀. 연속 채널만 조인다
    if (now - lastSendAt >= SEND_MS) {
      lastSendAt = now;
      // **렌더에도 스윙을 보낸다.** 표류를 그대로 보내면 화면의 검이 세션 내내
      // 세로축 둘레로 서서히 돌아간다
      cb.pose?.(swing);
    }
  }

  /** base 좌표계에서 본 월드 up을 갱신한다. 기기 중력을 rel로 옮기고 정규화한다. */
  function updateUp() {
    rotate(rel, gDev, up);
    const n = Math.hypot(up[0], up[1], up[2]);
    if (n > 1e-6) {
      up[0] /= n;
      up[1] /= n;
      up[2] /= n;
    } else {
      up[0] = 0;
      up[1] = 1;
      up[2] = 0;
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
    /**
     * 캘리브레이션. 지금 자세를 원점으로 삼는다(켤레를 저장).
     *
     * **상대 자세를 그 자리에서 다시 계산한다.** 안 그러면 다음 센서 이벤트가 올 때까지
     * `rel`이 보정 전 값으로 남는다. 가드가 이 값의 각도를 보게 되면서 그 한 틱이
     * 엉뚱한 guard on/off 한 쌍을 판정에 밀어 넣을 수 있게 됐다. 경기 시작 순간이라 더 나쁘다.
     */
    setBaseline() {
      base = [raw[0], raw[1], raw[2], raw[3]];
      baseConj = [-raw[0], -raw[1], -raw[2], raw[3]];
      mul(baseConj, raw, rel);
      // **스윙까지 그 자리에서 다시 만든다.** rel만 갱신하고 두면 다음 센서 이벤트까지
      // 소비처가 보정 전 스윙을 본다. 예전 한 틱 지연 버그와 같은 함정이다
      updateUp();
      swingAbout(rel, up, swing);
      // **비틀림 적분기도 원점으로.** 캘리브레이션 직전에 쌓인 값이 남아 경기 시작 순간
      // 엉뚱한 가드 한 쌍을 밀어 넣지 않게 한다(세로 중립 이산 이벤트 0 불변식).
      twist = 0;
    },
    /**
     * 기준 자세 원본. MSG.CALIB이 싣는 값이다. **read()를 대신 쓰면 안 된다.**
     * 둘은 다른 것이다. 여기는 보정 전 절대 자세이고 read()는 그 기준 대비 상대 자세라
     * 캘리브레이션 직후에는 단위 쿼터니언이다(예전에는 보정 전 값이 그대로 남아
     * 92도짜리 엉뚱한 쿼터니언이 나갔다. 지금은 setBaseline이 그 자리에서 다시 계산한다).
     */
    getBaseline() {
      return base;
    },
    /** 마지막 상대 자세. debug 화면이 읽는다. */
    read() {
      return swing;
    },
    /**
     * 기준 대비 기울기를 조작 축 둘로 분해한 값(도). `{ pitchDeg, rollDeg }`.
     *
     * **연속 채널의 예외가 아니다.** 이 값 자체는 판정에 안 들어간다.
     * motion.js가 이걸 받아 문턱을 넘는 순간에만 guard on/off라는 **이산 이벤트**를 내고,
     * 판정에 가는 것은 그 불리언뿐이다(ARENA_INPUT 1절 채널 계약).
     */
    tilt() {
      return tiltFromQuaternion(swing);
    },
    /**
     * 비틀림 누수 적분값(도) (GUARD_TWIST). motion.js가 이걸 받아 크기 히스테리시스로 가드를 낸다.
     * **연속 채널의 예외가 아니다.** 이 값은 판정에 안 들어가고, 문턱을 넘는 순간의 가드 불리언만 간다.
     * swing과 별개라 세로 고정 보장(swing 경로)에는 손대지 않는다. 부호는 방향, 크기는 세기다.
     */
    twistDeg() {
      return twist;
    },
    /** 실측 이벤트 주기. 고정 상수를 쓰지 않는다는 증거이자 튜닝 지표다. */
    getHz() {
      return hz;
    },
  };
}
