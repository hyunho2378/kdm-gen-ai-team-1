// controller 화면 문구 단일 원천(제품명·랜딩 카피). 컴포넌트에 제품명을 하드코딩하지 않는다.
// arena/src/copy.js, brand/src/copy.js와 같은 규약(VORTEX 네이밍 통일 트랙).
// 정적 HTML의 <title>은 상수를 못 읽으므로 controller/index.html에서 직접 관리한다.

export const BRAND = 'VORTEX';

// PLAY 첫 진입 코치마크 2종(강릉페이 S7). 폰 조작은 제스처라 특정 요소가 아닌 중앙 툴팁으로 안내한다.
export const PLAY_COACH = [
  '폰을 세로로 세워 쥔 자세가 기본입니다. 앞으로 눕히며 지르면 찌르기입니다.',
  '막을 때는 폰을 좌우 아무 쪽으로나 기울입니다. 세로로 돌아오면 풀립니다.',
  '화면 하단을 위아래로 밀면 전진과 후퇴입니다.',
];

export const HOME = {
  sub: '거리와 타이밍을 몸으로 익히는 몰입형 펜싱 XR',
  guest: '게스트로 시작',
  login: '로그인',
  loginSheetTitle: '로그인',
  loginSheetBody: '데모 버전은 게스트로 진행합니다. 별도 계정 없이 바로 시작할 수 있습니다.',
  loginSheetClose: '닫기',
};

// AI 대전자 유파. **카피는 VORTEX 3.11 원문 그대로**(presentation-v2 DUELIST_STYLES와 문자 일치, 인용문 포함).
// school은 shared/protocol.js SCHOOL 값. fact는 FENCING_RULES 근거 한 줄(표시 전용).
// 사진은 라이선스 미확인이라 반입하지 않는다. 부재 시 그라디언트 플레이스홀더로 내려앉는다(미해결 기록).
export const SELECT = {
  title: 'AI 대전자 선택',
  sub: '유파별 거리 습관을 가진 별도의 인격이다. 탭하면 상세가 열린다.',
  duel: '이 상대와 대전',
  cards: [
    {
      school: 'sabre',
      name: '이탈리아 세이버 유파',
      badge: 'Ver.1 공격형',
      style: '빠른 풋워크로 거칠게 좁혀오는 스타일',
      quote: '“긴장감을 조성해서 실수를 유발시키자.”',
      fact: '허리 위가 표적이고 베기와 팁이 모두 유효한 절단계다. 동시 개시는 무득점(시뮬타네).',
    },
    {
      school: 'epee',
      name: '프랑스 에페 유파',
      badge: 'Ver.2 카운터형',
      style: '거리를 일정하게 유지하며 상대를 기다리는 스타일',
      quote: '“먼저 움직이면 불리해진다.”',
      fact: '전신이 표적이고 우선권이 없어, 40ms 안의 동시타는 양쪽 다 득점(더블 투셰)이다.',
    },
    {
      school: 'hungarian',
      name: '헝가리안 유파',
      badge: 'Ver.3 심리전형',
      style: '페인트와 리듬 브레이크로 판단을 교란하는 스타일',
      quote: '“침착한 관찰력이 곧 승리다.”',
      fact: '라다엘리 사브르를 계승해 베기 호와 시뮬타네 규칙을 세이버와 공유한다.',
    },
    {
      school: 'mixed',
      name: 'MIXED 통합',
      badge: 'Ver.4 적응형',
      style: '세 스타일을 조합하고 진화시키는 코치이자 상대',
      quote: '“당신의 리듬을 읽고, 매 라운드 다른 얼굴로 온다.”',
      fact: '득점마다 세 유파를 갈아타며 난이도 계수를 올린다.',
    },
  ],
};
