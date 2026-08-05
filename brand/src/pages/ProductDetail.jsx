// 제품 상세 4종 공통 골격(BRAND_SITE_GUIDE 2.3).
// 제품명, 한 줄 카피, 대표 비주얼 자리, 뒤로 가기. 해당 제품이면 체험해보기 CTA.
//
// 4종이 같은 컴포넌트를 쓴다. 레이아웃이 갈리는 것은 갤러리가 붙는 다음 세션 이후이고
// 지금 넷을 따로 만들면 같은 뼈대를 네 번 고치게 된다(BRAND_SITE_GUIDE 2.3 "우선 공통 골격").
//
// slug는 라우트가 넘긴다. 없는 slug는 라우팅에서 이미 걸러지지만 직접 렌더될 때를 대비해
// 안내와 뒤로 가기를 낸다(빈 화면 금지).

import { useNavigate, useParams } from 'react-router-dom';
import { colors, radius, spacing, typography } from '../tokens.js';
import { DETAIL, PRODUCTS } from '../copy.js';
import { TempMark } from '../components/Section.jsx';
import ArenaCta from '../components/ArenaCta.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find((p) => p.slug === slug);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit * 3,
        padding: `${spacing.section} ${spacing.gutter}`,
        maxWidth: spacing.maxContent,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 뒤로 가기는 브라우저 이력을 쓴다. 랜딩의 어느 위치에서 왔는지를 그대로 되돌린다 */}
      <button type="button" onClick={() => navigate(-1)} style={backStyle}>
        {DETAIL.back}
      </button>

      {!product ? (
        <p style={{ margin: 0, fontFamily: typography.family, fontSize: typography.body.size, color: colors.text.dim }}>
          {DETAIL.notFound}
        </p>
      ) : (
        <>
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
            {product.name}
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
            {product.temp ? <TempMark /> : null}
          </p>

          {/* 대표 비주얼 자리. 갤러리와 3D는 다음 세션이다 */}
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
            {DETAIL.visualPlaceholder}
          </div>

          {product.demoCta ? <ArenaCta /> : null}
        </>
      )}
    </main>
  );
}

const backStyle = {
  alignSelf: 'flex-start',
  minHeight: 44,
  padding: '10px 20px',
  borderRadius: radius.pill,
  border: `1px solid ${colors.line.strong}`,
  background: 'transparent',
  color: colors.text.primary,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  lineHeight: 1,
  cursor: 'pointer',
};
