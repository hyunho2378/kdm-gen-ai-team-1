// 컨트롤러 제품 슬라이드. 참조 `frames/ref/Slide 16_9 - 113.svg`(1920x1080)를 브라우저에 렌더해
// getBBox로 좌표를 직접 실측했다(DESIGN 15절 출처 계약). SVG를 렌더하지 않고 좌표만 재현. 상단 표기 없음.
//
// 실측 좌표(1920x1080):
//   배경        pro-con1.png 풀블리드(참조 rect x0 y-12 w2079 h1132 = 오버스캔). 1920x1080이라 cover 정합.
//   글래스 카드1 x60  y710 w303 h303 rx20  (center 211.5, 861.5)  — Front View
//   글래스 카드2 x403 y710 w303 h303 rx20  (center 554.5, 861.5)  — Top View
//   뷰 front1(139x237)  rect x142.266 y744.385 w138.477 h236.614  (카드1 안)  종횡비 정확 일치
//   뷰 pro2(244x132)    rect x436 y796 w244 h132                   (카드2 안)  종횡비 정확 일치
//   바닥 그림자 타원1 cx207 cy975 rx115 ry32 / 타원2 cx569 cy919 rx140 ry32
//
// 매핑: 컨셉 슬라이드와 동일. 섹션 중앙 앵커(50%/50%) + 높이 스케일 vh 오프셋(k=100/1080). translate(-50%,-50%).
//   pro-con1.png의 height-cover 배치와 정확히 일치해 오버레이가 배경에 정합(오버플로 폭 무관).
// 헤드라인/설명은 참조 텍스트(컨트롤러 카피)를 지정 양식(공용 2단 헤더 SlideHeader, PV 타이포)에 얹는다.
//   참조 아이브로우는 'Solution/솔루션'(다른 슬라이드 템플릿 잔재)이라 슬라이드 주제인 'Controller/컨트롤러'로 둔다.

import { colors, typography, grid, whiteA } from '../tokens.js';
import { CONTROLLER } from '../copy.js';
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

// 네이비 오버레이(지시색 #263549/#131E2C/#3C5E8B). pro-con1 위에 얹어 톤 통일 + 좌측 가독.
const NAVY_TINT = 'linear-gradient(115deg, rgba(19,30,44,0.62) 0%, rgba(38,53,73,0.34) 48%, rgba(60,94,139,0.14) 100%)';
// 좌측 텍스트 가독 스크림(좌→우 어두움 감소).
const LEFT_SCRIM = 'linear-gradient(to right, rgba(19,30,44,0.72) 0%, rgba(19,30,44,0.32) 34%, rgba(19,30,44,0) 60%)';

// 유리 카드 재질(컨셉 슬라이드 글래스 문법과 통일). backdrop-filter blur + 흰 림 테두리 + inset 하이라이트.
const GLASS = {
  boxSizing: 'border-box',
  background: whiteA(0.06),
  border: `1px solid ${whiteA(0.22)}`,
  backdropFilter: 'blur(8px) saturate(1.1) brightness(1.03)',
  WebkitBackdropFilter: 'blur(8px) saturate(1.1) brightness(1.03)',
  boxShadow: `inset 0 1.5px 1px ${whiteA(0.24)}, inset 0 0 40px ${whiteA(0.05)}`,
  overflow: 'hidden',
};

// 바닥 그림자(제품 하단). 카드 안 % 좌표. 어두운 radial 타원.
const shadowStyle = (leftPct, topPct, wPct, hPct) => ({
  position: 'absolute',
  left: `${leftPct}%`,
  top: `${topPct}%`,
  width: `${wPct}%`,
  height: `${hPct}%`,
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)',
  pointerEvents: 'none',
});

// 뷰 이미지 슬롯(카드 안 % 좌표). 종횡비가 rect와 정확히 같아 왜곡 없음.
const viewStyle = (leftPct, topPct, wPct, hPct) => ({
  position: 'absolute',
  left: `${leftPct}%`,
  top: `${topPct}%`,
  width: `${wPct}%`,
  height: `${hPct}%`,
});

function GlassCard({ center, label, children }) {
  return (
    <div style={{ ...at(center[0], center[1]), width: vh(303), height: vh(303), borderRadius: vh(20), ...GLASS }}>
      {/* 라벨: 좌상단(참조 Front View/Top View). */}
      <div
        style={{
          position: 'absolute',
          top: vh(24),
          left: vh(26),
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: colors.white,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export default function SController() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#131E2C' }}>
      {/* 배경: pro-con1.png 풀블리드 cover + 네이비 틴트 + 좌측 스크림. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AssetImage src={CONTROLLER.bg} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: NAVY_TINT }} />
        <div style={{ position: 'absolute', inset: 0, background: LEFT_SCRIM }} />
      </div>

      {/* 상단 공용 2단 헤더(네이비 배경이라 onDark 흰 텍스트). PV 타이포. */}
      <div style={{ position: 'absolute', left: grid.marginX, right: grid.marginX, top: grid.marginTop, zIndex: 6, pointerEvents: 'none' }}>
        <SlideHeader
          eyebrow={{ en: CONTROLLER.label.en, ko: CONTROLLER.label.ko }}
          headline={CONTROLLER.headline}
          sub={CONTROLLER.desc.map((line, li) => (
            <span key={li}>
              {line.map((seg, i) => (
                <span key={i} style={{ fontWeight: seg.b ? 700 : 400 }}>{seg.t}</span>
              ))}
            </span>
          ))}
          onDark
        />
      </div>

      {/* 글래스 카드1(Front View): front1 세로 뷰 + 바닥 그림자. */}
      <GlassCard center={[211.5, 861.5]} label={CONTROLLER.views[0].label}>
        {/* 그림자: 참조 타원1 cx207 cy975 rx115 ry32 → 카드(x60 y710) 상대 %. */}
        <div style={shadowStyle(48.5, 87.5, 75.9, 21.1)} aria-hidden="true" />
        {/* front1: rect x142.266 y744.385 w138.477 h236.614 → 카드 상대 %. */}
        <div style={viewStyle(27.15, 11.35, 45.7, 78.1)}>
          <AssetImage src={CONTROLLER.views[0].img} fit="contain" />
        </div>
      </GlassCard>

      {/* 글래스 카드2(Top View): pro2 가로 뷰 + 바닥 그림자. */}
      <GlassCard center={[554.5, 861.5]} label={CONTROLLER.views[1].label}>
        {/* 그림자: 참조 타원2 cx569 cy919 rx140 ry32 → 카드(x403 y710) 상대 %. */}
        <div style={shadowStyle(54.8, 69.0, 92.4, 21.1)} aria-hidden="true" />
        {/* pro2: rect x436 y796 w244 h132 → 카드 상대 %. */}
        <div style={viewStyle(10.9, 28.4, 80.5, 43.6)}>
          <AssetImage src={CONTROLLER.views[1].img} fit="contain" />
        </div>
      </GlassCard>
    </div>
  );
}
