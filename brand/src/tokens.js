// brand 디자인 시스템 v2 (BRAND_SITE_V2_PLAN 1절). **라이트다.**
//
// **shared/tokens.js를 고치지 않는다.** 그것은 arena와 controller와 presentation의 다크 무대이고
// 여기만 라이트로 뒤집는다. 그래서 재수출한 뒤 바뀌는 것만 이 파일이 덮어쓴다.
// `export *`는 아래에 같은 이름의 지역 export가 있으면 그 이름을 건너뛴다(ES 모듈 규칙).
// 안 덮은 것(motion, radius, spacing, zIndex, breakpoints, withAlpha, steel, trail)은 shared 그대로다.
//
// ── 값의 근거 ────────────────────────────────────────────────────────────────
// 레퍼런스를 문서 요약이 아니라 **직접 브라우저로 열어 computed style로 쟀다**(1440 폭).
//
//   Satisfy   헤드라인 60 / 48 / 43.2px, 전부 weight 900, 자간 normal
//             워드마크 24px/900/-0.48px, 내비와 본문 14px/400, 캡션 12px
//   Apple     디스플레이 56px/600/-0.28px, 섹션 h2 28px/600, 카드 24px/700
//             본문과 CTA 17px/400/-0.374px, 내비 12px/400/-0.12px
//
// **두 곳 다 "전부 작다"가 아니다.** 헤드라인은 48~60px로 크고 나머지 전부가 12~17px로 작다.
// 위계는 그 간극과 굵기가 만든다. 그래서 축소의 대상은 헤드라인을 12px로 줄이는 것이 아니라
// **136px까지 가던 display를 60px대로 끌어내리는 것**이다.

export * from '../../shared/tokens.js';
import { colors as sharedColors, withAlpha, darken } from '../../shared/tokens.js';

// ── 원색 3개. HEX를 적는 유일한 자리다(AGENTS 예외 조항) ──────────────────────
const INK = '#101010';          // 메인 텍스트
const BG_TOP = '#C1C1C1';       // 배경 그라디언트 최상단
const BG_BOTTOM = '#F6F6F6';    // 배경 그라디언트 최하단
const PAPER = '#FDFDFD';        // 어두운 채움 위 글자

/**
 * 페이지 배경. 일자 수직 그라디언트다.
 * **배경 전용이고 요소 색이 아니다**(PLAN 1절). 카드나 버튼 채움에 쓰지 마라.
 */
export const pageGradient = `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`;

/**
 * 색 v2.
 *
 * **애매한 중간 회색이 없다.** 회색으로 보여야 하는 것은 전부 INK의 알파이고,
 * 그래서 배경 그라디언트가 어디를 지나든 같은 잉크의 농도로만 읽힌다.
 *
 * **알파는 실측으로 정했다.** 어두운 글자는 배경이 어두울수록 불리하므로 최악은
 * 그라디언트 최상단 #C1C1C1이다. 거기서 잰 대비가 아래와 같다.
 *
 *   알파 0.78  6.6:1   secondary
 *   알파 0.66  4.8:1   dim (본문 4.5 통과. 이보다 옅은 텍스트 금지)
 *   알파 0.55  3.5:1   미달. 다크 시절 dim 알파를 그대로 옮기면 여기서 깨진다
 */
export const colors = {
  bg: {
    // 단색이 필요한 자리(프리로더, 시트)는 그라디언트의 밝은 끝을 쓴다
    base: BG_BOTTOM,
    deep: BG_TOP,
    // 카드 판. 라이트에서는 흰 오버레이가 아니라 **잉크를 아주 옅게 얹어** 한 단계 눌린다
    raised: withAlpha(INK, 0.04),
    // 시트 뒤 스크림. 라이트 페이지 위에서도 뒤가 죽어야 한다
    overlay: withAlpha(INK, 0.45),
  },
  /**
   * 강조 채움. **레드를 브랜드에서 통째로 걷었다.**
   *
   * 라이트 배경에서 레드는 어느 값을 써도 대가가 있었다. #E60D15는 그라디언트 최상단
   * #C1C1C1 위에서 2.63:1이라 대형 기준 3.0도 미달이고, 그래서 #80070C로 내렸는데
   * 그것은 이미 브랜드 레드로 안 읽히는 자주색이다. **레드가 살아 있는 자리가 없다.**
   *
   * 그래서 강조는 잉크가 진다. 채움은 #101010이고 그 위 흰 글자가 18.71:1이다.
   * 레퍼런스도 같은 문법이다(Satisfy 흰 배경에 검은 알약, Apple 흰 배경에 검은 텍스트).
   */
  fill: {
    base: INK,
    // 눌린 상태. 잉크는 더 어두워질 수 없으므로 알파를 낮춰 물러난다
    press: withAlpha(INK, 0.82),
    on: PAPER,
  },
  text: {
    primary: INK,
    secondary: withAlpha(INK, 0.78),
    dim: withAlpha(INK, 0.66),
    // 딥 레드 채움 위. 대비 10.57
    onFill: PAPER,
  },
  line: {
    default: withAlpha(INK, 0.12),
    strong: withAlpha(INK, 0.28),
  },
  // 아래 둘은 페이지 색이 아니라 **재질 팔레트**다. 3D 크롬 재질과 조명, 검 궤적이 쓴다.
  // 라이트로 뒤집을 대상이 아니라 그대로 둔다
  steel: sharedColors.steel,
  trail: sharedColors.trail,
  blue: sharedColors.blue,
};

/**
 * 굵기 스케일. **역할 토큰(display, title...)에 안 얹히는 자리를 위한 것이다.**
 * 버튼 라벨, 활성 내비, 탭처럼 크기는 다른 역할을 쓰면서 굵기만 따로 정하는 자리가 있는데
 * 거기에 숫자를 손으로 적으면 500과 600이 파일마다 흩어진다(BV2-4 착수 시 12군데였다).
 * 값은 강릉페이 tokens의 weight 스케일과 같은 이름과 같은 숫자다.
 */
export const weight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 800,
};

/**
 * 타이포 v2. **위계를 크기로 벌리지 않는다.**
 *
 * 헤드라인이 둘(display, title)이고 그 아래는 전부 12~17px 계열이다. 슬라이드마다
 * 제목 크기를 새로 정하는 일이 없게 헤드라인 계열을 이 둘로 못 박는다.
 *
 * 상한을 레퍼런스에 맞춰 잘랐다. 예전 display는 8.5rem(136px)까지 갔는데 Satisfy가 60px,
 * Apple이 56px에서 멈춘다. 그 위로 올릴 근거가 실측에 없었다.
 *
 *   display  136px → 64px (1440에서 52.8px)
 *   title     68px → 36px (1440에서 32.8px)
 *   heading   28px → 22px
 *   body      18px → 17px (Apple 본문과 같다)
 *   hud/eyebrow                12px (Apple 내비와 같다)
 */
export const typography = {
  family: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
  // 히어로 딥다이브의 한 순간에만 쓴다. 섹션 제목에 쓰지 마라
  display: { size: 'clamp(2.5rem, 1.5rem + 2vw, 4rem)', weight: 800, tracking: '-0.02em', leading: 1.04 },
  // 섹션 헤드라인. **전 페이지가 이 하나를 쓴다**
  title: { size: 'clamp(1.5rem, 1.15rem + 1vw, 2.25rem)', weight: 700, tracking: '-0.02em', leading: 1.2 },
  // 서브 헤드라인(카드 제목, 블록 제목). Satisfy 상품명 18px/900과 같은 자리다
  heading: { size: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)', weight: 700, tracking: '-0.01em', leading: 1.3 },
  body: { size: 'clamp(0.9375rem, 0.9rem + 0.15vw, 1.0625rem)', weight: 400, tracking: '-0.01em', leading: 1.6 },
  caption: { size: '0.8125rem', weight: 400, tracking: '0', leading: 1.5 },
  // 내비와 라벨. Apple 내비 12px/-0.12px(=-0.01em)을 그대로 따른다
  hud: { size: '0.75rem', weight: 600, tracking: '0.06em', leading: 1.2 },
  /**
   * 아이브로우 v3. **21px에서 12px로 줄였다.**
   * 21px/700이던 것은 다크 시절 red.light가 4.02:1이라 대형 텍스트 예외로만 통과했기 때문이다.
   * 지금 레드는 #80070C라 최악 배경에서도 5.97:1이고, 12px 본문 기준 4.5를 그냥 넘긴다.
   * 크기로 버틸 이유가 사라져서 레퍼런스의 작고 정밀한 라벨로 되돌린다.
   */
  eyebrow: { size: '0.75rem', weight: 700, tracking: '0.1em', leading: 1.3 },
};

/** 라이트 배경에서 발광은 성립하지 않는다. 전부 걷는다(PLAN 1절 모션). */
export const glow = { blue: 'none', steel: 'none' };

/**
 * 워드마크와 대형 제목의 글자 처리. **크롬 그라디언트를 걷고 평면 잉크로 간다.**
 * 흰색에서 스틸로 흐르는 그라디언트는 어두운 무대를 전제한 것이라 밝은 배경에서는
 * 글자가 배경에 녹는다. 레퍼런스도 흰 배경 위 단색 워드마크다(Satisfy 검정 24px/900).
 * 키 이름을 유지해서 부르는 쪽(Header, HeroWordmark, Landing)이 안 바뀐다.
 */
export const steelText = { color: INK };

// 제목(디스플레이) 폰트는 미정이다. 지금은 본문과 같은 Pretendard를 가리키고
// 폰트가 정해지면 **이 키 한 줄만** 바꾼다. 워드마크와 대형 제목이 이 키를 참조한다.
export const displayFamily = "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
