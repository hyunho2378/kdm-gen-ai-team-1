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
//   대표 미디어    마스크는 **프레임 시퀀스 진입 연출**, 컨트롤러는 정면 렌더
//   헤드라인       제품 한 줄과 리드
//   딥다이브       고정 렌더 + 순차 텍스트 4단계
//   사양          좌 라벨 / 우 값
//   In the Box    벤토 그리드
//
// **In the Box는 Apple Vision Pro 스펙 면에 없다**(직접 열어 확인했다). 우리 기획이라
// 베낄 대상 자체가 없고 구성품도 우리 것이다.
//
// ── 3D 뷰어를 걷었다 ────────────────────────────────────────────────────────
// 딥다이브 고정 미디어가 three.js 뷰어였는데 **띄우던 것은 실제 제품이 아니라
// 플레이스홀더 프리미티브였다.** 실제 렌더가 확보되면서 짐작으로 세운 도형을 돌릴
// 이유가 없어졌다. 조작 안내("드래그해 돌린다")와 WebGL 실패 안내도 함께 사라졌고
// `three` 의존도 이 앱에서 걷었다.
//
// **회전을 글로 설명하지 않는다.** 마스크는 프레임 시퀀스가 진입에서 한 번 돌고
// 그 뒤로는 스펙과 렌더만 남는다.

import { spacing } from '../tokens.js';
import { MEDIA_PENDING, PRODUCT_CONCEPT, PRODUCT_DEEPDIVE, PRODUCT_DETAIL, PRODUCT_MEDIA } from '../copy.js';
import { Dive } from '../components/Blocks.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import ProductLayout from '../components/ProductLayout.jsx';
import MediaSequence from '../components/MediaSequence.jsx';
import HoverMedia from '../components/HoverMedia.jsx';
import WaveReveal from '../components/WaveReveal.jsx';
import { bodyStyle, captionStyle, headingStyle, titleStyle } from '../components/typo.js';

export default function ProductPage({ slug }) {
  const deep = PRODUCT_DEEPDIVE[slug];
  const rows = PRODUCT_DETAIL.spec[slug];
  const box = PRODUCT_DETAIL.box[slug];
  const con = PRODUCT_CONCEPT[slug];
  const media = PRODUCT_MEDIA[slug];

  return (
    <ProductLayout>
      {/* 대표 미디어와 헤드라인.
          **마스크는 프레임 시퀀스다.** mask-360.mp4에서 뽑은 webp 30장이 진입에서
          흐림에서 선명으로 한 바퀴 돌고 마지막 프레임에 선다. 컨트롤러는 회전 소스가
          없어 정면 렌더 한 장이 같은 자리를 진다 */}
      <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
        {media.frames ? (
          <MediaSequence
            mode="enter"
            frames={media.frames}
            fps={16}
            ratio={media.leadRatio}
            className="vx-prod-stage"
            style={{ maxWidth: 520 }}
            alt={`${deep.eyebrow.en} rotation sequence`}
          />
        ) : (
          <div
            data-beat
            className="vx-seq vx-prod-stage"
            style={{ aspectRatio: media.leadRatio, maxWidth: 520 }}
          >
            <img className="vx-seq-img" src={media.lead.src} alt={media.lead.alt} />
          </div>
        )}
        <div data-beat style={{ marginTop: spacing.unit * 3, display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
          <Eyebrow en={deep.eyebrow.en} ko={deep.eyebrow.ko} />
          <h1 style={titleStyle}>{deep.headline}</h1>
          <p style={bodyStyle}>{deep.lead}</p>
        </div>
      </section>

      {/* 딥다이브. 고정 렌더 옆을 네 단계가 지나간다. 내용은 오버뷰 시절 비트 그대로다 */}
      <Dive
        label={deep.eyebrow}
        steps={deep.beats}
        media={
          <img
            className="vx-dive-render"
            src={media.dive.src}
            alt={media.dive.alt}
            loading="lazy"
          />
        }
      />

      {/* ── 제품 컨셉. Apple 스펙 문법(좌 라벨 / 우 값). 뷰는 Side/Front/Top 호버 미디어 슬롯(웨이브 등장). ── */}
      <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
        <h2 data-beat style={{ ...headingStyle, marginBottom: spacing.unit * 3 }}>Product Concept</h2>
        <dl style={{ margin: 0 }}>
          <div data-beat className="vx-spec-row">
            <dt style={headingStyle}>{PRODUCT_CONCEPT.conceptLabel}</dt>
            <dd style={{ margin: 0 }}><span style={bodyStyle}>{con.concept}</span></dd>
          </div>
          <div data-beat className="vx-spec-row">
            <dt style={headingStyle}>{PRODUCT_CONCEPT.productConceptLabel}</dt>
            <dd style={{ margin: 0 }}><span style={bodyStyle}>{con.productConcept}</span></dd>
          </div>
          <div className="vx-spec-row">
            <dt data-beat style={headingStyle}>{PRODUCT_CONCEPT.viewsLabel}</dt>
            <dd style={{ margin: 0 }}>
              {/* **실제 렌더다.** 발표에 쓴 것과 같은 원본에서 왔고 원본이 정사각이라
                  슬롯도 1:1이다(4:3에 넣으면 위아래가 잘린다). 마스크 탑 뷰만 렌더가
                  아직 없어 대기 표면으로 남는다 */}
              <WaveReveal className="vx-views">
                {con.views.map((v) => (
                  <HoverMedia
                    key={v.label}
                    image={v.src}
                    pending={MEDIA_PENDING}
                    label={v.label}
                    ratio="1 / 1"
                    className={v.src ? 'vx-prod-stage' : ''}
                  />
                ))}
              </WaveReveal>
            </dd>
          </div>
        </dl>
      </section>

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
