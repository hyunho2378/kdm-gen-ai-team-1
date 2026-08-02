// COMPONENTS.md: 내 점수 좌 red.light, AI 우 blue.light, 소유자 텍스트 라벨 병기.
// 숫자는 트윈 없이 즉시 반영(PATTERNS 5절). 색 단독 구분 금지라 라벨을 항상 함께 낸다.

import { colors, typography } from '../../tokens.js';
import { RULES } from '../../game/judge.js';

function Side({ label, value, color, align }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align, gap: 2 }}>
      <span
        style={{
          color: colors.text.dim,
          fontSize: typography.caption.size,
          letterSpacing: typography.hud.tracking,
          wordBreak: 'keep-all',
        }}
      >
        {label}
      </span>
      <span
        style={{
          color,
          fontSize: typography.title.size,
          fontWeight: typography.title.weight,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ScoreBoard({ score, schoolName }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        fontFamily: typography.family,
      }}
    >
      <Side label="나" value={score.me} color={colors.red.light} align="flex-end" />
      <span style={{ color: colors.text.dim, fontSize: typography.caption.size }}>{RULES.MATCH_POINT}점 선취</span>
      <Side label={schoolName} value={score.ai} color={colors.blue.light} align="flex-start" />
    </div>
  );
}
