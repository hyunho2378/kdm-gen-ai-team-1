// 제품 딥다이브. **Apple Vision Pro 문법으로 두 제품을 한 편의 스크롤로 판다(BV2-4).**
//
// ── Apple Vision Pro 실측 (1440x900, 전체 스크롤) ────────────────────────────
// 문서 높이 32,734px = 36화면. 섹션 12개의 길이 분포가 이랬다.
//
//   1800px  2.0화면  미디어  1  고정 .   hero
//    900px  1.0화면  미디어  0  고정 .   foundation      ← 짧은 브리지
//   2129px  2.4화면  미디어 16  고정 O   design          ← 긴 딥다이브
//  13055px 14.5화면  미디어 46  고정 O   experience
//   7780px  8.6화면  미디어 16  고정 O   technology
//
//   긴 것(1.5화면 이상) 7개, 짧은 것 5개. 미디어 보유 75퍼센트.
//   **고정 미디어(position: sticky, top 52px, 1425x848)는 긴 딥다이브에만 있다.**
//   짧은 섹션에는 없다. 그 대비가 리듬을 만든다.
//
// ── 타이포를 그대로 베끼지 않는 이유 ─────────────────────────────────────────
// Apple의 헤드라인 계열은 80/56/48/32/28/24로 여섯 단계다("3단계뿐"이 아니다).
// 빈도를 지배하는 것은 12px 312회, 17px 94회, 21px 58회로 **전부 작은 지원 텍스트**다.
// 우리 스케일은 BV2-1에서 이미 이 레퍼런스들로부터 뽑았으므로 px를 다시 들여오지 않고
// **자리의 역할만 옮긴다.** 이 페이지가 쓰는 것은 셋뿐이다.
//
//   display  제품명 한 줄        (Apple 80/56 자리)
//   heading  비트 제목           (Apple 24/700 자리)
//   body     비트 본문 한 문장    (Apple 17 자리)
//
// ── Flip 짝 보존 ────────────────────────────────────────────────────────────
// 카드 인덱스를 걷어냈지만 **`data-flip-id`는 고정 미디어가 이어받는다.** 상세의 대표 비주얼과
// 같은 id라 라우트를 건너뛰는 shared element 전환이 그대로 산다(B8a).

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing, typography } from '../tokens.js';
import { PRODUCTS, PRODUCT_DEEPDIVE } from '../copy.js';
import { captureFlip, pendingFlipId, playFlip } from '../lib/flip.js';
import { gsap, ScrollTrigger, isReduced } from '../lib/motion.js';
import Eyebrow from '../components/Eyebrow.jsx';
import ProductViewer from '../components/ProductViewer.jsx';

const { products: DEEP, bridge, outro, detailCta } = PRODUCT_DEEPDIVE;

export default function Products() {
  const visualRefs = useRef({});
  const rootRef = useRef(null);

  // 상세에서 돌아왔을 때의 역방향 전환. 상세 대표 비주얼이 그 제품의 고정 미디어 자리로 접힌다
  useEffect(() => {
    const id = pendingFlipId();
    const slug = id ? id.replace('product-', '') : null;
    playFlip(slug ? visualRefs.current[slug] : null);
  }, []);

  /**
   * 비트 순차 등장. **고정 미디어 옆을 지나며 하나씩 드러난다.**
   * transform과 opacity만 건드린다(DESIGN 7절). 모션을 줄여 달라고 했으면 전부 제자리에 세운다.
   *
   * `once: true`라 되돌아 올라가도 다시 사라지지 않는다. 스크롤을 되감을 때 글자가
   * 깜빡이며 없어지는 것이 이 문법에서 가장 거슬리는 실패 모드다.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (isReduced()) return undefined;
    const ctx = gsap.context(() => {
      for (const el of root.querySelectorAll('[data-beat]')) {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        });
      }
      ScrollTrigger.refresh();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef}>
      {/* ── 진입. 짧다. 미디어 없이 무엇을 볼지만 세운다 ────────────────────── */}
      <section className="vx-shell vx-page">
        <Eyebrow en={PRODUCT_DEEPDIVE.eyebrow.en} ko={PRODUCT_DEEPDIVE.eyebrow.ko} />
        <h1
          style={{
            margin: '8px 0 0',
            fontFamily: typography.family,
            fontSize: typography.title.size,
            fontWeight: typography.title.weight,
            letterSpacing: typography.title.tracking,
            lineHeight: typography.title.leading,
            color: colors.text.primary,
            wordBreak: 'keep-all',
          }}
        >
          {PRODUCT_DEEPDIVE.title}
        </h1>
        <p
          style={{
            margin: '12px 0 0',
            fontFamily: typography.family,
            fontSize: typography.body.size,
            lineHeight: typography.body.leading,
            color: colors.text.secondary,
            maxWidth: 'var(--measure)',
            wordBreak: 'keep-all',
          }}
        >
          {PRODUCT_DEEPDIVE.line}
        </p>
      </section>

      {PRODUCTS.cards.map((card, i) => (
        <div key={card.slug}>
          <DeepDive
            card={card}
            deep={DEEP[card.slug]}
            onLeave={() => captureFlip(visualRefs.current[card.slug])}
            bindVisual={(el) => {
              visualRefs.current[card.slug] = el;
            }}
          />
          {/* 두 딥다이브 **사이에만** 브리지가 온다. 마지막 뒤에는 마감이 온다 */}
          {i === 0 ? <Bridge /> : null}
        </div>
      ))}

      {/* ── 마감. 짧다. 상세로 보내는 자리 ───────────────────────────────────── */}
      <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
        <Eyebrow en={outro.eyebrow.en} ko={outro.eyebrow.ko} />
        <p
          style={{
            margin: '8px 0 20px',
            fontFamily: typography.family,
            fontSize: typography.heading.size,
            fontWeight: typography.heading.weight,
            letterSpacing: typography.heading.tracking,
            color: colors.text.primary,
            wordBreak: 'keep-all',
          }}
        >
          {outro.line}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.unit * 1.5 }}>
          {PRODUCTS.cards.map((c) => (
            <Link
              key={c.slug}
              to={`/product/${c.slug}`}
              className="vx-card"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 44,
                padding: '0 18px',
                textDecoration: 'none',
                fontFamily: typography.family,
                fontSize: typography.body.size,
                color: colors.text.primary,
              }}
              onClick={() => captureFlip(visualRefs.current[c.slug])}
            >
              {c.name}
              <span style={{ fontSize: typography.hud.size, letterSpacing: typography.hud.tracking, color: colors.red.light }}>
                {detailCta}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

/**
 * 긴 딥다이브 한 편. **왼쪽 미디어가 고정되고 오른쪽 비트가 지나간다.**
 * Apple의 sticky 패널이 top 52px에 붙는 것과 같은 자리이고, 우리는 헤더 높이를 쓴다.
 *
 * 좁은 화면에서는 한 열로 쌓이고 고정이 풀린다. 세로가 모자란 화면에서 미디어를 붙들면
 * 비트를 읽을 자리가 안 남는다. 배치는 `.vx-dive`(index.css)가 쥔다.
 */
function DeepDive({ card, deep, onLeave, bindVisual }) {
  return (
    <section className="vx-shell vx-dive" aria-label={card.name}>
      {/* 고정 미디어. **바깥은 행 전체를 차지하는 격자 칸이고 안쪽이 붙는다.**
          한 겹을 안 두면 격자 칸 높이가 콘텐츠 높이와 같아져 sticky가 붙을 여지 자체가 없다
          (실측으로 잡았다. top이 92까지 갔다가 그대로 밀려 올라갔다).
          3D 뷰어는 화면 밖에서 스스로 루프를 세운다 */}
      <div className="vx-dive-media">
        <div
          className="vx-dive-media-inner"
          ref={bindVisual}
          data-flip-id={`product-${card.slug}`}
        >
          <ProductViewer slug={card.slug} />
        </div>
      </div>

      <div className="vx-dive-body">
        <div data-beat>
          <Eyebrow en={deep.eyebrow.en} ko={deep.eyebrow.ko} />
          {/* 제품명 자리. 이 페이지에서 display를 쓰는 유일한 곳이다 */}
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
          <p
            style={{
              margin: '16px 0 0',
              fontFamily: typography.family,
              fontSize: typography.body.size,
              lineHeight: typography.body.leading,
              color: colors.text.secondary,
              maxWidth: 'var(--measure)',
              wordBreak: 'keep-all',
            }}
          >
            {deep.lead}
          </p>
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
            <p
              style={{
                margin: '8px 0 0',
                fontFamily: typography.family,
                fontSize: typography.body.size,
                lineHeight: typography.body.leading,
                color: colors.text.secondary,
                maxWidth: 'var(--measure)',
                wordBreak: 'keep-all',
              }}
            >
              {b.body}
            </p>
          </div>
        ))}

        <div data-beat>
          <Link
            to={`/product/${card.slug}`}
            className="vx-card"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              minHeight: 44,
              padding: '0 18px',
              textDecoration: 'none',
              fontFamily: typography.family,
              fontSize: typography.body.size,
              color: colors.text.primary,
            }}
            onClick={onLeave}
          >
            {card.name}
            <span style={{ fontSize: typography.hud.size, letterSpacing: typography.hud.tracking, color: colors.red.light }}>
              {detailCta}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 짧은 브리지. **미디어가 없다.** 그 부재가 앞뒤 딥다이브를 갈라 준다
 * (Apple도 짧은 섹션에는 고정 미디어를 안 둔다. 실측에서 확인했다).
 */
function Bridge() {
  return (
    <section className="vx-shell" style={{ paddingBlock: 'calc(var(--section-gap) * 1.2)' }}>
      <div data-beat>
        <Eyebrow en={bridge.eyebrow.en} ko={bridge.eyebrow.ko} />
        <p
          style={{
            margin: '10px 0 0',
            fontFamily: typography.family,
            fontSize: typography.title.size,
            fontWeight: typography.title.weight,
            letterSpacing: typography.title.tracking,
            lineHeight: typography.title.leading,
            color: colors.text.primary,
            maxWidth: 'var(--measure)',
            wordBreak: 'keep-all',
          }}
        >
          {bridge.line}
        </p>
      </div>
    </section>
  );
}
