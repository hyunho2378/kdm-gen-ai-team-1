// 간합 디자인 토큰 v2. 실체는 이 파일 하나다. 위치: shared/tokens.js
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

export const colors = {
  bg: {
    base: BLACK,          // 지각상 블랙. 순수 #000 금지
    deep: '#0A0A0A',      // 그라디언트 하단, 비네트. base보다 어둡되 순검정 아님
    raised: '#181818',    // 카드, 패널, HUD 판넬. base보다 한 단 밝다
    overlay: withAlpha('#0A0A0A', 0.85),
  },
  red: {
    light: RED,           // 빛의 레드. 내 궤적, 다크 위 텍스트, 글로우 코어. bg.base 위 4.0:1(대형과 UI 전용)
    fill: RED_DEEP,       // 면의 레드. CTA, 배지, 플래시 채움. 위에 흰 텍스트 10.6:1
    // 버튼 press. 채움 전용. 이전 팔레트의 fill 대비 press 비율(0.76)을 그대로 옮겼다
    press: '#610509',
    glow: withAlpha(RED, 0.45),
  },
  blue: {
    light: '#35C8FF',     // AI 상대 궤적, 상대 소유 표시 전용. bg.base 위 9.8:1
    glow: 'rgba(53, 200, 255, 0.35)',
  },
  steel: {
    // 크롬 재질 그라디언트 스톱. 디스플레이 타이포, 로고, 검신, 구분선 하이라이트 전용
    // 본문, caption, HUD 텍스트 사용 금지. shadow 단독 사용 금지
    // VORTEX 리스킨에서 흰 끝단만 WHITE로 정합시켰다. mid와 shadow는 arena 정체성이라 유지한다
    hi: WHITE,
    mid: '#D8E2F0',
    shadow: '#6E7B92',
    edge: withAlpha(WHITE, 0.9),
    gradient: `linear-gradient(175deg, ${WHITE} 0%, #D8E2F0 45%, #6E7B92 78%, #D8E2F0 100%)`,
  },
  trail: {
    self: RED,                              // 내 검. red.light와 동일
    selfGlow: withAlpha(RED, 0.45),
    ai: '#35C8FF',                          // AI 상대. blue.light와 동일
    aiGlow: 'rgba(53, 200, 255, 0.35)',
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
};

export const glow = {
  // 블랙 배경에서는 그림자 대신 글로우가 깊이를 만든다. 색은 전부 팔레트에서 파생한다
  red: `0 0 24px ${colors.red.glow}`,
  blue: `0 0 24px ${colors.blue.glow}`,
  steel: `0 0 16px ${withAlpha(WHITE, 0.18)}`,
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
