// 제품 면. **마스크(`/mask`)와 컨트롤러(`/controller`)가 같은 골격을 쓴다.**
//
// ── Apple Tech Specs 실측 (1440, 직접 열어 computed로) ──────────────────────
//
//   대표 이미지   747x432(1.729:1), top 314. **풀블리드가 아니다.** 가운데 놓인다
//   스펙 행       `.techspecs-row` 17개
//   좌 라벨       x 223, 폭 216, 24px / 600
//   우 값         x 467, 폭 735, 17px
//   갭           28px (467 - 439)
//   문서 높이     10066 (오버뷰 32734의 3분의 1)
//
// **구조만 옮긴다.** Apple의 스펙 문구와 수치(칩 이름, 저장 용량, 픽셀 수 등)는
// 한 글자도 가져오지 않는다. 카테고리 이름과 값은 우리 제품의 것이고, 실제 하드웨어
// 수치는 지어낼 수 없어 자리표시로 둔다(DESIGN 15절, MAPPING 6절).
//
// ── 이 면의 구성 ────────────────────────────────────────────────────────────
//   대표 미디어    747x432 비율 슬롯
//   헤드라인       제품 한 줄과 리드
//   딥다이브       고정 3D + 순차 텍스트 4단계
//   사양          좌 라벨 / 우 값
//   In the Box    벤토 그리드
//
// **In the Box는 Apple Vision Pro 스펙 면에 없다**(직접 열어 확인했다). 우리 기획이라
// 베낄 대상 자체가 없고 구성품도 우리 것이다.

import { spacing } from '../tokens.js';
import { MEDIA_PENDING, PRODUCT_DEEPDIVE, PRODUCT_DETAIL } from '../copy.js';
import { Dive, SpecMedia } from '../components/Blocks.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import ProductLayout from '../components/ProductLayout.jsx';
import ProductViewer from '../components/ProductViewer.jsx';
import { bodyStyle, captionStyle, headingStyle, titleStyle } from '../components/typo.js';

export default function ProductPage({ slug }) {
  const deep = PRODUCT_DEEPDIVE[slug];
  const rows = PRODUCT_DETAIL.spec[slug];
  const box = PRODUCT_DETAIL.box[slug];

  return (
    <ProductLayout>
      {/* 대표 미디어와 헤드라인. Apple 스펙 면도 이미지 하나와 제목으로 연다 */}
      <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
        <SpecMedia pending={MEDIA_PENDING} />
        <div data-beat style={{ marginTop: spacing.unit * 3, display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
          <Eyebrow en={deep.eyebrow.en} ko={deep.eyebrow.ko} />
          <h1 style={titleStyle}>{deep.headline}</h1>
          <p style={bodyStyle}>{deep.lead}</p>
        </div>
      </section>

      {/* 딥다이브. 고정 3D 옆을 네 단계가 지나간다. 내용은 오버뷰 시절 비트 그대로다 */}
      <Dive label={deep.eyebrow} steps={deep.beats} media={<ProductViewer slug={slug} />} bare />

      {/* ── 사양. 좌 라벨 / 우 값 ─────────────────────────────────────────── */}
      <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
        <h2 data-beat style={{ ...headingStyle, marginBottom: spacing.unit * 3 }}>
          {PRODUCT_DETAIL.specLabel}
        </h2>
        <dl style={{ margin: 0 }}>
          {rows.map((r) => (
            <div key={r.label} data-beat className="vx-spec-row">
              <dt style={{ ...headingStyle }}>{r.label}</dt>
              <dd style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: spacing.unit * 0.5 }}>
                {r.values.map((v) => (
                  <span key={v} style={bodyStyle}>{v}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── In the Box. 벤토 그리드 ───────────────────────────────────────── */}
      <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
        <h2 data-beat style={{ ...headingStyle, marginBottom: spacing.unit * 3 }}>
          {PRODUCT_DETAIL.boxLabel}
        </h2>
        <ul data-beat className="vx-bento">
          {box.map((item) => (
            <li key={item} className="vx-bento-cell">
              {/* 구성품 이미지 자리. **빈 박스가 아니라 표면이다.** 이미지가 오면 덮는다 */}
              <span style={captionStyle}>{MEDIA_PENDING}</span>
              <span style={{ ...bodyStyle, marginTop: 'auto' }}>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </ProductLayout>
  );
}
