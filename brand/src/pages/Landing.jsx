// 랜딩. **관문이다.** 여기서 다 보여주지 않고 유인만 한다(B3 재편).
//
// 히어로(검끝 궤적) 다음에 관문(제품군/유파/체험)이 바로 이어진다. **월드빌딩 섹션은 걷어냈다(R5).**
// 이미지 없는 빈 큰 박스라 스크롤 흐름만 끊었고, 세계관 서사는 About으로 옮겨 갈 자리다.
// 각 관문의 본문은 자기 페이지로 옮겨 갔다(`pages/Products.jsx`, `pages/Duelists.jsx`, `pages/Experience.jsx`).
//
// **일반 스크롤이다.** presentation-v2의 방향키 셸을 가져오지 않는다.
// 스무스 스크롤은 App의 Lenis가 전역으로 건다.

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { colors, displayFamily, radius, spacing, steelText, typography } from '../tokens.js';
import { HEADER, LANDING, MEDIA_PENDING, SECTION } from '../copy.js';
import { gsap, isReduced } from '../lib/motion.js';
import Section from '../components/Section.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import HeroTrail from '../components/HeroTrail.jsx';
import HeroWordmark from '../components/HeroWordmark.jsx';
import Newsletter from '../components/Newsletter.jsx';

const { hero, gates, outro } = LANDING;

// **히어로 배경 레드 radial을 걷어냈다(REBOOT_PLAN 2.1).**
// 알파를 아무리 낮춰도 넓은 면을 먹는 레드는 배경을 물들이고, 그러면 사건의 색이 배경색이 된다.
// 레드는 어두운 곳에서 빛나는 요소로만 남는다. 여기서는 궤적 리본이 그 역할을 이미 하고 있다.

export default function Landing() {
  return (
    <main>
      <HeroSection />
      <GatewaySection />
      <CtaSection />
      <Newsletter id={SECTION.NEWSLETTER} />
      <Footer />
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
      // 워드마크가 먼저 서고 나머지가 뒤따른다. 순서가 곧 위계다.
      // rule(검끝 실선) 단계는 그 요소가 사라져 함께 걷어냈다
      tl.from('[data-enter="wordmark"]', { opacity: 0, y: 28, duration: 0.7 })
        .from('[data-enter="eyebrow"]', { opacity: 0, y: 12, duration: 0.45 }, '-=0.35')
        .from('[data-enter="sub"]', { opacity: 0, y: 14, duration: 0.5 }, '-=0.3')
        .from('[data-enter="tail"]', { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, '-=0.25');
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id={SECTION.HERO}
      className="vx-shell vx-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* 배경은 순흑이다. 깔던 레드 글로우를 걷어냈다. 빛나는 것은 궤적뿐이다 */}
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

        {/* **검끝 실선을 걷어냈다.** 브랜드 그라디언트(흰-레드-딥레드-블랙) 2px 선이었는데
            장식 선 금지와 레드 그라데이션 금지에 동시에 걸린다. 워드마크와 본문 사이의
            구분은 여백이 진다(REBOOT_PLAN 2.1) */}
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
            {/* **카드 보더와 판을 걷어냈다.** 구분은 여백과 타이포 스케일이 진다(REBOOT_PLAN 2.1).
                링크 영역은 그대로라 터치 타깃과 포커스는 줄지 않는다.
                `.vx-gate`는 호버 반응의 뿌리다. 반응 자체는 index.css가 쥔다 */}
            <Link
              to={g.to}
              className="vx-gate"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.unit * 1.5,
                height: '100%',
                minHeight: 180,
                paddingBlock: spacing.unit * 2,
                textDecoration: 'none',
              }}
            >
              {/* 대표 비주얼 자리. 제품 인덱스와 같은 문법이다(박스 없이 문구만, REBOOT_PLAN 2.1).
                  배치는 `.vx-card-visual`이, 호버 밝기는 `.vx-gate-visual`이 쥔다.
                  좁은 화면에서는 `.vx-card-visual`이 이 자리를 접는다 */}
              <span className="vx-card-visual vx-gate-visual">
                <span
                  style={{
                    fontFamily: typography.family,
                    fontSize: typography.caption.size,
                    color: colors.text.dim,
                  }}
                >
                  {MEDIA_PENDING}
                </span>
              </span>

              {/* 개별 구현이던 자리다. 컴포넌트로 통합해 크기와 굵기가 전 페이지와 같아진다 */}
              <Eyebrow en={g.eyebrow} />
              <span
                className="vx-gate-title"
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

/**
 * CTA 섹션. 결투로의 초대다. 큰 문구 하나와 레드 채움 버튼(/experience로).
 * **무배경, 선 없음.** 채움과 press는 `.vx-cta` 클래스가 쥔다(배경 인라인 금지, PITFALLS).
 */
function CtaSection() {
  const { cta } = outro;
  return (
    <section
      id={SECTION.CTA}
      className="vx-shell vx-section"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: spacing.unit * 4,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: displayFamily,
          fontSize: typography.display.size,
          fontWeight: typography.display.weight,
          letterSpacing: typography.display.tracking,
          lineHeight: typography.display.leading,
          color: colors.text.primary,
          maxWidth: spacing.maxContent,
          wordBreak: 'keep-all',
        }}
      >
        {cta.title}
      </h2>
      <Link to={cta.to} className="vx-cta" style={ctaLinkStyle}>
        {cta.button}
      </Link>
    </section>
  );
}

// 배경 없이 글자만 큰 climax. **background는 `.vx-cta`가 쥔다.** 여기서 걸면 :active press가 죽는다
const ctaLinkStyle = {
  display: 'inline-flex',
  alignSelf: 'flex-start',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '14px 32px',
  borderRadius: radius.pill,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  fontWeight: 600,
  lineHeight: 1,
  textDecoration: 'none',
};

/**
 * 푸터. 맨 아래. 워드마크(소형 크롬), 메뉴(HEADER.nav 재사용), 크레딧과 팀, 저작권.
 * **무배경, 선 없음.** 층은 여백이 낸다(REBOOT_PLAN 2.1).
 */
function Footer() {
  const { footer } = outro;
  return (
    <footer
      className="vx-shell"
      style={{
        paddingBlock: spacing.unit * 6,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit * 3,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: spacing.unit * 2,
        }}
      >
        {/* 소형 워드마크. 로고라 크롬 재질 허용(DESIGN 3절) */}
        <Link to="/" aria-label={footer.wordmark} style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: displayFamily,
              fontSize: typography.heading.size,
              fontWeight: typography.display.weight,
              letterSpacing: typography.display.tracking,
              lineHeight: 1,
              ...steelText,
            }}
          >
            {footer.wordmark}
          </span>
        </Link>

        {/* 메뉴는 헤더와 같은 배열을 쓴다. 순서가 헤더와 어긋나지 않는다 */}
        <nav aria-label="푸터 메뉴" style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.unit * 2 }}>
          {HEADER.nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: typography.family,
                fontSize: typography.caption.size,
                letterSpacing: typography.hud.tracking,
                color: colors.text.dim,
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={footerMetaStyle}>{footer.credit}</span>
        <span style={footerMetaStyle}>{footer.team}</span>
      </div>

      <span style={footerMetaStyle}>{footer.copyright}</span>
    </footer>
  );
}

const footerMetaStyle = {
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  color: colors.text.dim,
  wordBreak: 'keep-all',
};
