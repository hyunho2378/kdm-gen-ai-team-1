// 책임: 폰 자세를 조작 축 둘로 분해하고, 그 각도에서 가드 상태를 정한다.
//
// **여기는 입력 해석이지 판정이 아니다.** 출력은 guard on/off 불리언 하나이고,
// 그것이 이산 이벤트가 되어 기존 채널로 판정에 들어간다(ARENA_INPUT 1절).
// 각도 자체는 판정에 절대 닿지 않는다. 아날로그 값이 새면 같은 시드가 같은 결과를 못 낸다.
//
// **controller와 arena가 같은 파일을 읽는다.** controller는 실제 폰 자세로 가드를 내고,
// arena는 `?posetest=1` 미리보기가 같은 규칙을 화면에 표시한다. 두 곳이 각자 구현하면
// 미리보기가 실기와 다른 말을 하게 되고, 그러면 미리보기가 오히려 사람을 속인다.
//
// ── 좌표계 ──────────────────────────────────────────────────────────────────
// 컨트롤러가 보내는 쿼터니언은 캘리브레이션 자세 대비 **기기의 회전**이고
// 기준 기기 좌표계로 표현돼 있다(orientation.js가 기준의 켤레를 곱해 보낸다).
// 기준 그립이 "폰 세로, 충전 단자 아래, 화면이 몸 쪽"이라 그 좌표계가 곧 카메라 로컬이다.
//   +X 오른쪽   +Y 위   +Z 몸 쪽(카메라 뒤)   -Z 앞(상대 쪽)
// 칼날이 따라가는 것은 폰의 세로축(단자에서 상단)이므로 기준 자세에서 칼끝 벡터는 (0, 1, 0)이다.

/** 칼끝이 향하는 기준 벡터. 폰 세로축(손잡이에서 칼끝)이다. */
const BLADE_REST = [0, 1, 0];

const RAD2DEG = 180 / Math.PI;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * 조작 문턱. **손목 가동범위 기준이다.**
 * 팔을 휘둘러야 닿는 값이면 몇 판 만에 지쳐서 게임이 성립하지 않는다(실기 피드백).
 *
 * 켜는 각과 푸는 각을 벌린 이유는 경계 떨림 때문이다. 문턱이 하나면 손이 그 근처에 있을 때
 * guard on/off가 초당 수십 번 판정으로 쏟아진다.
 */
export const TILT = {
  rollOnDeg: 25,      // 이만큼 옆으로 기울면 가드
  rollOffDeg: 15,     // 이 안으로 돌아오면 풀린다
  // 앞뒤가 우세하면 가드가 아니다. 폰을 눕히는 것은 찌르기 방향이라
  // 그 도중에 옆으로 조금 틀어진 것까지 가드로 읽으면 두 동작이 싸운다.
  // 켜질 때는 좌우가 앞뒤보다 커야 하고, 풀릴 때는 앞뒤가 이 여유만큼 더 커야 한다.
  dominanceMarginDeg: 10,
};

/** 상태 이름. 화면 표시와 테스트가 같은 문자열을 쓴다. */
export const POSE_STATE = {
  NEUTRAL: 'neutral',   // 앙가르드. 이산 이벤트 없음
  GUARD: 'guard',
  THRUST_ZONE: 'thrust', // 앞으로 눕은 구간. 찌르기는 가속이 내지 각도가 내지 않는다
};

/**
 * 쿼터니언에서 칼끝 벡터를 뽑는다. [x, y, z, w] 순서다(three.js와 같은 관례).
 * 기준 자세에서 (0, 1, 0)이고, 폰을 움직이면 그 회전이 그대로 실린다.
 */
export function bladeVector(q) {
  if (!Array.isArray(q) || q.length !== 4) return [...BLADE_REST];
  const [x, y, z, w] = q;
  const [vx, vy, vz] = BLADE_REST;
  // v' = q * v * q^-1 을 전개한 표준형
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [
    vx + w * tx + (y * tz - z * ty),
    vy + w * ty + (z * tx - x * tz),
    vz + w * tz + (x * ty - y * tx),
  ];
}

/**
 * 칼끝 벡터를 조작 축 둘로 분해한다. **오일러각을 쓰지 않는다.**
 * 오일러 분해는 순서에 따라 값이 달라지고 짐벌락에서 두 축이 엉킨다.
 * 여기서는 구면 좌표라 두 축이 구조적으로 독립이다.
 *
 *   roll  좌우. 칼끝이 정중면에서 얼마나 벗어났는가. asin(x). 오른쪽이 양수
 *   pitch 앞뒤. 칼끝이 위에서 앞으로 얼마나 넘어갔는가. 앞이 양수
 *
 * 순수 좌우 기울임은 roll만, 순수 앞뒤 눕힘은 pitch만 움직인다(단위 검증 있음).
 */
export function tiltFromQuaternion(q) {
  const [x, y, z] = bladeVector(q);
  return {
    rollDeg: Math.asin(clamp(x, -1, 1)) * RAD2DEG,
    pitchDeg: Math.atan2(-z, y) * RAD2DEG,
  };
}

/**
 * 가드 상태 전이. **이전 상태를 받아 다음 상태를 낸다(히스테리시스).**
 * 순수 함수라 같은 입력이면 같은 출력이고, 미리보기와 실기가 같은 답을 낸다.
 */
export function nextGuard(guarding, tilt, cfg = TILT) {
  const roll = Math.abs(tilt.rollDeg);
  const pitch = Math.abs(tilt.pitchDeg);
  if (guarding) {
    // 풀리는 조건 둘. 좌우가 충분히 돌아왔거나, 앞뒤가 확실히 우세해졌거나
    if (roll < cfg.rollOffDeg) return false;
    if (pitch > roll + cfg.dominanceMarginDeg) return false;
    return true;
  }
  // 켜지는 조건. 좌우가 문턱을 넘고 그것이 우세 축이어야 한다
  return roll >= cfg.rollOnDeg && roll >= pitch;
}

/** 화면 표시용 상태. 가드가 아니면 앞뒤 기울기로 중립과 찌르기 구간을 가른다. */
export function poseState(guarding, tilt, cfg = TILT) {
  if (guarding) return POSE_STATE.GUARD;
  if (Math.abs(tilt.pitchDeg) > cfg.rollOnDeg && Math.abs(tilt.pitchDeg) > Math.abs(tilt.rollDeg)) {
    return POSE_STATE.THRUST_ZONE;
  }
  return POSE_STATE.NEUTRAL;
}

/**
 * pitch와 roll에서 쿼터니언을 만든다. **미리보기 전용의 역함수다.**
 * 슬라이더 값을 검 자세로 되돌려야 폰 없이 화면에서 확인할 수 있다.
 * roll을 먼저 걸고 pitch를 나중에 거는 순서라야 `tiltFromQuaternion`이 그대로 되받는다.
 */
export function quaternionFromTilt(pitchDeg, rollDeg) {
  const p = (pitchDeg / RAD2DEG) / 2;
  const r = (rollDeg / RAD2DEG) / 2;
  // 앞으로 눕힘은 x축 음의 회전(칼끝 +Y가 -Z로 간다), 좌우는 z축 음의 회전(칼끝이 +X로 간다)
  const qp = [-Math.sin(p), 0, 0, Math.cos(p)];
  const qr = [0, 0, -Math.sin(r), Math.cos(r)];
  const [ax, ay, az, aw] = qp;
  const [bx, by, bz, bw] = qr;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}
