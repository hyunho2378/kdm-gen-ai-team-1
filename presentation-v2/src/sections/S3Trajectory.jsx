// S3 인사이트(궤적은 정보다). 3겹.
// 레이어2(주인공): arena의 궤적 리본 렌더 모듈을 그대로 import해 풀스크린 배경으로 돌린다.
//   도표를 다시 그리지 않는다 — arena에서 실제로 도는 createTrailRibbon(가산 블렌딩 + 블룸)을 심는다.
//   마우스를 검끝 입력으로 연결해 관객이 움직이면 궤적이 그려진다.
// 레이어1: 블랙 바닥(렌더러 클리어 색 + CSS 폴백).
// 레이어3: '궤적은 정보다' 중앙, 하단에 계보 라벨. 다른 문구 없음.
//
// 성능: 오프스크린(현재 섹션 아님)이면 GPU 렌더를 건너뛴다. 전역 60fps는 마지막 전역 단계에서 총정리.

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect } from 'postprocessing';
import { createTrailRibbon } from '../../../arena/src/game/render/three/trail.js';
import { colors } from '../tokens.js';

const BLACK = 0x0a0a0b; // 브랜드 블랙(네이비 금지)

export default function S3Trajectory({ active }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch {
      return undefined; // WebGL 실패 → CSS 블랙 폴백. 발표가 죽지 않는다.
    }
    renderer.setClearColor(BLACK, 1); // 레이어1 블랙 = 클리어 색

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // arena 리본을 그대로 심는다. 내 검 = 실버-시안(관객 마우스가 내 검). 상대만 레드.
    const ribbon = createTrailRibbon({ core: colors.trail.self, glow: colors.trail.selfGlow, width: 0.025 });
    scene.add(ribbon.mesh);

    // arena 질감(빛나는 리본) 재현: 가산 리본 위에 블룸.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new EffectPass(
        camera,
        new BloomEffect({ intensity: 1.5, luminanceThreshold: 0.1, luminanceSmoothing: 0.35, radius: 0.75, mipmapBlur: true })
      )
    );

    let halfW = 1;
    let halfH = 1;
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
      halfH = 1;
      camera.left = -halfW;
      camera.right = halfW;
      camera.top = halfH;
      camera.bottom = -halfH;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // 마우스 → 월드 검끝. 없으면 부드러운 idle 드리프트(항상 흐르되 마우스가 우선). reduced면 드리프트 없음.
    const tip = new THREE.Vector3(0, 0, 0);
    const target = new THREE.Vector3(0, 0, 0);
    let mouseActive = 0;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      target.set(nx * halfW, ny * halfH, 0);
      mouseActive = 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    const t0 = last;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!activeRef.current) {
        last = now; // 오프스크린: dt 누적 없이 GPU 작업 스킵
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      mouseActive *= 0.96;
      if (!reduced && mouseActive < 0.5) {
        // idle: 검끝이 스스로 곡선을 그린다(항상 흐르는 궤적). arena와 같은 살아있는 질감.
        const t = (now - t0) / 1000;
        target.set(Math.sin(t * 0.7) * halfW * 0.72, Math.sin(t * 1.13 + 1.1) * halfH * 0.72, 0);
      }
      tip.lerp(target, 0.22); // 관성. 점 간격이 부드러워 teleport 리셋에 안 걸린다
      ribbon.push(tip, dt);
      ribbon.update(dt);
      ribbon.build(camera.position);
      composer.render();
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      ro.disconnect();
      ribbon.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 레이어2: arena 궤적 리본 */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* 레이어3: 중앙 문구 + 하단 계보 라벨 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textShadow: '0 2px 40px rgba(6,9,16,0.6)',
        }}
      >
        <span
          style={{
            fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
            fontSize: 'clamp(2rem, 6vw, 4.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#f2f6ff',
          }}
        >
          궤적은 정보다
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 'clamp(48px, 10vh, 120px)',
          zIndex: 2,
          display: 'flex',
          gap: 'clamp(16px, 4vw, 48px)',
          justifyContent: 'center',
          pointerEvents: 'none',
          fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
          fontSize: 'clamp(0.65rem, 1.3vw, 0.85rem)',
          fontWeight: 500,
          letterSpacing: '0.22em',
          color: 'rgba(242,246,255,0.5)',
        }}
      >
        <span>RHIZOMATIKS 2019 TOKYO</span>
        <span>WFL LA 2026</span>
      </div>
    </div>
  );
}
