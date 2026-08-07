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
  guest: '게스트 로그인',
  // **게스트 다음이 곧 코드 입력이다.** 연결이 안 되면 탭 셋이 할 일이 없다
  guestHint: '다음 화면에서 방 코드를 입력한다',
  login: '로그인',
  loginSheetTitle: '로그인',
  loginSheetBody: '데모 버전은 게스트로 진행합니다. 별도 계정 없이 바로 시작할 수 있습니다.',
  loginSheetClose: '닫기',
};

// 메인 화면(앱 셸). 하단 3탭은 영어 라벨이고 화면 안 문구는 국문이다.
// **탭 라벨만 영어인 것은 제품 라벨 표기 규약이다**(brand의 PRODUCTS/DUELISTS와 같은 결).
// 순서는 RECORDS / CONTROLLER / OPPONENT이고 기본 탭은 가운데 CONTROLLER다.
export const MAIN = {
  tabs: [
    { key: 'RECORDS', label: 'RECORDS', title: '내 기록' },
    { key: 'CONTROLLER', label: 'CONTROLLER', title: '컨트롤러' },
    // **'연습 모델'에서 '상대'로 바꿨다.** 이 탭이 정보 열람에서 선택으로 바뀌면서
    // 고르는 대상의 이름이 화면 제목이어야 한다
    { key: 'OPPONENT', label: 'OPPONENT', title: '상대' },
  ],
  connect: '연결',
  connected: '연결됨',
  /**
   * CONTROLLER 탭. 폰이 곧 컨트롤러라는 것이 이 앱의 제품 서사다.
   *
   * **두 문구를 능동 명사형으로 다듬었다(문구 수정 지시).** 뜻과 길이는 유지했다.
   *   전: 손에 든 폰이 곧 검이다
   *   후: 손에 쥔 폰이 검이 된다                      (상태 서술 -> 동작)
   *   전: 자이로와 가속도로 검끝의 자세와 찌르기를 읽는다. 세로로 세워 쥔 자세가
   *       앙가르드이고, 그 기준을 대전 직전에 매번 다시 잡는다.
   *   후: 자이로와 가속도가 검끝의 자세와 찌르기를 읽는다. 세로로 세워 쥐면 앙가르드이고,
   *       대전 직전에 그 기준을 다시 잡는다.          (수동 도구격 -> 주어, 명사절 -> 조건절)
   */
  productName: 'VORTEX BLADE',
  productLine: '손에 쥔 폰이 검이 된다',
  productBody: '자이로와 가속도가 검끝의 자세와 찌르기를 읽는다. 세로로 세워 쥐면 앙가르드이고, 대전 직전에 그 기준을 다시 잡는다.',
  // 조작 설정. **대전 시작 버튼이 아니라 설정과 보정이 이 탭의 일이다.**
  // 값은 shared/protocol.js와 pipeline.js가 실제로 쓰는 것이고 지어낸 수치가 없다
  setupTitle: '조작 설정',
  productSpecs: [
    { label: '자세 갱신', value: '30Hz', note: '연속 채널. 검 렌더 전용이라 판정에 안 닿는다' },
    { label: '기준 자세', value: '세로 홀드 3초', note: '앙가르드. 대전 직전마다 다시 잡는다' },
    { label: '이산 입력', value: '찌르기, 가드, 전진, 후퇴', note: '판정으로 가는 유일한 채널' },
  ],
  calibTitle: '기준 자세 보정',
  calibBody: '폰을 세로로 세워 쥐고 3초간 멈춘다. 그 자세가 앙가르드 기준이 된다.',
  calibAction: '지금 보정',
  calibDone: '보정 완료',
  sensorTitle: '센서 상태',
  sensorNone: '센서를 못 얻었다. 탭 버튼으로도 경기가 된다.',
  tapModeLabel: '탭 모드',
  tapModeBody: '센서 대신 화면 버튼으로 찌르기와 가드를 낸다.',
  guideTitle: '조작',
  guides: [
    { key: 'thrust', label: '찌르기', body: '세워 쥔 폰을 앞으로 눕히며 지른다' },
    { key: 'guard', label: '가드', body: '폰을 좌우 아무 쪽으로나 기울인다. 세로로 돌아오면 풀린다' },
    { key: 'step', label: '전진과 후퇴', body: '화면 하단을 위아래로 민다' },
  ],
  // 기록 탭. 서버가 신원별로 누적하고 앱은 읽기만 한다.
  // 서버가 기록을 못 받는 상태면 그 사실을 그대로 적는다(N1 상태 가시성)
  recordsNote: '이 기기의 익명 신원으로 누적된다. 브라우저 데이터를 지우면 신원이 바뀐다.',
  recordsOffTitle: '기록이 저장되지 않는다.',
  recordsOffBody: '서버에 기록 저장소가 연결되지 않았다. 아래 이력은 화면 확인용 예시이고 실제 저장분이 아니다.',
  recordsWin: '승',
  recordsLose: '패',
  recordsDraw: '무',
  recordsRateLabel: '승률',
  recordsTrendLabel: '점수 추이',
  recordsHistoryLabel: '경기 이력',
  recordsSampleBadge: '예시',
  // OPPONENT 탭. **선택이 여기서 끝난다.** 예전에는 보기만 되는 목록과 선택 화면이 갈려 있었다
  opponentNote: '카드를 탭하면 상세가 열린다.',
  opponentPickedNote: '선택한 상대로 대전을 시작한다.',
};

/**
 * RECORDS 탭 예시 이력. **실제 저장분이 아니다.**
 *
 * 서버에 기록 저장소가 붙기 전에도 화면이 무엇을 보여줄지 확인할 수 있게 두는 표본이다.
 * `records`가 비었을 때만 이 배열이 화면에 서고, 그때 `예시` 배지와 안내 문구가 함께 뜬다
 * (N1 상태 가시성. 저장된 것처럼 보이게 하지 않는다).
 *
 * 스키마는 서버가 주는 것과 같다(`server/src/db.js`의 match_records).
 * outcome은 win/lose/draw, score는 [나, 상대].
 */
export const SAMPLE_RECORDS = [
  { id: -1, school_name: '이탈리아 세이버 유파', outcome: 'win', score_me: 5, score_ai: 3 },
  { id: -2, school_name: '프랑스 에페 유파', outcome: 'lose', score_me: 2, score_ai: 5 },
  { id: -3, school_name: '헝가리안 유파', outcome: 'win', score_me: 5, score_ai: 4 },
  { id: -4, school_name: 'MIXED 통합', outcome: 'lose', score_me: 4, score_ai: 5 },
  { id: -5, school_name: '이탈리아 세이버 유파', outcome: 'win', score_me: 5, score_ai: 1 },
  { id: -6, school_name: '프랑스 에페 유파', outcome: 'win', score_me: 5, score_ai: 2 },
  { id: -7, school_name: '헝가리안 유파', outcome: 'draw', score_me: 4, score_ai: 4 },
  { id: -8, school_name: 'MIXED 통합', outcome: 'win', score_me: 5, score_ai: 3 },
];

// AI 대전자 유파. **카피는 VORTEX 3.11 원문 그대로**(presentation-v2 DUELIST_STYLES와 문자 일치, 인용문 포함).
// school은 shared/protocol.js SCHOOL 값. fact는 FENCING_RULES 근거 한 줄(표시 전용).
// 사진은 라이선스 미확인이라 반입하지 않는다. 부재 시 그라디언트 플레이스홀더로 내려앉는다(미해결 기록).
export const SELECT = {
  title: 'AI 대전자 선택',
  sub: '유파별 거리 습관을 가진 별도의 인격이다. 탭하면 상세가 열린다.',
  duel: '이 상대와 대전',
  back: '목록으로',
  picked: '선택됨',
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
