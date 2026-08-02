// 간합 디자인 토큰. 실체는 이 파일 하나다.
// 각 앱의 src/tokens.js는 이 파일을 재수출한다. 값 수정은 여기서만 한다.

export const colors = {
  bg: {
    base: '#0D1117',        // 차콜 네이비. 순수 검정 금지
    raised: '#161B22',
    overlay: 'rgba(13, 17, 23, 0.85)',
  },
  accent: {
    red: '#E5484D',         // 명중, 경고, TO-BE, CTA 전용
    redDim: '#8B2A2E',
  },
  trail: {
    self: '#4CC2FF',        // 내 검 궤적. 시안 블루
    selfGlow: 'rgba(76, 194, 255, 0.35)',
    ai: '#E5484D',          // AI 상대 궤적. 레드
    aiGlow: 'rgba(229, 72, 77, 0.35)',
    neutral: '#3FD68C',     // 보조 그린. 가이드 라인, 안전 상태
  },
  text: {
    primary: '#F0F3F6',
    secondary: '#9BA3AE',
    muted: '#5C6470',
    onAccent: '#0D1117',
  },
  line: {
    default: 'rgba(240, 243, 246, 0.12)',
    strong: 'rgba(240, 243, 246, 0.28)',
  },
};

export const typography = {
  family: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
  display: {
    size: 'clamp(2.5rem, 1.2rem + 4.5vw, 6rem)',
    weight: 800, tracking: '-0.03em', leading: 1.05,
  },
  title: {
    size: 'clamp(1.75rem, 1.1rem + 2vw, 3rem)',
    weight: 700, tracking: '-0.02em', leading: 1.15,
  },
  heading: {
    size: 'clamp(1.25rem, 1rem + 0.8vw, 1.75rem)',
    weight: 600, tracking: '-0.01em', leading: 1.3,
  },
  body: {
    size: 'clamp(1rem, 0.95rem + 0.2vw, 1.125rem)',
    weight: 400, tracking: '0', leading: 1.7,
  },
  caption: {
    size: '0.8125rem',
    weight: 400, tracking: '0.01em', leading: 1.5,
  },
  hud: {
    size: 'clamp(0.875rem, 0.8rem + 0.3vw, 1.125rem)',
    weight: 600, tracking: '0.06em', leading: 1.2,  // HUD는 대문자 소형 라벨 전제
  },
};

export const spacing = {
  unit: 8,  // 8pt 그리드. 4/8/12/16/24/32/48/64/96
  section: 'clamp(4rem, 2rem + 8vw, 10rem)',
  gutter: 'clamp(1rem, 0.5rem + 2vw, 2.5rem)',
  maxContent: '1280px',
  maxWide: '1680px',
};

export const breakpoints = {
  xs: 320, sm: 390, md: 768, lg: 1024, xl: 1280,
  xxl: 1440, xxxl: 1920, uw: 2560, uw4k: 3840,
};

export const motion = {
  // 이징. 찌르기 리듬: 길게 준비하고 짧게 꽂는다
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  thrust: 'cubic-bezier(0.8, 0, 0.2, 1)',
  duration: { fast: 150, base: 250, slow: 450, judge: 800 },
  // 성능 예산 (arena). 이 상한을 코드가 참조한다
  budget: {
    targetFps: 60,
    minFps: 30,
    trailMaxSegments: 240,     // 검 하나당 궤적 세그먼트 상한
    particleMax: 300,          // 동시 파티클 상한
    afterimageMax: 6,          // 실루엣 잔상 프레임 상한
  },
  // 시간 팽창
  timeDilation: { scale: 0.35, maxMs: 1200, cooldownMs: 8000 },
};

export const zIndex = {
  base: 0, trail: 10, silhouette: 20, hud: 100,
  overlay: 500, modal: 800, toast: 900,
};
