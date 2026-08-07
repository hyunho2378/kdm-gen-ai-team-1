// 마스크 제품 슬라이드. 참조 `frames/ref/Slide 16_9 - 125.svg`(1920x1080)를 브라우저에 렌더해
// getBBox로 좌표를 직접 실측했다(DESIGN 15절 출처 계약). SVG를 렌더하지 않고 좌표만 재현. 상단 표기 없음.
// **컨트롤러 슬라이드(SController)와 동일 문법.**
//
// 실측 좌표(1920x1080):
//   배경        mask-back.png 풀블리드(참조 rect x0 y-66.7 w2195 h1371 = 오버스캔). 1920x1080이라 cover 정합.
//   글래스 카드  x60 y710 w303 h303 rx20 (center 211.5, 861.5) — #62758D 0.2 틴트. 라벨 'Side View'.
//   mask1(240x240 square)  rect x92 y741 w240 h240 (카드 안, **좌우반전 scaleX-1**: 참조 matrix(-1 0 0 1 332 741))
//   그림자 타원1 cx207 cy975 rx115 ry32 / 타원2 cx221 cy959 rx115 ry34
//     — 참조가 "글래스 원"이라 부르지만 실제로는 **네이비 #1E2B36 0.4 radial 그림자**다. 그림자로 재현한다.
//     (유리 질감은 컨트롤러처럼 카드에 준다.)
//
// 매핑: 컨트롤러/컨셉과 동일. 섹션 중앙 앵커(50%/50%) + 높이 스케일 vh 오프셋(k=100/1080). translate(-50%,-50%).
//   mask-back.png의 height-cover 배치와 정확히 일치해 오버레이가 배경에 정합(오버플로 폭 무관).
// 헤드라인/설명/라벨은 참조 SVG 원문. 아이브로우 'Concept/제품 컨셉'(참조 원문). 상단 표기 '2026 KDM+…' 제거.

import { colors, typography, grid, whiteA } from '../tokens.js';
import { MASK } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { SlideHeader } from '../components/Bits.jsx';

// **1 ref-px를 contain-fit 단위로.** min(가로배율, 세로배율)이라 전체화면 종횡비가 16:9가 아니어도
// 1920x1080 구도가 통째로 들어와 안 잘린다(16:9에선 세로 기준과 동일). 좁은 비율에선 폭에 맞춰 축소.
const REF = 'min(100vw / 1920, 100vh / 1080)';
const vh = (refPx) => `calc(${refPx} * ${REF})`;
// 참조 좌표(x,y)를 섹션 중앙 앵커 left/top으로. 요소는 translate(-50%,-50%)로 자기 중심 정렬.
const at = (x, y) => ({
  position: 'absolute',
  left: `calc(50% + ${(x - 960).toFixed(3)} * ${REF})`,
  top: `calc(50% + ${(y - 540).toFixed(3)} * ${REF})`,
  transform: 'translate(-50%, -50%)',
});

// 네이비 오버레이(지시색 #1E2B36 계열 = 참조 배경 톤). mask-back 위에 얹어 톤 통일 + 좌측 가독.
const NAVY_TINT = 'linear-gradient(115deg, rgba(30,43,54,0.55) 0%, rgba(30,43,54,0.24) 48%, rgba(60,94,139,0.10) 100%)';
const LEFT_SCRIM = 'linear-gradient(to right, rgba(30,43,54,0.72) 0%, rgba(30,43,54,0.30) 34%, rgba(30,43,54,0) 60%)';

// 유리 카드 재질(컨트롤러 슬라이드 글래스 문법과 통일). 참조 카드 #62758D 0.2 틴트 + backdrop blur + 흰 림 + inset 하이라이트.
const GLASS = {
  boxSizing: 'border-box',
  background: 'rgba(98, 117, 141, 0.18)', // #62758D 틴트
  border: `1px solid ${whiteA(0.22)}`,
  backdropFilter: 'blur(8px) saturate(1.1) brightness(1.03)',
  WebkitBackdropFilter: 'blur(8px) saturate(1.1) brightness(1.03)',
  boxShadow: `inset 0 1.5px 1px ${whiteA(0.24)}, inset 0 0 40px ${whiteA(0.05)}`,
  overflow: 'hidden',
};

// 바닥 그림자(마스크 하단). 카드 안 % 좌표. 참조 색 #1E2B36(rgb 30,43,54) 0.4 radial.
const shadowStyle = (leftPct, topPct, wPct, hPct) => ({
  position: 'absolute',
  left: `${leftPct}%`,
  top: `${topPct}%`,
  width: `${wPct}%`,
  height: `${hPct}%`,
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  background: 'radial-gradient(50% 50% at 50% 50%, rgba(30,43,54,0.4) 0%, rgba(30,43,54,0) 100%)',
  pointerEvents: 'none',
});

export default function SMask() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#1E2B36' }}>
      {/* 배경: mask-back.png 풀블리드 cover + 네이비 틴트 + 좌측 스크림. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AssetImage src={MASK.bg} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: NAVY_TINT }} />
        <div style={{ position: 'absolute', inset: 0, background: LEFT_SCRIM }} />
      </div>

      {/* 상단 공용 2단 헤더(네이비 배경이라 onDark 흰 텍스트). PV 타이포. */}
      <div style={{ position: 'absolute', left: grid.marginX, right: grid.marginX, top: grid.marginTop, zIndex: 6, pointerEvents: 'none' }}>
        <SlideHeader
          eyebrow={{ en: MASK.label.en, ko: MASK.label.ko }}
          headline={MASK.headline}
          sub={MASK.desc.map((line, li) => (
            <span key={li}>
              {line.map((seg, i) => (
                <span key={i} style={{ fontWeight: seg.b ? 700 : 400 }}>{seg.t}</span>
              ))}
            </span>
          ))}
          onDark
        />
      </div>

      {/* 글래스 카드(Side View): 바닥 그림자 2개 + mask1(좌우반전). */}
      <div style={{ ...at(211.5, 861.5), width: vh(303), height: vh(303), borderRadius: vh(20), ...GLASS }}>
        {/* 라벨: 좌상단. */}
        <div style={{ position: 'absolute', top: vh(24), left: vh(26), fontFamily: typography.family, fontSize: typography.caption.size, fontWeight: 500, letterSpacing: '-0.01em', color: colors.white }}>
          {MASK.view.label}
        </div>

        {/* 바닥 그림자 타원2 cx221 cy959 rx115 ry34 → 카드(x60 y710) 상대 %(아래 레이어). */}
        <div style={shadowStyle(53.1, 82.2, 75.9, 22.4)} aria-hidden="true" />
        {/* 바닥 그림자 타원1 cx207 cy975 rx115 ry32 → 카드 상대 %. */}
        <div style={shadowStyle(48.5, 87.5, 75.9, 21.1)} aria-hidden="true" />

        {/* mask1: rect x92 y741 w240 h240 → 카드 상대 %. 참조 matrix 좌우반전 재현(scaleX -1). */}
        <div style={{ position: 'absolute', left: '10.56%', top: '10.23%', width: '79.2%', height: '79.2%', transform: 'scaleX(-1)' }}>
          <AssetImage src={MASK.view.img} fit="contain" />
        </div>
      </div>
    </div>
  );
}
