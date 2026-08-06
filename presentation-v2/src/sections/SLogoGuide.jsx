// 로고 가이드 (참조 `frames/ref/Slide 16_9 - 85.svg` 벤토 그리드). SVG를 렌더하지 않고 구조만 재현.
//   좌상단 아이브로우(헤드라인 문장 없음). 아래 벤토 4셀:
//     좌 큰 셀 조합형(네이비 그라디언트 #101925→#3C5E8B, 2행 span, 흰 조합형 로고)
//     우상 로고타입(실버 #FDFDFD→#C4C4C4, 잉크 워드마크)
//     우하좌 심볼(실버, 잉크 심볼) / 우하우 그리드 버전(실버, 그리드 오버레이 lgoo_line)
//   라벨은 영문만(좌상단). 상단 표기(팀/행사/제품명)는 넣지 않는다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, brandNavyStops, brandSilverStops } from '../tokens.js';
import { LOGO_GUIDE } from '../copy.js';
import { Eyebrow } from '../components/Bits.jsx';

// **위에서 아래로 그라데이션(참조 벤토).** 네이비/실버 견본이 내용이라 이 슬라이드에서만 보인다.
const NAVY_V = `linear-gradient(180deg, ${brandNavyStops[0]} 0%, ${brandNavyStops[1]} 100%)`;
const SILVER_V = `linear-gradient(180deg, ${brandSilverStops[0]} 0%, ${brandSilverStops[1]} 100%)`;

function GuideCard({ item }) {
  const onNavy = item.tone === 'navy';
  return (
    <div
      style={{
        gridArea: item.area,
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        background: onNavy ? NAVY_V : SILVER_V,
        boxShadow: onNavy ? 'none' : `inset 0 0 0 1px ${colors.line.faint}`,
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(16px, 1.8vw, 32px)',
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {/* 라벨: 영문만, 좌상단. 네이비 카드는 흰색, 실버 카드는 잉크. */}
      <div
        style={{
          flexShrink: 0,
          fontFamily: typography.family,
          fontSize: typography.body.size,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: onNavy ? colors.white : colors.text.primary,
        }}
      >
        {item.en}
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
      {/* 아이브로우만(헤드라인 문장 없음). 좌상단 전역 그리드. */}
      <div ref={headRef} style={{ flexShrink: 0 }}>
        <Eyebrow en={LOGO_GUIDE.label.en} ko={LOGO_GUIDE.label.ko} />
      </div>

      {/* 벤토 4셀: 조합형(좌, 2행 span) / 로고타입(우상, 2열) / 심볼(우하좌) / 그리드(우하우). */}
      <div
        ref={gridRef}
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          marginTop: 'clamp(16px, 3vh, 34px)',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gridTemplateAreas: '"comb type type" "comb symbol grid"',
          gap: 'clamp(10px, 1.6vw, 32px)',
        }}
      >
        {LOGO_GUIDE.items.map((item) => (
          <GuideCard key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}
