// COMPONENTS.md: 우측 고정 진행 레일. 섹션 8개 점, 현재 섹션 red.light, 클릭 scrollIntoView, zIndex.sticky.
// 현재 섹션 추적은 IntersectionObserver다. 스크롤 핸들러에서 레이아웃을 읽지 않는다(강제 리플로우 금지).
// 키보드로 시작된 이동은 애니메이션하지 않는다(MOTION 0절). 그래서 Enter 이동은 즉시 점프한다.

import { useEffect, useRef, useState } from 'react';
import { colors, motion, radius, typography, zIndex, breakpoints } from '../tokens.js';
import { SECTIONS } from '../content/sections.js';
import { scrollToId } from '../lib/scroll.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';

// md 미만에서는 우측 세로 레일이 본문 제목 위를 덮는다(320과 390에서 실측).
// 크기를 줄여 우겨넣지 않고 구조를 바꾼다. 하단 가로 행이 되는 것이 정직한 해법이다.
const VERTICAL_FROM = `(min-width: ${breakpoints.md}px)`;

// 320px에 44px 타깃 8개를 한 줄로 넣으면 352px라 넘친다. 4개씩 두 줄로 접는다.
const NARROW_RAIL_WIDTH = 44 * 4;

/** 세로 레일이 차지하는 폭. Section이 이만큼 오른쪽을 비워 본문 겹침을 막는다. */
export const RAIL_RESERVE_PX = 76;

export default function ProgressRail() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const ratios = useRef(new Map());
  const vertical = useMediaQuery(VERTICAL_FROM);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.current.set(e.target.id, e.intersectionRatio);
        // 가장 많이 보이는 섹션을 현재로 삼는다. 경계에서 깜빡이지 않는다.
        let best = null;
        let bestRatio = 0;
        for (const [id, r] of ratios.current) {
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1] }
    );

    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="섹션 이동"
      style={
        vertical
          ? {
              position: 'fixed',
              right: 'clamp(12px, 1.4vw, 32px)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: zIndex.sticky,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }
          : {
              position: 'fixed',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 'max(8px, env(safe-area-inset-bottom))',
              zIndex: zIndex.sticky,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              // border-box면 보더 2px 때문에 4개가 못 들어가 3줄로 접힌다. 내용 폭을 그대로 쓴다.
              boxSizing: 'content-box',
              width: NARROW_RAIL_WIDTH,
              maxWidth: 'calc(100vw - 32px)',
              gap: 0,
              // 본문이 아래로 지나가므로 반투명이 아니라 불투명 판넬로 가린다
              background: colors.bg.raised,
              borderRadius: radius.lg,
              border: `1px solid ${colors.line.default}`,
            }
      }
    >
      {SECTIONS.map((s) => {
        const on = s.id === active;
        return (
          <button
            key={s.id}
            type="button"
            className="rail-dot"
            aria-current={on ? 'true' : undefined}
            aria-label={s.label}
            onClick={(e) => scrollToId(s.id, { immediate: e.detail === 0 })}
            style={{
              // 터치 타깃 44px를 확보하되 시각 요소는 점 하나다
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: vertical ? 'flex-end' : 'center',
              position: 'relative',
              gap: 8,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: on ? colors.text.primary : colors.text.dim,
              fontFamily: typography.family,
              fontSize: typography.caption.size,
              letterSpacing: typography.caption.tracking,
            }}
          >
            {vertical ? (
              // 상시 노출하면 라벨이 본문 위를 덮는다(768~1440 실측). hover와 focus에서만 띄우고
              // 배경 칩을 깔아 본문 위에 떠도 읽히게 한다. 현재 섹션은 red.light 점과 aria-current가 알린다.
              <span
                className="rail-dot-label"
                style={{
                  position: 'absolute',
                  right: 44,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  background: colors.bg.overlay,
                  border: `1px solid ${colors.line.default}`,
                  borderRadius: radius.pill,
                  padding: '4px 10px',
                  transition: `opacity ${motion.duration.tooltip}ms ${motion.easeOut}`,
                  wordBreak: 'keep-all',
                }}
              >
                {s.label}
              </span>
            ) : null}
            <span
              aria-hidden="true"
              style={{
                width: on ? 10 : 6,
                height: on ? 10 : 6,
                borderRadius: radius.pill,
                background: on ? colors.red.light : colors.line.strong,
                flexShrink: 0,
                transition: `background-color ${motion.duration.tooltip}ms ${motion.easeOut}`,
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
