// 책임: 씬 구성 요소 생성. ARENA_SCENE.md 4, 5, 9절 수치를 그대로 쓴다.
// 색은 전부 tokens에서 JS로 주입한다. 여기에 HEX를 적지 마라.

import * as THREE from 'three';
import { colors } from '../../../tokens.js';

// 4절. fov는 수직 기준이라 세로 프레이밍이 종횡비와 무관하다.
export const CAMERA = { fov: 70, near: 0.05, far: 60, eyeY: 1.6 };

// 4절. d는 근접도라 값이 클수록 가깝다(judge.js 정의). 그래서 거리는 반비례한다.
//
// V4c 실측 조정. 상대가 화면 높이에서 차지하는 비율은 1.9m / (2 x dist x tan35도) = 1.3568 / dist다.
// 유효 범위 d 35~55에서 40~55퍼센트를 차지해야 위협적으로 읽힌다는 요구를 이 두 상수로 맞췄다.
//   d 35 → 3.32m → 40.9%   d 45 → 3.01m → 45.2%   d 55 → 2.70m → 50.3%
// 근을 더 줄이면 d 100에서 상대가 얼굴을 뚫고 들어온다. 원을 더 키우면 먼쪽이 40퍼센트 아래로 떨어진다.
const DIST_NEAR = 1.3;
const DIST_FAR = 4.4;
export function distFromD(d) {
  return DIST_FAR - (d / 100) * (DIST_FAR - DIST_NEAR);
}

// 5절 프리셋. 카메라 로컬 좌표(미터). 6절 가시성 증명이 이 수치로 계산되었다.
export const SWORD_POSES = {
  rest: { grip: [0.28, -0.30, -0.55], tip: [0.42, -0.22, -1.05] },
  windup: { grip: [0.34, -0.33, -0.52], tip: [0.52, -0.34, -0.95] },
  thrust: { grip: [0.14, -0.16, -1.50], tip: [0.02, 0.05, -1.95] },
  guard: { grip: [0.24, -0.10, -0.50], tip: [0.16, 0.34, -0.90] },
};

export function createCamera(aspect) {
  const cam = new THREE.PerspectiveCamera(CAMERA.fov, aspect, CAMERA.near, CAMERA.far);
  cam.position.set(0, CAMERA.eyeY, 0);
  cam.lookAt(0, CAMERA.eyeY, -1);
  return cam;
}

export function createLights(scene) {
  // 9절. 조명은 둘만. ambient 낮게 + 상대 쪽 rim directional 하나.
  const ambient = new THREE.AmbientLight(new THREE.Color(colors.steel.mid), 0.35);
  const rim = new THREE.DirectionalLight(new THREE.Color(colors.steel.hi), 1.5);
  rim.position.set(-1.2, 3.0, -4.0);
  scene.add(ambient, rim);
  return { ambient, rim };
}

/** 도장 이미지가 오기 전 임시 배경. bg.base에서 bg.deep으로 떨어지는 그라디언트 텍스처. */
function gradientTexture() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, colors.bg.base);
  grad.addColorStop(1, colors.bg.deep);
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 크롬 재질용 환경맵. metalness가 높은 재질은 환경맵이 없으면 새까맣게 렌더된다(실측 확인).
 * 블랙 무대라 밝은 방을 넣을 수는 없으므로, 어두운 바탕에 밝은 띠 하나만 둔 등장방형 텍스처를 만든다.
 * 그 띠가 검신을 타고 흐르는 하이라이트가 된다. 색은 tokens에서만 온다.
 */
export function createEnvironment(renderer, scene) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = colors.bg.deep;
  g.fillRect(0, 0, 64, 32);

  const band = g.createLinearGradient(0, 6, 0, 20);
  band.addColorStop(0, colors.bg.deep);
  band.addColorStop(0.45, colors.steel.mid);
  band.addColorStop(0.5, colors.steel.hi);
  band.addColorStop(0.55, colors.steel.mid);
  band.addColorStop(1, colors.bg.deep);
  g.fillStyle = band;
  g.fillRect(0, 6, 64, 14);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  scene.environment = env;

  tex.dispose();
  pmrem.dispose();
  return env;
}

export function createBackground(scene) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 20),
    new THREE.MeshBasicMaterial({ map: gradientTexture(), depthWrite: false })
  );
  plane.position.set(0, CAMERA.eyeY, -14);
  scene.add(plane);

  // 바닥. 거리감을 돕는 최소한의 면.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(colors.bg.deep), roughness: 0.95, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  scene.fog = new THREE.FogExp2(new THREE.Color(colors.bg.deep), 0.075);

  return {
    plane,
    setImage(image) {
      if (!image) return;
      const tex = new THREE.Texture(image);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      plane.material.map?.dispose();
      plane.material.map = tex;
      plane.material.needsUpdate = true;
    },
  };
}

/**
 * 내 검. 15절 방향에 따라 Box 세장비로 간다. Lathe는 여유 시 승격.
 * 그룹 원점이 그립이고 검신은 -z로 뻗는다. 검끝에 emissive 마커를 둔다.
 */
/**
 * 내 검. 프리셋 좌표는 **카메라 로컬**이므로 카메라의 자식으로 붙인다.
 * 씬에 직접 붙이면 같은 수치가 월드 좌표로 해석되어 화면 밖으로 나간다(실측 확인).
 */
export function createSword(camera) {
  const group = new THREE.Group();

  const BLADE_LEN = 0.62;
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.014, BLADE_LEN),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.steel.mid),
      metalness: 0.95,
      roughness: 0.18,
    })
  );
  blade.position.set(0, 0, -BLADE_LEN / 2 - 0.06);

  const guard = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.016, 0.016),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.steel.shadow),
      metalness: 0.9,
      roughness: 0.3,
    })
  );
  guard.position.set(0, 0, -0.055);

  const grip = new THREE.Mesh(
    new THREE.BoxGeometry(0.026, 0.026, 0.10),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.bg.raised),
      metalness: 0.2,
      roughness: 0.8,
    })
  );

  // 검끝 마커. 궤적 리본의 시작점이며 소유 색(red.light)을 띤다.
  const tipMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 10, 8),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.trail.self),
      emissive: new THREE.Color(colors.trail.self),
      emissiveIntensity: 2.2,
      roughness: 0.4,
    })
  );
  tipMarker.position.set(0, 0, -BLADE_LEN - 0.06);

  group.add(blade, guard, grip, tipMarker);
  camera.add(group);

  return { group, tipMarker, bladeLength: BLADE_LEN };
}
