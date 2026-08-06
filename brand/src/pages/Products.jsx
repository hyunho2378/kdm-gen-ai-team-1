// 제품 사이트. **브랜드 사이트의 유일한 페이지다.** 5탭 섹션이 세로로 이어진다.
//
// ── Apple 섹션 문법 (12섹션 실측, 이 파일이 재현 대상으로 삼는 것) ────────────
//
//   미디어      대부분 1425x704. 화면 폭을 꽉 채우는 가로 와이드가 각 섹션의 주인공
//   텍스트      소제목 24px + 짧은 문장. 미디어 위나 옆에 절제되게
//   스테이트먼트 전환 지점에 56px 큰 문장 하나짜리 섹션
//   딥다이브     핵심 구간 7000~10000px. 그 동안 미디어가 고정되고 텍스트가 순차로 바뀐다
//   브리지       짧은 섹션(756px)이 딥다이브 사이를 끊는다
//   영상        한 섹션은 영상 풀블리드
//
// **카드 나열을 두지 않는다.** 안내 카드 셋과 비트 스택과 사양 표가 그 나열이었다.
//
//   안내 카드 셋  -> 전환 스테이트먼트 셋(문장은 그대로, 부제와 링크 라벨은 갈 곳이 없다)
//   비트 스택     -> 딥다이브의 순차 텍스트. 한 번에 하나만 서고 스크롤이 다음으로 넘긴다
//   유파 3카드    -> 유파 딥다이브. 고정 미디어 옆을 셋이 차례로 지나간다
//   사양 표       -> 화면에서 뺐다. copy.js에 남아 있고 사양 면이 생기면 그 자리를 쓴다
//   특징 목록     -> 걷었다. 딥다이브 비트가 같은 사실을 이미 문장으로 편다
//
// **탭은 라우트가 아니라 앵커다.** 다섯이 한 페이지에 흐르고 내비가 현재 섹션을 밑줄로 표시한다.
//
// 미디어는 전부 첨부 예정 슬롯이다. 이미지와 영상 에셋은 리포에 하나도 없다.
// **Apple의 이미지와 영상과 문구는 복제하지 않는다.** 구조와 스크롤 문법만 재현한다.

import { Fragment, useEffect, useRef, useState } from 'react';
import { colors, spacing, typography } from '../tokens.js';
import {
  ABOUT,
  DUELISTS,
  EXPERIENCE,
  HERO,
  MEDIA_PENDING,
  PRODUCT_DEEPDIVE,
  PRODUCT_DETAIL,
  PRODUCT_NAV,
  PRODUCT_SITE,
  STATEMENTS,
  VIDEO_PENDING,
} from '../copy.js';
import { gsap, ScrollTrigger, isReduced } from '../lib/motion.js';
import ArenaCta from '../components/ArenaCta.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import Footer from '../components/Footer.jsx';
import HeroTrail from '../components/HeroTrail.jsx';
import HeroWordmark from '../components/HeroWordmark.jsx';
import ProductNav from '../components/ProductNav.jsx';
import ProductViewer from '../components/ProductViewer.jsx';

const TABS = PRODUCT_NAV.tabs;
const { bridge, sections } = PRODUCT_SITE;

/** 내비가 실측해 내보내는 바 높이. 붙는 자리와 판정선이 같은 값을 본다. */
function navH() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pnav-h')) || 52;
}

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
      // 여백 24는 `scroll-margin-top`의 16보다 커야 착지 직후가 현재로 잡힌다.
      // **높이를 숫자로 적으면 좁은 화면에서 틀린다.** 바가 두 줄로 접히면 52가 아니라 147이다
      const line = navH() + 24;
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

  const statementBefore = (key) => STATEMENTS.find((st) => st.before === key);

  return (
    <>
      <ProductNav productName={HERO.wordmark} active={active} onJump={jump} />

      <main ref={rootRef}>
        <Hero />

        {TABS.map((t) => {
          const st = statementBefore(t.key);
          return (
            <Fragment key={t.key}>
              {/* 전환 스테이트먼트. 다음 탭을 여는 큰 문장 하나다 */}
              {st ? <Statement line={st.line} /> : null}

              <section id={t.key} ref={bind(t.key)} className="vx-pd-section" aria-label={t.ko}>
                {t.key === 'overview' ? <Overview /> : null}
                {t.key === 'mask' || t.key === 'controller' ? <ProductDive slug={t.key} /> : null}
                {t.key === 'vision' ? <Vision /> : null}
                {t.key === 'experience' ? <Experience /> : null}
              </section>

              {/* 두 제품 딥다이브 **사이에만** 브리지가 온다 */}
              {t.key === 'mask' ? <Bridge /> : null}
            </Fragment>
          );
        })}
      </main>

      {/* 랜딩이 사라지면서 갈 곳을 잃은 크레딧과 팀과 저작권이 여기로 내려왔다 */}
      <Footer />
    </>
  );
}

/**
 * 히어로. 랜딩 히어로를 Apple 문법으로 맞췄다.
 * **미디어가 주인공이다.** 와이드 슬롯이 화면 폭을 다 쓰고 카피가 그 안에 작게 앉는다.
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
      tl.from('[data-enter="wordmark"]', { opacity: 0, y: 28, duration: 0.7 })
        .from('[data-enter="eyebrow"]', { opacity: 0, y: 12, duration: 0.45 }, '-=0.35')
        .from('[data-enter="sub"]', { opacity: 0, y: 14, duration: 0.5 }, '-=0.3')
        .from('[data-enter="tail"]', { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, '-=0.25');
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-label={HERO.wordmark} style={{ paddingBottom: spacing.unit * 4 }}>
      <div className="vx-wide" style={{ justifyContent: 'flex-start' }}>
        {/* 검끝 궤적. 슬롯 안에서만 돈다. 라이트에서 보이게 잉크와 일반 합성으로 바꿨다 */}
        <HeroTrail />

        {/* **이미지 자리 표기.** 카피가 좌측을 쓰므로 우하단에 눕혀 겹치지 않는다 */}
        <span
          data-enter="tail"
          style={{
            position: 'absolute',
            right: 'var(--page-gutter)',
            bottom: spacing.unit * 2,
            ...captionStyle,
            letterSpacing: typography.hud.tracking,
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

      {/* 슬롯 아래 띠. 팀 표기와 스크롤 단서만 눕힌다 */}
      <div
        className="vx-shell"
        style={{
          marginTop: spacing.unit * 3,
          display: 'flex',
          justifyContent: 'space-between',
          gap: spacing.unit * 2,
          flexWrap: 'wrap',
        }}
      >
        <p data-enter="tail" style={captionStyle}>{HERO.team}</p>
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
 * 전환 스테이트먼트. **큰 문장 하나뿐인 섹션이다**(Apple 56px 자리).
 * 미디어도 부제도 두지 않는다. 그 비어 있음이 앞뒤를 갈라 준다.
 */
function Statement({ line }) {
  return (
    <section className="vx-shell" style={{ paddingBlock: 'calc(var(--section-gap) * 1.4)' }}>
      <p
        data-beat
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.display.size,
          fontWeight: typography.display.weight,
          letterSpacing: typography.display.tracking,
          lineHeight: typography.display.leading,
          color: colors.text.primary,
          maxWidth: 'var(--measure)',
          wordBreak: 'keep-all',
        }}
      >
        {line}
      </p>
    </section>
  );
}

/**
 * 짧은 브리지. **미디어가 없다.** 그 부재가 앞뒤 딥다이브를 갈라 준다
 * (Apple의 브리지도 756px 짧은 섹션이고 고정 미디어가 없다. 실측에서 확인했다).
 */
function Bridge() {
  return (
    <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
      <div data-beat style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
        <Eyebrow en={bridge.eyebrow.en} ko={bridge.eyebrow.ko} />
        <p style={titleStyle}>{bridge.line}</p>
      </div>
    </section>
  );
}

/**
 * 와이드 미디어 섹션 하나. **큰 미디어 + 소제목 + 짧은 문장.** 이 셋이 전부다.
 * `bare`면 판을 깔지 않는다(3D 캔버스가 투명해 페이지 배경이 비쳐야 하는 자리).
 */
function WideSection({ label, title, line, pending, children, bare }) {
  return (
    <>
      <div data-beat className={`vx-bleed vx-wide${bare ? ' vx-wide-bare' : ''}`}>
        {children ?? <span style={captionStyle}>{pending}</span>}
      </div>
      <div
        className="vx-shell"
        data-beat
        style={{ marginTop: spacing.unit * 3, display: 'flex', flexDirection: 'column', gap: spacing.unit }}
      >
        {label ? <Eyebrow en={label.en} ko={label.ko} /> : null}
        <h2 style={headingStyle}>{title}</h2>
        <p style={bodyStyle}>{line}</p>
      </div>
    </>
  );
}

/** OVERVIEW. 큰 미디어 둘. 하나는 두 장치, 하나는 이름의 뜻이다. */
function Overview() {
  const tab = TABS[0];
  const copy = sections.overview;
  const { naming, principles } = ABOUT;
  return (
    <>
      <WideSection label={{ en: tab.label, ko: tab.ko }} title={copy.title} line={copy.line} pending={MEDIA_PENDING} />

      <div style={{ marginTop: 'var(--section-gap)' }}>
        <WideSection label={naming.eyebrow} title={naming.title} line={naming.body} pending={MEDIA_PENDING} />
      </div>

      {/* 원칙 셋. **목록으로 눕히지 않는다.** 줄바꿈 하나로 이어진 한 덩어리의 큰 문장이다 */}
      <div className="vx-shell" data-beat style={{ marginTop: 'var(--section-gap)' }}>
        <p style={{ ...titleStyle, whiteSpace: 'pre-line' }}>{principles.items.join('\n')}</p>
      </div>
    </>
  );
}

/**
 * 제품 딥다이브. **미디어가 고정되고 텍스트가 순차로 바뀐다.**
 *
 * 예전에는 비트 넷이 세로로 쌓여 한 화면에 다 보였다. 그것이 카드 나열이라, Apple의
 * 긴 딥다이브(7000~10000px)처럼 **한 번에 하나만 세우고 스크롤이 다음으로 넘긴다.**
 */
function ProductDive({ slug }) {
  const deep = PRODUCT_DEEPDIVE[slug];
  const steps = [{ title: deep.headline, body: deep.lead }, ...deep.beats];
  return <Dive label={deep.eyebrow} steps={steps} media={<ProductViewer slug={slug} />} bare headingOnFirst />;
}

/**
 * VISION. 큰 미디어 하나로 비전화면을 세우고, 유파 셋은 딥다이브로 지나간다.
 *
 * **유파 3카드를 걷었다.** 나란한 세 장이 곧 카드 나열이라, 고정 미디어 옆을 셋이
 * 차례로 지나가는 문법으로 옮겼다. 유파와 성향과 스타일과 인용은 그대로다.
 */
function Vision() {
  const tab = TABS.find((t) => t.key === 'vision');
  const copy = sections.vision;
  const steps = DUELISTS.cards.map((d) => ({
    title: d.name,
    body: d.style,
    note: d.quote,
    kicker: `${d.ver} ${d.trait}`,
  }));
  return (
    <>
      <WideSection label={{ en: tab.label, ko: tab.ko }} title={copy.title} line={copy.line} pending={MEDIA_PENDING} />
      <div style={{ marginTop: 'var(--section-gap)' }}>
        <Dive label={DUELISTS.header.eyebrow} steps={steps} media={<span style={captionStyle}>{MEDIA_PENDING}</span>} />
      </div>
    </>
  );
}

/** EXPERIENCE. **영상 풀블리드다**(Apple도 열두 섹션 중 하나를 영상으로 쓴다). */
function Experience() {
  const tab = TABS.find((t) => t.key === 'experience');
  const copy = sections.experience;
  return (
    <>
      <WideSection label={{ en: tab.label, ko: tab.ko }} title={copy.title} line={copy.line} pending={VIDEO_PENDING} />
      <div
        className="vx-shell"
        data-beat
        style={{ marginTop: spacing.unit * 3, display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 }}
      >
        <p style={bodyStyle}>{EXPERIENCE.body}</p>
        <p style={{ ...captionStyle, letterSpacing: typography.hud.tracking }}>{EXPERIENCE.flow}</p>
        <ArenaCta label={PRODUCT_DETAIL.cta} />
        <p style={captionStyle}>{EXPERIENCE.notice}</p>
      </div>
    </>
  );
}

/**
 * 딥다이브 한 편. 바깥이 스크롤 길이를 만들고 안쪽이 붙는다.
 *
 * **단계마다 한 화면씩 준다.** Apple의 핵심 딥다이브가 7000~10000px인 자리이고,
 * 다섯 단계면 500dvh라 그 대역에 든다.
 *
 * **모든 단계가 DOM에 있다.** 안 보이는 것은 `opacity: 0`일 뿐이라 스크린리더는 전부
 * 읽는다. 순차는 눈에만 걸리는 연출이고 내용을 감추지 않는다.
 */
function Dive({ label, steps, media, bare, headingOnFirst }) {
  const ref = useRef(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const pick = () => {
      const r = el.getBoundingClientRect();
      const top = navH();
      // 무대가 붙어 있는 동안의 진행. 스크롤 길이에서 무대 한 벌을 뺀 것이 분모다
      const travel = r.height - (window.innerHeight - top);
      const p = travel > 0 ? (top - r.top) / travel : 0;
      setAt(Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length))));
    };
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    pick();
    return () => {
      window.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, [steps.length]);

  return (
    <div ref={ref} className="vx-bleed" style={{ height: `${steps.length * 100}dvh` }}>
      <div className="vx-stage-inner">
        <div className={`vx-wide${bare ? ' vx-wide-bare' : ''}`}>{media}</div>

        <div className="vx-shell">
          <div className="vx-stage-text">
            {steps.map((s, i) => (
              <div key={s.title} className="vx-stage-step" data-on={i === at ? 'true' : 'false'}>
                {/* 아이브로우는 첫 단계에만. 매 단계 되풀이하면 그것이 나열로 읽힌다 */}
                {i === 0 && label ? <Eyebrow en={label.en} ko={label.ko} /> : null}
                {s.kicker ? <p style={{ ...captionStyle, marginBottom: spacing.unit * 0.5 }}>{s.kicker}</p> : null}
                {i === 0 && headingOnFirst ? (
                  <h2 style={{ ...titleStyle, marginTop: spacing.unit }}>{s.title}</h2>
                ) : (
                  <h3 style={{ ...headingStyle, marginTop: i === 0 ? spacing.unit : 0 }}>{s.title}</h3>
                )}
                <p style={{ ...bodyStyle, marginTop: spacing.unit }}>{s.body}</p>
                {s.note ? <p style={{ ...captionStyle, marginTop: spacing.unit }}>{s.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Apple 실측 위계. 스테이트먼트 56px, 소제목 24px, 본문 17px. 우리 토큰이 그 자리를 맡는다
const titleStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.title.size,
  fontWeight: typography.title.weight,
  letterSpacing: typography.title.tracking,
  lineHeight: typography.title.leading,
  color: colors.text.primary,
  maxWidth: 'var(--measure)',
  wordBreak: 'keep-all',
};

const headingStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.heading.size,
  fontWeight: typography.heading.weight,
  letterSpacing: typography.heading.tracking,
  lineHeight: typography.heading.leading,
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
