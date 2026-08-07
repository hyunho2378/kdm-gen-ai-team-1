// controller 디자인 시스템. **네이비다.**
//
// **shared/tokens.js를 고치지 않는다.** 그것은 arena의 무대(블랙 + 레드)이고 여기만 뒤집는다.
// 그래서 재수출한 뒤 바뀌는 것만 이 파일이 덮어쓴다. `export *`는 아래에 같은 이름의
// 지역 export가 있으면 그 이름을 건너뛴다(ES 모듈 규칙). brand/src/tokens.js와 같은 규약이다.
//
// ── 색의 근거 ────────────────────────────────────────────────────────────────
// 프라이머리 `#263E5F`는 presentation-v2와 brand가 쓰는 브랜드 네이비와 같은 값이다.
// 세 앱이 같은 색을 봐야 한 브랜드로 읽힌다.
//
// **레드를 통째로 걷었다.** 다크에서 `#E60D15`는 배경 대비 4.02:1이라 대형 텍스트와 UI로만
// 통과했고, 네이비 무대에서는 색상환이 정반대라 화면이 두 브랜드로 갈린다.
// 강조는 실버와 흰 채움이 나눠 받는다.
//
// ── 대비 (배경 #101925 기준) ─────────────────────────────────────────────────
//   흰 텍스트 #FDFDFD            17.2:1
//   secondary 알파 0.78          10.6:1
//   dim 알파 0.60                 6.2:1   본문 4.5 통과. 이보다 옅은 텍스트 금지
//   네이비 채움 #263E5F 위 흰 글자  10.74:1
//   판 #263E5F는 배경 위 1.9:1이라 **글자 대비가 아니라 면 구분용이다**

export * from '../../shared/tokens.js';
import {
  colors as sharedColors,
  typography as sharedTypography,
  withAlpha,
} from '../../shared/tokens.js';

// ── 원색 4개. HEX를 적는 유일한 자리다(AGENTS 예외 조항) ──────────────────────
const NAVY_DEEP = '#101925';   // 배경 바닥
const NAVY = '#263E5F';        // 프라이머리. 채움과 판
const PAPER = '#FDFDFD';       // 텍스트와 채움 위 글자
const SILVER = '#C4C4C4';      // 강조 라인과 보조 강조. 레드가 있던 자리를 나눠 받는다

/**
 * 페이지 배경. 위가 어둡고 아래가 프라이머리 쪽으로 열린다.
 * **배경 전용이고 요소 색이 아니다.** 카드나 버튼 채움에 쓰지 마라.
 */
export const pageGradient = `linear-gradient(180deg, ${NAVY_DEEP} 0%, #16233A 58%, #1E3149 100%)`;

export const colors = {
  bg: {
    base: NAVY_DEEP,
    deep: NAVY_DEEP,
    // 카드와 판. 프라이머리를 옅게 얹어 배경 위에서 한 단계 뜬다
    raised: withAlpha(NAVY, 0.55),
    overlay: withAlpha(NAVY_DEEP, 0.88),
  },
  /**
   * 프라이머리. **`red` 그룹을 이것이 대신한다.**
   * 그룹 이름을 `red`로 두고 값만 네이비로 바꾸면 이름이 거짓말이 되므로 그룹째 갈았다.
   */
  primary: {
    base: NAVY,
    fill: NAVY,
    // 눌린 상태. 채움 전용이고 fill을 명도 낮춘 값이다(DESIGN 2절 press 행)
    press: '#1B2C44',
    tonal: withAlpha(NAVY, 0.35),
    glow: withAlpha(NAVY, 0.5),
    on: PAPER,
  },
  /** 강조. 레드가 지던 "눈이 먼저 가는" 자리를 실버가 받는다. */
  accent: {
    base: SILVER,
    dim: withAlpha(SILVER, 0.7),
  },
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
  // 재질 팔레트. 3D와 궤적이 쓰는 것이라 무대 색이 아니다. 그대로 둔다
  steel: sharedColors.steel,
  trail: sharedColors.trail,
  blue: sharedColors.blue,
};

/**
 * 얼굴. **SUIT 가변폰트다.**
 * presentation-v2와 brand가 같은 CDN(`sun-typeface/SUIT@2.0.5` variable woff2)을 쓴다.
 * **축 100~900이 실제라 굵기를 합성하지 않는다.** 합성 굵기는 글자를 찌그러뜨린다.
 * 로드 실패 시 Pretendard로, 그 다음 시스템 얼굴로 내려앉는다.
 */
const SUIT =
  "'SUIT Variable', SUIT, 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif";

/**
 * 스케일(크기, 자간, 행간)은 shared 그대로 두고 **얼굴만 갈아 끼운다.**
 * `export *`가 이 지역 export에 가려지므로 원본을 펼쳐 넣지 않으면 스케일을 통째로 잃는다.
 */
export const typography = { ...sharedTypography, family: SUIT };

/** 어두운 무대라 발광이 성립한다. 다만 레드 글로우는 없다. */
export const glow = { primary: `0 0 24px ${withAlpha(NAVY, 0.5)}`, steel: 'none' };
