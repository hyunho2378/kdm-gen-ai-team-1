// arena 디자인 시스템. **무대는 네이비이고 소유 색은 그대로다.**
//
// **shared/tokens.js를 고치지 않는다.** 재수출한 뒤 바뀌는 것만 이 파일이 덮는다
// (brand는 라이트로, controller는 네이비로 같은 규약을 쓴다). `export *`는 아래에 같은
// 이름의 지역 export가 있으면 그 이름을 건너뛴다(ES 모듈 규칙).
//
// ── 레드를 두 갈래로 가른다 ─────────────────────────────────────────────────
// arena는 다른 두 앱과 사정이 다르다. **레드가 UI 강조이면서 동시에 소유 색이다.**
// 그래서 통째로 걷으면 "내 것"과 "상대 것"을 가르는 문법이 함께 죽는다.
//
//   유지  소유와 판정   내 램프, 내 점수, 내 피스트 점, 판정 텍스트, 명중 FUI, 유효 거리 밴드
//                     DESIGN 3절이 "내 검 레드, 상대 블루"로 못박은 자리다. 네이비로 바꾸면
//                     상대 블루(#35C8FF)와 색상환에서 붙어 구분이 죽는다
//   교체  순수 UI      버튼 채움, 코치마크, 상태 칩, 유파 카드, fps, 디버그, 프레임 장식,
//                     포커스 링. 소유와 무관하고 강조만 하던 자리라 네이비와 실버가 받는다
//   무변경 캔버스      궤적, 잔상, 파티클, 3D. 표준 문서 배너의 canvas/WebGL 예외다
//
// 그래서 `red`와 `blue` 그룹을 **남긴다.** 이름이 거짓말이 아니고 소비자가 실제로 그 뜻으로
// 쓴다(controller에서 그룹째 걷은 것과 반대인 것은 그쪽에 소유 색이 없기 때문이다).
//
// ── 대비 (배경 #101925 기준) ─────────────────────────────────────────────────
//   흰 텍스트 #FDFDFD        17.2:1
//   실버 #C4C4C4             11.3:1
//   네이비 채움 위 흰 글자     10.74:1
//   레드 #E60D15              4.13:1   소유 표시 전용. 본문에 쓰지 않는다

export * from '../../shared/tokens.js';
import {
  colors as sharedColors,
  glow as sharedGlow,
  typography as sharedTypography,
  withAlpha,
} from '../../shared/tokens.js';

// ── 원색 4개. HEX를 적는 유일한 자리다(AGENTS 예외 조항) ──────────────────────
const NAVY_DEEP = '#101925';   // 무대 바닥
const NAVY = '#263E5F';        // 프라이머리. 채움과 판
const PAPER = '#FDFDFD';       // 텍스트
const SILVER = '#C4C4C4';      // 보조 강조. 레드가 지던 UI 자리를 받는다

export const colors = {
  ...sharedColors,
  bg: {
    base: NAVY_DEEP,
    deep: '#0B121B',
    // HUD 판넬. 프라이머리를 옅게 얹어 무대 위에서 한 단계 뜬다
    raised: withAlpha(NAVY, 0.5),
    overlay: withAlpha(NAVY_DEEP, 0.86),
  },
  /** UI 프라이머리. **소유 색이 아니다.** 버튼과 판과 선택 표시가 이것을 본다. */
  primary: {
    base: NAVY,
    fill: NAVY,
    // 눌린 상태. 채움 전용이고 fill을 명도 낮춘 값이다(DESIGN 2절 press 행)
    press: '#1B2C44',
    tonal: withAlpha(NAVY, 0.35),
    glow: withAlpha(NAVY, 0.5),
    on: PAPER,
  },
  /** UI 보조 강조(실버). 경고와 디버그와 프레임 장식이 쓴다. */
  accent: {
    base: SILVER,
    dim: withAlpha(SILVER, 0.7),
    glow: withAlpha(SILVER, 0.3),
  },
  // **소유 색 둘은 shared 그대로다.** 내 것이 레드, 상대가 블루(DESIGN 3절)
  red: sharedColors.red,
  blue: sharedColors.blue,
  text: {
    primary: PAPER,
    secondary: withAlpha(PAPER, 0.78),
    // 가독 하한선. 이보다 옅은 텍스트 금지
    dim: withAlpha(PAPER, 0.6),
    onFill: PAPER,
  },
  line: {
    default: withAlpha(PAPER, 0.14),
    strong: withAlpha(PAPER, 0.34),
  },
};

/**
 * 얼굴. **SUIT 가변폰트다.**
 * brand와 controller와 presentation-v2가 같은 CDN 같은 버전을 쓴다.
 * **축 100~900이 실제라 굵기를 합성하지 않는다.** 합성 굵기는 글자를 찌그러뜨린다.
 */
const SUIT =
  "'SUIT Variable', SUIT, 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif";

/** 스케일은 shared 그대로 두고 얼굴만 갈아 끼운다. */
export const typography = { ...sharedTypography, family: SUIT };

/** 대형 제목과 워드마크. 크롬 재질을 쓰는 자리라 얼굴만 같이 간다. */
export const displayFamily = SUIT;

/** 발광. **UI 글로우는 네이비이고 소유 글로우(red, blue)는 shared 그대로다.** */
export const glow = { ...sharedGlow, primary: `0 0 24px ${withAlpha(NAVY, 0.5)}` };
