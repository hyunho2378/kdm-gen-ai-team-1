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
const FADE_SEC = 0.12;                   // 포즈 크로스페이드 120ms

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
// 부위 경계용 어두운 테두리 두께(텍셀). 겹친 팔다리를 가르는 유일한 수단이다
const EDGE = 11;
// 바깥 헤일로. 밝은 몸체라 강할 필요가 없다. 홀로그램 기운만 남긴다
const GLOW_ALPHA = 0.07;
const GLOW_R = 14;

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

  // 전진. 앞발이 떠서 앞으로 나가고 상체가 따라간다
  [POSE.ADVANCE]: pose({
    head: [0.492, 0.090, 0.105, 0.074],
    neck: [0.492, 0.175],
    shoulder: [[0.297, 0.228], [0.687, 0.230]],
    elbow: [[0.230, 0.362], [0.784, 0.306]],
    hand: [[0.310, 0.462], [0.752, 0.190]],
    hip: [[0.367, 0.515], [0.617, 0.515]],
    knee: [[0.232, 0.680], [0.782, 0.718]],
    foot: [[0.290, 0.886], [0.738, 0.952]],
  }),

  // 텔레그래프. 어깨와 검이 들린다. FEINT와 REAL 공통 예고 형태다
  [POSE.TELEGRAPH]: pose({
    head: [0.508, 0.100, 0.105, 0.074],
    neck: [0.508, 0.185],
    shoulder: [[0.312, 0.212], [0.702, 0.242]],
    elbow: [[0.205, 0.300], [0.800, 0.330]],
    hand: [[0.250, 0.190], [0.766, 0.210]],
    hip: [[0.378, 0.518], [0.628, 0.518]],
    knee: [[0.214, 0.708], [0.792, 0.708]],
    foot: [[0.258, 0.952], [0.748, 0.952]],
  }),

  // 런지. 앞다리가 길게 뻗고 검이 카메라를 향한다(원근으로 굵어진다)
  [POSE.LUNGE]: pose({
    head: [0.470, 0.170, 0.105, 0.074],
    neck: [0.474, 0.252],
    shoulder: [[0.300, 0.300], [0.690, 0.306]],
    elbow: [[0.345, 0.348], [0.808, 0.400]],
    hand: [[0.448, 0.382], [0.842, 0.318]],
    hip: [[0.350, 0.560], [0.600, 0.558]],
    knee: [[0.215, 0.800], [0.800, 0.842]],
    foot: [[0.110, 0.952], [0.892, 0.952]],
  }),

  // 피격. 상체가 젖혀지고 팔이 흩어진다
  [POSE.HIT]: pose({
    head: [0.535, 0.135, 0.105, 0.074],
    neck: [0.522, 0.212],
    shoulder: [[0.320, 0.272], [0.712, 0.266]],
    elbow: [[0.212, 0.302], [0.826, 0.368]],
    hand: [[0.168, 0.212], [0.870, 0.480]],
    hip: [[0.382, 0.530], [0.632, 0.526]],
    knee: [[0.226, 0.722], [0.796, 0.726]],
    foot: [[0.268, 0.952], [0.752, 0.952]],
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
 * 골격을 그린다. 같은 도형을 두 번 훑는다.
 * 1패스는 굵고 어둡게(부위 테두리), 2패스는 유니폼 톤으로. 이 테두리가 겹친 팔다리를 가른다.
 * pad가 0이면 안쪽 채움, EDGE면 바깥 테두리다.
 */
function drawFigure(ctx, P, color, pad) {
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

  // 다리. 허벅지가 굵고 정강이가 가늘다
  for (let i = 0; i < 2; i += 1) {
    seg(P.hip[i], P.knee[i], 78);
    seg(P.knee[i], P.foot[i], 52);
  }

  // 몸통. 어깨에서 골반으로 좁아지는 사다리꼴
  ctx.beginPath();
  ctx.moveTo(X(P.shoulder[0][0]), Y(P.shoulder[0][1]));
  ctx.lineTo(X(P.shoulder[1][0]), Y(P.shoulder[1][1]));
  ctx.lineTo(X(P.hip[1][0]), Y(P.hip[1][1]));
  ctx.lineTo(X(P.hip[0][0]), Y(P.hip[0][1]));
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 54 + pad * 2;
  ctx.stroke();

  // 목
  seg(P.neck, [P.head[0], P.head[1] + P.head[3] * 0.5], 52);

  // 팔
  for (let i = 0; i < 2; i += 1) {
    seg(P.shoulder[i], P.elbow[i], 46);
    seg(P.elbow[i], P.hand[i], 38);
  }

  // 투구. 머리 타원에 턱 보호대와 목가리개(비브)
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

  ctx.restore();
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

  // 검 든 손의 장갑
  ctx.fillStyle = colors.bg.raised;
  ctx.beginPath();
  ctx.arc(X(P.hand[0][0]), Y(P.hand[0][1]), 26, 0, Math.PI * 2);
  ctx.fill();

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
 * 포즈 한 장. 어두운 테두리 → 유니폼 채움 → 장비 → 바깥 헤일로 순이다.
 * 부풀린 도형을 불투명으로 만든 뒤 합성할 때 알파를 한 번만 먹인다.
 * 반투명 이미지를 여러 방향으로 겹치면 알파가 1로 수렴해 흰 덩어리가 된다(실측).
 */
function bakePose(P) {
  const out = makeCanvas();
  const ctx = out.getContext('2d');

  // 1패스. 굵고 어두운 테두리가 겹친 부위를 가른다
  drawFigure(ctx, P, colors.bg.deep, EDGE);

  // 2패스. 유니폼 톤. steel.mid를 bg.deep으로 눌러 블룸 문턱 아래에 앉힌다
  const body = makeCanvas();
  const bctx = body.getContext('2d');
  drawFigure(bctx, P, colors.steel.mid, 0);
  bctx.globalCompositeOperation = 'source-atop';
  bctx.globalAlpha = UNIFORM_DARKEN;
  bctx.fillStyle = colors.bg.deep;
  bctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.drawImage(body, 0, 0);

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
  [POSE.ADVANCE]: [-0.190, 1.016, 0.10],
  [POSE.TELEGRAPH]: [-0.250, 1.561, 0.02],
  [POSE.LUNGE]: [-0.052, 1.176, 0.20],
  [POSE.HIT]: [-0.333, 1.517, 0.02],
};

const AIM = {
  [POSE.IDLE]: [0.22, 1.42, 0.34],
  [POSE.ADVANCE]: [0.20, 1.44, 0.38],
  telegraphReal: [-0.30, 2.20, 0.10],
  telegraphFeint: [0.14, 1.70, 0.35],
  [POSE.LUNGE]: [0.16, 1.24, 0.78],
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
  const handTarget = new THREE.Vector3();
  const aimTarget = new THREE.Vector3();
  const aimDir = new THREE.Vector3();
  const BLADE_AXIS = new THREE.Vector3(0, 0, -1);
  const tmpColor = new THREE.Color();
  const lerpArr = (out, a, b, t) =>
    out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
  const baseColor = new THREE.Color(colors.steel.hi);
  const hitColor = new THREE.Color(colors.red.light);
  const realColor = new THREE.Color(colors.red.light);

  function setPose(name) {
    if (name === poseName) return;
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
        fade = Math.min(1, fade + dtSec / FADE_SEC);
        planes[current].material.opacity = fade;
        planes[1 - current].material.opacity = 1 - fade;
      }

      // 검 손과 겨냥점. 런지 중에는 대기에서 런지로 뻗는 중간값을 쓴다
      let aim = AIM[poseName] ?? AIM[POSE.IDLE];
      if (poseName === POSE.TELEGRAPH) aim = real ? AIM.telegraphReal : AIM.telegraphFeint;
      const h = HAND[poseName] ?? HAND[POSE.IDLE];
      if (poseName === POSE.LUNGE) {
        const t = Math.min(1, Math.max(0, lunge));
        lerpArr(handTarget, HAND[POSE.IDLE], h, t);
        lerpArr(aimTarget, AIM[POSE.IDLE], aim, t);
      } else {
        handTarget.set(h[0], h[1], h[2]);
        aimTarget.set(aim[0], aim[1], aim[2]);
      }
      // 포즈 사이를 순간이동하면 리본이 화면을 가로지르는 직선을 긋는다. 따라붙게 둔다
      const k = Math.min(1, dtSec * 14);
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
      else if (poseName === POSE.TELEGRAPH && real) tmpColor.copy(baseColor).lerp(realColor, 0.35);
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
