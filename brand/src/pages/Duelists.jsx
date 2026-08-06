// 유파 셀렉션 페이지. 랜딩에 있던 유파 섹션을 옮겨 왔다.
//
// **이번 세션은 정적 3카드 배치까지다.** 전진과 좌측 이동과 상세가 붙는 셀렉션 안무는 B7이다.
// 카드에 `data-flip-id`를 미리 달아 둔다. 값은 ver(Ver.1 Ver.2 Ver.3)이다.
//
// 문구는 B4 확정 라이팅이다. VORTEX_DESIGN_SYSTEM 3.11 원문에서 어미가 다듬어졌다
// (예 "유발시키자" -> "유발한다"). 두 문서가 갈린 것은 PROGRESS 미해결에 적었다.

import { colors, radius, spacing, typography } from '../tokens.js';
import { DUELISTS } from '../copy.js';
import Page from '../components/Page.jsx';

export default function Duelists() {
  return (
    <Page eyebrow={DUELISTS.header.eyebrow} headline={DUELISTS.header.title} sub={DUELISTS.header.sub}>
      {/* 셀렉션 안무는 B7이고 지금은 안내 라벨만 선다 */}
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          fontWeight: 600,
          letterSpacing: typography.hud.tracking,
          color: colors.text.dim,
        }}
      >
        {DUELISTS.selection.guide}
      </span>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.unit * 2,
        }}
      >
        {DUELISTS.cards.map((d) => (
          <li
            key={d.key}
            data-flip-id={`duelist-${d.ver}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: spacing.unit * 3,
              borderRadius: radius.lg,
              border: `1px solid ${colors.line.default}`,
              background: colors.bg.raised,
            }}
          >
            <span
              style={{
                fontFamily: typography.family,
                fontSize: typography.caption.size,
                letterSpacing: typography.hud.tracking,
                color: colors.red.light,
              }}
            >
              {d.ver} {d.trait}
            </span>
            <span
              style={{
                fontFamily: typography.family,
                fontSize: typography.heading.size,
                fontWeight: typography.heading.weight,
                color: colors.text.primary,
                wordBreak: 'keep-all',
              }}
            >
              {d.name}
            </span>
            <span
              style={{
                fontFamily: typography.family,
                fontSize: typography.body.size,
                lineHeight: typography.body.leading,
                color: colors.text.secondary,
                wordBreak: 'keep-all',
              }}
            >
              {d.style}
            </span>
            <blockquote
              style={{
                margin: 0,
                paddingLeft: 12,
                borderLeft: `2px solid ${colors.red.light}`,
                fontFamily: typography.family,
                fontSize: typography.caption.size,
                lineHeight: 1.6,
                color: colors.text.dim,
                wordBreak: 'keep-all',
              }}
            >
              {d.quote}
            </blockquote>
          </li>
        ))}
      </ul>
    </Page>
  );
}
