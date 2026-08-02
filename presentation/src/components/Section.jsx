// COMPONENTS.md: 8개 섹션 래퍼. min-height 100dvh(100vh 금지), spacing.section 상하, id 해시 앵커.
// PATTERNS 2절 골격: 라벨(hud, text.dim, 대문자) → 제목(title 또는 display) → 본문(body, 최대 720px).

import { colors, spacing, typography, breakpoints } from '../tokens.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { RAIL_RESERVE_PX } from './ProgressRail.jsx';
import Reveal from './Reveal.jsx';

// md 미만에서 ProgressRail이 하단 가로 행(4개씩 2줄)이 된다. 그만큼 아래를 비운다.
const RAIL_BOTTOM_CLEARANCE = 112;

export default function Section({
  id,
  label,
  title,
  lead,
  children,
  titleAs: TitleTag = 'h2',
  renderTitle,
  reveal = false,
}) {
  const railIsVertical = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  // 제목과 본문을 한 묶음으로 스태거 등장시킨다. cover는 자체 연출을 쓰므로 감싸지 않는다.
  const HeadWrap = reveal ? Reveal : 'div';

  return (
    <section
      id={id}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: spacing.section,
        paddingBottom: railIsVertical ? spacing.section : `calc(${spacing.section} + ${RAIL_BOTTOM_CLEARANCE}px)`,
        paddingLeft: spacing.gutter,
        // 세로 레일이 본문 오른쪽을 덮지 않게 그만큼 비운다(768~1440에서 겹침 실측)
        paddingRight: railIsVertical ? `calc(${spacing.gutter} + ${RAIL_RESERVE_PX}px)` : spacing.gutter,
        // 읽기 블록은 상한을 두되 4K에서 우표가 되지 않게 타이포와 여백이 함께 커진다(RESPONSIVE 4K 절)
        width: '100%',
        maxWidth: spacing.maxWide,
        marginInline: 'auto',
      }}
    >
      <HeadWrap>
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
          {label}
        </p>

        {renderTitle ? null : (
          <TitleTag
            style={{
              margin: `${spacing.unit * 2}px 0 0`,
              fontFamily: typography.family,
              fontSize: typography.title.size,
              fontWeight: typography.title.weight,
              letterSpacing: typography.title.tracking,
              lineHeight: typography.title.leading,
              color: colors.text.primary,
              wordBreak: 'keep-all',
              maxWidth: '20ch',
            }}
          >
            {title}
          </TitleTag>
        )}

        {lead ? (
          <p
            style={{
              margin: `${spacing.unit * 3}px 0 0`,
              fontFamily: typography.family,
              fontSize: typography.body.size,
              fontWeight: typography.body.weight,
              letterSpacing: typography.body.tracking,
              lineHeight: typography.body.leading,
              color: colors.text.secondary,
              maxWidth: '72ch',
              wordBreak: 'keep-all',
            }}
          >
            {lead}
          </p>
        ) : null}
      </HeadWrap>

      {renderTitle ? renderTitle() : null}
      {children}
    </section>
  );
}
