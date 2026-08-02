// COMPONENTS.md: 렌더 루트. 렌더러 구현을 갖지 않고 인터페이스만 붙인다.
// 루프 주도권은 loop.js가 쥔다. react-three-fiber를 쓰지 않는다.
//
// 이 파일이 지키는 순서(ARENA_SCENE 3절):
//   1. loop.setTimeScale(engine.getTimeScale())   ← 로직 시계 제어. 렌더러로 넘기지 않는다
//   2. const fx = engine.drainFx()                ← 큐 소비도 여기서. 렌더러의 쓰기 0을 지킨다
//   3. renderer.render(engine.view, fx, dt)

import { useEffect, useRef } from 'react';
import { zIndex } from '../tokens.js';
import { createLoop } from './loop.js';
import { createRenderer } from './render/index.js';
import { PRESET } from './pose.js';

export default function GameCanvas({ engine, poseChannel, showMeter, onRendererReady, onFallback }) {
  const mountRef = useRef(null);
  // 콜백을 의존성에 넣으면 부모가 리렌더될 때마다 렌더러가 통째로 재생성된다.
  // 폴백 직후 three가 다시 서면서 전환이 취소되는 버그를 실측으로 확인했다. ref로 고정한다.
  const readyRef = useRef(onRendererReady);
  const fallbackRef = useRef(onFallback);
  readyRef.current = onRendererReady;
  fallbackRef.current = onFallback;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const renderer = createRenderer(mount, {
      dev: showMeter,
      onFallback: (reason) => fallbackRef.current?.(reason),
    });
    readyRef.current?.(renderer);

    const loop = createLoop({
      update: (stepSec) => engine.update(stepSec),
      render: (_alpha, realDtSec) => {
        loop.setTimeScale(engine.getTimeScale());

        // 키보드 모드의 자세 프리셋. 연속 채널은 판정을 거치지 않는다.
        // 컨트롤러가 붙으면(C3) setQuaternion이 이 값을 덮는다.
        if (poseChannel) {
          const v = engine.view;
          poseChannel.setPreset(
            v.meGuard ? PRESET.GUARD : v.meLunge > 0.02 ? PRESET.THRUST : PRESET.REST
          );
          renderer.setSwordPose(poseChannel.read());
        }

        const fx = engine.drainFx();
        renderer.render(engine.view, fx, realDtSec);
      },
    });

    loop.start();

    const onResize = () => renderer.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      loop.dispose();
      renderer.dispose();
    };
    // 콜백은 ref로 고정했으므로 의존성에 넣지 않는다. 렌더러는 마운트당 한 번만 선다.
  }, [engine, poseChannel, showMeter]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        zIndex: zIndex.content,
      }}
    />
  );
}
