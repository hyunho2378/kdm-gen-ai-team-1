// 랜딩 원페이지. 섹션 순서는 BRAND_SITE_GUIDE 2.1 그대로다.
// 히어로, 월드빌딩, 제품군 4종, 유파 소개, 체험해보기.
//
// **일반 스크롤이다.** presentation-v2의 방향키 셸을 가져오지 않는다.
// Lenis도 이 세션에서는 넣지 않는다(네이티브 스크롤). 부드러운 스크롤은 다음 세션 실설치분이다.
//
// 이 세션은 뼈대다. 각 섹션은 라벨과 배치만 있고 궤적, 셰이더, 유리, morph 전환은 다음 세션이다.

import { Link } from 'react-router-dom';
import { brandGradient, colors, displayFamily, radius, spacing, steelText, typography } from '../tokens.js';
import {
  DEMO,
  DUELISTS,
  DUELISTS_SECTION,
  HERO,
  PRODUCTS,
  PRODUCTS_SECTION,
  SECTION,
  WORLD,
} from '../copy.js';
import Section, { TempMark } from '../components/Section.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import ArenaCta from '../components/ArenaCta.jsx';

export default function Landing() {
  return (
    <main>
      <HeroSection />
      <WorldSection />
      <ProductsSection />
      <DuelistsSection />
      <DemoSection />
    </main>
  );
}

/** 히어로. 궤적 모션은 다음 세션이라 지금은 워드마크와 한 줄 정의만 선다. */
function HeroSection() {
  return (
    <section
      id={SECTION.HERO}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: spacing.unit * 3,
        padding: `${spacing.section} ${spacing.gutter}`,
        maxWidth: spacing.maxWide,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <Eyebrow en={HERO.eyebrow.en} ko={HERO.eyebrow.ko} />

      {/* 워드마크는 메탈릭이다(VORTEX_DESIGN_SYSTEM 3.1, 3.7). shared의 steelText를 그대로 쓴다.
          **브랜드 그라디언트를 글자에 넣지 않는다.** 마지막 스톱이 #101010이라 X가 배경에 묻힌다(실측). */}
      <h1
        style={{
          margin: 0,
          fontFamily: displayFamily,
          fontSize: typography.display.size,
          fontWeight: typography.display.weight,
          letterSpacing: typography.display.tracking,
          lineHeight: typography.display.leading,
          width: 'fit-content',
          ...steelText,
        }}
      >
        {HERO.wordmark}
      </h1>

      {/* 검끝 한 줄 모티프의 자리(2.5절). 지금은 브랜드 그라디언트 실선이고
          궤적 모션으로 바뀌는 것은 다음 세션이다 */}
      <span
        aria-hidden="true"
        style={{ display: 'block', height: 2, width: 'min(560px, 60vw)', background: brandGradient }}
      />

      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.heading.size,
          lineHeight: typography.heading.leading,
          color: colors.text.secondary,
          maxWidth: 720,
          wordBreak: 'keep-all',
        }}
      >
        {HERO.sub}
      </p>

      <p style={{ margin: 0, fontFamily: typography.family, fontSize: typography.caption.size, color: colors.text.dim }}>
        {HERO.team}
      </p>
    </section>
  );
}

/** 월드빌딩. **확정 카피가 없어 자리만 잡는다.** 지어낸 문장을 확정처럼 두지 않는다. */
function WorldSection() {
  return (
    <Section id={SECTION.WORLD} eyebrow={WORLD.eyebrow}>
      <div
        style={{
          minHeight: 'clamp(220px, 30vh, 420px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.lg,
          border: `1px solid ${colors.line.default}`,
          background: colors.bg.raised,
          fontFamily: typography.family,
          fontSize: typography.body.size,
          color: colors.text.dim,
          textAlign: 'center',
          padding: spacing.gutter,
          wordBreak: 'keep-all',
        }}
      >
        {WORLD.todo}
      </div>
    </Section>
  );
}

/** 제품군 4종. 카드 클릭이 상세 라우트로 간다. morph 전환은 다음 세션이라 지금은 단순 이동이다. */
function ProductsSection() {
  return (
    <Section
      id={SECTION.PRODUCTS}
      eyebrow={PRODUCTS_SECTION.eyebrow}
      headline={PRODUCTS_SECTION.headline}
      temp={PRODUCTS_SECTION.headlineTemp}
    >
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          // 320에서 1열, 넓어지면 자동으로 2열과 4열이 된다. 미디어쿼리 없이 폭만 보고 접힌다
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: spacing.unit * 2,
        }}
      >
        {PRODUCTS.map((p) => (
          <li key={p.slug}>
            <Link to={`/product/${p.slug}`} style={cardStyle}>
              {/* 대표 비주얼 자리. 다음 세션에서 갤러리와 3D가 들어온다 */}
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
                {p.temp ? <TempMark /> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** 유파 3종. 문구는 VORTEX_DESIGN_SYSTEM 3.11 원문이고 유리 카드는 다음 세션이다. */
function DuelistsSection() {
  return (
    <Section
      id={SECTION.DUELISTS}
      eyebrow={DUELISTS_SECTION.eyebrow}
      headline={DUELISTS_SECTION.headline}
      sub={DUELISTS_SECTION.sub}
    >
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
        {DUELISTS.map((d) => (
          <li
            key={d.key}
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
    </Section>
  );
}

/** 체험해보기. 헤드라인 3줄과 CTA는 VORTEX_DESIGN_SYSTEM 3.14 원문이다. */
function DemoSection() {
  return (
    <Section id={SECTION.DEMO} eyebrow={DEMO.eyebrow}>
      <h2
        style={{
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: displayFamily,
          fontSize: typography.display.size,
          fontWeight: typography.display.weight,
          letterSpacing: typography.display.tracking,
          lineHeight: typography.display.leading,
          color: colors.text.primary,
        }}
      >
        {DEMO.headline.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>
      <ArenaCta />
    </Section>
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
