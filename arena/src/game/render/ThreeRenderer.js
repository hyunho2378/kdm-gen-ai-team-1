// 책임: three.js 1인칭 렌더러. ARENA_SCENE.md 사양을 구현한다.
//
// 규율. 게임 상태는 읽기만 한다(허용 필드 9개). 루프는 loop.js가 쥔다.
// react-three-fiber를 쓰지 않는다. 색은 tokens에서만 온다.
// V4a 범위는 씬 골격이다. 리본은 V4b, 빌보드는 V4c, 명중 연출은 V4d, 후처리는 V4b와 V4e에서 붙는다.

import * as THREE from 'three';
import { colors, motion } from '../../tokens.js';
import { thrustEase } from './canvas2d/geometry.js';
import {
  CAMERA,
  SWORD_POSES,
  createBackground,
  createCamera,
  createEnvironment,
  createLights,
  createSword,
  distFromD,
} from './three/scene.js';

const DPR_CAP = 2;
const BUDGET = motion.budget;

/** 두 좌표를 섞는다. 프리셋 트윈의 최소 단위다. */
function lerp3(out, a, b, t) {
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
  return out;
}

export function createThreeRenderer() {
  let renderer = null;
  let scene = null;
  let camera = null;
  let sword = null;
  let background = null;
  let opponent = null;
  let canvas = null;
  let onLost = null;

  let w = 0;
  let h = 0;
  let fps = 60;

  // 연속 채널의 최신값. 판정에 쓰이지 않는다.
  let pose = { kind: 'preset', value: 'rest' };

  const tmpGrip = new THREE.Vector3();
  const tmpTip = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();
  // 검신이 뻗는 로컬 축. scene.js의 지오메트리 배치와 일치해야 한다.
  const BLADE_AXIS = new THREE.Vector3(0, 0, -1);

  /** 프리셋 사이 블렌드. 자세 선택은 pose, 진행도는 게임 상태가 준다. */
  function poseSword(gameState) {
    const guard = gameState.meGuard === true;
    const lunge = Math.min(1, Math.max(0, gameState.meLunge ?? 0));

    let a = SWORD_POSES.rest;
    let b = SWORD_POSES.rest;
    let t = 0;

    if (guard) {
      b = SWORD_POSES.guard;
      t = 1;
    } else if (lunge > 0) {
      // 앞 30퍼센트는 와인드업으로 당겼다가 나머지에서 뻗는다. 비대칭이 찌르기의 인상을 만든다.
      const e = thrustEase(lunge);
      if (e < 0.3) {
        a = SWORD_POSES.rest;
        b = SWORD_POSES.windup;
        t = e / 0.3;
      } else {
        a = SWORD_POSES.windup;
        b = SWORD_POSES.thrust;
        t = (e - 0.3) / 0.7;
      }
    }

    lerp3(tmpGrip, a.grip, b.grip, t);
    lerp3(tmpTip, a.tip, b.tip, t);

    sword.group.position.copy(tmpGrip);
    // lookAt을 쓰지 않는다. 비카메라 객체의 lookAt은 +z를 타깃으로 향하는데 검신은 -z로 뻗어 있고,
    // 인자를 월드 좌표로 해석해 카메라 자식인 이 그룹과 좌표계가 어긋난다(실측으로 검이 뒤집혔다).
    // 그룹이 카메라의 자식이라 로컬 공간이 곧 카메라 공간이므로 방향을 직접 계산한다.
    tmpDir.copy(tmpTip).sub(tmpGrip).normalize();
    sword.group.quaternion.setFromUnitVectors(BLADE_AXIS, tmpDir);

    // 컨트롤러가 붙으면(C3) 프리셋 회전을 쿼터니언으로 대체한다. 위치는 그립 그대로 둔다.
    if (pose.kind === 'quaternion') {
      const [x, y, z, wq] = pose.value;
      tmpQuat.set(x, y, z, wq);
      sword.group.quaternion.copy(tmpQuat);
    }
  }

  return {
    id: 'three',
    label: '3D',

    init(mount, { dev = false, onContextLost } = {}) {
      onLost = onContextLost;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      Object.assign(canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'block',
      });
      renderer.setClearColor(new THREE.Color(colors.bg.base), 1);
      mount.appendChild(canvas);

      // 컨텍스트 손실은 폴백 신호다. 삼켜서는 안 된다(PITFALLS 브라우저별 검증).
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        onLost?.();
      });

      scene = new THREE.Scene();
      camera = createCamera(1);
      // 카메라의 자식(내 검)이 렌더되려면 카메라 자체가 씬에 들어가야 한다.
      scene.add(camera);
      createLights(scene);
      // 환경맵이 먼저 서야 크롬 재질이 발색한다.
      createEnvironment(renderer, scene);
      background = createBackground(scene);
      sword = createSword(camera);

      // V4c에서 빌보드로 교체된다. 지금은 거리 매핑 확인용 자리표시자다.
      opponent = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.7, 0.12),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(colors.bg.raised),
          emissive: new THREE.Color(colors.trail.ai),
          emissiveIntensity: 0.25,
          roughness: 0.7,
        })
      );
      opponent.position.set(0, 0.85, -4);
      scene.add(opponent);

      void dev;
      this.resize();
    },

    resize() {
      if (!renderer || !canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = Math.max(1, Math.round(rect?.width ?? window.innerWidth));
      h = Math.max(1, Math.round(rect?.height ?? window.innerHeight));
      renderer.setPixelRatio(Math.min(DPR_CAP, window.devicePixelRatio || 1));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },

    render(gameState, fx, dtRender) {
      if (!renderer) return;
      if (dtRender > 0) fps += (1 / dtRender - fps) * 0.08;

      // 상대 거리. d는 근접도라 값이 클수록 가깝다.
      opponent.position.z = -distFromD(gameState.d);

      poseSword(gameState);

      // fx는 V4d에서 소비한다. 지금은 계약만 받는다.
      void fx;

      renderer.render(scene, camera);
    },

    /** 연속 채널 주입. 판별 유니온만 받는다(ARENA_SCENE 3절). */
    setSwordPose(next) {
      if (next && (next.kind === 'preset' || next.kind === 'quaternion')) pose = next;
    },

    setPoses() {
      // V4c에서 빌보드 텍스처로 연결한다.
    },
    setBackgroundImage(image) {
      background?.setImage(image);
    },
    clear() {
      // V4b 리본이 붙으면 여기서 비운다.
    },
    getFps() {
      return fps;
    },
    isDegraded() {
      return fps < BUDGET.minFps;
    },

    dispose() {
      scene?.traverse((o) => {
        o.geometry?.dispose?.();
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
        else o.material?.dispose?.();
      });
      renderer?.dispose();
      canvas?.remove();
      renderer = null;
      scene = null;
      camera = null;
      sword = null;
      background = null;
      opponent = null;
      canvas = null;
    },
  };
}
