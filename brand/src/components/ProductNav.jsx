// 제품 내비. **사이트의 유일한 헤더다.**
//
// PD-1에서는 Apple Vision Pro의 로컬 내비(서브내비) 구조로 들어왔고, 그 위에 전역 헤더가
// 따로 상주했다. **바 둘이 위아래로 붙어 자리를 다퉜다.** 헤더 통합 세션에서 전역 헤더를
// 걷어내면서 이 바가 그 역할까지 물려받았다. 좌측 워드마크가 그 흔적이다.
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
// **우리도 top 0이다.** 전역 헤더가 없어져 Apple의 "글로벌내비가 사라진 뒤 top 0"과
// 같은 자리에 처음부터 서 있다. 문서의 첫 요소라 스크롤해도 안 움직인다.
//
// ── 고정 방식 ───────────────────────────────────────────────────────────────
// **sticky다. fixed가 아니다.** fixed는 transform이 걸린 조상(R3 워프)에 잡혀 뷰포트가 아니라
// 그 조상을 기준으로 튄다(PITFALLS). sticky는 그 함정을 안 밟는다. BV2-4 딥다이브에서
// 같은 방식으로 워프와의 공존을 실측했다(워프 한복판에도 가로 초과 0).
//
// ── 탭은 라우트다(개정) ─────────────────────────────────────────────────────
// **Apple의 로컬 내비도 앵커가 아니라 라우트다.** 실측한 href가 `/apple-vision-pro/`,
// `/apple-vision-pro/specs/`, `/os/visionos/`였다. 우리도 다섯 탭이 각자 주소를 갖고,
// 누르면 스크롤이 아니라 화면이 통째로 바뀐다. 현재 탭은 라우트가 정한다.
//
// 색은 전부 v2 라이트 팔레트다. 선 장식을 두지 않고 **현재 탭 밑줄만 네이비로** 긋는다.

import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { colors, typography, weight } from '../tokens.js';
import { HERO, PRODUCT_NAV } from '../copy.js';
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

export default function ProductNav() {
  const demo = arenaUrl();
  const { pathname } = useLocation();
  const ref = useRef(null);

  /**
   * 실제 바 높이를 CSS 변수로 내보낸다. 앵커 섹션의 `scroll-margin-top`이 이 값을 읽는다.
   *
   * **52px을 상수로 적으면 좁은 화면에서 틀린다.** 좁아지면 제품명 아래로 줄이 접혀
   * 바가 두 줄이 되는데, 320에서 잰 높이가 **147px**이었다. 그때 앵커로 뛰면 섹션 top이
   * 68에 서고 바 바닥이 147이라 아이브로우가 바 아래로 숨는다(실측).
   *
   * 폭마다 접히는 정도가 달라 media query로 값을 나눠 적어도 또 어긋난다. 그래서 숫자를
   * 적지 않고 잰다. ResizeObserver라 폰트가 늦게 붙어 높이가 바뀌어도 따라온다.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const push = () => {
      document.documentElement.style.setProperty('--pnav-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    };
    push();
    const ro = new ResizeObserver(push);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--pnav-h');
    };
  }, []);

  // **워프에서 뺀다. 이게 흔들림의 원인이었다.**
  //
  // 스크롤 워프(R3)가 콘텐츠 래퍼에 `skewY`를 거는데, 이 바도 그 안에 있어 함께 기울었다.
  // sticky가 잡아 두는 것은 흐름상의 자리라서 top 값 자체는 0으로 멀쩡한데, 그 위에 얹힌
  // skew가 바를 통째로 비스듬히 눕힌다. **실측: 스크롤 중 바의 사각형 top이 0에서
  // -37까지 갔다 왔다.** 3도에 폭 절반 720px이면 720*tan(3도) = 37.7px이라 값이 맞는다.
  //
  // 전역 헤더와 자리를 다퉈서가 아니었다. 헤더를 걷어낸 뒤에도 이 값은 그대로 남아 있었다.
  // `data-warp="none"`이 같은 각을 빼서 이 요소만 안 기운 채로 세운다(ScrollWarp의 EXCLUDE).
  return (
    <nav ref={ref} className="vx-pnav" data-warp="none" aria-label={PRODUCT_NAV.label}>
      <div className="vx-pnav-bar">
        {/* 좌측 워드마크. Apple 21px/600 자리라 heading 토큰을 쓴다.
            **다시 링크가 됐다.** 탭이 라우트로 갈리면서 돌아갈 첫 화면이 생겼다
            (Apple도 좌측 제품명이 `/apple-vision-pro/`로 간다) */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            fontFamily: typography.family,
            fontSize: typography.heading.size,
            fontWeight: typography.heading.weight,
            letterSpacing: typography.heading.tracking,
            color: colors.text.primary,
            whiteSpace: 'nowrap',
          }}
        >
          {HERO.wordmark}
        </Link>

        {/* 우측 묶음. 탭 셋과 CTA 둘이 한 줄에 선다 */}
        <div className="vx-pnav-right">
          {TABS.map((t) => {
            const on = t.to === pathname;
            return (
              <Link
                key={t.key}
                to={t.to}
                aria-current={on ? 'page' : undefined}
                className="vx-pnav-tab"
                style={{
                  ...itemText,
                  // **색 하나로 구분하지 않는다.** 굵기와 밑줄이 함께 움직인다(DESIGN 13절).
                  // 현재 탭만 네이비이고 나머지는 dim이라 강조가 한 자리에만 선다
                  fontWeight: on ? weight.bold : weight.medium,
                  color: on ? colors.text.primary : colors.text.dim,
                  borderBottomColor: on ? colors.text.primary : 'transparent',
                }}
              >
                {t.label}
              </Link>
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
              우리는 잉크 채움이다(#101010 위 흰 글자 18.71) */}
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


