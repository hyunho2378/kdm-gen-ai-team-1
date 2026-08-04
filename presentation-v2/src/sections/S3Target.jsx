// 대상 TARGET. 원본 레이아웃은 `Slide 16_9 - 5.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼았다.
//
// 원본 실측(1920 기준, SVG에서 직접 뽑은 값):
//   라벨  x 102.4  y 229.9  size 24  weight 600  (원본 fill #B3122C. 지금은 tokens.red)
//   헤드라인 x 102.4  y 308.3  size 38  weight 600
//   **카드가 아니라 큰 원 3개다.** cx 440.5 / 978.0 / 1487.0, cy 655.8, r 231.3
//   원 채움 white 0.07, 테두리는 그라디언트 스트로크
//   번호 size 35 opacity 0.65  y 582 / 서술 2줄 size 30 weight 600  y 673.3, 728.3
// 비율만 가져오고 값은 뷰포트에 따라 늘어나게 clamp로 재구성했다(320~3840 대응).

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { TARGET, TARGET_ITEMS } from '../copy.js';
import { SectionLabel } from '../components/Bits.jsx';

export default function S3Target({ active }) {
  const headRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    const items = itemsRef.current.filter(Boolean);
    if (!head) return undefined;

    if (reduced) {
      gsap.set([head, ...items], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(head, { opacity: 0, y: 20 });
    gsap.set(items, { opacity: 0, y: 34 });
    const tl = gsap.timeline();
    tl.to(head, { opacity: 1, y: 0, duration: 0.8, ease: motion.gsapOut });
    tl.to(items, { opacity: 1, y: 0, duration: 0.9, ease: motion.gsapOut, stagger: 0.14 }, 0.18);

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 저알파 레드 radial 하나. 원 3개를 아래에서 받친다. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '62%',
          width: 'min(150vh, 130vw)',
          height: 'min(150vh, 130vw)',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 50% 50%, rgba(230,13,21,0.11) 0%, rgba(230,13,21,0.035) 38%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 상단 좌측: 라벨과 헤드라인. 원본 x 102.4 → 5.33vw */}
      <div
        ref={headRef}
        style={{
          position: 'absolute',
          left: 'clamp(20px, 5.33vw, 130px)',
          top: 'clamp(48px, 19vh, 210px)',
          right: 'clamp(20px, 5.33vw, 130px)',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <SectionLabel label={TARGET.label} />
        <h2
          style={{
            margin: 'clamp(12px, 1.9vh, 24px) 0 0',
            fontFamily: typography.family,
            fontSize: 'clamp(1.25rem, 2.6vw, 2.8rem)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.3,
            color: colors.text.primary,
          }}
        >
          {TARGET.headline}
        </h2>
      </div>

      {/* 원 3개. 원본 지름 462.7 / 1920 = 24.1vw, 중심 y 655.8 / 1080 = 60.7vh */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '60.7%',
          transform: 'translateY(-50%)',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'clamp(12px, 3.5vw, 76px)',
          padding: '0 clamp(16px, 4vw, 100px)',
          pointerEvents: 'none',
        }}
      >
        {TARGET_ITEMS.map((it, i) => (
          <div
            key={it.key}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            style={{
              flex: '0 1 clamp(140px, 24.1vw, 620px)',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              background: colors.surface.glass,
              // 원본은 그라디언트 스트로크다. 위가 밝고 아래로 사라진다.
              border: `1px solid transparent`,
              backgroundImage: `linear-gradient(${colors.surface.glass}, ${colors.surface.glass}), linear-gradient(180deg, ${colors.line.strong} 0%, ${colors.line.faint} 62%, transparent 100%)`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(8px, 1.6vh, 22px)',
              textAlign: 'center',
              padding: '0 clamp(10px, 2vw, 40px)',
              willChange: 'transform, opacity',
            }}
          >
            <span
              style={{
                fontFamily: typography.family,
                fontSize: 'clamp(1rem, 1.82vw, 2rem)',
                fontWeight: 600,
                letterSpacing: '0.02em',
                lineHeight: 1,
                color: colors.text.primary,
                opacity: 0.65,
              }}
            >
              {it.no}
            </span>
            <div>
              {it.desc.map((line) => (
                <div
                  key={line}
                  style={{
                    fontFamily: typography.family,
                    fontSize: 'clamp(0.68rem, 1.56vw, 1.7rem)',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.55,
                    color: colors.text.primary,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
