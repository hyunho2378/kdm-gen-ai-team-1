// 책임: XR 글라스의 홀로그램 정보 층. 월드 좌표에 서는 DOM 연출을 그린다.
//
// 시각 문법은 팔각형 프레임과 같다. 팔각, steel 얇은 라인, red.light 액센트, hud 타이포.
// 셋이 산다. 되찌르기 링(D4), 명중 마커(D5), 데미지 인디케이터(D5).
//
// 캔버스 밖 DOM이므로 MOTION 규율을 그대로 지킨다. **transform과 opacity만** 애니메이션한다.
// 좌표는 렌더러가 투영해 준 CSS 픽셀이다(ThreeRenderer.projectToScreen).

import { useEffect, useRef, useState } from 'react';
import { colors, motion, typography, zIndex } from '../../tokens.js';
import { OUTCOME, OWNER, RULES } from '../../game/judge.js';
import { cutSize, octagonPoints, useViewport } from './frame.js';

const RING_R = 34;
const MARK_R = 46;
const ENTER_MS = 150;
const HOLD_MS = motion.duration.judge;

/** 팔각형 꼭짓점. 프레임과 같은 도형 언어를 작은 크기로 되풀이한다. */
function octagon(r) {
  const pts = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** 등장과 이탈을 한 번씩만 태우는 스위치. 유지 시간이 지나면 스스로 꺼진다. */
function useLifecycle(holdMs) {
  const [phase, setPhase] = useState('in');
  useEffect(() => {
    const raf = requestAnimationFrame(() => setPhase('hold'));
    const t = setTimeout(() => setPhase('out'), holdMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [holdMs]);
  return phase;
}

/**
 * 되찌르기 링(D4). 패리 지점에 서서 600ms 동안 줄어든다.
 * 줄어드는 팔각형이 곧 남은 시간이다. 이 안에 찌르면 2점이다.
 */
function RiposteRing({ shot, reduced }) {
  const scaleRef = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    let anim = 0;
    const t0 = performance.now();
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
      style={{
        position: 'absolute',
        left: shot.x,
        top: shot.y,
        opacity: shown ? 1 : 0,
        transition: `opacity ${ENTER_MS}ms ${motion.easeOut}`,
      }}
    >
      <div ref={scaleRef} style={{ position: 'absolute', left: -RING_R, top: -RING_R, willChange: 'transform' }}>
        <svg width={RING_R * 2} height={RING_R * 2}>
          <g transform={`translate(${RING_R} ${RING_R})`}>
            <polygon points={octagon(RING_R - 3)} fill="none" stroke={colors.steel.mid} strokeWidth="1.5" />
            <polygon points={octagon(RING_R - 11)} fill="none" stroke={colors.red.light} strokeWidth="2" opacity="0.9" />
          </g>
        </svg>
      </div>
      <Label x={RING_R + 8} y={-9} tone={colors.red.light} text="되찌르기" />
    </div>
  );
}

/**
 * 명중 마커(D5). 내가 득점한 지점에 팔각 레티클이 선다.
 * 팔각 외곽 + 과녁 링 2겹 + 부위 라벨 + 점수 팝업. JUDGE 안에 이탈한다.
 */
function HitMarker({ shot, reduced }) {
  const phase = useLifecycle(HOLD_MS - ENTER_MS);
  const enter = phase !== 'in';
  const leave = phase === 'out';
  // reduced에서는 크기 변화를 빼고 페이드만 남긴다(11절 분기)
  const scale = reduced ? 1 : enter ? 1 : 1.35;

  return (
    <div
      style={{
        position: 'absolute',
        left: shot.x,
        top: shot.y,
        opacity: leave ? 0 : enter ? 1 : 0,
        transform: `scale(${leave ? 1.12 : scale})`,
        transformOrigin: '0 0',
        transition: `opacity ${ENTER_MS}ms ${motion.easeOut}, transform ${ENTER_MS}ms ${motion.easeOut}`,
      }}
    >
      <div style={{ position: 'absolute', left: -MARK_R, top: -MARK_R }}>
        <svg width={MARK_R * 2} height={MARK_R * 2}>
          <g transform={`translate(${MARK_R} ${MARK_R})`}>
            <polygon points={octagon(MARK_R - 3)} fill="none" stroke={colors.steel.mid} strokeWidth="1.5" />
            <circle r={MARK_R - 16} fill="none" stroke={colors.steel.shadow} strokeWidth="1" />
            <circle r={MARK_R - 28} fill="none" stroke={colors.red.light} strokeWidth="1.5" opacity="0.9" />
            {/* 코너 꺾쇠. 프레임과 같은 액센트 문법 */}
            {[0, 90, 180, 270].map((deg) => (
              <path
                key={deg}
                d={`M ${MARK_R - 10} -7 L ${MARK_R - 3} 0 L ${MARK_R - 10} 7`}
                transform={`rotate(${deg})`}
                fill="none"
                stroke={colors.red.light}
                strokeWidth="2"
              />
            ))}
          </g>
        </svg>
      </div>
      <Label x={MARK_R + 10} y={-24} tone={colors.red.light} text={`+${shot.points}`} big />
      <Label x={MARK_R + 10} y={2} tone={colors.text.secondary} text={shot.part} />
    </div>
  );
}

/**
 * 데미지 인디케이터(D5). 내가 맞았을 때.
 * **파란 연출을 쓰지 않는다.** 팔각 프레임 가장자리에서 맞은 방향 변이 red.light로 점등한다.
 * 경고의 레드이므로 색 규칙에 맞는다.
 */
function DamageEdge({ shot, w, h, reduced }) {
  const phase = useLifecycle(HOLD_MS - ENTER_MS);
  const on = phase === 'hold';

  const pts = octagonPoints(w, h);
  // 화면 중앙에서 피격 지점으로 향하는 방향과 가장 잘 맞는 변을 고른다
  const cx = w / 2;
  const cy = h / 2;
  const vx = shot.x - cx;
  const vy = shot.y - cy;
  const len = Math.hypot(vx, vy) || 1;
  let best = 0;
  let bestDot = -Infinity;
  for (let i = 0; i < 8; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % 8];
    const mx = (a[0] + b[0]) / 2 - cx;
    const my = (a[1] + b[1]) / 2 - cy;
    const m = Math.hypot(mx, my) || 1;
    const dot = (vx / len) * (mx / m) + (vy / len) * (my / m);
    if (dot > bestDot) {
      bestDot = dot;
      best = i;
    }
  }
  const a = pts[best];
  const b = pts[(best + 1) % 8];
  const cut = cutSize(w);

  return (
    <>
      <svg
        width={w}
        height={h}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: on ? 1 : 0,
          transition: `opacity ${reduced ? ENTER_MS : 90}ms ${motion.easeOut}`,
        }}
      >
        <line
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          stroke={colors.red.light}
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (a[0] + b[0]) / 2,
          top: (a[1] + b[1]) / 2,
          transform: `translate(${a[0] < w / 2 ? cut : -cut - 60}px, -8px)`,
          opacity: on ? 1 : 0,
          transition: `opacity ${ENTER_MS}ms ${motion.easeOut}`,
        }}
      >
        <Label x={0} y={0} tone={colors.red.light} text={`피격 ${shot.part}`} />
      </div>
    </>
  );
}

function Label({ x, y, tone, text, big = false }) {
  return (
    <span
      style={{
        position: 'absolute',
        left: x,
        top: y,
        whiteSpace: 'nowrap',
        fontFamily: typography.family,
        fontSize: big ? typography.hud.size : typography.caption.size,
        fontWeight: typography.hud.weight,
        letterSpacing: typography.hud.tracking,
        lineHeight: 1,
        color: tone,
      }}
    >
      {text}
    </span>
  );
}

export default function FuiLayer({ shot, reduced = false }) {
  const { w, h } = useViewport();
  if (!shot) return null;

  const scored = shot.outcome === OUTCOME.HIT || shot.outcome === OUTCOME.RIPOSTE;
  const mine = shot.owner === OWNER.ME;
  // 데미지 표시는 프레임 가장자리에 서므로 피격 지점이 화면 밖이어도 그린다
  const needsPoint = !(scored && !mine);
  if (needsPoint && !shot.visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: zIndex.sticky, pointerEvents: 'none' }}
    >
      {shot.outcome === OUTCOME.PARRY ? <RiposteRing key={shot.id} shot={shot} reduced={reduced} /> : null}
      {scored && mine ? <HitMarker key={shot.id} shot={shot} reduced={reduced} /> : null}
      {scored && !mine ? <DamageEdge key={shot.id} shot={shot} w={w} h={h} reduced={reduced} /> : null}
    </div>
  );
}
