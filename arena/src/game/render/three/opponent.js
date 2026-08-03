// 책임: AI 상대 빌보드. ARENA_SCENE 7절.
//
// 블랙 배경 위에서 실루엣이 읽히는 법(DESIGN v2 9절):
// 몸체는 어두운 채움(bg.raised), 외곽은 밝은 림. 어두운 실루엣을 그냥 올리면 배경과 붙어 사라진다.
// 단 림 밝기는 Bloom threshold(0.42, 선형) 아래로 묶는다. 블룸은 궤적의 전유물이다.
// 림을 흰색 불투명으로 두면 선형 휘도 1.0이라 상대 전체가 번진다.
//
// 색은 tokens에서만 온다. 텍스처는 생성 1회 후 재사용한다(포즈 5장, 평면 2장이 공유).

import * as THREE from 'three';
import { colors } from '../../../tokens.js';

export const POSE = {
  IDLE: 'idle',
  ADVANCE: 'advance',
  TELEGRAPH: 'telegraph',
  LUNGE: 'lunge',
  HIT: 'hit',
};

const TEX_W = 512;
const TEX_H = 1024;
const FIG_H = 1.9;                       // 상대 키(m)
const FIG_W = (FIG_H * TEX_W) / TEX_H;   // 0.95m
const FADE_SEC = 0.12;                   // 포즈 크로스페이드 120ms

// 림 최종 알파.
//
// 여기서 한 번 틀렸다. 처음에 0.52를 두고 "sRGB 0.60이니 선형 0.32라 안전하다"고 계산했는데
// **알파 합성이 sRGB가 아니라 선형 버퍼에서 일어난다.** 흰 림은 선형 1.0이므로
// 합성 결과의 선형 휘도가 곧 알파다. 0.52는 선형 0.58이라 threshold 0.42를 훌쩍 넘었고
// 실측에서 상대 다리 구간이 192/255(선형 0.527)로 나와 블룸에 걸리고 있었다.
//
// 그래서 알파 자체를 문턱 아래로 내린다. 합성 후 총 알파는 0.26 + 0.10 x 0.74 = 0.334 선형이고
// 화면에는 sRGB 0.61(약 156/255)로 나온다. 배경 0.04 대비 15:1이라 또렷하다.
const RIM_ALPHA = 0.26;
const GLOW_ALPHA = 0.10;
// 밝기를 문턱 아래로 묶은 대신 림을 굵게 가져간다. 두께는 휘도를 올리지 않는다
const RIM_R = 5;
const GLOW_R = 16;

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
  foot: [[0.255, 0.984], [0.745, 0.984]],
  blade: [0.470, 0.590, 0.055],  // 텍스처에 투영된 검끝과 끝 폭. 카메라 쪽으로 짧게 눕는다
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
    foot: [[0.290, 0.918], [0.738, 0.984]],
    blade: [0.462, 0.582, 0.055],
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
    foot: [[0.258, 0.984], [0.748, 0.984]],
    blade: [0.130, 0.062, 0.040],
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
    foot: [[0.110, 0.984], [0.892, 0.984]],
    blade: [0.600, 0.500, 0.090],
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
    foot: [[0.268, 0.984], [0.752, 0.984]],
    blade: [0.075, 0.130, 0.036],
  }),
};

function makeCanvas() {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  return c;
}

const X = (v) => v * TEX_W;
const Y = (v) => v * TEX_H;

/** 검신. 손에서 검끝으로 갈수록 굵어진다. 카메라를 향한 원근을 이 폭 변화가 대신한다. */
function drawBlade(ctx, hand, blade) {
  const [hx, hy] = hand;
  const [tx, ty, tw] = blade;
  const dx = X(tx) - X(hx);
  const dy = Y(ty) - Y(hy);
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const w0 = 9;
  const w1 = (tw * TEX_W) / 2;

  ctx.beginPath();
  ctx.moveTo(X(hx) + nx * w0, Y(hy) + ny * w0);
  ctx.lineTo(X(tx) + nx * w1, Y(ty) + ny * w1);
  ctx.lineTo(X(tx) - nx * w1, Y(ty) - ny * w1);
  ctx.lineTo(X(hx) - nx * w0, Y(hy) - ny * w0);
  ctx.closePath();
  ctx.fill();

  // 코킬. 손 앞 원반 하나로 검을 든 손이 읽힌다
  ctx.beginPath();
  ctx.arc(X(hx) + (dx / len) * 14, Y(hy) + (dy / len) * 14, 23, 0, Math.PI * 2);
  ctx.fill();
}

/** 골격을 단색으로 그린다. 림도 몸체도 이 같은 도형을 쓴다. */
function drawFigure(ctx, P, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const seg = (a, b, w) => {
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(X(a[0]), Y(a[1]));
    ctx.lineTo(X(b[0]), Y(b[1]));
    ctx.stroke();
  };

  // 다리. 허벅지가 굵고 정강이가 가늘다.
  // 선 굵기는 텍셀 기준이라 실측 지름이 그대로 나온다. 허벅지 78px은 0.145m다
  for (let i = 0; i < 2; i += 1) {
    seg(P.hip[i], P.knee[i], 78);
    seg(P.knee[i], P.foot[i], 52);
    // 발
    const f = P.foot[i];
    const out = i === 0 ? -1 : 1;
    seg(f, [f[0] + out * 0.075, f[1]], 34);
  }

  // 몸통. 어깨에서 골반으로 좁아지는 사다리꼴
  ctx.beginPath();
  ctx.moveTo(X(P.shoulder[0][0]), Y(P.shoulder[0][1]));
  ctx.lineTo(X(P.shoulder[1][0]), Y(P.shoulder[1][1]));
  ctx.lineTo(X(P.hip[1][0]), Y(P.hip[1][1]));
  ctx.lineTo(X(P.hip[0][0]), Y(P.hip[0][1]));
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 54;
  ctx.stroke();

  // 목
  seg(P.neck, [P.head[0], P.head[1] + P.head[3] * 0.5], 52);

  // 팔
  for (let i = 0; i < 2; i += 1) {
    seg(P.shoulder[i], P.elbow[i], 46);
    seg(P.elbow[i], P.hand[i], 38);
  }

  // 투구. 머리 타원에 턱 보호대와 목가리개(비브)를 붙여야 민머리가 아니라 펜싱 마스크로 읽힌다
  ctx.beginPath();
  ctx.ellipse(X(P.head[0]), Y(P.head[1]), X(P.head[2]), Y(P.head[3]), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    X(P.head[0]),
    Y(P.head[1] + P.head[3] * 0.42),
    X(P.head[2] * 0.88),
    Y(P.head[3] * 0.58),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 비브. 마스크 아래로 벌어지며 어깨를 덮는 사다리꼴
  const hx = X(P.head[0]);
  const hb = Y(P.head[1] + P.head[3] * 0.85);
  const bw = X(P.head[2]) * 0.9;
  const sy = (Y(P.shoulder[0][1]) + Y(P.shoulder[1][1])) / 2 + 26;
  ctx.beginPath();
  ctx.moveTo(hx - bw, hb);
  ctx.lineTo(hx + bw, hb);
  ctx.lineTo(hx + bw * 1.5, sy);
  ctx.lineTo(hx - bw * 1.5, sy);
  ctx.closePath();
  ctx.fill();

  drawBlade(ctx, P.hand[0], P.blade);
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
 * 포즈 한 장. 겉에서 안으로 글로우, 선명한 림, 어두운 몸체, 투구 하이라이트 순이다.
 * 부풀린 도형을 불투명으로 만든 뒤 합성할 때 알파를 한 번만 먹인다.
 * 반투명 이미지를 16방향으로 겹치면 알파가 1로 수렴해 흰 덩어리가 된다(실측).
 */
function bakePose(P) {
  const solid = makeCanvas();
  drawFigure(solid.getContext('2d'), P, colors.steel.hi);

  const body = makeCanvas();
  drawFigure(body.getContext('2d'), P, colors.bg.raised);

  const rim = dilate(solid, RIM_R);
  const glow = dilate(solid, GLOW_R);

  const out = makeCanvas();
  const ctx = out.getContext('2d');
  ctx.globalAlpha = GLOW_ALPHA;
  ctx.drawImage(glow, 0, 0);
  ctx.globalAlpha = RIM_ALPHA;
  ctx.drawImage(rim, 0, 0);
  ctx.globalAlpha = 1;
  ctx.drawImage(body, 0, 0);

  // 투구 하이라이트 한 점. 머리가 어디를 향하는지 이것 하나로 읽힌다.
  // 어두운 몸체 위에 얹히므로 이 알파가 거의 그대로 선형 휘도가 된다. 문턱 아래로 묶는다
  ctx.globalAlpha = 0.30;
  ctx.fillStyle = colors.steel.hi;
  ctx.beginPath();
  ctx.ellipse(
    X(P.head[0] - P.head[2] * 0.34),
    Y(P.head[1] - P.head[3] * 0.30),
    X(P.head[2] * 0.26),
    Y(P.head[3] * 0.20),
    -0.5,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(out);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * AI 검끝 오프셋(빌보드 기준 로컬, m). +z가 카메라 쪽이다.
 * 이 포인트가 AI 리본의 소스다. 텔레그래프에서 REAL과 FEINT의 궤적 크기가 갈린다.
 */
const TIP = {
  [POSE.IDLE]: [-0.20, 1.12, 0.30],
  [POSE.ADVANCE]: [-0.22, 1.14, 0.38],
  telegraphReal: [-0.34, 1.76, 0.16],   // 크고 높은 윈드업. 파란 리본이 큰 호를 그린다
  telegraphFeint: [-0.15, 1.26, 0.52],  // 짧고 낮은 페인트 플릭
  [POSE.LUNGE]: [0.02, 1.34, 1.46],     // 카메라를 향해 뻗는다
  [POSE.HIT]: [0.42, 1.52, 0.24],
};

export function createOpponent(scene) {
  const textures = {};
  for (const name of Object.values(POSE)) textures[name] = bakePose(POSES[name]);

  const geometry = new THREE.PlaneGeometry(FIG_W, FIG_H);
  geometry.translate(0, FIG_H / 2, 0);  // 발이 바닥 y 0에 닿는다

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

  // 검끝 포인트. 그룹의 자식이라 빌보드 회전을 그대로 따른다
  const tip = new THREE.Object3D();
  group.add(tip);
  scene.add(group);

  let current = 0;
  let poseName = POSE.IDLE;
  let fade = 1;
  const tmpColor = new THREE.Color();
  const baseColor = new THREE.Color(colors.steel.hi);
  const hitColor = new THREE.Color(colors.red.light);
  const realColor = new THREE.Color(colors.red.light);
  const tipTarget = new THREE.Vector3();

  function setPose(name) {
    if (name === poseName) return;
    poseName = name;
    const next = 1 - current;
    planes[next].material.map = textures[name];
    planes[next].material.needsUpdate = true;
    current = next;
    fade = 0;
  }

  return {
    group,
    tip,

    setPose,
    getPose() {
      return poseName;
    },

    /** 월드 z. distFromD가 준 거리를 그대로 받는다. */
    setDistance(dist) {
      group.position.z = -dist;
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

      // 검끝. 런지 중에는 대기 자세에서 런지 자세로 뻗는 중간값을 쓴다
      let target = TIP[poseName] ?? TIP[POSE.IDLE];
      if (poseName === POSE.TELEGRAPH) target = real ? TIP.telegraphReal : TIP.telegraphFeint;
      if (poseName === POSE.LUNGE) {
        const a = TIP[POSE.IDLE];
        const b = TIP[POSE.LUNGE];
        const t = Math.min(1, Math.max(0, lunge));
        tipTarget.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
      } else {
        tipTarget.set(target[0], target[1], target[2]);
      }
      // 포즈 사이를 순간이동하면 리본이 화면을 가로지르는 직선을 긋는다. 따라붙게 둔다
      tip.position.lerp(tipTarget, Math.min(1, dtSec * 14));

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
      for (const t of Object.values(textures)) t.dispose();
      for (const p of planes) p.material.dispose();
      geometry.dispose();
      scene.remove(group);
    },
  };
}
