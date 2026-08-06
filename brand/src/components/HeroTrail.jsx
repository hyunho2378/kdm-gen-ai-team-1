// 히어로 검끝 궤적. DESIGN 10절 모티프를 brand 히어로에서 구현한다.
//
// **궤적 리본은 arena 모듈을 그대로 import한다**(BRAND_SITE_GUIDE 8절).
// `arena/src/game/render/three/trail.js`의 `createTrailRibbon`이고 arena 파일은 읽기만 한다.
// 도표로 다시 그리지 않는다. 여기 있는 것은 좌표계와 추종 로직뿐이다.
//
// 좌표계. 직교 카메라로 화면 세로를 2단위(y -1..1)에 맞춘다. 가로는 종횡비만큼 넓어진다.
// **이 배율이 리본의 순간이동 가드와 직결된다.** trail.js는 프레임 간 이동이
// max(0.35, 12 x dt)를 넘으면 이력을 버린다(궤적이 아니라 자리 이동으로 본다).
// 그래서 커서 좌표를 그대로 밀지 않고 속도 상한을 건 추종점을 민다.
// 상한 9단위/초는 어느 프레임레이트에서도 가드 아래다(60fps 0.15 대 0.35, 20fps 0.45 대 0.6).
//
// ── 라이트 배경 대응 (BV2-2) ────────────────────────────────────────────────
// **가산 합성이 문제였다.** trail.js의 재질은 `AdditiveBlending`인데, 가산은 배경을
// 밝게만 만든다. 어두운 무대에서는 그것이 발광이지만 밝은 무대에서는 더할 여지가 없어서
// 리본이 통째로 사라진다. **색만 잉크로 바꿔도 안 보인다**(가산은 어두운 색을 더해도 0이다).
// 실측: 스틸 코어 #D8E2F0가 #C1C1C1 위에서 1.38:1, #F6F6F6 위에서 1.21:1이었다.
//
// 그래서 **합성 방식을 브랜드 쪽에서 일반 합성으로 바꾸고 색을 잉크로 내린다.**
// arena 파일은 그대로 둔다(읽기만 한다는 계약 유지). trail.js가 돌려주는 mesh의 재질을
// 여기서 덮어쓰는 것이라 arena의 다크 무대는 영향을 안 받는다.

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createTrailRibbon } from '../../../arena/src/game/render/three/trail.js';
import { colors } from '../tokens.js';

// 소용돌이 상수. 커서 입력이 없을 때 검끝이 스스로 그리는 궤적이다.
// **각속도가 곧 호의 길이다.** 리본 수명이 520ms(arena LIFE_MS)라 화면에 남는 것은
// 그 사이에 지나온 길뿐이다. 1.8rad/s에서는 54도 조각이라 소용돌이로 안 읽혀 2.6으로 올렸다(실측).
const VORTEX = {
  radius: 0.52,      // 기준 반경(단위). 화면 세로 2단위 기준이라 약 26퍼센트 지점
  speed: 2.6,        // 각속도(rad/s). 520ms에 약 78도가 남는다
  breathe: 0.3,      // 반경이 드나드는 비율
  breatheRate: 0.37, // 반경 호흡의 각속도 배수. 각속도와 나누어떨어지지 않아 같은 자리를 안 밟는다
};

// 추종. 커서를 따라가는 검끝의 관성이다.
//
// **직선 추격이 아니라 스프링이다.** 남은 거리의 일정 비율만 따라가면 목표가 바뀔 때마다
// 경로가 꺾여 리본이 다각형으로 보인다(실측). 속도를 상태로 들고 가면 방향이 관성으로 돌아
// 곡선이 나오고, 그것이 검끝이 그리는 선이다.
const FOLLOW = {
  stiffness: 90,     // 목표를 당기는 세기
  damping: 0.86,     // 프레임당 속도 감쇠(60fps 기준). 1에 가까울수록 오래 흐른다
  maxSpeed: 9,       // 단위/초 상한. 순간이동 가드 아래로 유지하는 값이다
};

const IDLE_MS = 900;   // 이만큼 입력이 없으면 소용돌이로 넘어간다
const RIBBON_WIDTH = 0.0028; // 반폭(단위). 1440x900에서 약 2.5px. 가늘고 선명한 한 줄이다
const DPR_CAP = 2;

/** 정적 폴백에 그릴 나선. reduced motion에서 한 번만 그린다. */
const STATIC_POINTS = 150;

function vortexAt(t, out) {
  const a = t * VORTEX.speed;
  const r = VORTEX.radius * (1 - VORTEX.breathe + VORTEX.breathe * Math.sin(a * VORTEX.breatheRate));
  out.set(Math.cos(a) * r, Math.sin(a) * r * 0.72, 0);
  return out;
}

export default function HeroTrail() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // WebGL이 없으면 히어로는 워드마크만으로 선다. 화면을 비우지 않는 것이 우선이다
      console.warn('[brand] WebGL을 못 얻었다. 히어로 궤적을 생략한다.');
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 2);

    // 코어는 잉크, 잔광은 옅은 잉크. trail.js가 둘을 섞어 가장자리를 죽인다
    const ribbon = createTrailRibbon({
      core: colors.text.primary,
      glow: colors.text.dim,
      width: RIBBON_WIDTH,
    });
    // **가산에서 일반 합성으로 바꾼다.** 이걸 안 바꾸면 어떤 색을 줘도 밝은 배경에서 안 보인다.
    // toneMapped는 가산 발광을 위한 설정이라 같이 되돌린다
    ribbon.mesh.material.blending = THREE.NormalBlending;
    ribbon.mesh.material.toneMapped = true;
    ribbon.mesh.material.needsUpdate = true;
    scene.add(ribbon.mesh);

    const target = new THREE.Vector3();
    const tip = new THREE.Vector3();
    const vel = new THREE.Vector3();
    const step = new THREE.Vector3();
    let hasPointer = false;
    let lastMoveAt = -Infinity;
    let t = 0;

    function resize() {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    }
    resize();

    // 화면 좌표를 카메라 단위로 옮긴다. 세로가 2단위이므로 가로는 종횡비를 곱한다
    function onPointerMove(e) {
      const rect = host.getBoundingClientRect();
      if (rect.height === 0) return;
      const aspect = rect.width / rect.height;
      target.set(
        ((e.clientX - rect.left) / rect.width * 2 - 1) * aspect,
        -((e.clientY - rect.top) / rect.height * 2 - 1),
        0
      );
      hasPointer = true;
      lastMoveAt = performance.now();
    }

    if (reduced) {
      // 정적 완성. 나선을 한 번에 그려 두고 루프를 돌리지 않는다.
      // 사람이 볼 것은 같은 모티프이고 움직임만 없다
      for (let i = 0; i < STATIC_POINTS; i += 1) {
        ribbon.push(vortexAt(i * 0.02, tip), 1 / 60);
      }
      ribbon.build(camera.position);
      renderer.render(scene, camera);

      const ro = new ResizeObserver(() => {
        resize();
        renderer.render(scene, camera);
      });
      ro.observe(host);
      return () => {
        ro.disconnect();
        scene.remove(ribbon.mesh);
        ribbon.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    // 첫 프레임의 검끝을 소용돌이 위에 올려 둔다. 원점에서 출발하면 첫 획이 직선으로 튄다
    vortexAt(0, tip);

    let raf = 0;
    let last = 0;
    let running = false;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      // 탭 복귀나 정지 후 재개에서 dt가 튀면 한 프레임이 화면을 가로지른다
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      t += dt;

      const idle = !hasPointer || now - lastMoveAt > IDLE_MS;
      if (idle) vortexAt(t, target);

      // 스프링으로 당기고 감쇠시킨다. 속도가 상태라 방향이 관성으로 돌아 곡선이 남는다.
      // 프레임당 이동은 상한으로 자른다. 상한이 있어야 리본의 순간이동 가드에 안 걸린다
      step.copy(target).sub(tip);
      vel.addScaledVector(step, FOLLOW.stiffness * dt);
      vel.multiplyScalar(Math.pow(FOLLOW.damping, dt * 60));
      step.copy(vel).multiplyScalar(dt);
      const maxStep = FOLLOW.maxSpeed * dt;
      if (step.length() > maxStep) {
        step.setLength(maxStep);
        vel.copy(step).divideScalar(dt); // 잘린 만큼 속도도 줄여 다음 프레임이 다시 튀지 않게 한다
      }
      tip.add(step);

      ribbon.push(tip, dt);
      ribbon.update(dt);
      ribbon.build(camera.position);
      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      last = 0; // 정지 동안 흐른 시간이 dt로 들어오지 않게 시계를 끊는다
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    // 히어로가 화면 밖이면 그리지 않는다. 아래 섹션을 읽는 동안 GPU를 놀린다
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(host);

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      stop();
      scene.remove(ribbon.mesh);
      ribbon.dispose();
      // **컨텍스트를 명시적으로 놓는다.** dispose만으로는 GPU 컨텍스트가 GC까지 남는다.
      // dev StrictMode는 효과를 두 번 돌려 컨텍스트를 둘 만드는데(실측 생성 2, 살아 있는 canvas 1),
      // 놓아 주지 않으면 브라우저 컨텍스트 한도를 향해 쌓인다. 프로덕션은 생성 1이다
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  // 텍스트 아래, 클릭을 막지 않는 층.
  //
  // **`data-warp="none"`은 스크롤 워프에서 빠지겠다는 표시다.** 이 층은 fixed가 아니라
  // 히어로 섹션 안의 absolute라(실측) 워프 래퍼 밖으로 낼 수가 없다. 대신 ScrollWarp가
  // 같은 각을 빼 준다. skewY는 각이 더해지므로 두 행렬의 곱이 정확히 항등이 되고
  // 검끝 궤적만 안 기운 채로 남는다
  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-warp="none"
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
