// IA 2절 7번: 최종 산출물 3종. P4에서 유리 카드로 개편.
// 유리 = CSS backdrop-filter(blur+반투명) + line.strong 보더 + glow.steel. drei/three 유리는 도입하지 않는다(R3F 배제 판정).
// 등장 = GSAP from(yPercent:100, stagger) + ScrollTrigger로 아래에서 순차 부상(GreenSock 공식 패턴, 무료).
// reduced-transparency에서 불투명 폴백(bg.raised), reduced-motion에서 y 이동 없이 페이드만.
// 카피(o.name, o.role, "캡처 예정")는 원문 그대로.

import { useEffect, useRef } from 'react';
import { colors, radius, spacing, typography, glow } from '../tokens.js';
import { gsap, ScrollTrigger } from '../lib/scroll.js';
import { isReduced } from '../lib/motionMode.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { OUTPUTS } from '../content/sections.js';

export default function OutputsSection() {
  const gridRef = useRef(null);
  const reducedTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)');

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    const cards = Array.from(grid.children);
    const reduced = isReduced();
    // 아래에서 순차 부상. reduced-motion에서는 y 이동을 버리고 짧은 페이드만(전정기관 자극 회피).
    gsap.set(cards, reduced ? { opacity: 0 } : { opacity: 0, yPercent: 100 });
    const trigger = ScrollTrigger.create({
      trigger: grid,
      start: 'top 82%',
      once: true, // 재진입 재실행 금지
      onEnter: () =>
        gsap.to(
          cards,
          reduced
            ? { opacity: 1, duration: 0.3, ease: 'none' }
            : { opacity: 1, yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.18 }
        ),
    });
    return () => trigger.kill();
  }, []);

  // reduced-transparency면 불투명. 아니면 얇은 유리막(어두운 무대 위 옅은 반투명 + blur).
  const glassBg = reducedTransparency ? colors.bg.raised : 'rgba(242, 246, 255, 0.05)';
  const glassBlur = reducedTransparency ? 'none' : 'blur(16px) saturate(140%)';

  return (
    <div
      ref={gridRef}
      style={{
        marginTop: spacing.unit * 5,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: spacing.gutter,
      }}
    >
      {OUTPUTS.map((o) => (
        <article
          key={o.key}
          style={{
            background: glassBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${colors.line.strong}`,
            borderRadius: radius.lg,
            boxShadow: glow.steel,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.unit * 2,
          }}
        >
          {/* 캡처 슬롯. 실제 화면 이미지가 오면 이 자리를 교체한다 */}
          <div
            aria-hidden="true"
            style={{
              aspectRatio: '16 / 10',
              borderRadius: radius.md,
              background: colors.bg.deep,
              border: `1px solid ${colors.line.default}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: typography.family,
              fontSize: typography.caption.size,
              letterSpacing: typography.hud.tracking,
              color: colors.text.dim,
            }}
          >
            캡처 예정
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.heading.size,
              fontWeight: typography.heading.weight,
              letterSpacing: typography.heading.tracking,
              lineHeight: typography.heading.leading,
              color: colors.text.primary,
              wordBreak: 'keep-all',
            }}
          >
            {o.name}
          </h3>
          <p
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.body.size,
              lineHeight: typography.body.leading,
              color: colors.text.secondary,
              wordBreak: 'keep-all',
            }}
          >
            {o.role}
          </p>
        </article>
      ))}
    </div>
  );
}
