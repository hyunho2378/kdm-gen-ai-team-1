// PATTERNS 1절: bg.base에서 bg.deep으로 떨어지는 수직 그라디언트 + 약한 방사 비네트.
// 전역 1회만 깐다. 섹션마다 반복하면 이음매가 보이고 페인트 비용이 늘어난다.
// fixed라 스크롤과 무관하게 한 장으로 유지된다.

import { colors } from '../tokens.js';

export default function StageBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        background: [
          `radial-gradient(ellipse at 50% 0%, rgba(216, 226, 240, 0.05), transparent 55%)`,
          `radial-gradient(ellipse at 50% 50%, transparent 40%, ${colors.bg.deep} 100%)`,
          `linear-gradient(180deg, ${colors.bg.base} 0%, ${colors.bg.deep} 100%)`,
        ].join(', '),
      }}
    />
  );
}
