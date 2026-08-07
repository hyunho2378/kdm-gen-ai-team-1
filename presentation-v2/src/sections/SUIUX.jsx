// UIUX 슬라이드. 참조 `frames/ref/14.svg`(1920x1080)를 브라우저에 렌더해 getBBox로
// 좌표를 직접 실측했다(DESIGN 15절 출처 계약). SVG를 그대로 렌더하지 않고 구조/좌표만 재현.
// 상단 표기 없음. AI 워크플로우(develop) 바로 다음, 데모 앞.
//
// 실측 좌표(1920x1080):
//   설명 문단  x402.664 y172.6, 2줄 SUIT24 볼드/레귤러 혼합 — 공용 2단 헤더(SlideHeader, PV2 role)로 옮긴다
//   카드 3개   x436 / 791.273 / 1146.55, y321, 295.273x639, rx20
//   카드 라벨  카드 중심 정렬 캡션(내 기록/컨트롤러 제어/승리), y977.2
//
// 카드 이미지는 실제 컨트롤러 앱(controller-vortex.vercel.app) 스크린샷 3장이다(296x639, 참조
// rect 295.273x639과 거의 일치해 크롭 없이 앉는다). 순서는 참조와 같다: 내 기록(기록 도넛) →
// 컨트롤러 제어(조작 설정) → 승리(경기 결과).

import { colors, grid, typography } from '../tokens.js';
import { UIUX } from '../copy.js';
import { SlideHeader } from '../components/Bits.jsx';
import AssetImage from '../components/AssetImage.jsx';

const REF = 'min(100vw / 1920, 100vh / 1080)';
const vh = (refPx) => `calc(${refPx} * ${REF})`;
// 중앙 앵커(카드: rect 중심에 배치). 컨셉/워크플로우와 같은 매핑 문법.
const at = (x, y) => ({
  position: 'absolute',
  left: `calc(50% + ${(x - 960).toFixed(2)} * ${REF})`,
  top: `calc(50% + ${(y - 540).toFixed(2)} * ${REF})`,
  transform: 'translate(-50%, -50%)',
});
// 좌상단 앵커(라벨 캡션: 카드 중심에 맞춰 폭 지정 후 가운데 정렬).
const atTL = (x, y) => ({
  position: 'absolute',
  left: `calc(50% + ${(x - 960).toFixed(2)} * ${REF})`,
  top: `calc(50% + ${(y - 540).toFixed(2)} * ${REF})`,
});

// 카드 중심 x(실측 436/791.273/1146.55 + 295.273/2).
const CARD_CX = [436 + 295.273 / 2, 791.273 + 295.273 / 2, 1146.55 + 295.273 / 2];
const CARD_CY = 321 + 639 / 2;
const CARD_W = 295.273;
const CARD_H = 639;
const LABEL_Y = 977.2;

export default function SUIUX() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 공용 2단 헤더. 아이브로우 UIUX/앱 연동 + 설명 한 문단(볼드 4구간, 참조 원문). */}
      <div style={{ position: 'absolute', left: grid.marginX, right: grid.marginX, top: grid.marginTop, zIndex: 4 }}>
        <SlideHeader
          eyebrow={{ en: UIUX.label.en, ko: UIUX.label.ko, tone: colors.navy }}
          sub={UIUX.body.map((line, li) => (
            <span key={li}>
              {line.map((seg, i) => (
                <span key={i} style={{ fontWeight: seg.b ? 700 : 400 }}>{seg.t}</span>
              ))}
            </span>
          ))}
        />
      </div>

      {/* 앱 스크린샷 카드 3개. 실측 rect 295.273x639 rx20, 실제 스샷이 296x639라 크롭 없이 앉는다. */}
      {UIUX.cards.map((card, i) => (
        <div key={card.key}>
          <div
            style={{
              ...at(CARD_CX[i], CARD_CY),
              width: vh(CARD_W),
              height: vh(CARD_H),
              borderRadius: vh(20),
              overflow: 'hidden',
              boxShadow: `0 0 0 1px ${colors.line.default}`,
              zIndex: 1,
            }}
          >
            <AssetImage src={card.img} alt={card.label} fit="cover" />
          </div>
          {/* 카드 중심에 정렬된 캡션. 폭을 카드와 같게 주고 텍스트 가운데 정렬로 실측 중심을 재현한다. */}
          <div
            style={{
              ...atTL(CARD_CX[i], LABEL_Y),
              width: vh(CARD_W),
              transform: 'translateX(-50%)',
              textAlign: 'center',
              // **역할 토큰만(PV2).** headline이 아니라 body 크기 + 700(카드 제목 위계 규칙,
              // FOUNDATION "위계는 크기 대비가 아니라 굵기와 여백이 낸다"와 같은 문법).
              fontFamily: typography.family,
              fontSize: typography.body.size,
              fontWeight: 700,
              color: colors.text.primary,
              zIndex: 2,
            }}
          >
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
