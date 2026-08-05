// controller 화면 문구 단일 원천(제품명·랜딩 카피). 컴포넌트에 제품명을 하드코딩하지 않는다.
// arena/src/copy.js, brand/src/copy.js와 같은 규약(VORTEX 네이밍 통일 트랙).
// 정적 HTML의 <title>은 상수를 못 읽으므로 controller/index.html에서 직접 관리한다.

export const BRAND = 'VORTEX';

export const HOME = {
  sub: '거리와 타이밍을 몸으로 익히는 몰입형 펜싱 XR',
  guest: '게스트로 시작',
  login: '로그인',
  loginSheetTitle: '로그인',
  loginSheetBody: '데모 버전은 게스트로 진행합니다. 별도 계정 없이 바로 시작할 수 있습니다.',
  loginSheetClose: '닫기',
};
