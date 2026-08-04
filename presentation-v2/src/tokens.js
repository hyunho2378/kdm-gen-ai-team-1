// presentation-v2 팔레트. 브랜드 원안: 블랙 + 실버 + 레드. **네이비 금지.**
// 전 섹션(S1~)이 이 팔레트를 공유한다. 값 수정은 여기서만.
// shared/tokens.js와는 별개다(앱 간 색 통일은 별개 작업). 이 파일만 고친다.
//
// **생블랙(#000000)과 생화이트(#FFFFFF)를 쓰지 않는다.** 배경은 black, 전경은 white가 기준이고
// 흰 계열 텍스트는 전부 white에서 파생시킨다. 예외는 메탈릭 그라디언트의 하이라이트 스톱 하나뿐이다.

// 전경 흰색의 채널. 흰 계열 값은 전부 여기서 파생한다. rgba 하드코딩을 막는 유일한 통로다.
const WHITE_RGB = '253, 253, 253';

/** white에서 알파만 바꿔 파생시킨다. 예: whiteA(0.5) */
export const whiteA = (a) => `rgba(${WHITE_RGB}, ${a})`;

export const colors = {
  black: '#101010', // 배경 기준. 생블랙 아님
  deep: '#0A0A0A', // 더 깊은 톤(그라디언트 하단, 비네트). 이것도 생블랙 아님
  raised: '#181818', // 살짝 뜬 표면
  white: '#FDFDFD', // 전경 기준. 생화이트 아님

  // 실버 화이트 메탈릭. 워드마크·검·HUD의 재질 표현 전용.
  // hi의 #FFFFFF는 **그라디언트 하이라이트 스톱 예외**다. 텍스트 색으로 직접 쓰지 않는다.
  silver: {
    hi: '#FFFFFF',
    mid: '#D8E2F0',
    shadow: '#6E7B92',
    gradient: 'linear-gradient(175deg, #FFFFFF 0%, #D8E2F0 45%, #6E7B92 78%, #D8E2F0 100%)',
  },

  // 포인트 레드. 명중·강조·CTA·라벨 포인트·TO-BE에만 아껴서. 화면 전체를 레드로 칠하지 않는다.
  red: '#E60D15',
  redDeep: '#80070C', // 브랜드 그라디언트의 어두운 레드 스톱
  redGlow: 'rgba(230, 13, 21, 0.45)',

  // 흰 계열 텍스트. 전부 white에서 파생한다.
  text: {
    primary: '#FDFDFD',
    secondary: whiteA(0.78),
    dim: whiteA(0.5),
    faint: whiteA(0.32),
    onFill: '#FDFDFD', // red 채움 위 텍스트
  },

  // 보더와 구분선과 표면. 같은 white에서 파생한다.
  line: {
    default: whiteA(0.14),
    strong: whiteA(0.3),
    faint: whiteA(0.06),
    hairline: whiteA(0.04),
  },
  surface: {
    glass: whiteA(0.035),
    pill: whiteA(0.06),
  },

  // 궤적: 내 검 실버-시안, 상대 레드(arena 소유 색 규칙 유지).
  trail: {
    self: '#A9DFFF',
    selfGlow: 'rgba(169, 223, 255, 0.4)',
    opponent: '#FF3B4E',
    opponentGlow: 'rgba(255, 59, 78, 0.4)',
  },
};

// 브랜드 그라디언트. 컬러 시스템 섹션이 이 값과 아래 스톱 배열을 그대로 진열한다.
export const brandGradient =
  `linear-gradient(105deg, ${colors.white} 0%, ${colors.red} 42%, ${colors.redDeep} 72%, ${colors.black} 100%)`;

// 위 그라디언트의 스톱을 순서대로. 컬러 시스템의 Color1~4 라벨이 이 배열에서 값을 읽는다.
export const brandGradientStops = [colors.white, colors.red, colors.redDeep, colors.black];

/** '#E60D15' → '230, 13, 21'. 컬러 시스템이 RGB 표기를 토큰에서 유도하게 하는 유일한 통로. */
export const hexToRgbText = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

export const typography = {
  // 본문 계열. 확정(Pretendard).
  family: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
  // 디스플레이(제목) 계열. **폰트 미정이라 본문과 분리해 둔다.**
  // S1 워드마크와 S3 컨셉명이 이 키만 참조하므로 이 한 줄을 바꾸면 제목 폰트가 전부 교체된다.
  displayFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
};

export const motion = {
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)', // 진입, 이탈
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)', // 화면 내 이동
  // GSAP 문자열 이즈. 위 CSS 곡선과 같은 성격으로 맞춘다(GSAP은 cubic-bezier 문자열을 안 받는다).
  gsapOut: 'power3.out',
  gsapInOut: 'power2.inOut',
  budget: {
    targetFps: 60,
    minFps: 30,
    dprCap: 2, // 전 캔버스 공통 DPR 상한
  },
};
