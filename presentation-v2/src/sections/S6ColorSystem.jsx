// 컬러 시스템. 참조 `frames/ref/Slide 16_9 - 83.svg` 레이아웃(SVG 렌더 아님). 상단 표기 없음.
//
// **레드 견본을 걷고 새 색 체계(브랜딩 네이비 / 브랜딩 실버)를 소개한다.** 각 그라디언트 견본 + 라벨 + HEX.
// **이 페이지는 토큰의 진열장이다.** 화면 색값을 전부 tokens에서 읽는다(brand*Gradient / brand*Stops).
// 색 견본이 내용이라 여기서만 네이비/실버가 보인다(발표 전역 라이트 배경 규칙과 별개).

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  colors,
  typography,
  motion,
  grid,
  whiteA,
  inkA,
  brandNavyGradient,
  brandNavyStops,
  brandSilverGradient,
  brandSilverStops,
} from '../tokens.js';
import { COLOR_SYSTEM } from '../copy.js';
import { Eyebrow } from '../components/Bits.jsx';

const CARD_RADIUS = 20;

// 한 견본 카드. 그라디언트 배경 + 라벨(상단) + HEX 스톱(하단).
// 다크(네이비)는 흰 글자, 라이트(실버)는 잉크 글자. 라이트 카드는 옅은 잉크 테두리로 경계.
function Swatch({ label, gradient, stops, dark, cardRef }) {
  const strong = dark ? colors.white : colors.text.primary;
  const dim = dark ? whiteA(0.6) : colors.text.dim;
  return (
    <div
      ref={cardRef}
      style={{
        borderRadius: CARD_RADIUS,
        background: gradient,
        boxShadow: dark ? 'none' : `inset 0 0 0 1px ${inkA(0.1)}`,
        padding: 'clamp(18px, 3vh, 36px) clamp(18px, 2.24vw, 44px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 0,
        willChange: 'transform, opacity',
      }}
    >
      <div style={{ fontFamily: typography.family, fontSize: typography.headline.size, fontWeight: 500, letterSpacing: '-0.01em', color: strong }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 'clamp(24px, 5vw, 90px)' }}>
        {stops.map((s) => (
          <div key={s}>
            <div style={{ fontFamily: typography.family, fontSize: typography.caption.size, color: dim, lineHeight: 1.8 }}>{COLOR_SYSTEM.hex}</div>
            <div style={{ fontFamily: typography.family, fontSize: typography.caption.size, color: strong, lineHeight: 1.8 }}>{s.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function S6ColorSystem({ active }) {
  const headRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    const cards = cardsRef.current.filter(Boolean);
    if (!head) return undefined;

    if (reduced) {
      gsap.set([head, ...cards], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(head, { opacity: 0, y: 16 });
    gsap.set(cards, { opacity: 0, y: 32 });
    const tl = gsap.timeline();
    tl.to(head, { opacity: 1, y: 0, duration: 0.75, ease: motion.gsapOut });
    tl.to(cards, { opacity: 1, y: 0, duration: 0.9, ease: motion.gsapOut, stagger: 0.14 }, 0.18);

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        // 전역 그리드 원천. 이 슬라이드의 실측 마진이 grid 토큰이 됐다(다른 슬라이드가 이 값을 공유한다).
        padding: `${grid.marginTop} ${grid.marginX} ${grid.marginBottom}`,
      }}
    >
      {/* 상단: 좌측 아이브로우 + 우측 헤드라인과 서브 */}
      <div ref={headRef} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(16px, 4vw, 96px)', flexShrink: 0 }}>
        <div style={{ flex: '0 0 auto' }}>
          {/* 네이비는 이 슬라이드에서만 허용된 액센트다(전역 금지). 아이브로우 영문 라벨에 얹는다. */}
          <Eyebrow en={COLOR_SYSTEM.label.en} ko={COLOR_SYSTEM.label.ko} tone={colors.navy} />
        </div>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.headline.size,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.5,
              color: colors.text.primary,
            }}
          >
            {COLOR_SYSTEM.headline}
          </h2>
          <p
            style={{
              margin: 'clamp(6px, 1vh, 12px) 0 0',
              fontFamily: typography.family,
              fontSize: typography.body.size,
              fontWeight: 400,
              lineHeight: 1.65,
              color: colors.text.secondary,
            }}
          >
            {COLOR_SYSTEM.sub}
          </p>
        </div>
      </div>

      {/* 견본 2종. 좌 네이비(넓게) / 우 실버. 참조 Slide 83 비율. */}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          marginTop: 'clamp(14px, 3.2vh, 34px)',
          display: 'grid',
          gridTemplateColumns: '1.25fr 0.85fr',
          gap: 'clamp(10px, 2.08vw, 50px)',
        }}
      >
        <Swatch
          label={COLOR_SYSTEM.brandingNavy}
          gradient={brandNavyGradient}
          stops={brandNavyStops}
          dark
          cardRef={(el) => { cardsRef.current[0] = el; }}
        />
        <Swatch
          label={COLOR_SYSTEM.brandingSilver}
          gradient={brandSilverGradient}
          stops={brandSilverStops}
          cardRef={(el) => { cardsRef.current[1] = el; }}
        />
      </div>
    </div>
  );
}
