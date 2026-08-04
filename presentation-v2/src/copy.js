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

// 대상 TARGET (원본 Slide 16_9 - 5.svg)
// 원본은 카드가 아니라 큰 원 3개다(실측 cx 440.5 / 978.0 / 1487.0, cy 655.8, r 231.3).
export const TARGET = {
  label: { en: 'TARGET', ko: '대상' },
  headline: '누구나 쉽게, 가장 가까운 취미 경험으로 전환하는 XR 경험',
};

// desc의 각 줄은 조각 배열이다. b가 true인 조각만 굵게 나온다(원본 볼드 위치).
export const TARGET_ITEMS = [
  {
    key: 't1',
    no: '01',
    desc: [
      [{ t: '펜싱을 가장 가까운' }],
      [{ t: '취미로 만나고 싶은 사람들', b: true }],
    ],
  },
  {
    key: 't2',
    no: '02',
    desc: [
      [{ t: '해보고 싶었지만,' }],
      [{ t: '시작하기는 어려웠던 사람들', b: true }],
    ],
  },
  {
    key: 't3',
    no: '03',
    desc: [
      [{ t: '일상에 새로운 긴장', b: true }, { t: '과' }],
      [{ t: '몰입', b: true }, { t: '을 원하는 사람들' }],
    ],
  },
];

// 디자인 키워드 (원본 Slide 16_9 - 29.svg)
// 원본 라벨은 'Desigh Keyword'로 오타가 있다. 지시 문구대로 'Design Keyword'를 쓴다.
export const KEYWORD = {
  label: { en: 'Design Keyword', ko: '디자인 키워드' },
  headline: '빠르게 움직이고, 정확하게 판단하며, 끝까지 몰입한다.',
  body: [
    '본 제품은 펜싱의 핵심 경험을 XR 기술로 확장하여 실시간 피드백과 직관적인 인터페이스를 통해 더욱 효과적인 트레이닝 환경을 제공한다.',
    '이를 위해 Dynamic, Precision, Immersion의 세가지 디자인 키워드를 바탕으로 형태와 사용자 경험을 전개한다.',
  ],
};

// caption의 각 줄은 문자열이거나 { terms, suffix }다.
// 원본 SVG는 '거리 · 자세 · 타이밍'처럼 가운데점을 썼지만 DESIGN 카피 규칙이 이를 금지한다.
// 그래서 낱말을 terms로 쪼개 두고 사이 구분은 컴포넌트가 얇은 선으로 그린다.
export const KEYWORDS = [
  {
    key: 'dynamic',
    en: 'Dynamic',
    ko: '역동적인',
    img: '/images/keyword/dynamic.png',
    caption: ['빠르게 변화하는 경기 상황 속에서도', '사용자의 움직임을 자연스럽게 따라가는 경험'],
  },
  {
    key: 'precision',
    en: 'Precision',
    ko: '정확한',
    img: '/images/keyword/precision.png',
    caption: [{ terms: ['거리', '자세', '타이밍'], suffix: '을' }, '정밀하게 분석하는 XR 글라스'],
  },
  {
    key: 'immersion',
    en: 'Immersion',
    ko: '몰입하는',
    img: '/images/keyword/immersion.png',
    caption: ['현실과 디지털이 자연스럽게', '결합된 몰입형 훈련 경험'],
  },
];

// 브랜드 네이밍 (원본 Slide 16_9 - 30.svg)
export const NAMING = {
  label: { en: 'Brand Naming', ko: '브랜드 네이밍' },
  headline:
    "펜싱 검이 그리는 곡선의 궤적과 경기의 긴장감이 소용돌이처럼 몰입으로 이어지는 순간을 'VORTEX'라는 이름에 담았다.",
  sub: '사용자의 움직임과 정확한 피드백이 하나의 경험으로 이어지는 XR 트레이닝을 상징한다.',
  shots: ['/images/naming/photo-1.png', '/images/naming/photo-2.png'],
};

// 마지막 섹션 데모 CTA (원본 Slide 16_9 - 9.svg)
export const DEMO = {
  label: 'IMMERSIVE FENCING XR',
  // 원본은 3줄로 끊어 좌측 정렬한다.
  headline: ['ENTER', 'THE', 'VORTEX.'],
  ctaLabel: '데모 실행',
};

// 컬러 시스템 (원본 Slide 16_9 - 31.svg)
// **색값은 여기에 적지 않는다.** 컴포넌트가 tokens에서 읽어 표시한다(이 페이지가 토큰의 진열장).
export const COLOR_SYSTEM = {
  label: { en: 'Color System', ko: '컬러 시스템' },
  headline: '강렬한 브랜드 레드는 펜싱의 에너지와 긴장감을, 절제된 블랙은 XR 인터페이스의 명확성과 몰입감을 표현한다.',
  sub: '대비감 있는 컬러 시스템을 통해 브랜드 아이덴티티와 사용자 경험을 일관되게 전달한다.',
  brandingRed: 'Branding Red',
  primary: 'Primary',
  brandGradient: 'Brand Gradient',
  hex: 'HEX',
  rgb: 'RGB',
  stopLabels: ['Color1', 'Color2', 'Color3', 'Color4'],
};

// 컨셉 (원본 Slide 16_9 - 4.svg)
// 원본 순서: CONCEPT → VORTEX → 인용 → 가로 구분선 → 반투명 레드 글래스 박스 본문.
export const CONCEPT = {
  label: 'CONCEPT',
  quote: '“상대와 나 사이의 결정적 거리, 1:1 대응”',
  body: [
    '상대와 나, 오직 두 사람만이 만들어내는 결정적 거리 안에 들어서는 순간부터',
    '결투는 이미 시작, 그 거리를 계산하고 지키고 무너뜨리는 감각의 결투 경험',
  ],
};

// 인터랙션 4종 (원본 `바인더1.pdf` 6페이지의 4카드 그리드).
// icon은 lucide-react 아이콘 이름. 컴포넌트가 이름으로 골라 쓴다.
// name과 desc의 각 줄은 문자열이거나 { terms, tail }이다.
// 원본은 '페인트 · 리포스트 판독'과 '속도·각도'처럼 가운데점을 쓰지만 DESIGN 카피 규칙이 금지한다.
// 낱말을 terms로 쪼개 두고 사이 구분은 컴포넌트가 얇은 선으로 그린다.
export const EXPERIENCE = {
  label: { en: 'EXPERIENCE', ko: '핵심 인터랙션' },
  // 원본 PDF 문구는 '포르테를 이루는 네 가지 핵심 XR 인터렉션'이다.
  // 포르테(PORTÉE)는 구 제품명이라 확정명 VORTEX로 바꾸고 '인터렉션' 오타도 바로잡았다.
  headline: 'VORTEX를 이루는 네 가지 핵심 XR 인터랙션',
};

export const INTERACTIONS = [
  {
    key: 'forte',
    icon: 'Footprints',
    name: '포르테 트래킹',
    desc: ['풋워크를 하체 트래킹으로 인식해', '상대와의 거리를 매 순간 재계산'],
  },
  {
    key: 'enGarde',
    icon: 'PersonStanding',
    name: '앙 가르드 안정성',
    desc: ['무게중심과 자세를 트래킹해', 'En garde의 정확도를 평가'],
  },
  {
    key: 'blade',
    icon: 'Swords',
    name: '블레이드 트래킹 & 콘택트',
    desc: [{ terms: ['검끝 속도', '각도'], tail: ' 추적, 명중 순간' }, '진동으로 타격 반동을 재현'],
  },
  {
    key: 'feint',
    icon: 'Brain',
    name: { terms: ['페인트', '리포스트 판독'] },
    desc: ['가짜 동작과 진짜 공격을 구분해', '카운터 타이밍을 학습'],
  },
];

// 유파별 AI (원본 Slide 16_9 - 7.svg). 배열 순서가 곧 서브 진행 순서다.
export const DUELIST = {
  label: { en: 'AI DUELIST', ko: '유파별 AI' },
  headline: '당신과 마주 서는 것은, 매번 다른 유파로 구성',
  sub: [
    'AI 대전자는 유파별 거리 습관을 가진 별도의 인격으로 설계되며,',
    '사용자의 패턴을 학습해 세 스타일을 조합하고 진화시키는 코치이자 상대',
  ],
  // 상세 미디어 슬롯. 실제 영상이 없어 자리만 잡는다.
  mediaPending: '상세 영상 예정',
};

export const DUELIST_STYLES = [
  {
    key: 'ver1',
    school: '이탈리아 세이버 유파',
    badge: 'Ver.1 공격형',
    style: '빠른 풋워크로 거칠게 좁혀오는 스타일',
    quote: '“긴장감을 조성해서 실수를 유발시키자.”',
    img: '/images/duelist/style-1.png',
  },
  {
    key: 'ver2',
    school: '프랑스 에페 유파',
    badge: 'Ver.2 카운터형',
    style: '거리를 일정하게 유지하며 상대를 기다리는 스타일',
    quote: '“먼저 움직이면 불리해진다.”',
    img: '/images/duelist/style-2.png',
  },
  {
    key: 'ver3',
    school: '헝가리안 유파',
    badge: 'Ver.3 심리전형',
    style: '페인트와 리듬 브레이크로 판단을 교란하는 스타일',
    quote: '“침착한 관찰력이 곧 승리다.”',
    img: '/images/duelist/style-3.png',
  },
];

// 셸 섹션 목록. App.jsx가 이 배열로 섹션을 세운다.
// **순서를 바꾸면 App.jsx의 위임 인덱스와 active 비교 숫자를 함께 고쳐야 한다.**
// 브랜드 4장(대상 → 디자인 키워드 → 네이밍 → 컬러)은 문제 다음, 컨셉 앞에 들어간다.
export const SECTION_LABELS = [
  { id: 's1', ko: '표지', en: 'COVER' },
  { id: 's2', ko: '문제', en: 'WHY' },
  { id: 's3', ko: '대상', en: 'TARGET' },
  { id: 's4', ko: '디자인 키워드', en: 'DESIGN KEYWORD' },
  { id: 's5', ko: '브랜드 네이밍', en: 'BRAND NAMING' },
  { id: 's6', ko: '컬러 시스템', en: 'COLOR SYSTEM' },
  { id: 's7', ko: '컨셉', en: 'CONCEPT' },
  { id: 's8', ko: '인터랙션', en: 'EXPERIENCE' },
  { id: 's9', ko: '유파', en: 'AI DUELIST' },
  { id: 's10', ko: 'AI 워크플로우', en: 'AI WORKFLOW' },
  { id: 's11', ko: '산출물', en: 'OUTPUTS' },
  { id: 's12', ko: '데모', en: 'DEMO' },
];

export const PLACEHOLDER_SUFFIX = '플레이스홀더';
export const COVER_HINT = '↑ ↓   SPACE   SCROLL';
