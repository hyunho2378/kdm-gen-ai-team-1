// 랜딩. **관문이다.** 여기서 다 보여주지 않고 유인만 한다(B3 재편).
//
// 히어로(검끝 궤적)와 월드빌딩은 그대로 두고, 제품군과 유파와 체험은 관문 카드 셋으로 줄였다.
// 각 섹션의 본문은 자기 페이지로 옮겨 갔다(`pages/Products.jsx`, `pages/Duelists.jsx`, `pages/Experience.jsx`).
//
// **일반 스크롤이다.** presentation-v2의 방향키 셸을 가져오지 않는다.
// 스무스 스크롤은 App의 Lenis가 전역으로 건다.

import { Link } from 'react-router-dom';
import { brandGradient, colors, displayFamily, radius, spacing, steelText, typography } from '../tokens.js';
import { GATEWAYS, HERO, SECTION, WORLD } from '../copy.js';
import Section, { TempMark } from '../components/Section.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import HeroTrail from '../components/HeroTrail.jsx';

export default function Landing() {
  return (
    <main>
      <HeroSection />
      <WorldSection />
      <GatewaySection />
    </main>
  );
}

/**
 * 히어로. 검끝 궤적이 주인공이라 배경을 비운다.
 * 궤적 캔버스는 inset 0으로 깔리고 콘텐츠는 그 위 층에서 선다.
 */
function HeroSection() {
  return (
    <section
      id={SECTION.HERO}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: `${spacing.section} ${spacing.gutter}`,
        maxWidth: spacing.maxWide,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <HeroTrail />

      {/* 콘텐츠 층. 궤적 위에 선다 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.unit * 3,
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

        {/* 검끝 한 줄 모티프의 자리(2.5절). 지금은 브랜드 그라디언트 실선이다 */}
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
      </div>
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

/**
 * 관문 셋. 제목과 한 줄과 링크만 둔다.
 * 카드 전체가 링크라 터치 타깃이 넓고 키보드로도 한 번에 잡힌다.
 */
function GatewaySection() {
  return (
    <Section id={SECTION.PRODUCTS}>
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
        {GATEWAYS.map((g) => (
          <li key={g.key}>
            <Link
              to={g.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                height: '100%',
                minHeight: 180,
                padding: spacing.unit * 3,
                borderRadius: radius.lg,
                border: `1px solid ${colors.line.default}`,
                background: colors.bg.raised,
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: typography.heading.size,
                  fontWeight: typography.heading.weight,
                  color: colors.text.primary,
                  wordBreak: 'keep-all',
                }}
              >
                {g.title}
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
                {g.line}
                {g.temp ? <TempMark /> : null}
              </span>
              <span
                aria-hidden="true"
                style={{
                  marginTop: 'auto',
                  fontFamily: typography.family,
                  fontSize: typography.caption.size,
                  letterSpacing: typography.hud.tracking,
                  fontWeight: 600,
                  color: colors.red.light,
                }}
              >
                VIEW
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
