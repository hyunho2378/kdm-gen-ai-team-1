// 제품 상세 3종 공통 골격(BRAND_SITE_GUIDE 2.3). 오버워치 무기 상세 문법이다.
//
// 4구역. 왼쪽 세로 탭, 중앙 360 뷰어, 뷰어 아래 정보 패널, 하단 CTA.
// **탭은 뷰어를 바꾸지 않는다.** 오버워치에서 스킨 리스트가 무기를 갈아 끼우는 자리를
// 여기서는 정보 탭이 대신하고, 제품은 하나뿐이라 뷰어는 상시 유지된다.
//
// 셋이 같은 컴포넌트를 쓴다. 갈리는 것은 히어로 제목과 CTA 유무뿐이다.
//
// **없는 slug는 여기 오지 않는다.** App이 있는 제품만 라우트로 열고 나머지는 전역 NotFound가 받는다.

import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, radius, spacing, typography } from '../tokens.js';
import { PRODUCTS, PRODUCT_DETAIL } from '../copy.js';
import { captureFlip, playFlip } from '../lib/flip.js';
import ArenaCta from '../components/ArenaCta.jsx';
import ProductViewer from '../components/ProductViewer.jsx';

const TABS = PRODUCT_DETAIL.tabs;

export default function ProductDetail({ slug }) {
  const product = PRODUCTS.cards.find((p) => p.slug === slug);
  const visualRef = useRef(null);
  const tabRefs = useRef({});
  const [tab, setTab] = useState(TABS[0].key);

  // 카드에서 넘어온 전환을 여기서 재생한다. 기록이 없으면(주소 직접 입력, reduced motion)
  // 아무 일도 일어나지 않고 페이지는 그냥 서 있다.
  //
  // **스크롤을 먼저 맨 위로 보낸다.** ScrollToTop은 useEffect라 이 layout effect 뒤에 도는데,
  // 그때 스크롤이 바뀌면 날아가는 도중에 목표 자리가 움직여 어긋난다.
  //
  // 탭도 함께 처음으로 돌린다. 라우터가 같은 컴포넌트를 재사용하면 앞 제품의 탭이 남는다
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setTab(TABS[0].key);
    playFlip(visualRef.current);
  }, [slug]);

  /** 화살표로 탭을 옮긴다. 세로 목록이라 위아래가 기본이고 좌우도 같이 받는다. */
  function onTabKeyDown(e) {
    const i = TABS.findIndex((t) => t.key === tab);
    let next = -1;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const key = TABS[next].key;
    setTab(key);
    // 포커스가 따라가야 다음 화살표가 이어서 먹는다
    tabRefs.current[key]?.focus();
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit * 3,
        // 위쪽만 고정 헤더 높이(68)를 더한다
        padding: `calc(${spacing.section} + 68px) ${spacing.gutter} ${spacing.section}`,
        maxWidth: spacing.maxContent,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 라벨이 "제품군으로"라서 실제로 제품군 인덱스로 간다. 이력이 아니라 자리로 돌아간다.
          돌아갈 때도 같은 요소가 카드 자리로 접힌다 */}
      <Link to="/products" style={backStyle} onClick={() => captureFlip(visualRef.current)}>
        {PRODUCT_DETAIL.back}
      </Link>

      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          fontWeight: 600,
          letterSpacing: typography.hud.tracking,
          color: colors.red.light,
        }}
      >
        {product.name}
      </span>

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
          maxWidth: 640,
          wordBreak: 'keep-all',
        }}
      >
        {product.line}
      </p>

      {/* 좁은 폭에서는 한 열로 접혀 탭, 뷰어, 패널 순으로 선다(index.css) */}
      <div className="vx-detail">
        {/* 구역 1. 왼쪽 탭 */}
        <div
          className="vx-tablist"
          role="tablist"
          aria-label={PRODUCT_DETAIL.tabsLabel}
          aria-orientation="vertical"
        >
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <button
                key={t.key}
                ref={(el) => { tabRefs.current[t.key] = el; }}
                type="button"
                role="tab"
                id={`tab-${t.key}`}
                aria-selected={on}
                aria-controls={`panel-${t.key}`}
                // 로빙 탭인덱스. 탭키는 목록 전체를 한 번만 지난다
                tabIndex={on ? 0 : -1}
                onClick={() => setTab(t.key)}
                onKeyDown={onTabKeyDown}
                style={{ ...tabStyle, borderColor: on ? colors.line.strong : 'transparent' }}
              >
                {/* 아이브로우 문법의 레드 점. **색 단독 구분 금지라 굵기도 같이 올린다**(DESIGN 13절) */}
                <span
                  aria-hidden="true"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    flex: 'none',
                    background: on ? colors.red.light : 'transparent',
                    border: on ? 'none' : `1px solid ${colors.line.strong}`,
                  }}
                />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                  <span
                    style={{
                      fontSize: typography.caption.size,
                      fontWeight: on ? 700 : 600,
                      letterSpacing: typography.hud.tracking,
                      color: on ? colors.text.primary : colors.text.dim,
                    }}
                  >
                    {t.label}
                  </span>
                  <span style={{ fontSize: typography.caption.size, color: colors.text.dim }}>
                    {t.ko}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 2, minWidth: 0 }}>
          {/* 구역 2. 360 뷰어. **카드 썸네일과 같은 `data-flip-id`를 단다.** 이것이 전환의 짝이다.
              탭이 바뀌어도 이 자리는 그대로다 */}
          <div
            ref={visualRef}
            data-flip-id={`product-${product.slug}`}
            style={{
              position: 'relative',
              aspectRatio: '16 / 9',
              // 좁은 폭에서 16대9는 너무 납작해 제품이 안 보인다. 바닥을 깐다
              minHeight: 240,
              overflow: 'hidden',
              borderRadius: radius.lg,
              border: `1px solid ${colors.line.default}`,
              background: colors.bg.raised,
            }}
          >
            <ProductViewer slug={product.slug} />
          </div>

          {/* 구역 3. 탭 정보 패널. 뷰어 아래에 붙어 뷰어를 밀어내지 않는다 */}
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.unit * 1.5,
              padding: spacing.unit * 2,
              borderRadius: radius.lg,
              border: `1px solid ${colors.line.default}`,
              background: colors.bg.raised,
            }}
          >
            {tab === 'overview' ? <Overview product={product} /> : <Features slug={product.slug} />}
          </div>
        </div>
      </div>

      {/* 구역 4. 하단 CTA. 데모가 있는 제품만 arena로 나간다.
          모의 검 컨트롤러는 단독 체험이 없어 CTA 없이 되돌아가는 길만 둔다 */}
      <section style={blockStyle}>
        {product.demoCta ? (
          <>
            <SectionLabel>{PRODUCT_DETAIL.labels.experience}</SectionLabel>
            <ArenaCta label={PRODUCT_DETAIL.cta} />
          </>
        ) : (
          <Link to="/products" style={backStyle} onClick={() => captureFlip(visualRef.current)}>
            {PRODUCT_DETAIL.back}
          </Link>
        )}
      </section>
    </main>
  );
}

/** OVERVIEW 패널. 확정된 설명 한 문단과 스펙표다. 스펙은 아직 비어 있다. */
function Overview({ product }) {
  const rows = PRODUCT_DETAIL.spec[product.slug];
  return (
    <>
      <p style={bodyStyle}>{product.detail}</p>
      {rows.length === 0 ? (
        <span style={todoStyle}>{PRODUCT_DETAIL.specTodo}</span>
      ) : (
        <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((r) => (
            <div key={r.name} style={{ display: 'flex', gap: 24 }}>
              <dt style={{ ...bodyStyle, color: colors.text.dim, flex: 'none', minWidth: 96 }}>{r.name}</dt>
              <dd style={{ ...bodyStyle, margin: 0 }}>{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}

/** FEATURES 패널. 특징 목록이다. 아직 비어 있다. */
function Features({ slug }) {
  const items = PRODUCT_DETAIL.features[slug];
  if (items.length === 0) return <span style={todoStyle}>{PRODUCT_DETAIL.featuresTodo}</span>;
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        fontWeight: 600,
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

const tabStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  // 터치 타깃 44px
  minHeight: 44,
  padding: '10px 12px',
  borderRadius: radius.md,
  border: '1px solid transparent',
  background: 'transparent',
  fontFamily: typography.family,
  cursor: 'pointer',
  textAlign: 'left',
};

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
