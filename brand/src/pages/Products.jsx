// 제품 사이트. **브랜드 사이트의 유일한 페이지다.** 5탭 섹션이 세로로 이어진다.
//
// ── 구조 (PRODUCT_PAGE_APPLE_MAPPING, Apple 오버뷰 문법) ─────────────────────
// Apple 실측: 로컬 내비가 sticky로 상단에 붙고 그 아래로 섹션이 계속 이어진다.
// 우리는 Tech Specs 한 자리를 **마스크와 컨트롤러 둘로 쪼갰다.** 제품이 둘뿐이라
// 각각 자기 탭을 가지는 편이 스펙을 깊게 펴기 좋다.
//
// **탭은 라우트가 아니라 앵커다.** 다섯이 한 페이지에 흐르고 내비가 현재 섹션을
// 밑줄로 표시한다. 아래로 쭉 스크롤하면 내용이 끊기지 않고 이어진다.
//
// ── 복구 세션에서 각 탭이 실제 내용을 받았다 ─────────────────────────────────
// 헤더 통합 세션이 전역 헤더와 함께 페이지 넷을 통째로 지웠고, 그 안의 콘텐츠까지
// 같이 사라졌다. 세 커밋에서 되살려 탭 안에 배치했다.
//
//   HERO        `46ef601` 랜딩 히어로. 풀블리드 슬롯 + 검끝 궤적 리본 + 워드마크
//   OVERVIEW    `46ef601` 랜딩 관문 셋(앵커로 전환) + `/about` 네이밍 원칙 팀
//   MASK        `a7f73c2` 딥다이브(고정 3D + 비트 4) + `1f914ed` 특징과 사양
//   CONTROLLER  같은 둘의 컨트롤러 쪽
//   VISION      `46ef601` `/duelists` 머리말과 유파 셀렉션 3종
//   EXPERIENCE  `46ef601` `/experience` 3단계와 시연 연결과 주의 사항
//
// **글로벌 헤더는 복구하지 않는다.** 서브내비와 위아래로 겹쳐 흔들리던 그것이다.
//
// 미디어 슬롯은 여전히 첨부 예정이다. 이미지 에셋은 리포에 한 장도 없다.

import { Fragment, useEffect, useRef, useState } from 'react';
import { colors, spacing, typography, weight } from '../tokens.js';
import {
  ABOUT,
  DUELISTS,
  EXPERIENCE,
  HERO,
  MEDIA_PENDING,
  OVERVIEW_GUIDE,
  PRODUCT_DEEPDIVE,
  PRODUCT_DETAIL,
  PRODUCT_NAV,
  PRODUCT_SITE,
} from '../copy.js';
import { gsap, ScrollTrigger, isReduced } from '../lib/motion.js';
import ArenaCta from '../components/ArenaCta.jsx';
import DuelistSelector from '../components/DuelistSelector.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import Footer from '../components/Footer.jsx';
import HeroTrail from '../components/HeroTrail.jsx';
import HeroWordmark from '../components/HeroWordmark.jsx';
import ProductNav from '../components/ProductNav.jsx';
import ProductViewer from '../components/ProductViewer.jsx';

const TABS = PRODUCT_NAV.tabs;
const { bridge, sections } = PRODUCT_SITE;
// 딥다이브와 사양을 가진 탭은 둘뿐이다. 나머지 셋은 각자 다른 내용이 온다
const PRODUCT_TABS = { mask: 'mask', controller: 'controller' };

export default function Products() {
  const rootRef = useRef(null);
  const sectionRefs = useRef({});
  const [active, setActive] = useState(TABS[0].key);

  /**
   * 현재 섹션 추적. **내비 바로 아래 선을 지난 마지막 섹션이 현재다.**
   *
   * 처음에는 교차하는 것 중 "가장 위"를 골랐는데, 그러면 이미 지나간 섹션이 늘 더 위에 있어
   * 앵커로 뛰어들었을 때 현재 탭이 첫 섹션에 붙박였다(실측: `/#mask`로 들어가면
   * 화면은 mask인데 탭은 OVERVIEW였다).
   *
   * 그래서 관찰자에 기대지 않고 **관찰자가 깨울 때마다 전 섹션의 위치를 직접 읽어**
   * 기준선을 지난 마지막 것을 고른다. 판정이 한 곳에 모여 스크롤과 점프가 같은 답을 낸다.
   */
  useEffect(() => {
    const nodes = TABS.map((t) => sectionRefs.current[t.key]).filter(Boolean);
    if (nodes.length === 0) return undefined;
    const pick = () => {
      // 내비 아래 한 뼘. 이 선을 지난 마지막 섹션이 현재다.
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
   * 주소에 앵커를 달고 들어온 경우(`/#mask`) 그 섹션으로 보낸다.
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

  /** 탭을 누르면 그 섹션으로. scroll-margin-top이 내비 아래 자리를 확보한다. */
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
      <ProductNav productName={HERO.wordmark} active={active} onJump={jump} />

      <main ref={rootRef}>
        <Hero />

        <SectionShell tab={TABS[0]} bind={bind('overview')}>
          <OverviewBody onJump={jump} />
        </SectionShell>

        {TABS.slice(1).map((t) => (
          <Fragment key={t.key}>
            <SectionShell tab={t} bind={bind(t.key)}>
              {PRODUCT_TABS[t.key] ? <ProductBody slug={t.key} /> : null}
              {t.key === 'vision' ? <VisionBody /> : null}
              {t.key === 'experience' ? <ExperienceBody /> : null}
            </SectionShell>
            {/* 두 제품 **사이에만** 브리지가 온다 */}
            {t.key === 'mask' ? <Bridge /> : null}
          </Fragment>
        ))}
      </main>

      {/* 랜딩이 사라지면서 갈 곳을 잃은 크레딧과 팀과 저작권이 여기로 내려왔다 */}
      <Footer />
    </>
  );
}

/**
 * 히어로. **랜딩에서 복구했다(`46ef601`, BV2-2 Satisfy 문법).**
 *
 * ── Satisfy 히어로 실측 (1440x900을 직접 열어 computed style로 잼) ────────────
 *   비주얼이 첫 화면의 69퍼센트를 먹고, 카피가 그 안 46퍼센트 지점에 작은 덩어리로 앉고,
 *   비주얼이 화면을 다 안 채워서 아래 여백이 산다. **셋이 같이 있어야 성립한다.**
 *
 * **슬롯은 빈 박스가 아니다.** 카드와 같은 표면(--card-bg)이라 판으로 읽히고, 카피가 그 위에
 * 얹혀 있어 자리의 용도가 보인다. 이미지가 오면 이 슬롯을 그대로 채우면 된다(풀블리드 cover).
 *
 * **전역 헤더가 없어져 상단 여백이 내비 높이로 바뀌었다.** 예전에는 68px이었다.
 */
function Hero() {
  const ref = useRef(null);

  // 진입 시퀀스. transform과 opacity만 쓴다(MOTION 11절).
  //
  // **gsap.context와 revert가 필수다.** 그냥 kill로 정리하면 StrictMode의 이중 마운트에서
  // 첫 타임라인이 남긴 인라인 스타일(opacity 0)이 그대로 있고, 두 번째 `from()`이 그 값을
  // **도착 상태로 읽어** 워드마크가 영원히 안 뜬다(실측으로 잡았다).
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const ctx = gsap.context(() => {
      // 모션을 줄여 달라고 했으면 등장을 생략한다. 원래 자리에 그대로 선다
      if (isReduced()) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      // 워드마크가 먼저 서고 나머지가 뒤따른다. 순서가 곧 위계다
      tl.from('[data-enter="wordmark"]', { opacity: 0, y: 28, duration: 0.7 })
        .from('[data-enter="eyebrow"]', { opacity: 0, y: 12, duration: 0.45 }, '-=0.35')
        .from('[data-enter="sub"]', { opacity: 0, y: 14, duration: 0.5 }, '-=0.3')
        .from('[data-enter="tail"]', { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, '-=0.25');
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      aria-label={HERO.wordmark}
      style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── 비주얼 슬롯. **전폭이다.** shell 거터를 뚫고 화면 끝까지 간다 ────── */}
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

        {/* **이미지 자리 표기.** 카피가 좌측을 쓰므로 우하단에 눕혀 겹치지 않는다 */}
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

        <div
          className="vx-shell"
          style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: spacing.unit }}
        >
          <div data-enter="eyebrow">
            <Eyebrow en={HERO.eyebrow.en} ko={HERO.eyebrow.ko} />
          </div>

          {/* **평면 잉크다.** 크롬 셰이더는 라이트 배경에서 대비 1.16:1이라 걷었다 */}
          <HeroWordmark text={HERO.wordmark} />

          <p data-enter="sub" style={{ ...leadStyle, marginTop: spacing.unit }}>
            {HERO.sub}
          </p>
        </div>
      </div>

      {/* ── 슬롯 아래 띠. **여기가 살아 있는 여백이다** ─────────────────────── */}
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
        <p data-enter="tail" style={captionStyle}>
          {HERO.team}
        </p>
        <p
          data-enter="tail"
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.hud.size,
            letterSpacing: typography.hud.tracking,
            fontWeight: typography.hud.weight,
            color: colors.text.primary,
          }}
        >
          {HERO.scrollHint}
        </p>
      </div>
    </section>
  );
}

/**
 * 탭 하나에 대응하는 섹션의 껍데기.
 *
 * **머리를 안 다는 탭이 둘 있다.** 마스크와 컨트롤러는 딥다이브가 자기 아이브로우와
 * 헤드라인과 리드를 이미 이고 있다. 여기서 또 달면 같은 문장이 한 섹션 안에서 두 번 뜬다
 * (실측으로 잡았다). 그때는 껍데기가 앵커와 여백만 준다.
 */
function SectionShell({ tab, bind, children }) {
  const copy = sections[tab.key];
  return (
    <section id={tab.key} ref={bind} className="vx-shell vx-pd-section" aria-label={tab.ko}>
      {copy ? (
        <div data-beat style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
          <Eyebrow en={tab.label} ko={tab.ko} />
          <h2 style={titleStyle}>{copy.title}</h2>
          <p style={leadStyle}>{copy.line}</p>
        </div>
      ) : null}
      {children}
    </section>
  );
}

/**
 * OVERVIEW. **안내 셋과 브랜드 소개가 여기 있다.**
 * 안내는 랜딩 관문에서 복구했고 목적지만 앵커로 바꿨다. 소개는 `/about` 세 블록이다.
 */
function OverviewBody({ onJump }) {
  const { naming, principles, team } = ABOUT;
  return (
    <>
      <div data-beat style={{ marginTop: spacing.unit * 3 }}>
        <MediaSlot />
      </div>

      {/* 아래에 무엇이 오는지 미리 말하는 자리. 상단 내비와 겹치는 것이 아니라
          Apple 오버뷰가 각 장을 요약해 두는 것과 같은 문법이다 */}
      <ul
        data-beat
        style={{
          listStyle: 'none',
          margin: `${spacing.unit * 5}px 0 0`,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.unit * 2,
        }}
      >
        {OVERVIEW_GUIDE.map((g) => (
          <li key={g.key}>
            <a
              href={`#${g.key}`}
              className="vx-guide vx-card"
              onClick={(e) => {
                e.preventDefault();
                onJump(g.key);
              }}
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
              <Eyebrow en={g.eyebrow} />
              <span className="vx-guide-title" style={{ ...titleStyle, color: colors.text.primary }}>
                {g.title}
              </span>
              <span style={{ ...captionStyle, lineHeight: 1.6 }}>{g.line}</span>
              <span
                aria-hidden="true"
                style={{
                  marginTop: 'auto',
                  fontFamily: typography.family,
                  fontSize: typography.caption.size,
                  letterSpacing: typography.hud.tracking,
                  fontWeight: weight.semibold,
                  color: colors.text.primary,
                }}
              >
                {g.link}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* 브랜드 소개 셋. 제품을 보기 전에 왜 만드는지가 먼저 온다 */}
      <div data-beat style={{ marginTop: spacing.unit * 6, display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 }}>
        <Eyebrow en={naming.eyebrow.en} ko={naming.eyebrow.ko} />
        <h3 style={titleStyle}>{naming.title}</h3>
        <p style={bodyStyle}>{naming.body}</p>
      </div>

      {/* **불릿 원이나 선을 두지 않는다**(R1). 존재감은 크기가 진다 */}
      <div data-beat style={{ marginTop: spacing.unit * 5, display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 }}>
        <h3 style={titleStyle}>{principles.title}</h3>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: spacing.unit * 1.5 }}>
          {principles.items.map((item) => (
            <li
              key={item}
              style={{
                fontFamily: typography.family,
                fontSize: typography.heading.size,
                fontWeight: typography.heading.weight,
                lineHeight: typography.heading.leading,
                color: colors.text.primary,
                wordBreak: 'keep-all',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div data-beat style={{ marginTop: spacing.unit * 5, display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 }}>
        <h3 style={titleStyle}>{team.title}</h3>
        <p style={bodyStyle}>{team.body}</p>
        <span style={captionStyle}>{team.imagePending}</span>
      </div>
    </>
  );
}

/**
 * MASK와 CONTROLLER. **고정 미디어 옆을 비트가 지나가고, 그 아래 특징과 사양이 온다.**
 *
 * 딥다이브는 `a7f73c2`에서, 특징과 사양은 `1f914ed`에서 복구했다.
 * 3D 뷰어가 이 탭의 대표 미디어다. 따로 미디어 슬롯을 두면 같은 자리가 두 벌이 된다.
 */
function ProductBody({ slug }) {
  const deep = PRODUCT_DEEPDIVE[slug];
  const features = PRODUCT_DETAIL.features[slug];
  const rows = PRODUCT_DETAIL.spec[slug];

  return (
    <>
      <div className="vx-dive">
        {/* **바깥은 행 전체를 차지하는 격자 칸이고 안쪽이 붙는다.** 한 겹을 안 두면
            격자 칸 높이가 콘텐츠 높이와 같아져 sticky가 붙을 여지 자체가 없다
            (실측으로 잡았다. top이 92까지 갔다가 그대로 밀려 올라갔다) */}
        <div className="vx-dive-media">
          <div className="vx-dive-media-inner">
            <ProductViewer slug={slug} />
          </div>
        </div>

        <div className="vx-dive-body">
          <div data-beat>
            <Eyebrow en={deep.eyebrow.en} ko={deep.eyebrow.ko} />
            {/* 제품명 자리. 이 페이지에서 display를 쓰는 유일한 곳이고,
                껍데기가 머리를 안 달았으므로 **이것이 이 섹션의 h2다** */}
            <h2
              style={{
                margin: '10px 0 0',
                fontFamily: typography.family,
                fontSize: typography.display.size,
                fontWeight: typography.display.weight,
                letterSpacing: typography.display.tracking,
                lineHeight: typography.display.leading,
                color: colors.text.primary,
                wordBreak: 'keep-all',
              }}
            >
              {deep.headline}
            </h2>
            <p style={{ ...bodyStyle, marginTop: spacing.unit * 2 }}>{deep.lead}</p>
          </div>

          {deep.beats.map((b) => (
            <div key={b.title} data-beat>
              <h3
                style={{
                  margin: 0,
                  fontFamily: typography.family,
                  fontSize: typography.heading.size,
                  fontWeight: typography.heading.weight,
                  letterSpacing: typography.heading.tracking,
                  color: colors.text.primary,
                }}
              >
                {b.title}
              </h3>
              <p style={{ ...bodyStyle, marginTop: spacing.unit }}>{b.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 특징 목록. 비트가 문장으로 펴 놓은 것을 한눈에 훑는 자리다 */}
      <div data-beat style={{ marginTop: spacing.unit * 5 }}>
        <span style={{ ...captionStyle, display: 'block', marginBottom: spacing.unit }}>
          {PRODUCT_DETAIL.featuresLabel}
        </span>
        {features && features.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: spacing.unit * 3, display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
            {features.map((it) => (
              <li key={it} style={bodyStyle}>{it}</li>
            ))}
          </ul>
        ) : (
          <span style={captionStyle}>{PRODUCT_DETAIL.featuresTodo}</span>
        )}
      </div>

      <Specs rows={rows} />
    </>
  );
}

/**
 * VISION. **유파 셀렉션이 여기 있다.**
 *
 * `/duelists`에서 복구했다. 마스크 비트가 이미 "마주 선 상대의 유파를 시야에 세워
 * 대응을 미리 고른다"고 말한다. **유파는 시야가 보여주는 것이라 비전화면이 제 자리다.**
 */
function VisionBody() {
  const [reduced, setReduced] = useState(false);
  // 렌더 중에 matchMedia를 읽지 않는다. 첫 페인트 뒤 한 번 정하고 셀렉터에 내린다
  useEffect(() => setReduced(isReduced()), []);

  return (
    <>
      <div data-beat style={{ marginTop: spacing.unit * 3 }}>
        <MediaSlot />
      </div>

      <div data-beat style={{ marginTop: spacing.unit * 5, display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 }}>
        <Eyebrow en={DUELISTS.header.eyebrow.en} ko={DUELISTS.header.eyebrow.ko} />
        <h3 style={titleStyle}>{DUELISTS.header.title}</h3>
        <p style={bodyStyle}>{DUELISTS.header.sub}</p>
        <span
          style={{
            fontFamily: typography.family,
            fontSize: typography.caption.size,
            fontWeight: weight.semibold,
            letterSpacing: typography.hud.tracking,
            color: colors.text.dim,
          }}
        >
          {DUELISTS.selection.guide}
        </span>
      </div>

      {/* **data-beat를 안 건다.** 셀렉터가 카드에 transform과 filter를 직접 쥐고 있어서
          등장 트윈이 그 값을 덮어쓰면 활성 카드의 배율이 어긋난다 */}
      <div style={{ marginTop: spacing.unit * 3 }}>
        <DuelistSelector reduced={reduced} />
      </div>
    </>
  );
}

/** EXPERIENCE. `/experience` 관문에서 복구했다. 3단계와 시연 연결과 주의 사항. */
function ExperienceBody() {
  return (
    <>
      <div data-beat style={{ marginTop: spacing.unit * 3 }}>
        <MediaSlot />
      </div>

      <div data-beat style={{ marginTop: spacing.unit * 5, display: 'flex', flexDirection: 'column', gap: spacing.unit * 3 }}>
        <p style={bodyStyle}>{EXPERIENCE.body}</p>

        {/* 3단계. 번호는 순서라 시각 요소가 아니라 내용이다.
            **번호 원 테두리는 없다**(REBOOT_PLAN 2.1). 크기와 색으로 선다 */}
        <ol
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.unit * 2,
          }}
        >
          {EXPERIENCE.steps.map((step, i) => (
            <li key={step} style={{ display: 'flex', alignItems: 'baseline', gap: spacing.unit * 1.5, paddingBlock: spacing.unit }}>
              <span
                style={{
                  flex: 'none',
                  fontFamily: typography.family,
                  fontSize: typography.eyebrow.size,
                  fontWeight: weight.bold,
                  lineHeight: 1,
                  color: colors.text.primary,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontFamily: typography.family, fontSize: typography.body.size, color: colors.text.primary, wordBreak: 'keep-all' }}>
                {step}
              </span>
            </li>
          ))}
        </ol>

        <ArenaCta label={PRODUCT_DETAIL.cta} />

        <p style={{ ...captionStyle, lineHeight: 1.6 }}>{EXPERIENCE.notice}</p>
      </div>
    </>
  );
}

/**
 * 짧은 브리지. **미디어가 없다.** 그 부재가 앞뒤 딥다이브를 갈라 준다
 * (Apple도 짧은 섹션에는 고정 미디어를 안 둔다. 실측에서 확인했다).
 */
function Bridge() {
  return (
    <section className="vx-shell" style={{ paddingBlock: 'calc(var(--section-gap) * 1.2)' }}>
      <div data-beat style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
        <Eyebrow en={bridge.eyebrow.en} ko={bridge.eyebrow.ko} />
        <p style={titleStyle}>{bridge.line}</p>
      </div>
    </section>
  );
}

/**
 * 미디어 자리. **빈 박스가 아니다.** 카드와 같은 표면이고 이미지가 오면 cover로 덮는다.
 * 마스크와 컨트롤러 탭은 3D 뷰어가 이 노릇을 해서 이것을 안 쓴다.
 */
function MediaSlot() {
  return (
    <div className="vx-card vx-pd-media" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={captionStyle}>{MEDIA_PENDING}</span>
    </div>
  );
}

/** 사양 표. 값이 미정인 행도 이름은 확정이라 행을 세워 둔다. */
function Specs({ rows }) {
  if (!rows || rows.length === 0) return <span style={captionStyle}>{PRODUCT_DETAIL.specTodo}</span>;
  return (
    <div data-beat style={{ marginTop: spacing.unit * 5 }}>
      <span style={{ ...captionStyle, display: 'block', marginBottom: spacing.unit }}>{PRODUCT_SITE.specLabel}</span>
      <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
        {rows.map((r) => (
          <div key={r.name} style={{ display: 'flex', gap: spacing.unit * 3 }}>
            <dt style={{ ...bodyStyle, color: colors.text.dim, flex: 'none', minWidth: 120 }}>{r.name}</dt>
            <dd style={{ ...bodyStyle, margin: 0 }}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const titleStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.title.size,
  fontWeight: typography.title.weight,
  letterSpacing: typography.title.tracking,
  lineHeight: typography.title.leading,
  color: colors.text.primary,
  wordBreak: 'keep-all',
};

const leadStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.heading.size,
  lineHeight: typography.heading.leading,
  color: colors.text.secondary,
  maxWidth: 'var(--measure)',
  wordBreak: 'keep-all',
};

const bodyStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  lineHeight: typography.body.leading,
  color: colors.text.secondary,
  maxWidth: 'var(--measure)',
  wordBreak: 'keep-all',
};

const captionStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  color: colors.text.dim,
  wordBreak: 'keep-all',
};
