// COMPONENTS.md: 렌더 루트. canvas 풀스크린, zIndex.content.
// 루프는 여기서 돈다. 로직은 engine.update(고정 스텝), 그리기는 renderer.draw(가변).
// 캔버스는 transform opacity 규칙의 예외 영역이다.

import { useEffect, useRef } from 'react';
import { zIndex } from '../tokens.js';
import { createLoop } from './loop.js';
import { createRenderer } from './renderer/index.js';
import { layout } from './renderer/geometry.js';
import { OUTCOME, OWNER } from './judge.js';

export default function GameCanvas({ engine, showMeter, onRendererReady }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = createRenderer(canvas);
    renderer.resize();
    onRendererReady?.(renderer);

    let lastTips = null;

    const loop = createLoop({
      update: (stepSec) => engine.update(stepSec),
      render: (_alpha, realDtSec) => {
        loop.setTimeScale(engine.getTimeScale());
        renderer.update(realDtSec);
        lastTips = renderer.draw(engine.view, { showMeter }) ?? lastTips;

        // 판정 연출을 캔버스로 옮긴다. engine은 캔버스를 모른다.
        const fx = engine.drainFx();
        if (fx.length > 0 && lastTips) {
          const rect = canvas.getBoundingClientRect();
          const { scale } = layout(rect.width, rect.height, engine.view.d);
          for (const e of fx) {
            if (e.outcome === OUTCOME.PARRY) {
              renderer.onParry(lastTips.meTip, scale);
            } else if (e.outcome === OUTCOME.HIT || e.outcome === OUTCOME.RIPOSTE) {
              const tip = e.owner === OWNER.ME ? lastTips.meTip : lastTips.aiTip;
              renderer.onHit(e.owner, tip, scale);
            }
          }
        }
      },
    });

    loop.start();

    const onResize = () => renderer.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      loop.dispose();
    };
  }, [engine, showMeter, onRendererReady]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        display: 'block',
        zIndex: zIndex.content,
      }}
    />
  );
}
