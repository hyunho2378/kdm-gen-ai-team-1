// 제품 상세 4종 공통 골격(BRAND_SITE_GUIDE 2.3).
// 히어로 제목만 slug별이고 섹션 라벨과 뒤로와 CTA는 공통이다.
//
// 4종이 같은 컴포넌트를 쓴다. 레이아웃이 갈리는 것은 갤러리가 붙는 이후 세션이고
// 지금 넷을 따로 만들면 같은 뼈대를 네 번 고치게 된다(BRAND_SITE_GUIDE 2.3 "우선 공통 골격").
//
// 없는 slug는 빈 화면 대신 안내와 돌아갈 길을 낸다.

import { Link, useParams } from 'react-router-dom';
import { colors, radius, spacing, typography } from '../tokens.js';
import { PRODUCTS, PRODUCT_DETAIL } from '../copy.js';
import ArenaCta from '../components/ArenaCta.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = PRODUCTS.cards.find((p) => p.slug === slug);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit * 3,
        // 위쪽만 고정 헤더 높이(68)를 더한다
        padding: `calc(${spacing.section} + 68px) ${spacing.gutter} ${spacing.section}`,
        maxWidth: spacing.maxContent,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 라벨이 "제품군으로"라서 실제로 제품군 인덱스로 간다. 이력이 아니라 자리로 돌아간다 */}
      <Link to="/products" style={backStyle}>
        {PRODUCT_DETAIL.back}
      </Link>

      {!product ? (
        <p style={{ margin: 0, fontFamily: typography.family, fontSize: typography.body.size, color: colors.text.dim }}>
          {PRODUCT_DETAIL.notFound}
        </p>
      ) : (
        <>
          <span
            style={{
              fontFamily: typography.family,
              fontSize: typography.caption.size,
              fontWeight: 600,
              letterSpacing: typography.hud.tracking,
              color: colors.red.light,
            }}
          >
            {product.name}
          </span>

          <h1
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.title.size,
              fontWeight: typography.title.weight,
              letterSpacing: typography.title.tracking,
              lineHeight: typography.title.leading,
              color: colors.text.primary,
              wordBreak: 'keep-all',
            }}
          >
            {PRODUCT_DETAIL.hero[product.slug]}
          </h1>

          <p
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.heading.size,
              lineHeight: typography.heading.leading,
              color: colors.text.secondary,
              maxWidth: 640,
              wordBreak: 'keep-all',
            }}
          >
            {product.line}
          </p>

          <section style={blockStyle}>
            <SectionLabel>{PRODUCT_DETAIL.labels.overview}</SectionLabel>
            <p
              style={{
                margin: 0,
                fontFamily: typography.family,
                fontSize: typography.body.size,
                lineHeight: typography.body.leading,
                color: colors.text.secondary,
                maxWidth: 640,
                wordBreak: 'keep-all',
              }}
            >
              {product.detail}
            </p>
          </section>

          <section style={blockStyle}>
            <SectionLabel>{PRODUCT_DETAIL.labels.features}</SectionLabel>
            {/* 대표 비주얼 자리. 갤러리와 3D는 이후 세션이다 */}
            <div
              style={{
                aspectRatio: '16 / 9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.lg,
                border: `1px solid ${colors.line.default}`,
                background: colors.bg.raised,
                fontFamily: typography.family,
                fontSize: typography.caption.size,
                color: colors.text.dim,
              }}
            >
              {PRODUCT_DETAIL.visualPlaceholder}
            </div>
          </section>

          {product.demoCta ? (
            <section style={blockStyle}>
              <SectionLabel>{PRODUCT_DETAIL.labels.experience}</SectionLabel>
              <ArenaCta label={PRODUCT_DETAIL.cta} />
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}

function SectionLabel({ children }) {
  return (
    <span
      style={{
        fontFamily: typography.family,
        fontSize: typography.caption.size,
        fontWeight: 600,
        letterSpacing: typography.hud.tracking,
        color: colors.text.dim,
      }}
    >
      {children}
    </span>
  );
}

const blockStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: spacing.unit * 1.5,
};

const backStyle = {
  alignSelf: 'flex-start',
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
  padding: '10px 20px',
  borderRadius: radius.pill,
  border: `1px solid ${colors.line.strong}`,
  background: 'transparent',
  color: colors.text.primary,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  lineHeight: 1,
  textDecoration: 'none',
};
