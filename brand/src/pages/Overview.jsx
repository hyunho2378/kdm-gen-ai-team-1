// OVERVIEW. **사이트의 첫 화면이고 루트(`/`)다.**
//
// Apple도 제품의 대표 주소가 오버뷰다(`/apple-vision-pro/`). 스펙과 OS는 그 아래
// 다른 주소로 갈린다. 우리도 같은 자리 배분이다.
//
// ── 이 페이지의 구성 ────────────────────────────────────────────────────────
//   히어로        **블랙 표지 구도.** 마스크(좌)와 컨트롤러(우)가 중앙 로고를 향해 선다
//   영상 캐러셀    자동 재생 영상 + 설명 한 줄. Apple 오버뷰 갤러리 문법
//   수렴 영상      man-blur 풀블리드. 흐림에서 선명으로
//   두 장치       와이드 미디어 + 소제목 + 짧은 문장
//   왜 VORTEX인가  **moti 이미지** + 소제목 + 짧은 문장
//   원칙          목록이 아니라 한 덩어리의 큰 문장
//
// **히어로만 블랙이고 그 아래는 라이트다.** 그 대비가 진입의 절반이다.
//
// **리본 궤적을 히어로에서 걷었다.** 표지 구도가 주인공인데 움직이는 것이 넷이 되면
// 시선이 갈리고, 무엇보다 그 리본은 라이트 배경용 잉크로 튜닝돼 블랙 위에서 안 보인다.

import { spacing } from '../tokens.js';
import { ABOUT, CONVERGE, MEDIA_PENDING, PRODUCT_NAV, PRODUCT_SITE } from '../copy.js';
import { SectionHead, WideMedia } from '../components/Blocks.jsx';
import AutoVideo from '../components/AutoVideo.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import HeroCover from '../components/HeroCover.jsx';
import ProductLayout from '../components/ProductLayout.jsx';
import VideoRail from '../components/VideoRail.jsx';
import { bodyStyle, titleStyle } from '../components/typo.js';

const TAB = PRODUCT_NAV.tabs[0];

export default function Overview() {
  const { naming, principles } = ABOUT;
  const copy = PRODUCT_SITE.sections.overview;

  return (
    <ProductLayout>
      <HeroCover />

      {/* 영상 캐러셀. 첫 장이 mask-360이고 나머지는 파일이 오면 copy의 src만 채운다 */}
      <VideoRail />

      {/* 수렴 영상. **풀블리드다.** 흐림에서 선명으로 모이는 것이 이 자리의 내용이다 */}
      <section className="vx-bleed" style={{ paddingBlock: 'var(--section-gap)' }}>
        <AutoVideo className="vx-converge" src={CONVERGE.src} pending={MEDIA_PENDING} ratio="1425 / 848" />
        <div
          className="vx-shell"
          data-beat
          style={{ marginTop: spacing.unit * 3, display: 'flex', flexDirection: 'column', gap: spacing.unit }}
        >
          <Eyebrow en={CONVERGE.eyebrow.en} ko={CONVERGE.eyebrow.ko} />
          <h2 style={titleStyle}>{CONVERGE.line}</h2>
          <p style={bodyStyle}>{CONVERGE.body}</p>
        </div>
      </section>

      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <WideMedia pending={MEDIA_PENDING} />
        <SectionHead label={{ en: TAB.label, ko: TAB.ko }} title={copy.title} line={copy.line} />
      </section>

      {/* **두 번째 미디어가 moti다.** 브랜드 모티프 이미지이고 자리표시가 아니다.
          2880x1034(2.79:1)이라 슬롯(2.024:1)보다 납작하다. cover로 덮어 위아래를 살짝
          잘라 슬롯을 꽉 채운다. 늘리지 않으므로 비율이 찌그러지지 않는다 */}
      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <WideMedia>
          <img
            src="/images/moti/moti.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </WideMedia>
        <SectionHead label={naming.eyebrow} title={naming.title} line={naming.body} />
      </section>

      {/* 원칙 셋. **목록으로 눕히지 않는다.** 줄바꿈 하나로 이어진 한 덩어리의 큰 문장이다 */}
      <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
        <p data-beat style={{ ...titleStyle, whiteSpace: 'pre-line' }}>{principles.items.join('\n')}</p>
      </section>
    </ProductLayout>
  );
}
