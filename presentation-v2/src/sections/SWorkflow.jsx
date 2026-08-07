// AI 워크플로우 슬라이드(2개 상태). 참조 frames/ref/2029(형태 탐색)·2030(구체화)를 브라우저에 렌더해
// getBBox로 좌표·색을 직접 실측했다(DESIGN 15절 출처 계약). SVG를 렌더하지 않고 좌표만 재현. 상단 표기 없음.
//
// **두 액센트 색이 두 제품 라인을 구분한다**(실측: 연두 #0ED400/#1EFF00=컨트롤러, 자두 #CD00BF/#FF01FA=글라스).
// 배경은 흰색(라이트). 헤더는 공용 2단 헤더(SlideHeader, PV 타이포). 이미지/하이라이트/캡션은 참조 좌표에 REF 매핑.
//
// 실측 좌표(1920x1080):
//   [explore] 좌 마스크 몽타주 x60 y451 760x568 rx20 / 우 컨트롤러 몽타주 x842 y452 763x568 rx20
//             연두 하이라이트(컨트롤러) x1228 y644 185x188 / 자두 하이라이트(마스크) x246 y827 197x200
//             툴카드 x60 y335 185x102 (미드저니 x70 y345 78x82 + 비즈컴 x155 y347 80x80)
//             연두 캡션 baseline x1622 y777 / 자두 캡션 x1622 y911 (fs16)
//   [develop] 좌 컨트롤러 보드 x60 y446 928x573 rx20 / 우 마스크 보드 x1005 y446 855x573 rx20
//             연두 하이라이트 x97 y749 368x258 / 자두 하이라이트 x1354 y468 223x530
//             툴카드 x60 y335 100x100 (비즈컴 x70 y345 80x80) / 연두 라벨 x96 y731 / 자두 라벨 x1238 y966

import { colors, typography, grid } from '../tokens.js';
import { WORKFLOW, WORKFLOW_COLORS } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { SlideHeader } from '../components/Bits.jsx';

const REF = 'min(100vw / 1920, 100vh / 1080)';
const vh = (refPx) => `calc(${refPx} * ${REF})`;
// 중앙 앵커(이미지/하이라이트: rect 중심에 배치).
const at = (x, y) => ({
  position: 'absolute',
  left: `calc(50% + ${(x - 960).toFixed(2)} * ${REF})`,
  top: `calc(50% + ${(y - 540).toFixed(2)} * ${REF})`,
  transform: 'translate(-50%, -50%)',
});
// 좌상단 앵커(텍스트/툴카드: 시작점 x, 상단 y).
const atTL = (x, y) => ({
  position: 'absolute',
  left: `calc(50% + ${(x - 960).toFixed(2)} * ${REF})`,
  top: `calc(50% + ${(y - 540).toFixed(2)} * ${REF})`,
});

// #RRGGBB → rgba(.., a).
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// 참조 좌표별 레이아웃(rect 중심 cx/cy로 변환해 둠).
const LAYOUT = {
  explore: {
    images: [
      { src: (d) => d.images.mask, cx: 440, cy: 735, w: 760, h: 568 },
      { src: (d) => d.images.controller, cx: 1223.5, cy: 736, w: 763, h: 568 },
    ],
    highlights: [
      { axis: 'controller', cx: 1320.5, cy: 738, w: 185, h: 188 },
      { axis: 'glass', cx: 344.5, cy: 927, w: 197, h: 200 },
    ],
    captions: [
      { axis: 'controller', x: 1620, y: 762, w: 245 },
      { axis: 'glass', x: 1620, y: 896, w: 245 },
    ],
    tool: { cardX: 60, cardY: 335, cardW: 185, cardH: 102, logos: [{ cx: 109, cy: 386, w: 78, h: 82 }, { cx: 195, cy: 387, w: 80, h: 80 }] },
  },
  develop: {
    images: [
      { src: (d) => d.images.controller, cx: 524, cy: 732.5, w: 928, h: 573 },
      { src: (d) => d.images.mask, cx: 1432.5, cy: 732.5, w: 855, h: 573 },
    ],
    highlights: [
      { axis: 'controller', cx: 281, cy: 878, w: 368, h: 258 },
      { axis: 'glass', cx: 1465.5, cy: 733, w: 223, h: 530 },
    ],
    // develop은 캡션 대신 하단/우측 라벨(하이라이트 위 한 줄).
    labels: [
      { axis: 'controller', x: 96, y: 719 },
      { axis: 'glass', x: 1238, y: 954 },
    ],
    tool: { cardX: 60, cardY: 335, cardW: 100, cardH: 100, logos: [{ cx: 110, cy: 385, w: 80, h: 80 }] },
  },
};

export default function SWorkflow({ slide }) {
  const data = WORKFLOW[slide];
  const L = LAYOUT[slide];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.white }}>
      {/* 공용 2단 헤더(라이트, PV 타이포). 아이브로우 좌상단 고정. */}
      <div style={{ position: 'absolute', left: grid.marginX, right: grid.marginX, top: grid.marginTop, zIndex: 6, pointerEvents: 'none' }}>
        <SlideHeader
          eyebrow={{ en: data.eyebrow.en, ko: data.eyebrow.ko, tone: colors.navy }}
          headline={data.headline}
          sub={data.body.map((line, li) => (
            <span key={li}>
              {line.map((seg, i) => (
                <span key={i} style={{ fontWeight: seg.b ? 700 : 400 }}>{seg.t}</span>
              ))}
            </span>
          ))}
        />
      </div>

      {/* 사용한 툴 라벨(카드 위, 참조 baseline y324). */}
      <div
        style={{
          ...atTL(L.tool.cardX, L.tool.cardY - 32),
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          fontWeight: 500,
          color: colors.text.secondary,
          zIndex: 5,
        }}
      >
        {data.toolsLabel}
      </div>
      <div
        style={{
          ...atTL(L.tool.cardX, L.tool.cardY),
          width: vh(L.tool.cardW),
          height: vh(L.tool.cardH),
          borderRadius: vh(20),
          background: colors.bg,
          border: `1px solid ${colors.line.default}`,
          zIndex: 5,
        }}
      />
      {L.tool.logos.map((lo, i) => (
        <div key={i} style={{ ...at(lo.cx, lo.cy), width: vh(lo.w), height: vh(lo.h), zIndex: 6 }}>
          <AssetImage src={data.tools[i]} fit="contain" />
        </div>
      ))}

      {/* 이미지 슬롯(몽타주/보드). 참조 rect 중심 + rx20. */}
      {L.images.map((im, i) => (
        <div
          key={i}
          style={{ ...at(im.cx, im.cy), width: vh(im.w), height: vh(im.h), borderRadius: vh(20), overflow: 'hidden', zIndex: 1 }}
        >
          <AssetImage src={im.src(data)} fit="cover" />
        </div>
      ))}

      {/* 선택 하이라이트 프레임(두 색 = 두 제품 라인). 반투명 틴트 + 실선 테두리. */}
      {L.highlights.map((hl, i) => {
        const c = WORKFLOW_COLORS[hl.axis];
        return (
          <div
            key={i}
            aria-hidden="true"
            style={{
              ...at(hl.cx, hl.cy),
              width: vh(hl.w),
              height: vh(hl.h),
              borderRadius: vh(19.5),
              boxSizing: 'border-box',
              background: rgba(c.tint, 0.22),
              border: `2px solid ${c.tint}`,
              boxShadow: `0 0 0 1px ${rgba(c.accent, 0.25)}`,
              zIndex: 2,
            }}
          />
        );
      })}

      {/* explore: 우측 색 캡션 / develop: 하이라이트 라벨. axis로 색 결정. */}
      {(L.captions || []).map((cap, i) => {
        const item = data.captions[i];
        return (
          <div
            key={`cap-${i}`}
            style={{
              ...atTL(cap.x, cap.y),
              width: vh(cap.w),
              fontFamily: typography.family,
              fontSize: vh(16),
              fontWeight: 600,
              lineHeight: 1.55,
              letterSpacing: '-0.01em',
              color: WORKFLOW_COLORS[item.axis].accent,
              zIndex: 4,
            }}
          >
            {item.text}
          </div>
        );
      })}
      {(L.labels || []).map((lb, i) => {
        const item = data.labels[i];
        return (
          <div
            key={`lb-${i}`}
            style={{
              ...atTL(lb.x, lb.y),
              fontFamily: typography.family,
              fontSize: vh(16),
              fontWeight: 700,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              color: WORKFLOW_COLORS[item.axis].accent,
              zIndex: 4,
            }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
}
