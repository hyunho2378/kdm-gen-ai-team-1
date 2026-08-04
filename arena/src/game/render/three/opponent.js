// 책임: AI 상대 빌보드. ARENA_SCENE 7절.
//
// 블랙 배경 위에서 실루엣이 읽히는 법 (D2 개정):
// **흰 펜싱 유니폼 전제로 몸체를 밝게** 채운다. 블랙 무대 위 흰 선수가 우리 무채색 규칙과 정합이다.
// 밝은 몸체는 그 자체로 실루엣이 되므로 바깥 림에 기대지 않고, 대신 부위마다 어두운 테두리를 둘러
// 겹친 팔다리가 서로 갈린다(2패스. 굵게 어둡게 한 번, 그 위에 유니폼 톤으로 한 번).
//
// **몸체 밝기는 Bloom threshold(0.42, 선형) 아래로 묶는다.** 블룸은 궤적의 전유물이다.
// 알파 합성은 선형 버퍼에서 일어나므로 흰색 불투명은 선형 1.0이라 상대 전체가 번진다.
// 순백 대신 steel.mid를 bg.deep으로 눌러 sRGB 약 0.60(선형 0.32)에 앉힌다.
// 배경 0.04 대비 15:1이라 블랙 무대에서는 이것이 흰색으로 읽힌다.
//
// 검은 텍스처에 그리지 않는다. 3D 골동 레이피어가 손 앵커에 따로 붙는다.
//
// 색은 tokens에서만 온다. 텍스처는 생성 1회 후 재사용한다(포즈 5장, 평면 2장이 공유).

import * as THREE from 'three';
import { colors } from '../../../tokens.js';
import { attachSwordModel } from './swordModel.js';

export const POSE = {
  IDLE: 'idle',
  ADVANCE: 'advance',
  TELEGRAPH: 'telegraph',
  LUNGE: 'lunge',
  HIT: 'hit',
};

const TEX_W = 512;
const TEX_H = 1024;
const FIG_H = 1.9;                       // 상대 키(m). 머리 꼭대기에서 발바닥까지다
/**
 * 포즈 크로스페이드. **공격은 빠르고 회복은 느리다.**
 * 같은 값으로 두면 찌르기가 미끄러지듯 나가 순간성이 죽는다.
 * 텔레그래프와 런지로 들어갈 때는 55ms, 돌아올 때는 220ms다.
 */
const FADE_FAST = 0.055;
const FADE_SLOW = 0.22;

/**
 * 텍스처 안에서 선수가 차지하는 세로 구간.
 *
 * 발을 텍스처 맨 아래(0.984)에 두었더니 발 스트로크와 림과 글로우가 경계 밖으로 나가
 * 바닥에서 **잘린 그루터기**로 보였다. 발을 0.952로 올려 안쪽에 들이고,
 * 대신 평면을 키워 **머리에서 발바닥까지가 정확히 FIG_H**가 되게 역산한다.
 * 이러면 화면 점유율 계산(4절 40.9~50.3퍼센트)이 그대로 산다.
 */
const HEAD_V = 0.021;   // 머리 타원 꼭대기
const SOLE_V = 0.969;   // 발바닥. 발 중심 0.952 + 발 스트로크 절반 17px
const SPAN = SOLE_V - HEAD_V;
const PLANE_H = FIG_H / SPAN;
const PLANE_W = (PLANE_H * TEX_W) / TEX_H;

// 유니폼 톤. steel.mid를 bg.deep으로 이만큼 눌러 문턱 아래에 앉힌다.
// 0.30이면 sRGB 약 0.60, 선형 약 0.32다. 올리면 상대가 블룸에 걸리므로 올릴 때 반드시 실측하라.
const UNIFORM_DARKEN = 0.30;
// 뒤쪽 팔다리는 더 눌러 깊이를 만든다. sRGB 약 0.42로 앞쪽 0.60과 확실히 갈린다
const SHADE_DARKEN = 0.52;
// 부위 경계용 어두운 테두리 두께(텍셀). 겹친 팔다리를 가르는 유일한 수단이다
const EDGE = 11;
// 바깥 헤일로. 밝은 몸체라 강할 필요가 없다. 홀로그램 기운만 남긴다
const GLOW_ALPHA = 0.07;
const GLOW_R = 14;

/**
 * 풋워크 (E4). 상대가 거리 축(z) 말고는 전혀 안 움직여 "서 있는 그림"으로 읽히던 것을 푼다.
 *
 * **시간의 함수여야 한다.** 매 프레임 난수를 더하면 그것은 떨림이지 발놀림이 아니다.
 * 서로 나누어떨어지지 않는 주기 셋을 겹쳐 반복 주기를 눈에 안 띄게 길게 만든다.
 *
 * **세로는 위치가 아니라 발바닥을 축으로 한 세로 압축으로 준다.**
 * 그룹을 아래로 내리면 발이 바닥면 밑으로 들어가 잘린다. D1에서 고친 "잘린 그루터기"가 그대로 재발한다
 * (지오메트리가 발바닥을 y 0에 맞춰 놓았고 바닥은 불투명이라 깊이로 발을 먹는다).
 * 실제 펜서도 무게중심을 낮출 때 발은 지면에 붙어 있으므로 압축이 현상에도 맞다.
 * 그룹 원점이 곧 발바닥이라 scale.y가 정확히 "발을 붙인 채 머리가 내려가는" 변형이 된다.
 */
const SWAY_X = 0.045;    // m. 실루엣 폭 1.00m의 4.5퍼센트. 리본 순간이동 가드 0.35m보다 한참 아래다
const BREATH = 0.006;    // 호흡 압축 비율. 1.9m 기준 약 11mm
const DIP = 0.055;       // 큰 숙임 압축 비율. 약 105mm 머리 하강
const DIP_SEC = 0.85;    // 숙였다 일어나기 한 번에 걸리는 시간
const DIP_GAP = [3.4, 6.8];  // 다음 큰 숙임까지의 간격(초). 저빈도라야 변주로 읽힌다
// 전진과 런지의 무게중심 하강. 텍스처는 손대지 않고 그룹 변형으로만 준다
const POSE_DIP = { [POSE.ADVANCE]: 0.035, [POSE.LUNGE]: 0.05 };

/** 저주파 합성 노이즈. -1~1. 주기가 서로 나누어떨어지지 않아 반복이 안 읽힌다. */
function lowNoise(t) {
  return Math.sin(t * 0.83) * 0.55 + Math.sin(t * 1.61 + 1.7) * 0.31 + Math.sin(t * 2.87 + 4.1) * 0.14;
}

/** 렌더 전용 난수. 판정은 이 값을 절대 보지 않는다(sparks.js와 같은 규율). */
function rand(ref) {
  ref.v = (ref.v * 1664525 + 1013904223) >>> 0;
  return ref.v / 4294967296;
}

/**
 * 이번 공격의 표적 (E4). 상대가 내 어디를 노리는가.
 * 겨냥 보정값이라 절대 좌표가 아니라 **검이 향하는 방향**을 바꾼다.
 * 시각 전용이다. `judge.js`는 부위를 보지 않으므로 판정에 아무 영향이 없다.
 */
export const TARGET = { HEAD: 'head', CHEST: 'chest', FLANK: 'flank' };

/**
 * 겨냥 보정은 **방향**이지 위치가 아니다. 검끝은 손에서 tipDistance만큼 그 방향으로 나간 점이라
 * 보정값과 착지 높이가 선형이 아니다. 그래서 값을 감으로 넣으면 안 되고 역산해야 한다.
 *
 * 처음에 머리 보정을 +0.42로 넣었더니 검끝이 y 1.497에 앉아 **부위 라벨이 몸통으로 나왔다**(실측).
 * FUI가 "투구"라고 쓰는데 칼이 가슴에 꽂혀 있으면 R4의 요구가 깨진다.
 * 문턱 1.55를 넘도록 역산해 +0.78로 올렸고 실측 착지가 y 1.66이다.
 */
const TARGET_AIM = {
  [TARGET.HEAD]: [-0.10, 0.78],
  [TARGET.CHEST]: [0, 0],
  [TARGET.FLANK]: [0.26, -0.30],
};
const ZERO_AIM = [0, 0];

/**
 * 유파 기술 카탈로그 (R4). FENCING_RULES 4절.
 * **전부 시각 계층이다.** 공격 타이밍과 판정은 opponents와 judge가 그대로 쥐고,
 * 여기서는 "어떤 기술로 보이느냐"만 갈린다(E4 착탄 다양화와 같은 원리).
 *
 * | 필드 | 뜻 |
 * |---|---|
 * | target | 어디를 노리는가. FUI 부위 라벨과 일치해야 한다 |
 * | bow | 스윙 중간에 겨냥점이 옆으로 부푸는 양(상대 로컬 m). **이것이 베기 호를 만든다** |
 * | reach | 몸이 카메라 쪽으로 나가는 양(m). 플런지와 플레슈가 크다 |
 * | dip | 추가 세로 압축. 몸이 낮게 깔린다 |
 *
 * 사브르는 절단계라 베기가 유효하고, **전진 시 발 교차가 반칙이라 플레슈를 못 쓴다.**
 * 그래서 장거리는 발을 교차하지 않는 플런지다. 에페는 찌르기 종목이고 플레슈가 허용된다.
 */
export const TECH = {
  CUT_HEAD: 'cutHead',
  CUT_FLANK: 'cutFlank',
  CUT_CHEEK: 'cutCheek',
  STOP_CUT: 'stopCut',
  THRUST: 'thrust',
  FLECHE: 'fleche',
  STOP_HIT: 'stopHit',
  PLUNGE: 'plunge',
};

const TECH_SPEC = {
  // 머리 베기. 위에서 아래로 내려치는 수직 호
  [TECH.CUT_HEAD]: { target: 'head', bow: [0.10, 0.62, 0], reach: 0.16, dip: 0.02 },
  // 옆구리 베기. 바깥에서 안으로 감는 수평 호
  [TECH.CUT_FLANK]: { target: 'flank', bow: [0.66, -0.06, 0], reach: 0.18, dip: 0.05 },
  // 뺨 베기. 대각선 호
  [TECH.CUT_CHEEK]: { target: 'head', bow: [0.44, 0.40, 0], reach: 0.14, dip: 0.02 },
  // 손목 스톱컷. 짧고 낮은 호. 뻗은 팔만 노린다
  [TECH.STOP_CUT]: { target: 'flank', bow: [0.26, -0.24, 0], reach: 0.06, dip: 0.01 },
  // 찌르기. 호가 없다. 에페의 기본
  [TECH.THRUST]: { target: 'chest', bow: [0, 0, 0], reach: 0.14, dip: 0.03 },
  // 플레슈. 상체를 던지며 달려든다. 가장 깊게 나가고 가장 낮게 깔린다
  [TECH.FLECHE]: { target: 'chest', bow: [0.06, -0.10, 0], reach: 0.42, dip: 0.09 },
  // 손목 스톱히트. 낮고 짧은 찌르기
  [TECH.STOP_HIT]: { target: 'flank', bow: [0.04, -0.16, 0], reach: 0.05, dip: 0.01 },
  // 플런지. 사브르의 장거리 공격이다. 발을 교차하지 않고 도약해 들어가며 베기 호를 얹는다.
  // 플레슈만큼 깊지 않은 것은 발 교차 없이 낼 수 있는 거리가 거기까지이기 때문이다
  [TECH.PLUNGE]: { target: 'chest', bow: [0.30, 0.34, 0], reach: 0.36, dip: 0.07 },
};

/** 발레스트라(홉 스텝). 양 유파 공통 전진 변주다. 양발이 함께 떠서 함께 닿는다. */
const HOP_H = 0.085;
const HOP_SEC = 0.30;
const HOP_GAP = [1.9, 4.2];

/** 패리당했을 때 검이 튕겨나는 방향 2종. 받는 위치가 매번 같지 않아야 한다(E4). */
export const PARRY_LINE = { HIGH: 'high', LOW: 'low' };

const KNOCK_DIR = {
  [PARRY_LINE.HIGH]: new THREE.Vector3(0.42, 0.34, -0.22),
  [PARRY_LINE.LOW]: new THREE.Vector3(0.36, -0.30, -0.18),
};

/**
 * 포즈 골격. 정규 좌표(x는 0~1이 텍스처 폭, y는 0~1이 텍스처 높이).
 *
 * 좌표가 비등방이라는 점을 놓치면 안 된다. 텍스처는 512 x 1024인데 x는 0.95m, y는 1.9m를 덮으므로
 * 텍셀 자체는 정사각이지만 **정규 좌표 0.1은 x에서 51px, y에서 102px이다.**
 * 처음에 머리 반지름을 x 0.082 y 0.073으로 주었더니 84 x 150px짜리 길쭉한 달걀이 나왔다(실측).
 * 원형 머리를 원하면 x 반지름이 y 반지름의 두 배여야 한다.
 *
 * 머리:몸 비례는 1:6.5다. 머리 높이 152px x 6.5 = 998px로 화면을 꽉 채운다.
 * 배열 인덱스 0이 검을 든 팔과 앞발(우리 시점의 왼쪽), 1이 뒷팔과 뒷발이다.
 */
const IDLE = {
  head: [0.500, 0.095, 0.105, 0.074],
  neck: [0.500, 0.180],
  shoulder: [[0.305, 0.234], [0.695, 0.234]],
  elbow: [[0.238, 0.368], [0.792, 0.312]],
  hand: [[0.318, 0.470], [0.760, 0.196]],
  hip: [[0.375, 0.520], [0.625, 0.520]],
  knee: [[0.210, 0.712], [0.790, 0.712]],
  foot: [[0.255, 0.952], [0.745, 0.952]],
};

function pose(over) {
  return { ...IDLE, ...over };
}

const POSES = {
  // 앙가르드. 무릎을 굽히고 발을 벌린 기본 자세
  [POSE.IDLE]: IDLE,

  // 전진. 앞발이 확실히 떠서 앞으로 나가고 무게중심이 따라간다
  [POSE.ADVANCE]: pose({
    head: [0.486, 0.086, 0.105, 0.074],
    neck: [0.486, 0.171],
    shoulder: [[0.292, 0.224], [0.682, 0.228]],
    elbow: [[0.226, 0.356], [0.780, 0.302]],
    hand: [[0.308, 0.452], [0.748, 0.186]],
    hip: [[0.362, 0.508], [0.612, 0.510]],
    knee: [[0.226, 0.668], [0.784, 0.714]],
    foot: [[0.302, 0.876], [0.740, 0.952]],
  }),

  // 텔레그래프. 상체를 뒤로 살짝 젖히고 검 팔을 확실히 들어 올린다.
  // 이 자세가 "온다"는 신호이므로 실루엣만 잘라 봐도 대기와 달라야 한다
  [POSE.TELEGRAPH]: pose({
    head: [0.516, 0.075, 0.105, 0.074],
    neck: [0.514, 0.160],
    shoulder: [[0.318, 0.190], [0.706, 0.228]],
    elbow: [[0.212, 0.272], [0.804, 0.318]],
    hand: [[0.262, 0.155], [0.770, 0.198]],
    hip: [[0.382, 0.512], [0.632, 0.516]],
    knee: [[0.216, 0.702], [0.796, 0.706]],
    foot: [[0.262, 0.952], [0.752, 0.952]],
  }),

  // 런지. **대기와 실루엣이 확연히 달라야 한다.**
  // 머리가 텍스처 높이로 0.205(약 0.41m) 떨어지고 발 간격이 0.844까지 벌어진다.
  // 앞무릎은 깊게 접히고 뒷다리는 펴진다. 검 든 팔은 카메라 쪽으로 완전히 뻗는다
  [POSE.LUNGE]: pose({
    head: [0.455, 0.300, 0.105, 0.074],
    neck: [0.462, 0.382],
    shoulder: [[0.292, 0.428], [0.672, 0.436]],
    elbow: [[0.372, 0.452], [0.800, 0.520]],
    hand: [[0.492, 0.470], [0.858, 0.430]],
    hip: [[0.352, 0.660], [0.598, 0.656]],
    knee: [[0.196, 0.836], [0.836, 0.900]],
    foot: [[0.086, 0.952], [0.930, 0.952]],
  }),

  // 피격. 상체가 뒤로 젖혀지고 균형이 무너진다
  [POSE.HIT]: pose({
    head: [0.556, 0.152, 0.105, 0.074],
    neck: [0.536, 0.226],
    shoulder: [[0.334, 0.286], [0.724, 0.272]],
    elbow: [[0.206, 0.318], [0.842, 0.372]],
    hand: [[0.156, 0.222], [0.888, 0.492]],
    hip: [[0.386, 0.540], [0.636, 0.534]],
    knee: [[0.238, 0.742], [0.788, 0.748]],
    foot: [[0.272, 0.952], [0.756, 0.952]],
  }),
};

/** 발밑 그림자용 방사 그라디언트. 가운데가 불투명하고 가장자리로 사라진다. */
function blobTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 32, 0, 64, 32, 62);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.38)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 64);
  return new THREE.CanvasTexture(c);
}

function makeCanvas() {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  return c;
}

const X = (v) => v * TEX_W;
const Y = (v) => v * TEX_H;

/**
 * 부위 하나를 그린다. 같은 도형을 두 번 훑는 것이 요령이다.
 * pad가 EDGE면 굵고 어두운 테두리, 0이면 안쪽 채움이다.
 * **부위마다 테두리를 두르고 순서대로 덮어야** 겹친 팔다리가 서로 갈린다(E2).
 * 한 번에 다 그리면 단색 덩어리가 되어 사람으로 안 읽힌다.
 */
function drawPart(ctx, P, part, color, pad) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const seg = (a, b, w) => {
    ctx.lineWidth = w + pad * 2;
    ctx.beginPath();
    ctx.moveTo(X(a[0]), Y(a[1]));
    ctx.lineTo(X(b[0]), Y(b[1]));
    ctx.stroke();
  };
  const i = part.endsWith('Back') ? 1 : 0;

  if (part === 'legBack' || part === 'legFront') {
    seg(P.hip[i], P.knee[i], 78);
    seg(P.knee[i], P.foot[i], 52);
  } else if (part === 'armBack' || part === 'armFront') {
    seg(P.shoulder[i], P.elbow[i], 46);
    seg(P.elbow[i], P.hand[i], 38);
  } else if (part === 'torso') {
    ctx.beginPath();
    ctx.moveTo(X(P.shoulder[0][0]), Y(P.shoulder[0][1]));
    ctx.lineTo(X(P.shoulder[1][0]), Y(P.shoulder[1][1]));
    ctx.lineTo(X(P.hip[1][0]), Y(P.hip[1][1]));
    ctx.lineTo(X(P.hip[0][0]), Y(P.hip[0][1]));
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 54 + pad * 2;
    ctx.stroke();
  } else if (part === 'neck') {
    seg(P.neck, [P.head[0], P.head[1] + P.head[3] * 0.5], 52);
  } else if (part === 'head') {
    const hr = pad / TEX_W;
    ctx.beginPath();
    ctx.ellipse(X(P.head[0]), Y(P.head[1]), X(P.head[2] + hr), Y(P.head[3]) + pad, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      X(P.head[0]),
      Y(P.head[1] + P.head[3] * 0.42),
      X(P.head[2] * 0.88 + hr),
      Y(P.head[3] * 0.58) + pad,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // 비브. 마스크 아래로 벌어지며 어깨를 덮는 사다리꼴
    const hx = X(P.head[0]);
    const hb = Y(P.head[1] + P.head[3] * 0.85);
    const bw = X(P.head[2]) * 0.9 + pad;
    const sy = (Y(P.shoulder[0][1]) + Y(P.shoulder[1][1])) / 2 + 26 + pad;
    ctx.beginPath();
    ctx.moveTo(hx - bw, hb);
    ctx.lineTo(hx + bw, hb);
    ctx.lineTo(hx + bw * 1.5, sy);
    ctx.lineTo(hx - bw * 1.5, sy);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// 그리는 순서가 곧 앞뒤다. 뒤쪽 팔다리를 먼저 깔고 몸통과 앞쪽을 덮는다
const BACK_PARTS = ['legBack', 'armBack'];
const FRONT_PARTS = ['torso', 'neck', 'head', 'legFront', 'armFront'];

/** 실루엣 전체. 바깥 헤일로를 만들 때만 쓴다. */
function drawFigure(ctx, P, color, pad) {
  for (const part of [...BACK_PARTS, ...FRONT_PARTS]) drawPart(ctx, P, part, color, pad);
}

/** 마스크와 장갑과 신발. 유니폼 위에 얹는 어두운 부위들이 선수로 읽히게 만든다. */
function drawGear(ctx, P) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 펜싱 마스크. 어두운 메시에 밝은 테두리 한 줄
  ctx.fillStyle = colors.bg.raised;
  ctx.beginPath();
  ctx.ellipse(X(P.head[0]), Y(P.head[1]), X(P.head[2]) - 7, Y(P.head[3]) - 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    X(P.head[0]),
    Y(P.head[1] + P.head[3] * 0.42),
    X(P.head[2] * 0.88) - 7,
    Y(P.head[3] * 0.58) - 7,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 메시 결. 가로줄 몇 개면 그물로 읽힌다
  ctx.strokeStyle = colors.steel.shadow;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 3;
  for (let i = -2; i <= 3; i += 1) {
    const y = Y(P.head[1] + i * P.head[3] * 0.26);
    ctx.beginPath();
    ctx.moveTo(X(P.head[0] - P.head[2]) + 12, y);
    ctx.lineTo(X(P.head[0] + P.head[2]) - 12, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 마스크 테두리. 두상이 또렷해진다
  ctx.strokeStyle = colors.steel.mid;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(X(P.head[0]), Y(P.head[1]), X(P.head[2]) - 5, Y(P.head[3]) - 5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 검 든 손의 장갑과 소매 커프. 어느 팔이 검을 쥐었는지가 이 둘로 읽힌다
  ctx.fillStyle = colors.bg.raised;
  ctx.beginPath();
  ctx.arc(X(P.hand[0][0]), Y(P.hand[0][1]), 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.bg.deep;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(X(P.hand[0][0] * 0.72 + P.elbow[0][0] * 0.28), Y(P.hand[0][1] * 0.72 + P.elbow[0][1] * 0.28));
  ctx.lineTo(X(P.hand[0][0] * 0.55 + P.elbow[0][0] * 0.45), Y(P.hand[0][1] * 0.55 + P.elbow[0][1] * 0.45));
  ctx.stroke();

  // 신발
  for (let i = 0; i < 2; i += 1) {
    const f = P.foot[i];
    const out = i === 0 ? -1 : 1;
    ctx.strokeStyle = colors.bg.raised;
    ctx.lineWidth = 36;
    ctx.beginPath();
    ctx.moveTo(X(f[0]), Y(f[1]));
    ctx.lineTo(X(f[0] + out * 0.075), Y(f[1]));
    ctx.stroke();
  }

  ctx.restore();
}

/** 도형을 반지름 r만큼 부풀린다. 원본이 불투명이라 몇 번을 겹쳐도 값이 튀지 않는다. */
function dilate(src, r, steps = 16) {
  const out = makeCanvas();
  const ctx = out.getContext('2d');
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    ctx.drawImage(src, Math.cos(a) * r, Math.sin(a) * r);
  }
  return out;
}

/**
 * 부위 묶음 하나를 한 톤으로 굽는다.
 * steel.mid를 bg.deep으로 눌러 블룸 문턱 아래에 앉힌다. darken이 클수록 어둡다.
 * 부위마다 어두운 테두리를 먼저 두르므로 같은 톤 안에서도 팔다리가 갈린다.
 */
function tonedLayer(P, parts, darken) {
  const c = makeCanvas();
  const g = c.getContext('2d');
  for (const part of parts) {
    drawPart(g, P, part, colors.bg.deep, EDGE);
    drawPart(g, P, part, colors.steel.mid, 0);
  }
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = darken;
  g.fillStyle = colors.bg.deep;
  g.fillRect(0, 0, TEX_W, TEX_H);
  return c;
}

/**
 * 포즈 한 장. 어두운 테두리 → 유니폼 채움 → 장비 → 바깥 헤일로 순이다.
 * 부풀린 도형을 불투명으로 만든 뒤 합성할 때 알파를 한 번만 먹인다.
 * 반투명 이미지를 여러 방향으로 겹치면 알파가 1로 수렴해 흰 덩어리가 된다(실측).
 */
function bakePose(P) {
  const out = makeCanvas();
  const ctx = out.getContext('2d');

  // 뒤쪽 팔다리를 어둡게 깔고 그 위에 몸통과 앞쪽을 밝게 덮는다.
  // 두 톤이 있어야 평면이 아니라 몸으로 읽힌다(E2).
  ctx.drawImage(tonedLayer(P, BACK_PARTS, SHADE_DARKEN), 0, 0);
  ctx.drawImage(tonedLayer(P, FRONT_PARTS, UNIFORM_DARKEN), 0, 0);

  drawGear(ctx, P);

  // 바깥 헤일로. 밝은 몸체 뒤에 옅게만 깐다
  const solid = makeCanvas();
  drawFigure(solid.getContext('2d'), P, colors.steel.hi, EDGE);
  const glow = dilate(solid, GLOW_R);
  ctx.globalCompositeOperation = 'destination-over';
  ctx.globalAlpha = GLOW_ALPHA;
  ctx.drawImage(glow, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(out);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * 상대의 검 손과 겨냥점(빌보드 로컬, m). +z가 카메라 쪽이다.
 *
 * 손 위치는 텍스처 좌표에서 그대로 나온다.
 *   x = (u - 0.5) x PLANE_W,  y = PLANE_H x (SOLE_V - v)
 * 겨냥점은 검이 향할 방향만 정한다. 실제 칼끝은 손에서 tipDistance만큼 떨어진 곳에 선다.
 *
 * 텔레그래프에서 REAL과 FEINT가 갈리는 곳이 여기다. REAL은 검을 높이 세우고 FEINT는 앞으로만 툭 낸다.
 * 색이 아니라 **칼의 각도**가 다르므로 형태로 읽힌다.
 */
const HAND = {
  [POSE.IDLE]: [-0.182, 1.000, 0.06],
  [POSE.ADVANCE]: [-0.192, 1.036, 0.10],
  [POSE.TELEGRAPH]: [-0.238, 1.631, 0.02],
  // 런지에서 손이 카메라 쪽으로 크게 나온다. 몸이 뻗는 만큼 검도 나가야 "몸으로 찌른다"가 된다
  [POSE.LUNGE]: [-0.008, 1.000, 0.34],
  [POSE.HIT]: [-0.345, 1.497, 0.02],
};

const AIM = {
  [POSE.IDLE]: [0.22, 1.42, 0.34],
  [POSE.ADVANCE]: [0.20, 1.44, 0.38],
  telegraphReal: [-0.30, 2.20, 0.10],
  telegraphFeint: [0.14, 1.70, 0.35],
  [POSE.LUNGE]: [0.20, 1.05, 0.95],
  [POSE.HIT]: [-0.62, 1.92, 0.10],
};

// 겨냥을 카메라 정면으로 두면 검이 극단적으로 단축돼 점으로 보인다(실측).
// 상대 검은 화면을 가로질러야 읽히므로 대기와 예고는 비스듬히 세우고,
// 런지만 카메라 쪽 성분을 키워 찔러 들어오는 인상을 만든다.

export function createOpponent(scene, { tipDistance } = {}) {
  const textures = {};
  for (const name of Object.values(POSE)) textures[name] = bakePose(POSES[name]);

  const geometry = new THREE.PlaneGeometry(PLANE_W, PLANE_H);
  // 발바닥(SOLE_V)이 y 0에 오게 민다. 평면 아래끝은 바닥 밑으로 조금 내려가지만
  // 그 구간은 투명이고 바닥이 깊이로 가려서 보이지 않는다
  geometry.translate(0, PLANE_H * (SOLE_V - 0.5), 0);

  const group = new THREE.Group();
  const planes = [];
  for (let i = 0; i < 2; i += 1) {
    const m = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        // 실루엣이라 조명 계산이 필요 없다. 값이 텍스처 그대로 나와 블룸 예측이 쉬워진다
        map: textures[POSE.IDLE],
        transparent: true,
        depthWrite: false,
        alphaTest: 0.01,
        toneMapped: false,
        color: new THREE.Color(colors.steel.hi),
      })
    );
    m.material.opacity = i === 0 ? 1 : 0;
    m.renderOrder = 1;  // 리본(2)보다 먼저. 궤적이 상대 위로 지나간다
    m.position.z = i * 0.004;  // 같은 z면 반투명 정렬이 프레임마다 뒤집힌다
    planes.push(m);
    group.add(m);
  }

  // 검 손. 3D 골동 레이피어가 여기 붙고 겨냥 방향으로 돈다.
  // 검이 도착하기 전과 로드 실패 시에는 tip이 리본 소스를 대신한다.
  const hand = new THREE.Object3D();
  const tip = new THREE.Object3D();
  group.add(hand, tip);
  scene.add(group);

  let sword = null;
  attachSwordModel(hand, { finish: 'antique', tipDistance })
    .then((r) => {
      sword = r;
      // 검은 빌보드 평면보다 앞이라 깊이로 자연히 앞에 선다. 렌더 순서는 기본값을 쓴다
      r.group.traverse((o) => {
        if (o.isMesh) o.renderOrder = 0;
      });
    })
    .catch((err) => {
      console.warn('[arena] 상대 검 로드 실패. 가상 검끝 포인트를 유지한다.', err);
    });

  // 접지 그림자. 발밑에 눕는 부드러운 타원 하나로 "바닥에 서 있다"가 성립한다.
  // 빌보드 그룹의 자식으로 넣으면 카메라를 따라 일어서므로 씬에 직접 붙이고 z만 따라간다.
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 0.52),
    new THREE.MeshBasicMaterial({
      map: blobTexture(),
      color: new THREE.Color(colors.bg.deep),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;  // 바닥과 z파이팅을 피하는 최소 높이
  shadow.renderOrder = 0;
  scene.add(shadow);

  let current = 0;
  let poseName = POSE.IDLE;
  let fade = 1;
  let fadeSec = FADE_SLOW;
  const handTarget = new THREE.Vector3();
  const aimTarget = new THREE.Vector3();
  const aimDir = new THREE.Vector3();
  // 패리당해 검이 튕겨나는 짧은 반동. 겨냥점을 잠깐 밀었다 되돌린다
  const KNOCK_SEC = 0.26;
  let knock = 0;
  let knockDir = KNOCK_DIR[PARRY_LINE.HIGH];

  // 풋워크 상태. 전부 렌더 전용이고 판정으로 돌아가지 않는다
  const seed = { v: 20260804 };
  let footT = 0;
  let dipT = -1;                                            // 진행 중이면 0~DIP_SEC, 아니면 -1
  let nextDipAt = DIP_GAP[0] + rand(seed) * (DIP_GAP[1] - DIP_GAP[0]);
  let target = TARGET.CHEST;
  // 이번 공격의 기술. 렌더러가 예고 진입에 한 번 정한다(R4)
  let tech = TECH_SPEC[TECH.THRUST];
  // 발레스트라 홉. 전진 중에만 뛴다
  let hopT = -1;
  let nextHopAt = HOP_GAP[0] + rand(seed) * (HOP_GAP[1] - HOP_GAP[0]);
  const BLADE_AXIS = new THREE.Vector3(0, 0, -1);
  const tmpColor = new THREE.Color();
  const lerpArr = (out, a, b, t) =>
    out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
  const baseColor = new THREE.Color(colors.steel.hi);
  const hitColor = new THREE.Color(colors.red.light);
  const realColor = new THREE.Color(colors.red.light);

  function setPose(name) {
    if (name === poseName) return;
    // 공격으로 들어가는 전환만 빠르다. 검과 몸이 같은 프레임에 뻗는다
    fadeSec = name === POSE.LUNGE || name === POSE.TELEGRAPH || name === POSE.HIT ? FADE_FAST : FADE_SLOW;
    poseName = name;
    const next = 1 - current;
    // needsUpdate를 세우지 않는다. 두 텍스처 모두 존재하므로 셰이더 define이 그대로고,
    // 세우면 포즈가 바뀔 때마다 three가 프로그램을 다시 훑는다(교전 중 프레임 히치의 원인).
    planes[next].material.map = textures[name];
    current = next;
    fade = 0;
  }

  return {
    group,

    /**
     * 패리당했을 때. 검이 튕겨나는 인상만 짧게 준다.
     * line이 상단이면 위로, 하단이면 아래로 밀린다. 받는 선이 매번 같으면 막기가 한 장면으로 굳는다(E4).
     */
    knockBack(line = PARRY_LINE.HIGH) {
      knockDir = KNOCK_DIR[line] ?? KNOCK_DIR[PARRY_LINE.HIGH];
      knock = 1;
    },

    /**
     * 이번 공격의 기술과 표적. 렌더러가 예고 진입 순간에 한 번 정한다.
     * 검 겨냥이 표적을 따라 돌고 파란 리본이 그 궤적을 그린다.
     * **표적은 기술이 정한다.** 베기 호의 착지점과 FUI 부위 라벨이 어긋나면 안 되기 때문이다(R4).
     */
    setAttack(name) {
      const spec = TECH_SPEC[name];
      if (!spec) return;
      tech = spec;
      target = spec.target;
    },
    getTarget() {
      return target;
    },

    /** 착탄점을 실루엣 안으로 죌 때 쓴다. 평면 폭의 절반이다. */
    bodyHalfWidth: PLANE_W / 2,

    /** 궤적 리본이 읽는 검끝. 3D 검이 서면 그쪽 앵커로 바뀐다. */
    getTip() {
      return sword ? sword.tipAnchor : tip;
    },

    /**
     * 텍스처 다섯 장을 미리 GPU에 올린다.
     * 안 하면 각 포즈가 **처음 화면에 뜨는 프레임**에 512 x 1024 업로드와 밉맵 생성이 통째로 들어간다.
     * 명중 포즈는 하필 찌르기가 꽂히는 순간에 처음 뜨므로 히치가 그 자리에 정확히 얹힌다.
     */
    prewarm(renderer) {
      for (const t of Object.values(textures)) renderer.initTexture(t);
    },

    setPose,
    getPose() {
      return poseName;
    },

    /** 월드 z. distFromD가 준 거리를 그대로 받는다. 그림자도 같이 옮긴다. */
    setDistance(dist) {
      group.position.z = -dist;
      shadow.position.z = -dist;
    },

    /**
     * 매 프레임. 카메라를 향하게 돌리고 크로스페이드를 진행하고 검끝을 포즈로 옮긴다.
     * tintHit는 0~1로 피격 순간의 red 틴트, kind는 텔레그래프 림 색조다.
     */
    update(dtSec, camera, { lunge = 0, tintHit = 0, real = false } = {}) {
      group.quaternion.copy(camera.quaternion);

      if (fade < 1) {
        fade = Math.min(1, fade + dtSec / fadeSec);
        planes[current].material.opacity = fade;
        planes[1 - current].material.opacity = 1 - fade;
      }

      // 풋워크. **예고 중에는 시간 자체를 세운다.**
      // 공격 예고가 잔움직임에 묻히면 페인트 판독 게임이 죽는다. 정지 자체가 "온다"는 신호다.
      // 값을 0으로 되돌리지 않고 그 자리에서 얼리므로 팝이 없고, 재개도 얼었던 위상에서 이어진다.
      if (poseName !== POSE.TELEGRAPH) {
        footT += dtSec;
        if (dipT >= 0) {
          dipT += dtSec;
          if (dipT >= DIP_SEC) dipT = -1;
        } else if (footT >= nextDipAt) {
          // 큰 숙임은 일정 간격이 아니라 뽑은 간격으로 온다. 규칙적이면 그것도 읽힌다
          dipT = 0;
          nextDipAt = footT + DIP_GAP[0] + rand(seed) * (DIP_GAP[1] - DIP_GAP[0]);
        }
        // 발레스트라. 전진 중에만 뛴다. 예고에 들어가면 홉도 함께 언다(E4 정지 규칙)
        if (hopT >= 0) {
          hopT += dtSec;
          if (hopT >= HOP_SEC) hopT = -1;
        } else if (poseName === POSE.ADVANCE && footT >= nextHopAt) {
          hopT = 0;
          nextHopAt = footT + HOP_GAP[0] + rand(seed) * (HOP_GAP[1] - HOP_GAP[0]);
        }
      }
      group.position.x = SWAY_X * lowNoise(footT);
      shadow.position.x = group.position.x;
      // 세로는 발바닥을 축으로 한 압축이다. 위치를 내리면 발이 바닥에 먹힌다(위 주석 참조)
      let squash = BREATH * (Math.sin(footT * 1.85) * 0.5 + 0.5);
      if (dipT >= 0) squash += DIP * Math.sin(Math.PI * (dipT / DIP_SEC));
      const poseDip = POSE_DIP[poseName] ?? 0;
      const swing = poseName === POSE.LUNGE ? Math.min(1, Math.max(0, lunge)) : 0;
      squash += poseName === POSE.LUNGE ? (poseDip + tech.dip) * swing : poseDip;
      // 몸이 카메라 쪽으로 나간다. 플런지와 플레슈가 크다. 그림자도 같이 따라간다(R4)
      const reach = tech.reach * swing;
      group.position.z += reach;
      shadow.position.z = group.position.z;
      // 발레스트라 홉. 위로만 뜨므로 발이 바닥에 먹히지 않는다(내려가면 D1 잘림이 재발한다)
      group.position.y = hopT >= 0 ? HOP_H * Math.sin(Math.PI * (hopT / HOP_SEC)) : 0;
      // **압축은 그룹이 아니라 빌보드 평면에만 건다.** 그룹에 걸면 손에 붙은 3D 검까지
      // 비균등 스케일을 받아 칼이 눌리고, 회전이 얹혀 있어 전단까지 생긴다(부모 비균등 스케일 x 자식 회전).
      // 평면 지오메트리는 발바닥이 원점이라 scale.y가 그대로 "발 붙인 채 머리가 내려가는" 변형이 된다.
      const bodyScale = 1 - squash;
      for (const p of planes) p.scale.y = bodyScale;

      // 검 손과 겨냥점. 런지 중에는 대기에서 런지로 뻗는 중간값을 쓴다
      let aim = AIM[poseName] ?? AIM[POSE.IDLE];
      if (poseName === POSE.TELEGRAPH) aim = real ? AIM.telegraphReal : AIM.telegraphFeint;
      // 표적 보정은 노리는 구간에만 얹는다. 예고에서 이미 보이므로 어디를 노리는지가 형태로 읽힌다
      const off = poseName === POSE.TELEGRAPH || poseName === POSE.LUNGE ? TARGET_AIM[target] : ZERO_AIM;
      const h = HAND[poseName] ?? HAND[POSE.IDLE];
      if (poseName === POSE.LUNGE) {
        const t = swing;
        lerpArr(handTarget, HAND[POSE.IDLE], h, t);
        lerpArr(aimTarget, AIM[POSE.IDLE], aim, t);
        aimTarget.x += off[0] * t;
        aimTarget.y += off[1] * t;
        // **베기 호 (R4).** 겨냥점이 스윙 중간에 옆으로 부푼다. 시작과 끝에서는 0이라
        // 착지점은 표적 그대로이고 가는 길만 휘어진다. 3D 검이 이 호를 그리고 리본이 따라온다.
        // 찌르기 계열은 bow가 0이라 직선이 그대로 산다
        const bow = Math.sin(Math.PI * t);
        aimTarget.x += tech.bow[0] * bow;
        aimTarget.y += tech.bow[1] * bow;
      } else {
        handTarget.set(h[0], h[1], h[2]);
        aimTarget.set(aim[0] + off[0], aim[1] + off[1], aim[2]);
      }
      // 검은 안 눌리지만 손과 겨냥은 몸을 따라 내려와야 한다. 그래야 검이 몸에서 떠 있지 않다
      handTarget.y *= bodyScale;
      aimTarget.y *= bodyScale;
      if (knock > 0) {
        knock = Math.max(0, knock - dtSec / KNOCK_SEC);
        aimTarget.addScaledVector(knockDir, knock);
      }
      // 손 추종도 포즈 전환과 같은 리듬을 탄다. 몸이 빠르게 뻗으면 검도 빠르게 나간다
      const k = Math.min(1, dtSec / fadeSec);
      hand.position.lerp(handTarget, k);
      aimDir.copy(aimTarget).sub(hand.position);
      if (aimDir.lengthSq() > 1e-8) {
        aimDir.normalize();
        hand.quaternion.setFromUnitVectors(BLADE_AXIS, aimDir);
      }
      // 검이 없을 때만 쓰는 대체 검끝
      if (!sword) tip.position.lerp(aimTarget, k);

      // 림 색조. 피격 틴트가 예고 색조를 이긴다
      if (tintHit > 0) tmpColor.copy(baseColor).lerp(hitColor, tintHit);
      // 유니폼이 밝아진 뒤로는 색 배수가 몸 전체에 걸린다. 0.35면 상대가 분홍으로 읽혀
      // 액센트가 아니라 색깔 표시가 된다. 형태(칼 각도)가 1차 단서이므로 색조는 낮게 둔다
      else if (poseName === POSE.TELEGRAPH && real) tmpColor.copy(baseColor).lerp(realColor, 0.22);
      else tmpColor.copy(baseColor);
      planes[0].material.color.copy(tmpColor);
      planes[1].material.color.copy(tmpColor);
    },

    /** 생성형 이미지가 도착하면 여기로 꽂는다. 키는 POSE 값과 같다. */
    setPoses(images) {
      if (!images) return;
      for (const name of Object.values(POSE)) {
        const img = images[name];
        if (!img) continue;
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        textures[name]?.dispose();
        textures[name] = tex;
      }
      for (const p of planes) {
        p.material.map = textures[poseName];
        p.material.needsUpdate = true;
      }
    },

    dispose() {
      sword?.dispose();
      for (const t of Object.values(textures)) t.dispose();
      for (const p of planes) p.material.dispose();
      geometry.dispose();
      shadow.geometry.dispose();
      shadow.material.map?.dispose();
      shadow.material.dispose();
      scene.remove(shadow);
      scene.remove(group);
    },
  };
}
