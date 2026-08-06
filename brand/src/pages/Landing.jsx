// 랜딩. **관문이다.** 여기서 다 보여주지 않고 유인만 한다(B3 재편).
//
// 히어로(검끝 궤적)와 월드빌딩은 그대로 두고, 제품군과 유파와 체험은 관문 카드 셋으로 줄였다.
// 각 섹션의 본문은 자기 페이지로 옮겨 갔다(`pages/Products.jsx`, `pages/Duelists.jsx`, `pages/Experience.jsx`).
//
// **일반 스크롤이다.** presentation-v2의 방향키 셸을 가져오지 않는다.
// 스무스 스크롤은 App의 Lenis가 전역으로 건다.

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { brandGradient, colors, displayFamily, radius, spacing, steelText, typography, withAlpha } from '../tokens.js';
import { LANDING, SECTION } from '../copy.js';
import { gsap, isReduced } from '../lib/motion.js';
import Section from '../components/Section.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import HeroTrail from '../components/HeroTrail.jsx';
import HeroWordmark from '../components/HeroWordmark.jsx';
import WorldScene from '../components/WorldScene.jsx';

const { hero, world, gates } = LANDING;

// 배경 글로우. 중심에서 번지는 vortex 암시다.
// **알파를 아주 낮게 둔다.** 레드가 넓은 면을 먹으면 사건의 색이 배경색이 된다(DESIGN 2절).
const HERO_GLOW = `radial-gradient(circle at 50% 45%, ${withAlpha(colors.red.light, 0.13)} 0%, ${withAlpha(
  colors.red.light,
  0.05
)} 28%, transparent 62%)`;

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
  const contentRef = useRef(null);

  // 진입 시퀀스. transform과 opacity만 쓴다(MOTION 11절).
  // **왕복에도 재생된다.** 랜딩으로 돌아오면 컴포넌트가 다시 마운트되어 타임라인이 새로 선다.
  //
  // **gsap.context와 revert가 필수다.** 그냥 tl.kill()로 정리하면 StrictMode의 이중 마운트에서
  // 첫 타임라인이 남긴 인라인 스타일(opacity 0)이 그대로 있고, 두 번째 `from()`이 그 값을
  // **도착 상태로 읽어** 워드마크가 영원히 안 뜬다(실측으로 잡았다).
  // revert가 인라인 스타일을 되돌려 두 번째 실행이 깨끗한 자리에서 시작한다.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;
    const ctx = gsap.context(() => {
      // 모션을 줄여 달라고 했으면 등장을 생략한다. 원래 자리에 그대로 선다
      if (isReduced()) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      // 워드마크가 먼저 서고 나머지가 뒤따른다. 순서가 곧 위계다
      tl.from('[data-enter="wordmark"]', { opacity: 0, y: 28, duration: 0.7 })
        .from('[data-enter="eyebrow"]', { opacity: 0, y: 12, duration: 0.45 }, '-=0.35')
        .from('[data-enter="rule"]', { opacity: 0, scaleX: 0, transformOrigin: 'left center', duration: 0.5 }, '-=0.3')
        .from('[data-enter="sub"]', { opacity: 0, y: 14, duration: 0.5 }, '-=0.3')
        .from('[data-enter="tail"]', { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, '-=0.25');
    }, root);
    return () => ctx.revert();
  }, []);

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
      {/* 배경층. 궤적과 텍스트 아래에 깔리는 낮은 알파 레드 글로우 하나 */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, background: HERO_GLOW }} />

      <HeroTrail />

      {/* 콘텐츠 층. 궤적 위에 선다 */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.unit * 3,
        }}
      >
        <div data-enter="eyebrow">
          <Eyebrow en={hero.eyebrow.en} ko={hero.eyebrow.ko} />
        </div>

        {/* 워드마크는 메탈릭이다(VORTEX_DESIGN_SYSTEM 3.1, 3.7).
            크롬을 셰이더로 올리고 실패하면 steelText로 내려앉는 판단은 HeroWordmark가 쥔다.
            **브랜드 그라디언트를 글자에 넣지 않는다.** 마지막 스톱이 #101010이라 X가 배경에 묻힌다(실측). */}
        <HeroWordmark text={hero.wordmark} />

        {/* 검끝 한 줄 모티프의 자리(2.5절). 지금은 브랜드 그라디언트 실선이다 */}
        <span
          aria-hidden="true"
          data-enter="rule"
          style={{ display: 'block', height: 2, width: 'min(560px, 60vw)', background: brandGradient }}
        />

        <p
          data-enter="sub"
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
          {hero.sub}
        </p>

        <p data-enter="tail" style={{ margin: 0, fontFamily: typography.family, fontSize: typography.caption.size, color: colors.text.dim }}>
          {hero.team}
        </p>

        {/* 스크롤 힌트. 첫 화면이 꽉 차 있어 아래가 있다는 것을 말로 알린다 */}
        <p
          data-enter="tail"
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.caption.size,
            letterSpacing: typography.hud.tracking,
            fontWeight: 600,
            color: colors.red.light,
          }}
        >
          {hero.scrollHint}
        </p>
      </div>
    </section>
  );
}

/** 월드빌딩. B5에서 sticky 시네마틱으로 올렸다. 연출은 WorldScene이 소유한다. */
function WorldSection() {
  return <WorldScene id={SECTION.WORLD} eyebrow={world.eyebrow} title={world.title} body={world.body} />;
}

/**
 * 관문 셋. 제목과 한 줄과 링크만 둔다.
 * 카드 전체가 링크라 터치 타깃이 넓고 키보드로도 한 번에 잡힌다.
 */
function GatewaySection() {
  return (
    <Section id={SECTION.GATES}>
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
        {gates.map((g) => (
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
                  fontSize: typography.caption.size,
                  fontWeight: 600,
                  letterSpacing: typography.hud.tracking,
                  color: colors.red.light,
                }}
              >
                {g.eyebrow}
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
              </span>
              <span
                aria-hidden="true"
                style={{
                  marginTop: 'auto',
                  fontFamily: typography.family,
                  fontSize: typography.caption.size,
                  letterSpacing: typography.hud.tracking,
                  fontWeight: 600,
                  color: colors.text.primary,
                }}
              >
                {g.link}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
