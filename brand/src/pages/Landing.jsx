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
 * 히어로. **Satisfy 문법으로 다시 짰다(BV2-2).**
 *
 * ── Satisfy 히어로 실측 (1440x900을 직접 열어 computed style로 잼) ────────────
 *
 *   비주얼    video/img 1440x617, object-fit cover, 첫 화면의 69퍼센트
 *             y 32에서 시작해 649에서 끝난다. **100vh를 안 채운다**
 *   카피      비주얼 안쪽 y 285, 즉 비주얼의 46퍼센트 지점
 *             헤드라인 60px/900 → 서브 14px/400(+66px) → 알약 CTA 14px/900(+35px)
 *             **총 150px. 그게 전부다**
 *   여백      비주얼이 끝나고 다음 섹션이 시작되기까지가 비어 있다
 *
 * 즉 **비주얼이 화면 대부분을 먹고, 카피는 그 위에 작은 덩어리로 앉고,
 * 비주얼이 화면을 다 안 채워서 아래 여백이 산다.** 셋이 같이 있어야 성립한다.
 *
 * ── 우리 적용 ────────────────────────────────────────────────────────────────
 * 예전에는 콘텐츠가 좌상단에 쌓이고 **아래 절반이 통째로 비어 있었다**(실측: 45퍼센트만 씀).
 * 이제 비주얼 슬롯이 헤더 아래부터 뷰포트의 68퍼센트를 먹고, 카피가 그 안 46퍼센트 지점에
 * 앉고, 슬롯 아래 띠가 여백이자 스크롤 단서가 된다.
 *
 * **슬롯은 빈 박스가 아니다.** 카드와 같은 표면(--card-bg)이라 판으로 읽히고, 카피가 그 위에
 * 얹혀 있어 자리의 용도가 보인다. 이미지가 오면 이 슬롯을 그대로 채우면 된다(풀블리드 cover).
 *
 * **슬롯은 전폭이다.** shell 거터를 뚫고 화면 끝까지 간다(Satisfy가 1440 전폭이다).
 * 카피만 shell 격자에 맞춰 좌측 거터에서 시작한다.
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
      ref={contentRef}
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        // 헤더가 상주하므로 그 아래에서 시작한다. Satisfy의 비주얼도 공지바 아래 y 32에서 열린다
        paddingTop: 'var(--header-h)',
      }}
    >
      {/* ── 비주얼 슬롯 ────────────────────────────────────────────────────────
          **전폭이다.** shell 거터를 뚫고 화면 끝까지 간다(Satisfy 비주얼이 1440 전폭).
          높이는 뷰포트의 68퍼센트로, Satisfy의 69퍼센트와 같은 자리다.
          **화면을 다 채우지 않는 것이 요점이다.** 아래에 남는 띠가 여백이고 스크롤 단서다.

          이미지가 오면 이 div의 배경 자리에 그대로 들어간다(object-fit cover 풀블리드). */}
      <div
        className="vx-hero-slot"
        style={{
          position: 'relative',
          flex: '0 0 auto',
          height: 'min(68dvh, 720px)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* 검끝 궤적. 슬롯 안에서만 돈다. 라이트에서 보이게 잉크와 일반 합성으로 바꿨다 */}
        <HeroTrail />

        {/* **이미지 자리 표기.** 카피가 좌측을 쓰므로 우하단에 눕혀 겹치지 않는다.
            빈 박스로 두지 않고 자리의 용도를 적어 두는 것이 이 표기의 전부다 */}
        <span
          data-enter="tail"
          style={{
            position: 'absolute',
            right: 'var(--page-gutter)',
            bottom: spacing.unit * 2,
            fontFamily: typography.family,
            fontSize: typography.caption.size,
            letterSpacing: typography.hud.tracking,
            color: colors.text.dim,
          }}
        >
          {MEDIA_PENDING}
        </span>

        {/* 카피. **슬롯 안 46퍼센트 지점에 앉는다**(Satisfy 실측 위치).
            가로는 shell 격자를 그대로 따라 좌측 거터에서 시작한다 */}
        <div
          className="vx-shell"
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            // Satisfy 카피 덩어리는 150px 안에 셋을 담는다. 우리도 촘촘히 붙인다
            gap: spacing.unit,
          }}
        >
          <div data-enter="eyebrow">
            <Eyebrow en={hero.eyebrow.en} ko={hero.eyebrow.ko} />
          </div>

          {/* **평면 잉크다.** 크롬 셰이더는 라이트 배경에서 대비 1.16:1이라 걷었다
              (근거는 HeroWordmark 주석의 실측표) */}
          <HeroWordmark text={hero.wordmark} />

          <p
            data-enter="sub"
            style={{
              margin: 0,
              marginTop: spacing.unit,
              fontFamily: typography.family,
              fontSize: typography.heading.size,
              lineHeight: typography.heading.leading,
              color: colors.text.secondary,
              maxWidth: 'var(--measure)',
              wordBreak: 'keep-all',
            }}
          >
            {hero.sub}
          </p>
        </div>
      </div>

      {/* ── 슬롯 아래 띠 ───────────────────────────────────────────────────────
          **여기가 살아 있는 여백이다.** Satisfy도 비주얼이 끝나고 다음 섹션까지 비운다.
          비워만 두면 죽은 자리라 팀 표기와 스크롤 단서만 바닥에 눕힌다. */}
      <div
        className="vx-shell"
        style={{
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: spacing.unit * 2,
          flexWrap: 'wrap',
          paddingBottom: spacing.unit * 4,
        }}
      >
        <p data-enter="tail" style={{ margin: 0, fontFamily: typography.family, fontSize: typography.caption.size, color: colors.text.dim }}>
          {hero.team}
        </p>

        <p
          data-enter="tail"
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.hud.size,
            letterSpacing: typography.hud.tracking,
            fontWeight: typography.hud.weight,
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
              className="vx-gate vx-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.unit * 1.5,
                height: '100%',
                minHeight: 180,
                padding: spacing.unit * 2,
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
              {/* **손으로 적은 clamp를 걷었다(BV2-1).** 여기만 `clamp(1.5rem, 1rem + 1.9vw, 2.6rem)`이라
                  1440에서 41.6px가 나와 다른 섹션 제목(32.8px)과 갈렸다. 섹션마다 제목 크기를 새로
                  정하는 것이 v2가 금지하는 바로 그것이다. 이제 셋 다 title 토큰 하나를 쓴다 */}
              <span
                className="vx-gate-title"
                style={{
                  fontFamily: typography.family,
                  fontSize: typography.title.size,
                  fontWeight: typography.title.weight,
                  letterSpacing: typography.title.tracking,
                  lineHeight: typography.title.leading,
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
