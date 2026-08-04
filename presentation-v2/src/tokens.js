// presentation-v2 팔레트. 브랜드 원안: 블랙 + 실버 + 레드. **네이비 금지.**
// 전 섹션(S1~)이 이 팔레트를 공유한다. 값 수정은 여기서만.

export const colors = {
  black: '#0A0A0B', // 바탕. 거의 순수 블랙(네이비 아님)
  deep: '#050506', // 더 깊은 블랙(그라디언트·비네트 하단)
  raised: '#141416', // 살짝 뜬 표면

  // 실버 화이트 메탈릭. 워드마크·검·HUD·주 텍스트의 기준.
  silver: {
    hi: '#FFFFFF',
    mid: '#D8E2F0',
    shadow: '#6E7B92',
    gradient: 'linear-gradient(175deg, #FFFFFF 0%, #D8E2F0 45%, #6E7B92 78%, #D8E2F0 100%)',
  },

  // 포인트 레드. 명중·강조·CTA·유효 구간에만 아껴서. 화면 전체를 레드로 칠하지 않는다.
  red: '#B3122C',
  redGlow: 'rgba(179, 18, 44, 0.45)',

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
