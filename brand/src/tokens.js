// 실체는 shared/tokens.js. 값을 여기서 수정하지 마라.
//
// shared의 4색이 이미 VORTEX_DESIGN_SYSTEM 2.1 확정값과 같다.
// black #101010, white #FDFDFD, red #E60D15, redDeep #80070C, redGlow rgba(230,13,21,0.45).
// 그래서 값을 다시 적지 않고 재수출한다. 두 벌로 적으면 한쪽만 고쳐지는 날이 온다.
export * from '../../shared/tokens.js';

// 아래 둘은 shared에 없는 brand 전용 추가분이다. shared는 이 세션에서 수정 금지라 여기 둔다.

// 2.1 Brand Gradient. 스톱 순서 FDFDFD, E60D15, 80070C, 101010.
// HEX를 적는 유일한 자리다. 스톱이 넷이라 shared의 파생 함수로는 나오지 않는다.
export const brandGradient = 'linear-gradient(105deg, #FDFDFD 0%, #E60D15 42%, #80070C 72%, #101010 100%)';

// 2.2 제목(디스플레이) 폰트는 미정이다. 지금은 본문과 같은 Pretendard를 가리키고
// 폰트가 정해지면 **이 키 한 줄만** 바꾼다. 워드마크와 대형 제목이 이 키를 참조한다.
export const displayFamily = "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
