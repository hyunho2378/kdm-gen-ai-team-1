// 로고 모티프 (참조 `frames/ref/Slide 16_9 - 84.svg`). SVG를 렌더하지 않고 구조/문구만 재현.
//   좌상단 아이브로우 + 헤드라인 + 본문(공용 2단 헤더). 아래 큰 시각 영역:
//   좌 다크 네이비 패널에 흰 로고 심볼을 크게(모티프 주인공), 우 라이트 패널에 라인 구성(lgoo_line).
//   상단 표기(팀/행사/제품명)는 넣지 않는다. 흰 로고는 다크 패널에만.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, motion, grid, scrimA } from '../tokens.js';
import { LOGO_MOTIF } from '../copy.js';
import { SlideHeader } from '../components/Bits.jsx';

const DARK_PANEL = `linear-gradient(155deg, ${scrimA(0.92)} 0%, ${scrimA(1)} 100%)`;

export default function SLogoMotif({ active }) {
  const headRef = useRef(null);
  const panelsRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    const panels = panelsRef.current ? [...panelsRef.current.children] : [];
    if (!head) return undefined;
    if (reduced) {
      gsap.set([head, ...panels], { opacity: 1, y: 0 });
      return undefined;
    }
    gsap.set(head, { opacity: 0, y: 18 });
    gsap.set(panels, { opacity: 0, y: 36 });
    const tl = gsap.timeline({ delay: 0.35 });
    tl.to(head, { opacity: 1, y: 0, duration: 0.8, ease: motion.gsapOut });
    tl.to(panels, { opacity: 1, y: 0, duration: 0.95, ease: motion.gsapOut, stagger: 0.14 }, 0.18);
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
        <SlideHeader
          eyebrow={{ en: LOGO_MOTIF.label.en, ko: LOGO_MOTIF.label.ko }}
          headline={LOGO_MOTIF.headline}
          sub={LOGO_MOTIF.body}
        />
      </div>

      {/* 시각 영역. 좌 다크 패널(흰 심볼, 모티프 주인공) + 우 라이트 패널(라인 구성). */}
      <div
        ref={panelsRef}
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          marginTop: 'clamp(16px, 3vh, 34px)',
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: 'clamp(10px, 1.6vw, 32px)',
        }}
      >
        {/* 좌: 다크 패널 + 흰 로고 심볼 크게 */}
        <div
          style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            background: DARK_PANEL,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(24px, 4vw, 80px)',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <img
            src="/images/assets/logo.svg"
            alt={LOGO_MOTIF.label.en}
            draggable="false"
            style={{ width: 'min(78%, 520px)', maxHeight: '72%', objectFit: 'contain', userSelect: 'none' }}
          />
        </div>

        {/* 우: 라이트 패널 + 라인 구성(모티프 기하) */}
        <div
          style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            background: colors.raised,
            boxShadow: `inset 0 0 0 1px ${colors.line.faint}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(20px, 3vw, 56px)',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <img
            src="/images/assets/lgoo_line.svg"
            alt="로고 구성"
            draggable="false"
            style={{ maxWidth: '86%', maxHeight: '80%', objectFit: 'contain', userSelect: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
