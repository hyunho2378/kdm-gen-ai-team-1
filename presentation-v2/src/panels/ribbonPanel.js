// S5 판1 블레이드 트래킹 / 판4 시간 팽창 공용 리본 패널.
// arena의 궤적 리본 렌더러(createTrailRibbon)를 그대로 심는다. three + 블룸. 마우스가 검끝.
// timeDilation=true면 비네트 + 색수차를 걸고 모션을 느리게 해 "시간이 느려지는 감각"을 준다.

import * as THREE from 'three';
import {
  EffectComposer, RenderPass, EffectPass, BloomEffect,
  VignetteEffect, ChromaticAberrationEffect,
} from 'postprocessing';
import { createTrailRibbon } from '../../../arena/src/game/render/three/trail.js';
import { colors } from '../tokens.js';

const BLACK = 0x0a0a0b;

export function createRibbonPanel(canvas, { timeDilation = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setClearColor(BLACK, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // 내 검 = 실버-시안.
  const ribbon = createTrailRibbon({ core: colors.trail.self, glow: colors.trail.selfGlow, width: timeDilation ? 0.03 : 0.025 });
  scene.add(ribbon.mesh);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({
    intensity: timeDilation ? 2.2 : 1.5,
    luminanceThreshold: 0.1, luminanceSmoothing: 0.35, radius: 0.8, mipmapBlur: true,
  });
  if (timeDilation) {
    // 시간 팽창: 강한 비네트 + 색수차.
    const vignette = new VignetteEffect({ darkness: 0.85, offset: 0.28 });
    const chroma = new ChromaticAberrationEffect({ offset: new THREE.Vector2(0.006, 0.006) });
    composer.addPass(new EffectPass(camera, bloom, vignette, chroma));
  } else {
    composer.addPass(new EffectPass(camera, bloom));
  }

  let halfW = 1;
  const tip = new THREE.Vector3();
  const target = new THREE.Vector3();
  let mouseActive = 0;
  const t0 = performance.now();

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    const aspect = w / h;
    halfW = aspect;
    camera.left = -aspect; camera.right = aspect; camera.top = 1; camera.bottom = -1;
    camera.updateProjectionMatrix();
  }

  return {
    resize,
    setMouse(nx, ny) {
      target.set(nx * halfW, ny, 0);
      mouseActive = 1;
    },
    render(dt, reduced) {
      // 시간 팽창이면 시간을 늦춘다.
      const scale = timeDilation ? 0.35 : 1;
      const sdt = Math.min(0.05, dt) * scale;
      mouseActive *= 0.96;
      if (!reduced && mouseActive < 0.5) {
        const t = ((performance.now() - t0) / 1000) * scale;
        const sp = timeDilation ? 0.4 : 0.7;
        target.set(Math.sin(t * sp) * halfW * 0.72, Math.sin(t * (sp * 1.6) + 1.1) * 0.72, 0);
      }
      tip.lerp(target, timeDilation ? 0.12 : 0.22);
      ribbon.push(tip, Math.max(1 / 120, sdt));
      ribbon.update(sdt);
      ribbon.build(camera.position);
      composer.render();
    },
    dispose() {
      ribbon.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
