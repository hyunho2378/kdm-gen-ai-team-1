// P4 편집 레이아웃: concept. 세로 나열을 깨고 전폭 대형 타이포 중심으로 재배치한다.
// 월드빌딩 문장(lead)을 문장 단위 행으로 크게 세우고, 행마다 스크롤 등장. 여백은 공격적으로.
// 카피는 원문 그대로. 문장 사이 공백을 줄바꿈으로 바꾸는 것은 배치이지 문구 변경이 아니다(글자 동일).

import { colors, spacing, typography, breakpoints } from '../tokens.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { RAIL_RESERVE_PX } from '../components/ProgressRail.jsx';
import Reveal from '../components/Reveal.jsx';

const RAIL_BOTTOM_CLEARANCE = 112;

// 마침표 뒤에서만 나눈다(문장 단위). 쉼표는 그대로 둔다. 글자는 하나도 바뀌지 않는다.
function toLines(text) {
  return text.split(/(?<=\.)\s+/).filter(Boolean);
}

export default function ConceptSection({ data }) {
  const railVertical = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const lines = toLines(data.lead);

  return (
    <section
      id={data.id}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: spacing.section,
        paddingBottom: railVertical ? spacing.section : `calc(${spacing.section} + ${RAIL_BOTTOM_CLEARANCE}px)`,
        paddingLeft: spacing.gutter,
        paddingRight: railVertical ? `calc(${spacing.gutter} + ${RAIL_RESERVE_PX}px)` : spacing.gutter,
        width: '100%',
        maxWidth: spacing.maxWide,
        marginInline: 'auto',
      }}
    >
      <Reveal style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 }}>
        <p
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.hud.size,
            fontWeight: typography.hud.weight,
            letterSpacing: typography.hud.tracking,
            lineHeight: typography.hud.leading,
            color: colors.text.dim,
            textTransform: 'uppercase',
          }}
        >
          {data.label}
        </p>
        {/* 제목은 큰 문장들의 프레이밍(kicker). 주인공은 아래 대형 타이포다 */}
        <h2
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
          {data.title}
        </h2>
      </Reveal>

      {/* 월드빌딩 문장을 행 단위로 크게(title 크기, 중심). 행마다 독립 Reveal로 스크롤 등장 */}
      <div style={{ marginTop: `clamp(${spacing.unit * 6}px, 8vh, ${spacing.unit * 16}px)`, display: 'flex', flexDirection: 'column', gap: `clamp(${spacing.unit * 3}px, 4vh, ${spacing.unit * 6}px)` }}>
        {lines.map((line, i) => (
          <Reveal key={i}>
            <p
              style={{
                margin: 0,
                fontFamily: typography.family,
                fontSize: typography.title.size,
                fontWeight: typography.title.weight,
                letterSpacing: typography.title.tracking,
                lineHeight: 1.2,
                color: i === lines.length - 1 ? colors.text.primary : colors.text.secondary,
                maxWidth: '20ch',
                wordBreak: 'keep-all',
              }}
            >
              {line}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
