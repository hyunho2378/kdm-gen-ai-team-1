// OVERVIEW. **사이트의 첫 화면이고 루트(`/`)다.**
//
// Apple도 제품의 대표 주소가 오버뷰다(`/apple-vision-pro/`). 스펙과 OS는 그 아래
// 다른 주소로 갈린다. 우리도 같은 자리 배분이다.
//
// ── 이 페이지의 구성(영어화 개정) ──────────────────────────────────────────
//   히어로        중앙에 IMMERSIVE FENCING XR 한 줄(영어만). 표지 구도는 걷었다
//   영상 캐러셀    자동 재생 영상 + 제품 이름. Apple 오버뷰 갤러리 문법
//   수렴 스크롤    **man-blur 스크롤 연동.** 좌우 여백에 정보가 서고 끝에 제품 면 관문
//   한 합 뒤       **man-mak. 위로 올렸다.** 삭제된 "두 장치" 섹션의 미디어 자리를
//                  이어받아 수렴 섹션 바로 다음에 선다(마스크를 내리는 장면)
//   왜 VORTEX인가  **moti 이미지** + 소제목 + 짧은 문장(영어)
//
// **삭제됨(지시):** "두 장치가 하나로 움직인다" 섹션, "원칙"(몸으로 익히는 거리감 등) 문단.
//
// **히어로만 블랙이고 그 아래는 라이트다.** 그 대비가 진입의 절반이다. 수렴 섹션과
// 닫는 섹션이 다시 어두워지는데 둘 다 무대 색이 그 영상의 가장자리 실측값이라
// 페이지가 어두워지는 게 아니라 영상이 자기 자리를 넓히는 것으로 읽힌다.

import { spacing } from '../tokens.js';
import { ABOUT, CLOSING } from '../copy.js';
import { SectionHead, WideMedia } from '../components/Blocks.jsx';
import AutoVideo from '../components/AutoVideo.jsx';
import HeroCover from '../components/HeroCover.jsx';
import ProductLayout from '../components/ProductLayout.jsx';
import ScrubSection from '../components/ScrubSection.jsx';
import VideoRail from '../components/VideoRail.jsx';
import { bodyStyle, titleStyle } from '../components/typo.js';

export default function Overview() {
  const { naming } = ABOUT;

  return (
    <ProductLayout>
      <HeroCover />

      {/* 영상 캐러셀. 첫 장이 mask-360이고 나머지는 파일이 오면 copy의 src만 채운다 */}
      <VideoRail />

      {/* 수렴. **스크롤 진행이 섹션 진행이다.** 좌우 여백에 정보가 하나씩 서고
          끝까지 내려오면 제품 면으로 가는 관문이 열린다 */}
      <ScrubSection />

      {/* 닫는 영상(man-mak, 마스크를 내리는 장면). **위로 올렸다.** "두 장치가 하나로
          움직인다" 섹션(지시로 삭제)이 여기 있던 이미지 자리표시를 이고 있었는데, 그 섹션이
          나가면서 예전엔 오버뷰 맨 끝(원칙 문단 직전)에 있던 이 영상이 그 자리를 이어받아
          수렴 섹션 바로 다음으로 왔다. 무대 색은 이 영상 가장자리의 실측값이다 */}
      <section className="vx-bleed vx-closing" aria-label={CLOSING.line}>
        <AutoVideo className="vx-closing-video" src={CLOSING.src} ratio={CLOSING.ratio} />
        <div className="vx-shell vx-closing-copy" data-beat>
          <span className="vx-closing-en">{CLOSING.eyebrow.en}</span>
          <h2 style={{ ...titleStyle, color: 'inherit', marginTop: spacing.unit }}>{CLOSING.line}</h2>
          <p style={{ ...bodyStyle, color: 'rgba(253, 253, 253, 0.78)' }}>{CLOSING.body}</p>
        </div>
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
    </ProductLayout>
  );
}
