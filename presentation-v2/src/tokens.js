// presentation-v2 팔레트. 브랜드 원안: 블랙 + 실버 + 레드. **네이비 금지.**
// 전 섹션(S1~)이 이 팔레트를 공유한다. 값 수정은 여기서만.
// shared/tokens.js와는 별개다(앱 간 색 통일은 별개 작업). 이 파일만 고친다.

export const colors = {
  black: '#000000', // 바탕. 순수 블랙 확정. 깊이는 그라디언트가 아니라 레드 radial 글로우가 만든다
  deep: '#050506', // 더 깊은 블랙(그라디언트·비네트 하단)
  raised: '#141416', // 살짝 뜬 표면

  // 실버 화이트 메탈릭. 워드마크·검·HUD·주 텍스트의 기준.
  silver: {
    hi: '#FFFFFF',
    mid: '#D8E2F0',
    shadow: '#6E7B92',
    gradient: 'linear-gradient(175deg, #FFFFFF 0%, #D8E2F0 45%, #6E7B92 78%, #D8E2F0 100%)',
  },

  // 포인트 레드. 명중·강조·CTA·라벨 포인트·TO-BE에만 아껴서. 화면 전체를 레드로 칠하지 않는다.
  red: '#E60D15',
  redGlow: 'rgba(230, 13, 21, 0.45)',

  text: {
    primary: '#F2F6FF',
    secondary: 'rgba(242, 246, 255, 0.78)',
    dim: 'rgba(242, 246, 255, 0.5)',
  },

  // 궤적: 내 검 실버-시안, 상대 레드(arena 소유 색 규칙 유지).
  trail: {
    self: '#A9DFFF',
    selfGlow: 'rgba(169, 223, 255, 0.4)',
    opponent: '#FF3B4E',
    opponentGlow: 'rgba(255, 59, 78, 0.4)',
  },
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
};
