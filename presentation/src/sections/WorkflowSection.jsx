// IA 2절 6번: AI 워크플로우. 단계마다 AI가 한 것과 사람이 판단한 것을 2열 병기.
// 툴 로고 이미지 금지(COMPONENTS.md WorkflowRow). 행 등장은 스태거.
// ai와 human이 비어 있으면 팀 확정 대기 상태를 정직하게 드러낸다. 추측으로 채우지 않는다.

import { colors, spacing, typography, breakpoints } from '../tokens.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { WORKFLOW } from '../content/sections.js';
import Reveal from '../components/Reveal.jsx';

function Cell({ heading, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          letterSpacing: typography.hud.tracking,
          color: colors.text.dim,
        }}
      >
        {heading}
      </span>
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.body.size,
          lineHeight: typography.body.leading,
          color: value ? colors.text.secondary : colors.text.dim,
          wordBreak: 'keep-all',
        }}
      >
        {value || '확정 예정'}
      </span>
    </div>
  );
}

export default function WorkflowSection() {
  const wide = useMediaQuery(`(min-width: ${breakpoints.md}px)`);

  return (
    <Reveal style={{ marginTop: spacing.unit * 5, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {WORKFLOW.map((row) => (
        <div
          key={row.step}
          style={{
            display: 'grid',
            gridTemplateColumns: wide ? 'minmax(140px, 1fr) 2fr 2fr' : '1fr',
            gap: wide ? spacing.gutter : spacing.unit * 2,
            paddingBlock: spacing.unit * 3,
            borderTop: `1px solid ${colors.line.default}`,
          }}
        >
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
            {row.step}
          </h3>
          <Cell heading="AI가 한 것" value={row.ai} />
          <Cell heading="사람이 판단한 것" value={row.human} />
        </div>
      ))}
    </Reveal>
  );
}
