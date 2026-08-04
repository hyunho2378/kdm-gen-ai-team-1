// 책임: 선수와 검끝의 좌표 계산. 렌더 레이어들이 공유한다.
// 판정에 쓰이지 않는다. 판정은 judge.js의 d 하나만 본다.

import { RULES } from '../../judge.js';

const GROUND = 0.72;      // 바닥선 높이 비율
const GAP_FAR = 0.62;     // d 최소일 때 두 선수 간 화면 폭 비율
const GAP_NEAR = 0.17;    // d 최대일 때

/** d는 근접도다. 클수록 가까우므로 간격은 반비례한다. */
export function layout(w, h, d) {
  const t = (d - RULES.D_MIN) / (RULES.D_MAX - RULES.D_MIN);
  const gap = w * (GAP_FAR + (GAP_NEAR - GAP_FAR) * t);
  const cx = w * 0.5;
  const groundY = h * GROUND;
  const scale = h / 900; // 1440x900 기준으로 그린 뒤 비율 보정
  return {
    groundY,
    scale,
    me: { x: cx - gap / 2, y: groundY, dir: 1 },
    ai: { x: cx + gap / 2, y: groundY, dir: -1 },
  };
}

/** thrust 이징. tokens.motion.thrust와 같은 커브를 수치로 근사한다(캔버스 전용). */
export function thrustEase(t) {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * 검끝 좌표. 런지 진행 t(0~1)에 따라 전방으로 호를 그린다.
 * 뻗을 때 빠르고 거둘 때 느린 비대칭이 찌르기의 인상을 만든다.
 *
 * **우선순위 thrust > guard(홀드 중) > 디폴트.** three 경로(R1)와 같은 순서다.
 * 가드를 먼저 보면 홀드 중에 되찌를 때 검이 선 자리에 굳어 "찔렀다"가 안 읽힌다.
 * three는 홀드 블렌드를 상태로 들고 있지만 여기는 프레임마다 계산하는 stateless 경로라
 * 찌르기 진행도 e로 두 자세를 섞는다. e가 0이면 방어선 그대로, 1이면 찌르기 그대로다.
 */
export function swordTip(fighter, scale, lungeT, guard) {
  const reach = 150 * scale;
  const shoulderY = fighter.y - 118 * scale;
  const baseX = fighter.x + fighter.dir * 26 * scale;

  const e = thrustEase(lungeT);
  // 호: 뻗는 동안 살짝 아래에서 위로 올라온다
  const arc = Math.sin(e * Math.PI) * 26 * scale;
  const tip = {
    x: baseX + fighter.dir * (48 * scale + reach * e),
    y: shoulderY + 14 * scale - arc,
  };
  if (!guard) return tip;

  // 가드는 검을 세운다. 전방 리치를 줄이고 위로 든다.
  const gx = baseX + fighter.dir * 34 * scale;
  const gy = shoulderY - 52 * scale;
  return { x: gx + (tip.x - gx) * e, y: gy + (tip.y - gy) * e };
}

/** 검자루 좌표. 검신을 그릴 때 검끝과 잇는다. */
export function swordHilt(fighter, scale, lungeT) {
  const e = thrustEase(lungeT);
  return {
    x: fighter.x + fighter.dir * (18 * scale + 42 * scale * e),
    y: fighter.y - 104 * scale,
  };
}
