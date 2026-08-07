// 로고 모티프 (참조 `frames/ref/Slide 16_9 - 84.svg`). SVG를 렌더하지 않고 구조/문구만 재현.
//   **moti.png 풀블리드 배경 + 상단 흰 밴드(텍스트 영역) + 사진 정중앙 흰 로고 심볼.**
//   흰 밴드: 아이브로우(좌) + 본문 두 줄(우). 밴드 아래 사진 영역 정중앙에 흰 심볼(logo.svg).
//   상단 표기(팀/행사/제품명)는 넣지 않는다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid } from '../tokens.js';
import { LOGO_MOTIF } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow } from '../components/Bits.jsx';

// 상단 흰 밴드 높이. 텍스트 영역. 아래는 사진.
const BAND_H = 'clamp(150px, 30vh, 300px)';

export default function SLogoMotif({ active }) {
  const bandRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const band = bandRef.current;
    const logo = logoRef.current;
    if (!band || !logo) return undefined;
    if (reduced) {
      gsap.set([band, logo], { opacity: 1, y: 0, scale: 1 });
      return undefined;
    }
    gsap.set(band, { opacity: 0, y: 18 });
    gsap.set(logo, { opacity: 0, scale: 0.9 });
    const tl = gsap.timeline({ delay: 0.35 });
    tl.to(band, { opacity: 1, y: 0, duration: 0.8, ease: motion.gsapOut });
    tl.to(logo, { opacity: 1, scale: 1, duration: 1.0, ease: motion.gsapOut }, 0.2);
    return () => tl.kill();
  }, [active]);

  // 본문 두 줄. 줄 배열이 곧 br. b:true 조각만 볼드(SUIT wght 축).
  const statement = LOGO_MOTIF.body.map((segs, li) => (
    <span key={li} style={{ display: 'block' }}>
      {segs.map((sg, si) => (
        <span key={si} style={{ fontWeight: sg.b ? 700 : 400 }}>{sg.t}</span>
      ))}
    </span>
  ));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 배경 사진: 밴드 아래 영역에 둔다. 상단 정렬이라 선수 머리가 위에 오고 아래가 잘린다. */}
      <div aria-hidden="true" style={{ position: 'absolute', top: BAND_H, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <AssetImage src={LOGO_MOTIF.bg} fit="cover" position="center top" />
      </div>

      {/* 상단 흰 밴드: 아이브로우 좌 + 본문 우(2단 헤더 정신). */}
      <div
        ref={bandRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: BAND_H,
          zIndex: 2,
          background: colors.bg,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'clamp(16px, 4vw, 96px)',
          padding: `${grid.marginTop} ${grid.marginX} 0`,
          willChange: 'transform, opacity',
        }}
      >
        <div style={{ flex: '0 0 auto' }}>
          <Eyebrow en={LOGO_MOTIF.label.en} ko={LOGO_MOTIF.label.ko} />
        </div>
        <div
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            fontFamily: typography.family,
            fontSize: typography.headline.size,
            letterSpacing: typography.headline.tracking,
            lineHeight: 1.6,
            color: colors.text.primary,
            wordBreak: 'keep-all',
          }}
        >
          {statement}
        </div>
      </div>

      {/* 흰 로고 심볼: 밴드 아래 사진 영역 정중앙. logo.svg는 흰 채움이라 다크 사진 위에 그대로 뜬다. */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: BAND_H,
          bottom: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px, 4vw, 80px)',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
      >
        <img
          src={LOGO_MOTIF.symbol}
          alt={LOGO_MOTIF.label.en}
          draggable="false"
          style={{ width: 'min(38%, 440px)', maxHeight: '58%', objectFit: 'contain', userSelect: 'none' }}
        />
      </div>
    </div>
  );
}
