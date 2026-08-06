// 로고 가이드 (참조 `frames/ref/Slide 16_9 - 85.svg`). SVG를 렌더하지 않고 구조만 재현.
//   좌상단 아이브로우 + 헤드라인(공용 2단 헤더). 아래 3분할:
//   조합형(좌, 큰 다크 네이비 카드 + 흰 로고 lockup) / 로고타입(우상, 라이트 카드 + 잉크 워드마크)
//   / 심볼(우하, 라이트 카드 + 잉크 심볼). 흰 로고는 다크 카드에만.
//   상단 표기(팀/행사/제품명)는 넣지 않는다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, inkA, whiteA, scrimA } from '../tokens.js';
import { LOGO_GUIDE } from '../copy.js';
import { SlideHeader } from '../components/Bits.jsx';

// 다크 조합형 카드 배경. #111A27 네이비에 아주 옅은 그라디언트로 깊이만.
const DARK_CARD = `linear-gradient(155deg, ${scrimA(0.92)} 0%, ${scrimA(1)} 100%)`;

function GuideCard({ item, area }) {
  const onDark = item.dark;
  return (
    <div
      style={{
        gridArea: area,
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        background: onDark ? DARK_CARD : colors.raised,
        boxShadow: onDark ? 'none' : `inset 0 0 0 1px ${colors.line.faint}`,
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(16px, 1.8vw, 32px)',
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {/* 라벨: 영문 + 국문. 다크 카드는 흰색, 라이트 카드는 잉크. */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            fontFamily: typography.family,
            fontSize: typography.body.size,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: onDark ? colors.white : colors.text.primary,
          }}
        >
          {item.en}
        </div>
        <div
          style={{
            fontFamily: typography.family,
            fontSize: typography.caption.size,
            fontWeight: 400,
            color: onDark ? whiteA(0.66) : colors.text.dim,
          }}
        >
          {item.ko}
        </div>
      </div>

      {/* 로고 자리. 카드 안 남은 공간 중앙에 contain으로. */}
      <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(8px, 1.5vh, 24px)' }}>
        <img
          src={item.asset}
          alt={item.en}
          draggable="false"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none' }}
        />
      </div>
    </div>
  );
}

export default function SLogoGuide({ active }) {
  const headRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    const cards = gridRef.current ? [...gridRef.current.children] : [];
    if (!head) return undefined;
    if (reduced) {
      gsap.set([head, ...cards], { opacity: 1, y: 0 });
      return undefined;
    }
    gsap.set(head, { opacity: 0, y: 18 });
    gsap.set(cards, { opacity: 0, y: 34 });
    const tl = gsap.timeline({ delay: 0.35 });
    tl.to(head, { opacity: 1, y: 0, duration: 0.8, ease: motion.gsapOut });
    tl.to(cards, { opacity: 1, y: 0, duration: 0.9, ease: motion.gsapOut, stagger: 0.12 }, 0.16);
    return () => tl.kill();
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
        padding: `${grid.marginTop} ${grid.marginX} ${grid.marginBottom}`,
      }}
    >
      <div ref={headRef} style={{ flexShrink: 0 }}>
        <SlideHeader eyebrow={{ en: LOGO_GUIDE.label.en, ko: LOGO_GUIDE.label.ko }} headline={LOGO_GUIDE.headline} />
      </div>

      {/* 3분할: 조합형 좌(두 행 span) / 로고타입 우상 / 심볼 우하. */}
      <div
        ref={gridRef}
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          marginTop: 'clamp(16px, 3vh, 34px)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gridTemplateAreas: '"comb type" "comb symbol"',
          gap: 'clamp(10px, 1.6vw, 32px)',
        }}
      >
        <GuideCard item={LOGO_GUIDE.items[0]} area="comb" />
        <GuideCard item={LOGO_GUIDE.items[1]} area="type" />
        <GuideCard item={LOGO_GUIDE.items[2]} area="symbol" />
      </div>
    </div>
  );
}
