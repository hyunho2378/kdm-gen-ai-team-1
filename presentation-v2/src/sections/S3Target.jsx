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
import { colors, typography, motion, grid, inkA } from '../tokens.js';
import { TARGET, TARGET_ITEMS } from '../copy.js';
import { SlideHeader, GlassRim } from '../components/Bits.jsx';

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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 상단: 공용 2단 헤더(아이브로우 좌 | 헤드라인 우). 전역 그리드 좌상단에 절대배치. */}
      <div
        ref={headRef}
        style={{
          position: 'absolute',
          left: grid.marginX,
          top: grid.marginTop,
          right: grid.marginX,
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <SlideHeader
          eyebrow={{ en: TARGET.label.en, ko: TARGET.label.ko }}
          headline={<span style={{ fontWeight: 800 }}>{TARGET.headline}</span>}
        />
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
              position: 'relative',
              flex: '0 1 clamp(140px, 24.1vw, 620px)',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              // **채움 없음.** 배경 bg가 그대로 비친다. backdrop-filter도 쓰지 않는다
              // (뒤가 단색이라 효과가 없고 비용만 든다).
              background: 'transparent',
              // 아주 약한 내부 음영 한 겹만(라이트 반전: 흰 글로우 → 잉크).
              boxShadow: `inset 0 0 60px ${inkA(0.03)}`,
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
            {/* 유리 림. 1.2px 링만 남기고 안쪽은 뚫려 있다. */}
            <GlassRim />

            <span
              style={{
                fontFamily: typography.family,
                // 원 안 번호. 헤드라인 크기 + 볼드 + 네이비 프라이머리.
                fontSize: typography.headline.size,
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: 1,
                color: colors.navy,
              }}
            >
              {it.no}
            </span>
            <div>
              {it.desc.map((segs, li) => (
                <div
                  key={li}
                  style={{
                    fontFamily: typography.family,
                    // 본문보다 4pt 키운다(1440에서 15→19px).
                    fontSize: 'clamp(0.97rem, 1.32vw, 1.41rem)',
                    letterSpacing: typography.body.tracking,
                    lineHeight: typography.body.leading,
                    color: colors.text.primary,
                  }}
                >
                  {/* 강조 조각만 굵게. 기존 타이포에서 한 단계씩 볼드 올림(400→500, 700→800). */}
                  {segs.map((sg, si) => (
                    <span key={si} style={{ fontWeight: sg.b ? 800 : 500 }}>
                      {sg.t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
