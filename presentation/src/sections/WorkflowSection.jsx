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
    // P4: 표 느낌(행 보더)을 지우고 카드 없는 넓은 행간 타이포로. 2열 병기 내용 규칙은 유지.
    <Reveal style={{ marginTop: spacing.unit * 6, display: 'flex', flexDirection: 'column', gap: spacing.unit * 6 }}>
      {WORKFLOW.map((row) => (
        <div
          key={row.step}
          style={{
            display: 'grid',
            gridTemplateColumns: wide ? 'minmax(160px, 1fr) 2fr 2fr' : '1fr',
            gap: wide ? `clamp(${spacing.unit * 3}px, 3vw, ${spacing.unit * 6}px)` : spacing.unit * 2,
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
