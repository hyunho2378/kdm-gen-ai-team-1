// 제품 상세. **Apple Vision Pro 로컬 내비 구조다(PD-1).**
//
// 상단에 서브내비가 붙고 그 아래로 OVERVIEW / TECH SPECS / EXPERIENCE 세 앵커 섹션이 흐른다.
// 서브내비는 스크롤을 따라 붙어 있고 현재 섹션을 밑줄로 표시한다(구조는 ProductNav 주석 참고).
//
// **내부 탭을 걷어냈다.** 예전에는 OVERVIEW/FEATURES를 패널로 갈아 끼웠는데,
// 서브내비 3탭과 개념이 겹쳐 같은 이름의 탭이 두 벌로 읽혔다. 이제 패널이 아니라 섹션이고
// 스펙은 TECH SPECS로, 특징은 OVERVIEW로 자리를 나눠 갔다.
//
// **각 섹션의 실제 내용은 PD-2~5가 채운다.** 여기 있는 것은 골격과 자리표시뿐이다.
//
// ── 3D 무대는 OVERVIEW 안에 남는다 ──────────────────────────────────────────
// Kew 문법(판 없이 3D가 배경 위에 직접 뜨고 글자가 옆에 얹힌다)은 그대로다.
// 3D는 상시 autoRotate라 밝은 면이 글자 뒤를 지나가면 대비가 무너지는데, 격자 열을 갈라
// 겹침을 원천 차단한다(실측 교집합 0). 좁은 폭에서는 3D가 먼저 서고 글이 그 아래다.
//
// **없는 slug는 여기 오지 않는다.** App이 있는 제품만 라우트로 열고 나머지는 전역 NotFound가 받는다.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, radius, spacing, typography, weight } from '../tokens.js';
import { PRODUCTS, PRODUCT_DETAIL, PRODUCT_NAV, PRODUCT_SECTION_PENDING, MEDIA_PENDING } from '../copy.js';
import { captureFlip, playFlip } from '../lib/flip.js';
import ArenaCta from '../components/ArenaCta.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import ProductNav from '../components/ProductNav.jsx';
import ProductViewer from '../components/ProductViewer.jsx';

const TABS = PRODUCT_NAV.tabs;

export default function ProductDetail({ slug }) {
  const product = PRODUCTS.cards.find((p) => p.slug === slug);
  const visualRef = useRef(null);
  const sectionRefs = useRef({});
  const [active, setActive] = useState(TABS[0].key);

  // 카드에서 넘어온 전환을 여기서 재생한다. 기록이 없으면 아무 일도 없다.
  // **스크롤을 먼저 맨 위로 보낸다.** 그때 스크롤이 바뀌면 날아가는 도중에 목표가 움직인다
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setActive(TABS[0].key);
    playFlip(visualRef.current);
  }, [slug]);

  /**
   * 현재 섹션 추적. **서브내비 바로 아래 선을 기준으로 판정한다.**
   * 화면 한가운데를 기준으로 하면 섹션이 짧을 때 건너뛰어 표시가 튄다.
   * IntersectionObserver의 rootMargin으로 그 선을 만든다.
   */
  useEffect(() => {
    const nodes = TABS.map((t) => sectionRefs.current[t.key]).filter(Boolean);
    if (nodes.length === 0) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        // 걸린 것 중 가장 위에 있는 것이 현재다
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit?.target?.id) setActive(hit.target.id);
      },
      // 위에서 헤더와 서브내비 높이만큼 잘라내고 아래는 크게 잘라 한 번에 하나만 걸리게 한다
      { rootMargin: '-124px 0px -62% 0px', threshold: 0 }
    );
    for (const n of nodes) io.observe(n);
    return () => io.disconnect();
  }, [slug]);

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
      <ProductNav productName={product.name} active={active} onJump={jump} />

      <main className="vx-shell" style={{ paddingBottom: 'var(--section-gap)' }}>
        {/* 라벨이 "제품군으로"라서 실제로 제품군 인덱스로 간다. 돌아갈 때도 같은 요소가 카드 자리로 접힌다 */}
        <Link
          to="/products"
          style={{ ...backStyle, marginTop: spacing.unit * 3 }}
          onClick={() => captureFlip(visualRef.current)}
        >
          {PRODUCT_DETAIL.back}
        </Link>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────
            PD-2가 히어로 풀블리드와 큰 텍스트 스테이트먼트로 채운다.
            지금은 기존 Kew 무대(3D + 한 줄 + 특징)를 그대로 안고 있다 */}
        <section id="overview" ref={bind('overview')} className="vx-pd-section" aria-label={TABS[0].label}>
          <SectionHead tab={TABS[0]} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 1.5, minWidth: 0 }}>
            <Eyebrow en={product.name} />
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
                maxWidth: 'var(--measure)',
                wordBreak: 'keep-all',
              }}
            >
              {product.line}
            </p>
          </div>

          <div className="vx-kew" style={{ marginTop: spacing.unit * 3 }}>
            {/* 3D 무대. 판도 보더도 라운드도 없다. 카드와 같은 flip id로 전환의 짝을 잇는다 */}
            <div ref={visualRef} data-flip-id={`product-${product.slug}`} className="vx-kew-stage">
              <ProductViewer slug={product.slug} />
            </div>

            <div className="vx-kew-info" style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 2, minWidth: 0 }}>
              <p style={bodyStyle}>{product.detail}</p>
              <Features slug={product.slug} />
              <span style={todoStyle}>{PRODUCT_SECTION_PENDING.overview}</span>
            </div>
          </div>
        </section>

        {/* ── TECH SPECS ───────────────────────────────────────────────────
            PD-4가 대표 사진과 In the Box 벤토 그리드로 채운다.
            지금은 확정된 스펙 행만 세워 둔다 */}
        <section id="specs" ref={bind('specs')} className="vx-pd-section" aria-label={TABS[1].label}>
          <SectionHead tab={TABS[1]} />
          <MediaSlot />
          <Specs slug={product.slug} />
          <span style={todoStyle}>{PRODUCT_SECTION_PENDING.specs}</span>
        </section>

        {/* ── EXPERIENCE ───────────────────────────────────────────────────
            PD-5가 영상 경험으로 채운다. Book a demo가 arena로 나가는 자리이기도 하다 */}
        <section id="experience" ref={bind('experience')} className="vx-pd-section" aria-label={TABS[2].label}>
          <SectionHead tab={TABS[2]} />
          <MediaSlot />
          {product.demoCta ? (
            <ArenaCta label={PRODUCT_DETAIL.cta} />
          ) : (
            <span style={todoStyle}>{PRODUCT_SECTION_PENDING.experience}</span>
          )}
        </section>
      </main>
    </>
  );
}

/** 섹션 머리. 영문 라벨과 국문을 함께 세운다(영문만으로는 무엇인지 안 읽힌다). */
function SectionHead({ tab }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 0.5, marginBottom: spacing.unit * 2 }}>
      <SectionLabel>{tab.label}</SectionLabel>
      <span style={{ fontFamily: typography.family, fontSize: typography.caption.size, color: colors.text.dim }}>
        {tab.ko}
      </span>
    </div>
  );
}

/**
 * 미디어 자리. **빈 박스가 아니다.** 히어로 슬롯과 같은 표면이고
 * 이미지가 오면 이 자리를 cover로 덮는다(PD-2 이후).
 */
function MediaSlot() {
  return (
    <div className="vx-card" style={{ height: '38vh', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={todoStyle}>{MEDIA_PENDING}</span>
    </div>
  );
}

/** 스펙 표. 값이 미정인 행도 이름은 확정이라 행을 세워 둔다. */
function Specs({ slug }) {
  const rows = PRODUCT_DETAIL.spec[slug];
  if (rows.length === 0) return <span style={todoStyle}>{PRODUCT_DETAIL.specTodo}</span>;
  return (
    <dl style={{ margin: `${spacing.unit * 2}px 0 0`, display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
      {rows.map((r) => (
        <div key={r.name} style={{ display: 'flex', gap: spacing.unit * 3 }}>
          <dt style={{ ...bodyStyle, color: colors.text.dim, flex: 'none', minWidth: 96 }}>{r.name}</dt>
          <dd style={{ ...bodyStyle, margin: 0 }}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** FEATURES 패널. 특징 목록이다. 아직 비어 있다. */
function Features({ slug }) {
  const items = PRODUCT_DETAIL.features[slug];
  if (items.length === 0) return <span style={todoStyle}>{PRODUCT_DETAIL.featuresTodo}</span>;
  return (
    <ul style={{ margin: 0, paddingLeft: spacing.unit * 3, display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
      {items.map((it) => (
        <li key={it} style={bodyStyle}>{it}</li>
      ))}
    </ul>
  );
}

function SectionLabel({ children }) {
  return (
    <span
      style={{
        fontFamily: typography.family,
        fontSize: typography.caption.size,
        fontWeight: weight.semibold,
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

const bodyStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  lineHeight: typography.body.leading,
  color: colors.text.secondary,
  wordBreak: 'keep-all',
};

const todoStyle = {
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  color: colors.text.dim,
};

// **아웃라인 버튼의 테두리는 남긴다.** 이건 장식이 아니라 버튼의 형태다.
// 테두리가 없으면 본문 링크와 구분되지 않아 누를 수 있다는 것이 안 읽힌다
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
