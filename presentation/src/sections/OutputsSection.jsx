// IA 2절 7번: 산출물 3종 유리 카드(P4) → 클릭 시 상세 오버레이로 모핑(P6, GSAP Flip 무료).
// 카드가 상세로 확대/역모핑한다. 슬라이드업 아님. ESC와 바깥 클릭으로 닫고 포커스를 가둔다.
// 스크롤 잠금은 걸지 않는다(전환 중 잠금 최소화, 상세는 fixed라 배경이 흘러도 제자리).
// 유리: backdrop-filter(blur+반투명)+line.strong+glow.steel. reduced-transparency 불투명 폴백.
// 등장: from(yPercent:100, stagger)+ScrollTrigger. reduced-motion에서 y 없이 페이드, Flip 없이 즉시 전환.
// 카피(o.name, o.role, "캡처 예정")는 원문 그대로.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { colors, radius, spacing, typography, glow, zIndex } from '../tokens.js';
import { gsap, ScrollTrigger } from '../lib/scroll.js';
import { isReduced } from '../lib/motionMode.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { OUTPUTS } from '../content/sections.js';

export default function OutputsSection() {
  const gridRef = useRef(null);
  const flipStateRef = useRef(null);
  const flipRef = useRef(null); // 로드된 Flip 플러그인
  const closeRef = useRef(null);
  const [open, setOpen] = useState(null);
  // 유리막을 불투명으로 돌리는 조건: 투명도 감소 요청 또는 고대비 요청(둘 다 반투명이 해롭다).
  // 훅은 무조건 각각 호출하고 값만 OR한다(조건부 호출 금지).
  const prefersReducedTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: more)');
  const reducedTransparency = prefersReducedTransparency || prefersHighContrast;

  // Flip은 클릭 시점에 동기적으로 필요하므로 마운트에서 미리 로드해 둔다(무료 플러그인).
  useEffect(() => {
    let live = true;
    import('gsap/Flip').then(({ Flip }) => {
      if (!live) return;
      gsap.registerPlugin(Flip);
      flipRef.current = Flip;
    });
    return () => { live = false; };
  }, []);

  // 초기 부상(P4). 아래에서 순차, reduced에서는 페이드만.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    const cards = Array.from(grid.querySelectorAll('[data-card]'));
    const reduced = isReduced();
    gsap.set(cards, reduced ? { opacity: 0 } : { opacity: 0, yPercent: 100 });
    const trigger = ScrollTrigger.create({
      trigger: grid,
      start: 'top 82%',
      once: true,
      onEnter: () =>
        gsap.to(cards, reduced
          ? { opacity: 1, duration: 0.3, ease: 'none' }
          : { opacity: 1, yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.18 }),
    });
    return () => trigger.kill();
  }, []);

  const toggle = (key) => {
    const Flip = flipRef.current;
    const cards = gridRef.current?.querySelectorAll('[data-card]');
    if (Flip && cards) flipStateRef.current = Flip.getState(cards, { props: 'borderRadius' });
    setOpen((cur) => (cur === key ? null : key));
  };

  // 상세로/에서 모핑. 상태 변경 뒤 레이아웃이 확정된 시점에 Flip.from을 돌린다.
  useLayoutEffect(() => {
    const Flip = flipRef.current;
    const state = flipStateRef.current;
    flipStateRef.current = null;
    if (!Flip || !state || isReduced()) return; // reduced면 즉시 전환
    // absolute 옵션은 쓰지 않는다. 열린 카드는 이미 position:fixed(out of flow)라 형제 리플로우가 없고,
    // absolute를 켜면 Flip이 전환 후에도 position:absolute를 남겨 오버레이가 뷰포트가 아닌 문서 기준이 된다.
    Flip.from(state, { duration: 0.5, ease: 'power3.inOut' });
  }, [open]);

  // ESC 닫기 + 포커스 트랩. 스크롤 잠금은 걸지 않는다.
  useEffect(() => {
    if (!open) return undefined;
    const panel = gridRef.current?.querySelector('[data-card="' + open + '"]');
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(null); return; }
      if (e.key === 'Tab' && panel) {
        const f = panel.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const glassBg = reducedTransparency ? colors.bg.raised : 'rgba(242, 246, 255, 0.05)';
  const glassBlur = reducedTransparency ? 'none' : 'blur(16px) saturate(140%)';
  const detailBg = reducedTransparency ? colors.bg.raised : 'rgba(21, 21, 26, 0.72)';

  return (
    <>
      {/* 딤 스크림. 바깥 클릭으로 닫는다 */}
      {open ? (
        <div
          aria-hidden="true"
          onClick={() => toggle(open)}
          style={{ position: 'fixed', inset: 0, zIndex: zIndex.overlay, background: colors.bg.overlay, backdropFilter: reducedTransparency ? 'none' : 'blur(2px)' }}
        />
      ) : null}

      <div
        ref={gridRef}
        style={{
          marginTop: spacing.unit * 5,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.gutter,
        }}
      >
        {OUTPUTS.map((o) => {
          const isOpen = open === o.key;
          return (
            <article
              key={o.key}
              data-card={o.key}
              role={isOpen ? 'dialog' : 'button'}
              aria-modal={isOpen ? 'true' : undefined}
              aria-label={isOpen ? undefined : `${o.name} 상세 보기`}
              tabIndex={isOpen ? -1 : 0}
              onClick={() => { if (!isOpen) toggle(o.key); }}
              onKeyDown={(e) => { if (!isOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(o.key); } }}
              style={{
                background: isOpen ? detailBg : glassBg,
                backdropFilter: glassBlur,
                WebkitBackdropFilter: glassBlur,
                border: `1px solid ${colors.line.strong}`,
                borderRadius: radius.lg,
                boxShadow: glow.steel,
                padding: isOpen ? 32 : 24,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.unit * 2,
                cursor: isOpen ? 'default' : 'pointer',
                ...(isOpen
                  ? {
                      position: 'fixed',
                      inset: `clamp(16px, 6vh, 80px) clamp(16px, 6vw, 120px)`,
                      margin: 'auto',
                      maxWidth: 720,
                      maxHeight: '88vh',
                      overflow: 'auto',
                      zIndex: zIndex.modal,
                    }
                  : {}),
              }}
            >
              {isOpen ? (
                <button
                  ref={closeRef}
                  type="button"
                  className="ganhap-btn"
                  onClick={(e) => { e.stopPropagation(); toggle(o.key); }}
                  aria-label="상세 닫기"
                  style={{
                    alignSelf: 'flex-end',
                    background: 'none',
                    border: `1px solid ${colors.line.strong}`,
                    borderRadius: radius.pill,
                    color: colors.text.secondary,
                    fontFamily: typography.family,
                    fontSize: typography.caption.size,
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  닫기
                </button>
              ) : null}

              {/* 캡처 슬롯. 상세에서 커진다. 실제 화면 이미지가 오면 교체 */}
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
                  fontSize: isOpen ? typography.title.size : typography.heading.size,
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
          );
        })}
      </div>
    </>
  );
}
