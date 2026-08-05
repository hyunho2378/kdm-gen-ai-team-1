// VORTEX 디자인 토큰 v2. 실체는 이 파일 하나다. 위치: shared/tokens.js
// 각 앱의 src/tokens.js는 이 파일을 재수출한다. 값 수정은 여기서만 한다.
// 근거와 사용 규칙: docs/DESIGN.md v2
//
// 색은 VORTEX 브랜드 확정값이다. 원본은 VORTEX_DESIGN_SYSTEM.md.
// **키 구조와 소유 의미는 그대로 두고 값만 갈았다**(갈래 B). 궤적과 램프의 소유는
// 내 검 레드 / 상대 블루로 유지한다. 근거는 DESIGN.md 2절 "소유 관계 결정".
//
// **순수 #000000과 #FFFFFF를 쓰지 않는다.** 배경 계열은 BLACK에서, 흰 계열은 WHITE에서만 파생한다.

// VORTEX 확정 4색. 아래 팔레트의 모든 값이 이 넷에서 나온다.
const BLACK = '#101010';     // Primary 배경. RGB 16,16,16
const WHITE = '#FDFDFD';     // 전경. RGB 253,253,253
const RED = '#E60D15';       // Branding Red. RGB 230,13,21
const RED_DEEP = '#80070C';  // Red Deep. 브랜드 그라디언트의 깊은 쪽 스톱

// VORTEX가 값을 정하지 않은 층. base 기준 상대 밝기 관계만 유지해 재산출했다
const DEEP = '#0A0A0A';      // base보다 어둡되 순검정 아님
const RAISED = '#181818';    // base보다 한 단 밝다

// arena 고유. VORTEX에 블루 정의가 없어 상대 식별색만 남는다
const BLUE = '#35C8FF';
// 크롬 재질 스톱. arena 정체성이라 값을 유지한다
const STEEL_MID = '#D8E2F0';
const STEEL_SHADOW = '#6E7B92';

/**
 * HEX에서 rgba 문자열을 만든다. **알파 파생값을 손으로 적지 않기 위한 유일한 통로다.**
 * 브랜드 색이 또 바뀔 때 rgba를 따로 고쳐야 하는 자리를 남기지 않는다.
 */
export function withAlpha(hex, a) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const v = parseInt(n, 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${a})`;
}

/**
 * HEX를 명도 방향으로 낮춘다. **어둡기 파생값을 손으로 적지 않기 위한 유일한 통로다.**
 * ratio 0.2면 각 채널이 20퍼센트 어두워진다(계수 0.8을 곱한다).
 *
 * 알파를 덮어 눌러 어둡게 만드는 방법을 쓰지 않는다. 그러면 뒤 배경이 비쳐서
 * 같은 버튼이 카드 위와 배경 위에서 다른 색이 된다. press는 채움 전용이라 불투명해야 한다.
 *
 * 채널 곱셈이라 감마를 고려하지 않는다. 지각 명도가 아니라 sRGB 값을 낮추는 것이고
 * DESIGN 2절이 요구하는 것도 그것이다. 색상(hue)은 비율이 유지되므로 그대로 남는다.
 */
export function darken(hex, ratio) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const v = parseInt(n, 16);
  const k = Math.max(0, 1 - ratio);
  const ch = (shift) => Math.round(((v >> shift) & 255) * k).toString(16).padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`.toUpperCase();
}

export const colors = {
  bg: {
    base: BLACK,          // 지각상 블랙. 순수 #000 금지
    deep: DEEP,           // 그라디언트 하단, 비네트
    raised: RAISED,       // 카드, 패널, HUD 판넬
    overlay: withAlpha(DEEP, 0.85),
  },
  red: {
    light: RED,           // 빛의 레드. 내 궤적, 다크 위 텍스트, 글로우 코어. bg.base 위 4.0:1(대형과 UI 전용)
    // **채움도 같은 브랜드 레드다.** 화면에서 레드는 #E60D15 하나로 읽혀야 한다.
    // 흰 텍스트가 4.5:1을 넘는 최소 darken 값을 찾았더니 **0이었다**(실측 4.66:1).
    // 어둡게 할수록 흰 텍스트 대비는 오르므로 브랜드 레드 그대로가 하한이자 정답이다.
    // 이전 채움 #80070C는 배경(#101010) 대비 1.77:1이라 버튼이 무대에 잠겨 있었다(지금 4.02:1)
    fill: RED,
    // 딥 레드. **채움 표준이 아니다.** 브랜드 그라디언트의 깊은 쪽 스톱과 깊이용 액센트 전용
    deep: RED_DEEP,
    // 버튼 press. 채움 전용. **fill에서 파생한다. 임의 HEX 금지**(DESIGN 2절 press 행).
    // VORTEX 컬러 시스템에 press 값이 없어서 fill을 명도 20퍼센트 낮춘다.
    // 이전 리터럴 #610509는 옛 팔레트 비율(0.76)로 손으로 적은 추론값이라 폐기했다
    press: darken(RED, 0.2),
    glow: withAlpha(RED, 0.45),
    // Tonal 버튼(MD3 위계 2순위)의 저알파 red 채움. 강릉페이 primary[100] 자리(색만 VORTEX red)
    tonal: withAlpha(RED, 0.14),
  },
  blue: {
    light: BLUE,          // AI 상대 궤적, 상대 소유 표시 전용. bg.base 위 9.8:1
    glow: withAlpha(BLUE, 0.35),
  },
  steel: {
    // 크롬 재질 그라디언트 스톱. 디스플레이 타이포, 로고, 검신, 구분선 하이라이트 전용
    // 본문, caption, HUD 텍스트 사용 금지. shadow 단독 사용 금지
    // VORTEX 리스킨에서 흰 끝단만 WHITE로 정합시켰다. mid와 shadow는 arena 정체성이라 유지한다
    hi: WHITE,
    mid: STEEL_MID,
    shadow: STEEL_SHADOW,
    edge: withAlpha(WHITE, 0.9),
    gradient: `linear-gradient(175deg, ${WHITE} 0%, ${STEEL_MID} 45%, ${STEEL_SHADOW} 78%, ${STEEL_MID} 100%)`,
  },
  trail: {
    self: RED,                              // 내 검. red.light와 동일
    selfGlow: withAlpha(RED, 0.45),
    ai: BLUE,                               // AI 상대. blue.light와 동일
    aiGlow: withAlpha(BLUE, 0.35),
    hit: WHITE,                             // 명중 순간 코어 고정
  },
  text: {
    primary: WHITE,
    secondary: withAlpha(WHITE, 0.78),
    dim: withAlpha(WHITE, 0.55),            // 가독 하한선. 이보다 어두운 텍스트 금지
    onFill: WHITE,                          // red.fill 위 텍스트
  },
  line: {
    default: withAlpha(WHITE, 0.14),
    strong: withAlpha(WHITE, 0.32),
  },
};

export const typography = {
  family: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
  // 상한은 3840 기준으로 잡는다. 6rem과 3rem에서 멈추면 2560과 3840에서 제목이 작아 보인다(RESPONSIVE 4K 절)
  display: { size: 'clamp(2.5rem, 1.2rem + 6vw, 8.5rem)', weight: 800, tracking: '-0.03em', leading: 1.05 },   // 크롬 허용
  title:   { size: 'clamp(1.75rem, 1rem + 3vw, 4.25rem)', weight: 700, tracking: '-0.02em', leading: 1.15 },   // 크롬 허용
  heading: { size: 'clamp(1.25rem, 1rem + 0.8vw, 1.75rem)', weight: 600, tracking: '-0.01em', leading: 1.3 },
  body:    { size: 'clamp(1rem, 0.95rem + 0.2vw, 1.125rem)', weight: 400, tracking: '0', leading: 1.7 },
  caption: { size: '0.8125rem', weight: 400, tracking: '0.01em', leading: 1.5 },
  hud:     { size: 'clamp(0.875rem, 0.8rem + 0.3vw, 1.125rem)', weight: 600, tracking: '0.06em', leading: 1.2 },
};

export const spacing = {
  unit: 8,  // 8pt 그리드. 허용 배수 4/8/12/16/24/32/48/64/96
  section: 'clamp(4rem, 2rem + 8vw, 10rem)',
  gutter: 'clamp(1rem, 0.5rem + 2vw, 2.5rem)',
  maxContent: '1280px',
  maxWide: '1680px',
};

export const radius = {
  xs: 4, sm: 8, md: 12, lg: 16, pill: 999,
  // 강릉페이 이식 시맨틱 별칭(controller VORTEX 앱). 값은 위 스케일과 같은 격자다.
  small: 8, button: 12, card: 16, chip: 20, modal: 20,
};

// iOS HIG 고정 타이포 스케일. controller VORTEX 폰 앱(390px 고정) 전용이다.
// arena의 fluid typography(clamp)와는 별개 — 폰은 뷰포트가 고정이라 고정 px가 맞다.
// 자간 규칙: 본문 -0.01em, 제목 -0.02em(강릉페이 DESIGN 이식).
export const ig = {
  largeTitle: { size: 34, weight: 700, tracking: '-0.02em', leading: 1.12 },
  title1:     { size: 28, weight: 700, tracking: '-0.02em', leading: 1.18 },
  title2:     { size: 22, weight: 700, tracking: '-0.02em', leading: 1.25 },
  title3:     { size: 20, weight: 600, tracking: '-0.01em', leading: 1.3 },
  body:       { size: 17, weight: 400, tracking: '-0.01em', leading: 1.5 },
  callout:    { size: 16, weight: 400, tracking: '-0.01em', leading: 1.45 },
  subhead:    { size: 15, weight: 400, tracking: '-0.01em', leading: 1.4 },
  footnote:   { size: 13, weight: 400, tracking: '0', leading: 1.38 },
  caption1:   { size: 12, weight: 400, tracking: '0', leading: 1.33 },
  caption2:   { size: 11, weight: 400, tracking: '0', leading: 1.3 },
};

export const glow = {
  // 블랙 배경에서는 그림자 대신 글로우가 깊이를 만든다. 색은 전부 팔레트에서 파생한다
  red: `0 0 24px ${colors.red.glow}`,
  blue: `0 0 24px ${colors.blue.glow}`,
  steel: `0 0 16px ${withAlpha(WHITE, 0.18)}`,
};

// 크롬(메탈릭) 텍스트. steel 그라디언트를 글자 모양으로 클립한다. 워드마크·디스플레이 전용.
// arena ChromeText와 같은 기법이고, controller 워드마크가 라이브러리 없이 재사용한다.
export const steelText = {
  backgroundImage: colors.steel.gradient,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

export const breakpoints = {
  xs: 320, sm: 390, md: 768, lg: 1024, xl: 1280,
  xxl: 1440, xxxl: 1920, uw: 2560, uw4k: 3840,
};

export const motion = {
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',        // 진입, 이탈
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',     // 화면 내 이동
  easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)',     // 시트, 드로어
  thrust: 'cubic-bezier(0.7, 0, 0.3, 1)',           // 캔버스 전용 찌르기 가속. DOM 금지
  duration: { press: 140, tooltip: 160, dropdown: 200, modal: 300, page: 180, judge: 800 },
  spring: {
    move: { damping: 1.0, response: 0.4 },
    rotate: { damping: 0.8, response: 0.4 },
    drawer: { damping: 0.8, response: 0.3 },
  },
  budget: {
    // arena 성능 예산. 렌더러가 이 상한을 참조한다
    targetFps: 60,
    minFps: 30,
    trailMaxSegments: 240,
    particleMax: 300,
    afterimageMax: 6,
  },
  timeDilation: { scale: 0.35, maxMs: 1200, cooldownMs: 8000 },
};

export const zIndex = {
  content: 0, sticky: 10, dropdown: 30, header: 50,
  overlay: 90, modal: 100, toast: 110,
};
