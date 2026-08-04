// presentation-v2 화면 문구 단일 원천. **컴포넌트에 문자열 하드코딩 금지.**
// 제품명과 문구가 또 바뀔 수 있다. 교체가 이 파일 하나 수정으로 끝나야 한다.
//
// 표기 규칙(docs/DESIGN.md 카피 절): 명사형 종결, 이모지 금지, em대시 금지, 가운데점 금지.
// 라벨의 영문과 한글은 가운데점 대신 { en, ko } 두 필드로 나눈다. 사이 구분은 컴포넌트가 선으로 그린다.

// 제품명과 컨셉명은 지금 같은 값이지만 나중에 갈라질 수 있어 별도 상수로 둔다.
export const TITLE = 'VORTEX';
export const CONCEPT_NAME = 'VORTEX';

// S1 표지
export const COVER = {
  team: 'Team 1',
  members: '김다영 주현호 윤소희',
  event: '2026 KDM+ AI Workshop',
  sub: '거리와 타이밍을 몸으로 익히는 몰입형 펜싱 XR',
};

// S2 문제
export const WHY = {
  label: { en: 'WHY', ko: '문제' },
  headline: ['펜싱은 시작하기 전에 포기하는 운동', '거리와 타이밍은 말로 전달되지 않는 감각'],
  asis: {
    badge: 'AS-IS',
    caption: ['도복과 마스크와 전용 피스트가 있어야 첫 합', '초심자가 겨루기까지 수개월의 기초 반복'],
  },
  tobe: {
    badge: 'TO-BE',
    caption: ['폰 하나를 검으로 쥐고 그 자리에서 대련', '거리와 타이밍을 화면이 실시간으로 해설'],
  },
};

// S3 컨셉
export const CONCEPT = {
  label: 'CONCEPT',
  desc: [
    '펜싱 칼이 소용돌이처럼 빨아들이는 몰입',
    '상대와 나 사이 거리를 계산하고 무너뜨리는 결투',
  ],
};

// S4 인터랙션 4종. 순서가 곧 서브 진행 순서다.
// icon은 lucide-react 아이콘 이름. 컴포넌트가 이름으로 골라 쓴다.
export const EXPERIENCE = {
  label: { en: 'EXPERIENCE', ko: '인터랙션' },
};

export const INTERACTIONS = [
  {
    key: 'forte',
    icon: 'Activity',
    name: '포르테 트래킹',
    desc: ['칼 뿌리의 위치와 속도를 폰 센서로 추적', '휘두름의 세기가 그대로 궤적의 두께'],
  },
  {
    key: 'enGarde',
    icon: 'Shield',
    name: '앙 가르드 안정성',
    desc: ['겨눔 자세의 흔들림을 실시간 지표로 환산', '무너진 자세가 그대로 판정의 빈틈'],
  },
  {
    key: 'blade',
    icon: 'Swords',
    name: '블레이드 트래킹과 콘택트',
    desc: ['두 칼날의 궤적과 맞닿는 순간의 판별', '막기와 흘리기가 갈리는 접촉 지점'],
  },
  {
    key: 'feint',
    icon: 'Eye',
    name: '페인트 리포스트 판독',
    desc: ['속임 동작과 진짜 공격의 구분', '되받아치기 창이 열리는 짧은 구간의 판독'],
  },
];

// S5 유파별 AI. 순서가 곧 서브 진행 순서다.
export const DUELIST = {
  label: { en: 'AI DUELIST', ko: '유파별 AI' },
  headline: ['유파마다 다른 리듬', '유파마다 다른 빈틈'],
};

export const DUELIST_STYLES = [
  {
    key: 'ver1',
    badge: 'Ver.1 공격형',
    desc: ['간격을 좁히며 먼저 찌르는 압박', '연속 공격으로 호흡을 빼앗는 유파'],
  },
  {
    key: 'ver2',
    badge: 'Ver.2 카운터형',
    desc: ['기다렸다 되받아치는 리포스트 중심', '먼저 나선 쪽의 빈틈을 노리는 유파'],
  },
  {
    key: 'ver3',
    badge: 'Ver.3 심리전형',
    desc: ['페인트로 반응을 끌어내는 속임', '읽히지 않는 리듬으로 판단을 흔드는 유파'],
  },
];

// 셸 섹션 목록. App.jsx가 이 배열로 8섹션을 세운다.
export const SECTION_LABELS = [
  { id: 's1', ko: '표지', en: 'COVER' },
  { id: 's2', ko: '문제', en: 'WHY' },
  { id: 's3', ko: '컨셉', en: 'CONCEPT' },
  { id: 's4', ko: '인터랙션', en: 'EXPERIENCE' },
  { id: 's5', ko: '유파', en: 'AI DUELIST' },
  { id: 's6', ko: 'AI 워크플로우', en: 'AI WORKFLOW' },
  { id: 's7', ko: '산출물', en: 'OUTPUTS' },
  { id: 's8', ko: '데모', en: 'DEMO' },
];

export const PLACEHOLDER_SUFFIX = '플레이스홀더';
export const COVER_HINT = '↑ ↓   SPACE   SCROLL';
