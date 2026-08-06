// 제품 상세 2종 공통 골격. **Kew 오크 문법이다**(REBOOT_PLAN 3.3).
//
// 박스형 4구역을 해체했다. 3D는 판 없이 페이지 배경 위에 직접 뜨고,
// 좌측 상단에 페이지 위계(제품명, 탭), 우측에 정보 텍스트가 배경 없이 얹힌다.
//
// **탭은 뷰어를 바꾸지 않는다.** 제품은 하나뿐이라 뷰어는 상시 유지되고 오른쪽 글자만 갈린다.
//
// ── 대비를 배치로 지킨다 ────────────────────────────────────────────────────
// 3D는 상시 autoRotate라 밝은 크롬 면이 글자 뒤를 지나가면 그 순간 대비가 무너진다.
// **그림자나 딤 판으로 때우지 않는다.** 격자 열은 서로 겹칠 수 없으므로 3D를 왼쪽 열에,
// 정보를 오른쪽 열에 두는 것 자체가 보증이 된다(실측 교집합 0). 좁은 폭에서 한 열로
// 쌓일 때도 3D가 먼저 서고 정보가 그 아래라 글자가 3D 위에 얹히지 않는다.
//
// **없는 slug는 여기 오지 않는다.** App이 있는 제품만 라우트로 열고 나머지는 전역 NotFound가 받는다.

import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, radius, spacing, typography } from '../tokens.js';
import { PRODUCTS, PRODUCT_DETAIL } from '../copy.js';
import { captureFlip, playFlip } from '../lib/flip.js';
import ArenaCta from '../components/ArenaCta.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
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
      className="vx-shell vx-page"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        // 3D가 주인공이라 블록 사이 여백을 한 칸 줄여 세로를 3D에 넘긴다
        gap: spacing.unit * 2,
      }}
    >
      {/* 라벨이 "제품군으로"라서 실제로 제품군 인덱스로 간다. 이력이 아니라 자리로 돌아간다.
          돌아갈 때도 같은 요소가 카드 자리로 접힌다 */}
      <Link to="/products" style={backStyle} onClick={() => captureFlip(visualRef.current)}>
        {PRODUCT_DETAIL.back}
      </Link>

      {/* ── 좌측 상단 페이지 위계. **격자 위에 둔다.**
             왼쪽 열 안에 두면 이 블록이 세로를 먹어 3D에 240px밖에 안 남는다(실측).
             밖으로 빼면 남는 세로가 통째로 3D 몫이 되어 제품이 주인공으로 선다 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 1.5, minWidth: 0 }}>
        {/* 개별 구현이던 자리다. 컴포넌트로 통합해 크기와 굵기가 전 페이지와 같아진다 */}
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

          {/* 한 줄 소개. **위계에 속하므로 왼쪽에 둔다.** 오른쪽 정보 열에 두면
              FEATURES 첫 항목과 같은 문장이라 바로 위아래로 붙어 중복으로 읽힌다(실측 화면) */}
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

          {/* 탭. **가로로 눕는다.** 제목 아래 한 줄이 되어 좌측 상단 위계의 끝을 맺는다.
              배치는 `.vx-kew-tabs`가 쥔다(인라인으로 걸면 CSS가 통째로 진다) */}
          <div
            className="vx-kew-tabs"
            role="tablist"
            aria-label={PRODUCT_DETAIL.tabsLabel}
            aria-orientation="horizontal"
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
                  style={tabStyle}
                >
                  {/* 선택 상태는 굵기(700 대 600)와 글자색 둘이 낸다.
                      색 단독 구분이 아니다(DESIGN 13절) */}
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
                </button>
              );
            })}
        </div>
      </div>

      {/* 좁은 폭에서는 한 열로 접혀 3D, 정보 순으로 선다(index.css) */}
      <div className="vx-kew">
        {/* ── 왼쪽 열. 3D 무대. **판도 보더도 라운드도 없다.**
               캔버스가 투명해 페이지 배경 위에 직접 뜬다.
               카드 썸네일과 같은 `data-flip-id`를 달아 전환의 짝을 잇는다.
               탭이 바뀌어도 이 자리는 그대로라 뷰어가 다시 서지 않는다 ── */}
        <div
          ref={visualRef}
          data-flip-id={`product-${product.slug}`}
          className="vx-kew-stage"
        >
          <ProductViewer slug={product.slug} />
        </div>

        {/* ── 오른쪽 열. 배경 없는 글자만. 뒤로 3D가 오지 않는다.
               열 번호는 `.vx-kew-info`가 못박는다(Flip 중 무대가 흐름에서 빠져도 자리를 지킨다) ── */}
        <div className="vx-kew-info" style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 2, minWidth: 0 }}>
          {/* 탭 정보 패널. 판과 테두리 없이 글자만 남고 구분은 여백이 진다 */}
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
            style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 1.5 }}
          >
            {tab === 'overview' ? <Overview product={product} /> : <Features slug={product.slug} />}
          </div>

          {/* 하단 CTA. 데모가 있는 제품만 arena로 나간다.
              컨트롤러는 단독 체험이 없어 CTA 없이 되돌아가는 길만 둔다 */}
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
        </div>
      </div>
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

// **탭 테두리를 걷어냈다(REBOOT_PLAN 2.1).** 선택 상태는 굵기와 글자색 둘이 함께 낸다.
// 색 단독 구분 금지(DESIGN 13절)는 굵기 700 대 600이 이미 만족시킨다.
// 영문 위 국문 아래 스택이라 가로로 누워도 두 줄이 유지된다
const tabStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 2,
  // 터치 타깃 44px
  minHeight: 44,
  padding: '10px 12px',
  borderRadius: radius.md,
  background: 'transparent',
  border: 'none',
  fontFamily: typography.family,
  cursor: 'pointer',
  textAlign: 'left',
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
