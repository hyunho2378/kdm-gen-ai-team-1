// COMPONENTS.md 공통 스펙. 상태 텍스트 라벨 필수(색 단독 구분 금지).
// ok는 text.primary, 저하는 red.light 텍스트.

import { colors, radius, typography } from '../../tokens.js';

export default function StatusChip({ label, value, degraded = false }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: colors.bg.overlay,
        border: `1px solid ${colors.line.default}`,
        borderRadius: radius.pill,
        padding: '6px 12px',
        fontFamily: typography.family,
        fontSize: typography.caption.size,
        letterSpacing: typography.caption.tracking,
        lineHeight: typography.caption.leading,
        wordBreak: 'keep-all',
      }}
    >
      <span style={{ color: colors.text.dim }}>{label}</span>
      <span style={{ color: degraded ? colors.red.light : colors.text.primary }}>{value}</span>
    </div>
  );
}
