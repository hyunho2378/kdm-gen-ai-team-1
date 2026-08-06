// 마지막 섹션. 데모(arena)로 보내는 CTA.
// 원본 레이아웃은 `Slide 16_9 - 9.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼았고
// 좌표는 SVG에서 직접 뽑았다.
//
// 원본 실측(1920 기준):
//   배경 black
//   라벨 IMMERSIVE FENCING XR  x 110  y 428  red
//   헤드라인 ENTER / THE / VORTEX.  x 110, 3줄, 아주 큰 얇은 획 대문자
//   레드 원 버튼  circle cx 1743  cy 881.3  r 68  fill #E60D15  → 90.78% / 81.60%, 지름 136
//   화살표  path M1704.07 874.3 H1781.93 L1758.11 899.948, stroke white 8px linecap round
//     → 우상향 화살표. lucide ArrowRight를 -45도 돌려 같은 방향으로 맞춘다
//
// 이동 대상 URL은 하드코딩하지 않는다. VITE_ARENA_URL이 없으면 이동 대신 콘솔에 남긴다.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { colors, typography, motion, grid, inkA } from '../tokens.js';
import { DEMO } from '../copy.js';
import { Eyebrow } from '../components/Bits.jsx';

const ARENA_URL = import.meta.env.VITE_ARENA_URL || '';

export default function S7Demo({ active }) {
  const labelRef = useRef(null);
  const lineRefs = useRef([]);
  const btnRef = useRef(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label = labelRef.current;
    const lines = lineRefs.current.filter(Boolean);
    const btn = btnRef.current;
    if (!label || !btn) return undefined;

    if (reduced) {
      gsap.set([label, ...lines, btn], { opacity: 1, y: 0 });
      return undefined;
    }

    // 헤드라인은 줄마다 y 페이드업. transform과 opacity만 만진다.
    gsap.set(label, { opacity: 0, y: 14 });
    gsap.set(lines, { opacity: 0, y: 44 });
    gsap.set(btn, { opacity: 0, y: 20 });
    const tl = gsap.timeline();
    tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: motion.gsapOut });
    tl.to(lines, { opacity: 1, y: 0, duration: 0.95, ease: motion.gsapOut, stagger: 0.12 }, 0.12);
    // 버튼은 지연 등장
    tl.to(btn, { opacity: 1, y: 0, duration: 0.7, ease: motion.gsapOut }, 0.72);

    return () => {
      tl.kill();
    };
  }, [active]);

  const openArena = () => {
    if (!ARENA_URL) {
      // 상수가 없으면 이동하지 않는다. 발표 중 빈 탭이 열리는 것을 막는다.
      console.warn('[demo] VITE_ARENA_URL 미설정. 이동을 건너뛴다.');
      return;
    }
    window.open(ARENA_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 아이브로우는 전역 그리드 좌상단 고정(전 슬라이드 같은 자리). */}
      <div
        ref={labelRef}
        style={{
          position: 'absolute',
          left: grid.marginX,
          top: grid.marginTop,
          zIndex: 3,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <Eyebrow en={DEMO.label} />
      </div>

      {/* 대형 헤드라인. 원본 x 110 → grid 좌마진에 정렬. */}
      <div
        style={{
          position: 'absolute',
          left: grid.marginX,
          top: '36%',
          right: grid.marginX,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        <div>
          {DEMO.headline.map((line, i) => (
            <div
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              style={{
                // 제목 폰트 미정. displayFamily 한 키만 바꾸면 S1 워드마크와 함께 교체된다.
                fontFamily: typography.displayFamily,
                fontSize: 'clamp(2.6rem, 9.4vw, 8.6rem)',
                fontWeight: 300,
                letterSpacing: '-0.01em',
                lineHeight: 1.06,
                color: colors.text.primary,
                opacity: 0,
                willChange: 'transform, opacity',
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* 우하단 레드 원형 버튼. 원본 cx 90.78% cy 81.60%, 지름 136/1920 = 7.08vw */}
      <button
        ref={btnRef}
        type="button"
        aria-label={DEMO.ctaLabel}
        onClick={openArena}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        style={{
          position: 'absolute',
          left: '90.78%',
          top: '81.6%',
          width: 'clamp(64px, 7.08vw, 168px)',
          height: 'clamp(64px, 7.08vw, 168px)',
          marginLeft: 'clamp(-84px, -3.54vw, -32px)',
          marginTop: 'clamp(-84px, -3.54vw, -32px)',
          zIndex: 5,
          borderRadius: '50%',
          border: 'none',
          padding: 0,
          // 라이트 반전: 레드 CTA를 잉크 원으로. 밝은 배경 위 잉크 원 + 밝은 화살표.
          background: colors.ink,
          color: colors.text.onFill,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          opacity: 0,
          // 그림자는 정적. 호버에서 한 단계 세진다.
          boxShadow: hover
            ? `0 10px 34px ${inkA(0.32)}`
            : `0 6px 22px ${inkA(0.2)}`,
          transition: `box-shadow 320ms ${motion.easeOut}`,
          willChange: 'transform, opacity',
        }}
      >
        {/* 원본 화살표는 우상향이다. lucide ArrowRight를 -45도 돌려 방향을 맞춘다.
            호버에서 화살표만 살짝 밀린다(transform만). */}
        <ArrowRight
          size="42%"
          strokeWidth={2.1}
          aria-hidden="true"
          style={{
            width: '42%',
            height: '42%',
            transform: `rotate(-45deg) translateX(${hover ? 3 : 0}px)`,
            transition: `transform 320ms ${motion.easeOut}`,
          }}
        />
      </button>
    </div>
  );
}
