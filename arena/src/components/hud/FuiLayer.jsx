// 책임: XR 글라스의 홀로그램 정보 층. 월드 좌표에 서는 DOM 연출을 그린다.
//
// 시각 문법은 팔각형 프레임과 같다. 팔각, steel 얇은 라인, red.light 액센트, hud 타이포.
// **D4는 리포스트 링 하나뿐이다.** D5의 명중 마커와 데미지 표시가 같은 문법으로 여기 붙는다.
//
// 캔버스 밖 DOM이므로 MOTION 규율을 그대로 지킨다. transform과 opacity만 애니메이션한다.
// 좌표는 렌더러가 투영해 준 CSS 픽셀이다(ThreeRenderer.projectToScreen).

import { useEffect, useRef, useState } from 'react';
import { colors, motion, typography, zIndex } from '../../tokens.js';
import { RULES } from '../../game/judge.js';

const RING_R = 34;
const ENTER_MS = 150;

/** 팔각형 꼭짓점. 프레임과 같은 도형 언어를 작은 크기로 되풀이한다. */
function octagon(r) {
  const pts = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

/**
 * 리포스트 링. 패리 성공 지점에 서서 600ms 동안 줄어든다.
 * 줄어드는 팔각형이 곧 남은 시간이다. 이 안에 찌르면 2점이다.
 */
function RiposteRing({ shot, reduced }) {
  const scaleRef = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    let anim = 0;
    const t0 = performance.now();
    // 남은 시간을 크기로 그린다. 프레임마다 transform만 만진다(layout과 paint를 건드리지 않는다)
    function tick(now) {
      const t = Math.min(1, (now - t0) / RULES.RIPOSTE_WINDOW_MS);
      if (scaleRef.current) scaleRef.current.style.transform = `scale(${(1 - t * 0.62).toFixed(3)})`;
      if (t < 1) anim = requestAnimationFrame(tick);
    }
    if (!reduced) anim = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(anim);
    };
  }, [reduced]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: shot.x,
        top: shot.y,
        width: 0,
        height: 0,
        opacity: shown ? 1 : 0,
        transition: `opacity ${ENTER_MS}ms ${motion.easeOut}`,
      }}
    >
      <div ref={scaleRef} style={{ position: 'absolute', left: -RING_R, top: -RING_R, willChange: 'transform' }}>
        <svg width={RING_R * 2} height={RING_R * 2} viewBox={`0 0 ${RING_R * 2} ${RING_R * 2}`}>
          <g transform={`translate(${RING_R} ${RING_R})`}>
            <polygon
              points={octagon(RING_R - 3)}
              fill="none"
              stroke={colors.steel.mid}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <polygon
              points={octagon(RING_R - 11)}
              fill="none"
              stroke={colors.red.light}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              opacity="0.9"
            />
          </g>
        </svg>
      </div>
      <span
        style={{
          position: 'absolute',
          left: RING_R + 8,
          top: -9,
          whiteSpace: 'nowrap',
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          fontWeight: typography.hud.weight,
          letterSpacing: typography.hud.tracking,
          color: colors.red.light,
        }}
      >
        되찌르기
      </span>
    </div>
  );
}

export default function FuiLayer({ shot, reduced = false }) {
  if (!shot || !shot.visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.sticky,
        pointerEvents: 'none',
      }}
    >
      {shot.outcome === 'PARRY' ? <RiposteRing key={shot.id} shot={shot} reduced={reduced} /> : null}
    </div>
  );
}
