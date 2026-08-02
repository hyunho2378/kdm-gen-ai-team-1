// PATTERNS 9절: 로딩은 검끝 곡선 모티프의 선 그리기 하나로 통일한다. 스피너 금지.
// ScrollTrail과 같은 선 문법을 쓰되 더 짧은 path다.
//
// 자원이 늦어도 화면을 인질로 잡지 않는다. 최대 2.5초에서 무조건 걷힌다.
// 라이브러리를 쓰지 않는다. 자체 구현이다(판정표: 프리로더는 자체 구현).

import { useEffect, useRef, useState } from 'react';
import { colors, motion, typography, zIndex } from '../tokens.js';
import { isReduced, REDUCED_FADE_MS } from '../lib/motionMode.js';
import { markBooted } from '../lib/boot.js';

const MAX_WAIT_MS = 2500;
const DRAW_MS = 900;
const EXIT_MS = motion.duration.page; // 180ms. UI 애니메이션 300ms 미만 규칙 안
const PATH_LENGTH = 1000;

// 검끝 곡선 한 줄. 준비 곡선 뒤 짧고 급한 찌르기라는 같은 문법이다.
const PATH_D = 'M 8 46 C 52 14, 96 68, 148 32 L 184 20';

export default function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const pathRef = useRef(null);

  // 선 그리기. reduced motion에서는 그리지 않고 완성 상태로 둔다.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    if (isReduced()) {
      path.style.strokeDashoffset = '0';
      return;
    }
    path.style.transition = `stroke-dashoffset ${DRAW_MS}ms ${motion.easeOut}`;
    // 다음 프레임에 목표값을 줘야 transition이 실제로 돈다
    const raf = requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // 폰트가 준비되면 걷는다. 늦어도 상한에서 걷는다.
  useEffect(() => {
    let cancelled = false;
    const leave = () => {
      if (!cancelled) setLeaving(true);
    };

    const cap = setTimeout(leave, MAX_WAIT_MS);
    const fonts = document.fonts?.ready ?? Promise.resolve();
    // 선 그리기가 한 번은 보이도록 최소 시간을 준다. reduced에서는 기다리지 않는다.
    const floor = isReduced() ? 0 : DRAW_MS * 0.6;
    fonts.then(() => setTimeout(leave, floor)).catch(leave);

    return () => {
      cancelled = true;
      clearTimeout(cap);
    };
  }, []);

  // 이탈이 끝나야 cover 등장이 시작된다.
  useEffect(() => {
    if (!leaving) return undefined;
    const ms = isReduced() ? REDUCED_FADE_MS : EXIT_MS;
    const t = setTimeout(() => {
      setGone(true);
      markBooted();
    }, ms);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="불러오는 중"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.toast,
        background: colors.bg.deep,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        opacity: leaving ? 0 : 1,
        transition: `opacity ${isReduced() ? REDUCED_FADE_MS : EXIT_MS}ms ${motion.easeOut}`,
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      <svg width="192" height="80" viewBox="0 0 192 80" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="preloader-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={colors.steel.mid} stopOpacity="0.5" />
            <stop offset="70%" stopColor={colors.steel.hi} stopOpacity="0.95" />
            <stop offset="100%" stopColor={colors.red.light} />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d={PATH_D}
          fill="none"
          stroke="url(#preloader-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={PATH_LENGTH}
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={PATH_LENGTH}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          letterSpacing: typography.hud.tracking,
          color: colors.text.dim,
        }}
      >
        간합
      </span>
    </div>
  );
}
