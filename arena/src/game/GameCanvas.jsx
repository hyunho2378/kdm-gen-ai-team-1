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
import { OUTCOME } from './judge.js';
import { IMPACT } from './render/three/post.js';

export default function GameCanvas({ engine, poseChannel, perf, reduced = false, frozen = false, onRendererReady, onFallback, onFx, onGameFx }) {
  const mountRef = useRef(null);
  // 콜백을 의존성에 넣으면 부모가 리렌더될 때마다 렌더러가 통째로 재생성된다.
  // 폴백 직후 three가 다시 서면서 전환이 취소되는 버그를 실측으로 확인했다. ref로 고정한다.
  const readyRef = useRef(onRendererReady);
  const fallbackRef = useRef(onFallback);
  const fxRef = useRef(onFx);
  const gameFxRef = useRef(onGameFx);
  // 온보딩·카운트다운 동안 로직 시계를 세운다. hitstop과 같은 경로(timeScale 0)라 판정에 영향이 없다.
  const frozenRef = useRef(frozen);
  readyRef.current = onRendererReady;
  fallbackRef.current = onFallback;
  fxRef.current = onFx;
  gameFxRef.current = onGameFx;
  frozenRef.current = frozen;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const renderer = createRenderer(mount, {
      reduced,
      onFallback: (reason) => fallbackRef.current?.(reason),
    });
    // 명중 순간 로직 시계만 세운다. 렌더는 계속 돈다.
    // 시계 제어는 ARENA_SCENE 3절대로 GameCanvas 소관이라 렌더러가 만지지 않는다.
    let hitstopUntil = 0;
    // 화면 좌표가 필요한 연출은 DOM이 그린다. 렌더러는 투영 좌표만 넘긴다
    renderer.setFxObserver((e) => fxRef.current?.(e));
    readyRef.current?.(renderer);

    const loop = createLoop({
      update: (stepSec) => engine.update(stepSec),
      render: (_alpha, realDtSec) => {
        const now = performance.now();
        loop.setTimeScale(frozenRef.current || now < hitstopUntil ? 0 : engine.getTimeScale());

        // 키보드 모드의 자세 프리셋. 연속 채널은 판정을 거치지 않는다.
        // 컨트롤러가 붙으면(C3) setQuaternion이 이 값을 덮는다.
        //
        // **우선순위 thrust > guard(홀드 중) > 디폴트 (R1).** 렌더러의 poseSword와 같은 순서다.
        // 가드를 먼저 보면 홀드 중에 찌를 때 찌르기 자세가 통째로 묻혀
        // 리포스트로 되찌를 때 "찔렀다"가 안 읽힌다. judge는 guard on/off를 순간 이벤트로
        // 옳게 처리하고 있으므로 고칠 곳은 자세 채널뿐이다.
        if (poseChannel) {
          const v = engine.view;
          poseChannel.setPreset(
            v.meLunge > 0.02 ? PRESET.THRUST : v.meGuard ? PRESET.GUARD : PRESET.REST
          );
          renderer.setSwordPose(poseChannel.read());
        }

        const fx = engine.drainFx();
        for (const e of fx) {
          if (e.outcome === OUTCOME.HIT || e.outcome === OUTCOME.RIPOSTE) {
            hitstopUntil = now + IMPACT.hitstopMs;
          }
          // 판정이 낸 사건 그대로다. 렌더러를 안 거치므로 2D 폴백에서도 폰이 반응한다(C3)
          gameFxRef.current?.(e);
        }
        // render 벽시계를 잰다. 헤드리스 fps는 무효라도 이 값의 전후 비교는 유효한 대리 지표다
        const t0 = performance.now();
        renderer.render(engine.view, fx, realDtSec);
        perf?.sample(realDtSec, performance.now() - t0);
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
  }, [engine, poseChannel, perf, reduced]);

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
