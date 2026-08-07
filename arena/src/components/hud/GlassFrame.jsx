// 책임: XR 글라스 1인칭 뷰포트 프레임. 각진 팔각형 하나로 화면 자체를 장비로 읽히게 한다.
//
// 색은 우리 것이다. 블랙 + 크롬 + red.light. 파란 네온을 쓰지 않는다.
// CSS filter와 blur를 쓰지 않는다(합성 비용). 겹은 SVG 세 장으로만 만든다.
// 상시 노출 요소라 애니메이션은 최초 1회 등장뿐이다(MOTION 0절).

import { useEffect, useState } from 'react';
import { colors, motion, zIndex } from '../../tokens.js';
import { cutSize, octagonPoints, useViewport } from './frame.js';

const STROKE = 1.75;
const ACCENT_OFFSET = 11;   // 컷 변에서 안쪽으로 밀어 넣는 거리
const ACCENT_SPAN = 0.30;   // 컷 변 길이 대비 액센트 절반 길이
const ACCENT_TICK = 7;

function path(points) {
  return `M${points.map((p) => `${p[0]} ${p[1]}`).join(' L')} Z`;
}

/**
 * 컷 변 하나의 액센트. 변과 나란한 짧은 선분에 양끝 꺾쇠를 붙인다.
 * 법선은 변에 수직인 두 후보 중 중심을 향하는 쪽을 고른다. 종횡비가 달라도 안쪽이 뒤집히지 않는다.
 */
function accentPath(a, b, cx, cy) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;

  let nx = -uy;
  let ny = ux;
  if (nx * (cx - mx) + ny * (cy - my) < 0) {
    nx = -nx;
    ny = -ny;
  }

  const half = len * ACCENT_SPAN;
  const x1 = mx - ux * half + nx * ACCENT_OFFSET;
  const y1 = my - uy * half + ny * ACCENT_OFFSET;
  const x2 = mx + ux * half + nx * ACCENT_OFFSET;
  const y2 = my + uy * half + ny * ACCENT_OFFSET;
  const tx = -nx * ACCENT_TICK;
  const ty = -ny * ACCENT_TICK;

  return `M${x1} ${y1} L${x2} ${y2} M${x1} ${y1} l${tx} ${ty} M${x2} ${y2} l${tx} ${ty}`;
}

export default function GlassFrame({ reduced = false }) {
  const { w, h } = useViewport();
  const [shown, setShown] = useState(reduced);

  useEffect(() => {
    if (reduced) return undefined;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  if (w <= 0 || h <= 0) return null;

  const pts = octagonPoints(w, h);
  const oct = path(pts);
  // evenodd로 사각형에서 팔각형을 뺀다. 남는 네 코너 삼각형만 어두워진다
  const outside = `M0 0 H${w} V${h} H0 Z ${oct}`;
  const cx = w / 2;
  const cy = h / 2;
  // 대각 컷 변 넷. 팔각형 점 배열에서 홀수 간선이다
  const cuts = [
    [pts[7], pts[0]],
    [pts[1], pts[2]],
    [pts[3], pts[4]],
    [pts[5], pts[6]],
  ];
  const c = cutSize(w);

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.sticky,
        pointerEvents: 'none',
        opacity: shown ? 1 : 0,
        transition: reduced ? 'none' : `opacity ${motion.duration.modal}ms ${motion.easeOut}`,
      }}
    >
      <defs>
        <linearGradient id="ganhap-frame-chrome" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={h}>
          <stop offset="0" stopColor={colors.steel.hi} />
          <stop offset="0.45" stopColor={colors.steel.mid} />
          <stop offset="0.78" stopColor={colors.steel.shadow} />
          <stop offset="1" stopColor={colors.steel.mid} />
        </linearGradient>
      </defs>

      {/* 바깥 딤. 코너가 잘려 나간 것으로 읽히게 하는 최소한의 대비 */}
      <path d={outside} fillRule="evenodd" fill={colors.bg.deep} fillOpacity="0.7" />

      {/* 크롬 스트로크 */}
      <path
        d={oct}
        fill="none"
        stroke="url(#ganhap-frame-chrome)"
        strokeWidth={STROKE}
        vectorEffect="non-scaling-stroke"
      />

      {/* 코너 액센트. 장식은 컷에만 두고 변 중앙은 비운다 */}
      <g stroke={colors.accent.base} strokeWidth="2" strokeLinecap="square" fill="none" opacity="0.9">
        {cuts.map(([a, b], i) => (
          <path key={i} d={accentPath(a, b, cx, cy)} vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      {/* 컷 크기를 읽는 요소가 하나 더 있다는 표시. 값은 frame.js가 소유한다 */}
      <desc>{`octagon cut ${c}px`}</desc>
    </svg>
  );
}
