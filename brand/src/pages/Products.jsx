// 제품 사이트. **브랜드 사이트의 유일한 페이지다.** 5탭 섹션이 세로로 이어진다.
//
// 랜딩과 `/about`과 `/duelists`와 `/experience`와 제품 상세를 걷어내고 이 한 벌만 남겼다.
// 그래서 이 페이지가 루트(`/`)이고, 상단 내비가 사이트의 유일한 헤더다.
//
// ── 구조 (PRODUCT_PAGE_APPLE_MAPPING, Apple 오버뷰 문법) ─────────────────────
// Apple 실측: 로컬 내비가 sticky로 상단에 붙고 그 아래로 섹션이 계속 이어진다.
// 우리는 Tech Specs 한 자리를 **마스크와 컨트롤러 둘로 쪼갰다.** 제품이 둘뿐이라
// 각각 자기 탭을 가지는 편이 스펙을 깊게 펴기 좋다.
//
//   OVERVIEW    두 장치가 하나로 움직인다
//   MASK        마스크 스펙
//   CONTROLLER  컨트롤러 스펙
//   VISION      비전화면
//   EXPERIENCE  경험하기. Book a demo가 arena로 나가는 자리
//
// **탭은 라우트가 아니라 앵커다.** 다섯이 한 페이지에 흐르고 서브내비가 현재 섹션을
// 밑줄로 표시한다. 아래로 쭉 스크롤하면 내용이 끊기지 않고 이어진다.
//
// **히어로는 중앙 정렬이다**(Apple 오버뷰 히어로). 제품명이 가운데 서고 한 줄이 붙는다.
//
// **예전 딥다이브(BV2-4)를 이 구조가 대신한다.** 그때는 두 제품을 긴 스크롤 둘로 나눠
// 팠는데, 5탭이 되면서 마스크와 컨트롤러가 각자 탭을 가져 같은 역할을 더 곧게 한다.
//
// 미디어는 전부 첨부 예정 슬롯이다. 각 섹션의 실제 내용은 PD-2 이후가 채운다.

import { useEffect, useRef, useState } from 'react';
import { colors, spacing, typography } from '../tokens.js';
import { MEDIA_PENDING, PRODUCT_DETAIL, PRODUCT_NAV, PRODUCT_SECTION_PENDING, PRODUCT_SITE } from '../copy.js';
import { gsap, ScrollTrigger, isReduced } from '../lib/motion.js';
import ArenaCta from '../components/ArenaCta.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import Footer from '../components/Footer.jsx';
import ProductNav from '../components/ProductNav.jsx';
import ProductViewer from '../components/ProductViewer.jsx';

const TABS = PRODUCT_NAV.tabs;
const { hero, sections } = PRODUCT_SITE;
// 스펙과 3D를 가진 탭은 둘뿐이다. 나머지는 미디어 슬롯이 선다
const SPEC_OF = { mask: 'mask', controller: 'controller' };

export default function Products() {
  const rootRef = useRef(null);
  const sectionRefs = useRef({});
  const [active, setActive] = useState(TABS[0].key);

  /**
   * 현재 섹션 추적. **서브내비 바로 아래 선을 지난 마지막 섹션이 현재다.**
   *
   * 처음에는 교차하는 것 중 "가장 위"를 골랐는데, 그러면 이미 지나간 섹션이 늘 더 위에 있어
   * 앵커로 뛰어들었을 때 현재 탭이 첫 섹션에 붙박였다(실측: `/products#mask`로 들어가면
   * 화면은 mask인데 탭은 OVERVIEW였다).
   *
   * 그래서 관찰자에 기대지 않고 **관찰자가 깨울 때마다 전 섹션의 위치를 직접 읽어**
   * 기준선을 지난 마지막 것을 고른다. 판정이 한 곳에 모여 스크롤과 점프가 같은 답을 낸다.
   */
  useEffect(() => {
    const nodes = TABS.map((t) => sectionRefs.current[t.key]).filter(Boolean);
    if (nodes.length === 0) return undefined;
    const pick = () => {
      // 서브내비 아래 한 뼘. 이 선을 지난 마지막 섹션이 현재다.
      //
      // **높이를 숫자로 적으면 좁은 화면에서 틀린다.** 바가 두 줄로 접히면 52가 아니라
      // 147이 되고(320에서 실측), 앵커로 뛴 섹션이 163에 서는데 선이 160이면 그 섹션이
      // 아직 안 지난 것으로 읽혀 탭이 앞 섹션에 남는다. ProductNav가 잰 값을 그대로 쓴다.
      // 여백 24는 `scroll-margin-top`의 16보다 커야 착지 직후가 현재로 잡힌다
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pnav-h')) || 52;
      const line = navH + 24;
      let current = nodes[0].id;
      for (const n of nodes) {
        if (n.getBoundingClientRect().top <= line) current = n.id;
      }
      setActive(current);
    };
    const io = new IntersectionObserver(pick, { rootMargin: '-124px 0px -40% 0px', threshold: [0, 1] });
    for (const n of nodes) io.observe(n);
    // 앵커로 뛰어든 직후처럼 관찰자가 안 깨는 경우를 위해 스크롤도 함께 듣는다
    window.addEventListener('scroll', pick, { passive: true });
    pick();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', pick);
    };
  }, []);

  /** 섹션 안 덩어리가 스크롤에 따라 하나씩 드러난다. transform과 opacity만 건드린다. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || isReduced()) return undefined;
    const ctx = gsap.context(() => {
      for (const el of root.querySelectorAll('[data-beat]')) {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: 'power3.out',
          // once라 되감아도 다시 사라지지 않는다. 되돌아갈 때 글자가 깜빡이며
          // 없어지는 것이 이 문법에서 가장 거슬리는 실패 모드다
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        });
      }
      ScrollTrigger.refresh();
    }, root);
    return () => ctx.revert();
  }, []);

  /**
   * 주소에 앵커를 달고 들어온 경우(`/products#mask`) 그 섹션으로 보낸다.
   * `/product/mask` 같은 옛 링크가 여기로 넘어오므로 이 경로가 그 링크를 살린다.
   * **레이아웃이 선 뒤에 움직인다.** 3D 캔버스가 자리를 잡기 전에 스크롤하면 목표가 어긋난다.
   */
  useEffect(() => {
    const key = window.location.hash.replace('#', '');
    if (!key || !TABS.some((t) => t.key === key)) return undefined;
    const id = window.setTimeout(() => {
      sectionRefs.current[key]?.scrollIntoView({ block: 'start' });
      setActive(key);
    }, 120);
    return () => window.clearTimeout(id);
  }, []);

  /** 탭을 누르면 그 섹션으로. scroll-margin-top이 서브내비 아래 자리를 확보한다. */
  function jump(key) {
    const el = sectionRefs.current[key];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(key);
  }

  const bind = (key) => (el) => {
    sectionRefs.current[key] = el;
  };

  return (
    <>
      <ProductNav productName={hero.wordmark} active={active} onJump={jump} />

      <main ref={rootRef}>
        {/* ── 히어로. **중앙 정렬이다.** 제품명이 가운데 서고 한 줄이 붙는다 ── */}
        <section
          className="vx-shell"
          style={{
            minHeight: '64dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: spacing.unit * 2,
            paddingBlock: 'var(--section-gap)',
          }}
        >
          <h1
            data-beat
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.display.size,
              fontWeight: typography.display.weight,
              letterSpacing: typography.display.tracking,
              lineHeight: typography.display.leading,
              color: colors.text.primary,
            }}
          >
            {hero.wordmark}
          </h1>
          <p
            data-beat
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.heading.size,
              lineHeight: typography.heading.leading,
              color: colors.text.secondary,
              maxWidth: 'var(--measure)',
              wordBreak: 'keep-all',
            }}
          >
            {hero.line}
          </p>
        </section>

        {/* ── 5탭 섹션이 세로로 이어진다 ─────────────────────────────────────── */}
        {TABS.map((t) => (
          <Section key={t.key} tab={t} bind={bind(t.key)} specSlug={SPEC_OF[t.key]} demo={t.key === 'experience'} />
        ))}
      </main>

      {/* 랜딩이 사라지면서 갈 곳을 잃은 크레딧과 팀과 저작권이 여기로 내려왔다 */}
      <Footer />
    </>
  );
}

/**
 * 탭 하나에 대응하는 섹션. 골격과 자리표시뿐이고 PD-2 이후가 채운다.
 * 스펙을 가진 탭(마스크, 컨트롤러)만 확정된 사양 행과 3D를 세운다.
 */
function Section({ tab, bind, specSlug, demo }) {
  const copy = sections[tab.key];
  return (
    <section id={tab.key} ref={bind} className="vx-shell vx-pd-section" aria-label={tab.ko}>
      <div data-beat style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
        <Eyebrow en={tab.label} ko={tab.ko} />
        <h2
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
          {copy.title}
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.body.size,
            lineHeight: typography.body.leading,
            color: colors.text.secondary,
            maxWidth: 'var(--measure)',
            wordBreak: 'keep-all',
          }}
        >
          {copy.line}
        </p>
      </div>

      {/* 미디어 자리. **빈 박스가 아니다.** 카드와 같은 표면이고 이미지가 오면 cover로 덮는다.
          제품 탭 둘은 3D 뷰어가 실제 미디어 노릇을 한다 */}
      <div data-beat style={{ marginTop: spacing.unit * 3 }}>
        {specSlug ? (
          <div className="vx-pd-media">
            <ProductViewer slug={specSlug} />
          </div>
        ) : (
          <div className="vx-card vx-pd-media" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={pendingStyle}>{MEDIA_PENDING}</span>
          </div>
        )}
      </div>

      {specSlug ? <Specs slug={specSlug} /> : null}

      {demo ? (
        <div data-beat style={{ marginTop: spacing.unit * 3 }}>
          <ArenaCta label={PRODUCT_DETAIL.cta} />
        </div>
      ) : null}

      <span data-beat style={{ ...pendingStyle, display: 'block', marginTop: spacing.unit * 3 }}>
        {PRODUCT_SECTION_PENDING[tab.key]}
      </span>
    </section>
  );
}

/** 사양 표. 값이 미정인 행도 이름은 확정이라 행을 세워 둔다. */
function Specs({ slug }) {
  const rows = PRODUCT_DETAIL.spec[slug];
  if (!rows || rows.length === 0) return <span style={pendingStyle}>{PRODUCT_DETAIL.specTodo}</span>;
  return (
    <div data-beat style={{ marginTop: spacing.unit * 3 }}>
      <span style={{ ...pendingStyle, display: 'block', marginBottom: spacing.unit }}>{PRODUCT_SITE.specLabel}</span>
      <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
        {rows.map((r) => (
          <div key={r.name} style={{ display: 'flex', gap: spacing.unit * 3 }}>
            <dt style={{ ...rowStyle, color: colors.text.dim, flex: 'none', minWidth: 120 }}>{r.name}</dt>
            <dd style={{ ...rowStyle, margin: 0 }}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const rowStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  lineHeight: typography.body.leading,
  color: colors.text.secondary,
  wordBreak: 'keep-all',
};

const pendingStyle = {
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  color: colors.text.dim,
};
