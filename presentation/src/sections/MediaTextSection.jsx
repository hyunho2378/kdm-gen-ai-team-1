// P4 편집 레이아웃: background와 insight. 라벨-제목-본문 세로 나열(PPT)을 깨고
// 미디어 60% + 텍스트 40% 비대칭 병치로 재배치한다. 좌우는 섹션마다 교차(mediaSide).
// 카피는 content/sections.js 원문 그대로. 제목만 대형 크롬 인용 타이포로 위계를 올린다(DESIGN 3절 크롬 title 허용).
// 텍스트는 미디어 옆에서 스크롤에 따라 단락 단위로 등장한다(Reveal, y24+opacity 기존 규율).

import { colors, spacing, typography, breakpoints } from '../tokens.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { RAIL_RESERVE_PX } from '../components/ProgressRail.jsx';
import ChromeText from '../components/ui/ChromeText.jsx';
import Reveal from '../components/Reveal.jsx';

const RAIL_BOTTOM_CLEARANCE = 112; // md 미만에서 하단 가로 레일이 차지하는 높이

export default function MediaTextSection({ data, media, mediaSide = 'right' }) {
  const twoCol = useMediaQuery(`(min-width: ${breakpoints.lg}px)`); // 1024 미만은 세로 적층
  const railVertical = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const mediaLeft = twoCol && mediaSide === 'left';

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
      <div
        style={{
          display: 'grid',
          // 미디어 60 / 텍스트 40. 좌우 교차는 컬럼 비율과 order로 함께 뒤집는다.
          gridTemplateColumns: twoCol ? (mediaLeft ? '3fr 2fr' : '2fr 3fr') : '1fr',
          gap: `clamp(${spacing.unit * 3}px, 4vw, ${spacing.unit * 8}px)`,
          alignItems: 'center',
        }}
      >
        {/* 텍스트 40% */}
        <Reveal style={{ order: mediaLeft ? 2 : 1, display: 'flex', flexDirection: 'column', gap: spacing.unit * 3 }}>
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
          {/* 핵심 문장(= 제목)을 대형 크롬 인용으로 강조 */}
          <ChromeText as="h2" variant="title" style={{ maxWidth: '18ch' }}>
            {data.title}
          </ChromeText>
          <p
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.body.size,
              lineHeight: typography.body.leading,
              color: colors.text.secondary,
              maxWidth: '46ch',
              wordBreak: 'keep-all',
            }}
          >
            {data.lead}
          </p>
        </Reveal>

        {/* 미디어 60% */}
        <Reveal style={{ order: mediaLeft ? 1 : 2 }}>
          <div>{media}</div>
        </Reveal>
      </div>
    </section>
  );
}
