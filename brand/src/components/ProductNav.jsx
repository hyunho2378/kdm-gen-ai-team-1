// 제품 서브내비. **Apple Vision Pro의 로컬 내비 구조를 옮겼다(PD-1).**
//
// ── Apple 실측 (1440x900, 직접 열어 computed로) ──────────────────────────────
//
//   요소       nav, position sticky, top 0, z-index 9997, 높이 52px, 전폭
//   좌측       제품명 21px / 600
//   우측       탭 3개 + CTA 2개, 전부 12px / 400
//   현재 탭    밑줄(검은 언더바). aria-current는 안 쓴다
//   Book a demo  알약 아웃라인(radius 980px), 배경 투명
//   Buy          알약 채움, 파란 배경 + 흰 글자
//   테두리     border-bottom 없음
//   스크롤     글로벌내비가 밀려 올라가면 그 자리를 이어받아 top 0에 붙는다
//
// **우리는 헤더가 늘 fixed로 남는다.** 그래서 서브내비는 top 0이 아니라 헤더 높이 아래에 붙는다.
// 그 자리가 Apple의 "글로벌내비가 사라진 뒤 top 0"과 등가다.
//
// ── 고정 방식 ───────────────────────────────────────────────────────────────
// **sticky다. fixed가 아니다.** fixed는 transform이 걸린 조상(R3 워프)에 잡혀 뷰포트가 아니라
// 그 조상을 기준으로 튄다(PITFALLS). sticky는 그 함정을 안 밟는다. BV2-4 딥다이브에서
// 같은 방식으로 워프와의 공존을 실측했다(워프 한복판에도 가로 초과 0).
//
// 색은 전부 v2 라이트 팔레트다. 선 장식을 두지 않고 현재 탭 밑줄만 잉크로 긋는다.

import { colors, spacing, typography, weight } from '../tokens.js';
import { PRODUCT_NAV } from '../copy.js';
import { arenaUrl } from './ArenaCta.jsx';

const TABS = PRODUCT_NAV.tabs;

/** 탭과 CTA가 공유하는 글자 규격. Apple이 이 줄을 전부 12px로 맞춘 것과 같다. */
const itemText = {
  fontFamily: typography.family,
  fontSize: typography.hud.size,
  letterSpacing: typography.hud.tracking,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

export default function ProductNav({ productName, active, onJump }) {
  const demo = arenaUrl();

  return (
    <nav className="vx-pnav" aria-label={PRODUCT_NAV.label}>
      <div className="vx-pnav-bar">
        {/* 좌측 제품명. Apple 21px/600 자리라 heading 토큰을 쓴다 */}
        <span
          style={{
            fontFamily: typography.family,
            fontSize: typography.heading.size,
            fontWeight: typography.heading.weight,
            letterSpacing: typography.heading.tracking,
            color: colors.text.primary,
            whiteSpace: 'nowrap',
          }}
        >
          {productName}
        </span>

        {/* 우측 묶음. 탭 셋과 CTA 둘이 한 줄에 선다 */}
        <div className="vx-pnav-right">
          {TABS.map((t) => {
            const on = t.key === active;
            return (
              <a
                key={t.key}
                href={`#${t.key}`}
                aria-current={on ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onJump(t.key);
                }}
                className="vx-pnav-tab"
                style={{
                  ...itemText,
                  // **색 하나로 구분하지 않는다.** 굵기와 밑줄이 함께 움직인다(DESIGN 13절)
                  fontWeight: on ? weight.bold : weight.medium,
                  color: on ? colors.text.primary : colors.text.dim,
                  borderBottomColor: on ? colors.text.primary : 'transparent',
                }}
              >
                {t.label}
              </a>
            );
          })}

          {/* Book a demo 자리. **arena로 나가는 출구다.**
              주소가 없으면 비활성으로 두고 사유를 옆에 적는다(ArenaCta와 같은 규율).
              눌러도 아무 일이 없는 버튼이 제일 나쁜 실패다 */}
          {demo ? (
            <a
              href={demo}
              target="_blank"
              rel="noreferrer"
              className="vx-pnav-pill"
              style={{ ...itemText, color: colors.text.primary, borderColor: colors.line.strong }}
            >
              {PRODUCT_NAV.demo}
            </a>
          ) : (
            <span
              className="vx-pnav-pill"
              aria-disabled="true"
              style={{ ...itemText, color: colors.text.dim, borderColor: colors.line.default }}
            >
              {PRODUCT_NAV.demo}
            </span>
          )}

          {/* Buy 자리. 아직 갈 곳이 없어 비활성이다. Apple은 파란 채움이고
              우리는 브랜드 레드 채움이다(흰 글자 대비 10.57) */}
          <span
            className="vx-pnav-pill vx-pnav-pill-fill"
            aria-disabled="true"
            title={PRODUCT_NAV.buyPending}
            style={{ ...itemText, color: colors.text.onFill }}
          >
            {PRODUCT_NAV.buy}
          </span>
        </div>
      </div>
    </nav>
  );
}

/** 서브내비 아래로 앵커가 가려지지 않게 섹션이 확보해야 하는 여백. */
export const PNAV_H = spacing.unit * 6.5;

