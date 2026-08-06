// 제품군 인덱스. 랜딩에 있던 제품군 섹션을 그대로 옮겨 온 페이지다.
//
// 카드에 `data-flip-id`를 미리 달아 둔다. 지금은 즉시 이동이고 B8에서 GSAP Flip이
// 이 속성으로 카드와 상세 히어로를 짝지어 morph 전환을 건다. 값은 slug다.

import { Link } from 'react-router-dom';
import { colors, radius, spacing, typography } from '../tokens.js';
import { PRODUCTS } from '../copy.js';
import Page from '../components/Page.jsx';

export default function Products() {
  return (
    <Page eyebrow={PRODUCTS.index.eyebrow} headline={PRODUCTS.index.title} sub={PRODUCTS.index.line}>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          // 3종이라 최소폭을 280으로 올려 유파 격자와 같은 리듬으로 맞춘다.
          // 320에서 1열, 768에서 2열, 넓은 화면에서 3열이 한 줄에 선다. 미디어쿼리 없이 폭만 보고 접힌다
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.unit * 2,
        }}
      >
        {PRODUCTS.cards.map((p) => (
          <li key={p.slug}>
            <Link to={`/product/${p.slug}`} data-flip-id={`product-${p.slug}`} style={cardStyle}>
              {/* 대표 비주얼 자리. 갤러리와 3D는 이후 세션이다 */}
              <span style={cardVisualStyle} aria-hidden="true" />
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: typography.heading.size,
                  fontWeight: typography.heading.weight,
                  color: colors.text.primary,
                }}
              >
                {p.name}
              </span>
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: typography.caption.size,
                  lineHeight: 1.6,
                  color: colors.text.dim,
                  wordBreak: 'keep-all',
                }}
              >
                {p.line}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  height: '100%',
  padding: spacing.unit * 2,
  borderRadius: radius.lg,
  border: `1px solid ${colors.line.default}`,
  background: colors.bg.raised,
  textDecoration: 'none',
};

const cardVisualStyle = {
  display: 'block',
  aspectRatio: '4 / 3',
  borderRadius: radius.md,
  border: `1px solid ${colors.line.default}`,
  background: colors.bg.deep,
};
