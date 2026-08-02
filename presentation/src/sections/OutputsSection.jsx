// IA 2절 7번: 최종 산출물 3종. arena와 brand 캡처는 아직 없어 bg.raised 플레이스홀더를 둔다.
// PATTERNS 3절 카드: bg.raised, line.default 보더, radius.lg, 패딩 24. 그림자 금지, 깊이는 보더로.

import { colors, radius, spacing, typography } from '../tokens.js';
import { OUTPUTS } from '../content/sections.js';
import Reveal from '../components/Reveal.jsx';

export default function OutputsSection() {
  return (
    <Reveal
      style={{
        marginTop: spacing.unit * 5,
        display: 'grid',
        // 4K에서 상한으로 가두지 않고 열을 늘린다(RESPONSIVE 탐색 중심 전략)
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: spacing.gutter,
      }}
    >
      {OUTPUTS.map((o) => (
        <article
          key={o.key}
          style={{
            background: colors.bg.raised,
            border: `1px solid ${colors.line.default}`,
            borderRadius: radius.lg,
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
    </Reveal>
  );
}
