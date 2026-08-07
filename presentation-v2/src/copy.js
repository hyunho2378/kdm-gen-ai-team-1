// presentation-v2 화면 문구 단일 원천. **컴포넌트에 문자열 하드코딩 금지.**
// 제품명과 문구가 또 바뀔 수 있다. 교체가 이 파일 하나 수정으로 끝나야 한다.
//
// 표기 규칙(docs/DESIGN.md 카피 절): 명사형 종결, 이모지 금지, em대시 금지, 가운데점 금지, 박스라인 금지.
// 라벨의 영문과 한글은 { en, ko } 두 필드로 나눈다. 화면에서는 Eyebrow가 위아래 스택으로 세운다.
// 문장 안 나열은 쉼표로 쓴다.

// 제품명과 컨셉명은 지금 같은 값이지만 나중에 갈라질 수 있어 별도 상수로 둔다.
export const TITLE = 'VORTEX';
export const CONCEPT_NAME = 'VORTEX';

// S1 표지
export const COVER = {
  team: 'Team 1',
  members: '김다영 주현호 윤소희',
  event: '2026 KDM+ AI Workshop',
  // 히어로 서브. **brand LANDING.hero.sub 확정본과 통일**(두 사이트 문구 일치). 'XR' → '훈련'
  sub: '거리와 타이밍을 몸으로 익히는 몰입형 펜싱 훈련',
};

// 인사이트 PAIN POINT (원본 1.svg)
// 상단 페인 3장과 하단 인사이트 3장이 같은 열에 선다. 배열 순서가 곧 열 순서다.
export const PAINPOINT = {
  label: { en: 'Problem', ko: '문제점' },
  painLabel: 'PAIN POINT',
  insightLabel: 'INSIGHT',
  // 문제점 페이지 풀블리드 배경(펜싱 대결 사진). 유리 카드가 그 위에 뜬다.
  bg: '/images/prb/prb.png',
  // 반부활 헤드 텍스트(프롤로그처럼 중앙 큰 텍스트로 시작 → 위로 올라가며 헤드라인 크기로 축소).
  // **줄 배열이 곧 br**: "~1:1 대결 스포츠다." 다음 줄바꿈, "이 때문에~"가 둘째 줄.
  // b:true 세 구간만 볼드: "상대와의 거리, 타이밍, 움직임" / "1:1 대결 스포츠" / "'관람하는 스포츠'".
  head: [
    [
      { t: '펜싱은 빠른 공격보다 ' },
      { t: '상대와의 거리, 타이밍, 움직임', b: true },
      { t: '을 읽는 감각이 중요한 ' },
      { t: '1:1 대결 스포츠', b: true },
      { t: '다.' },
    ],
    [
      { t: '이 때문에 높은 진입장벽으로 많은 사람들에게는 ' },
      { t: "'관람하는 스포츠'", b: true },
      { t: '에 머물러 있다.' },
    ],
  ],
};

export const PAINPOINT_COLUMNS = [
  {
    key: 'functional',
    // 원본 SVG 오타 'Fuctional'을 'Functional'로 교정했다.
    title: 'Functional (기능적)',
    pain: ['거리감을 익히기 어렵고', '자세 교정이 어려움'],
    insight: ['피드백 받을 수 있는', '시스템이 필요'],
  },
  {
    key: 'economic',
    title: 'Economic (경제적)',
    pain: ['레슨비와 장비가 비싸고', '연습장이 부족'],
    insight: ['일상에서 지속적으로 즐길 수', '있는 환경이 필요'],
  },
  {
    key: 'social',
    title: 'Social (사회적)',
    pain: ['진입 장벽이 높고', '같이 할 사람이 없음'],
    insight: ['부담 없이 시작하고, 대결하며', '성장할 수 있는 경험이 필요'],
  },
];

// S2 솔루션(AS-IS/TO-BE). 아이브로우가 '문제 WHY'에서 '솔루션 Solution'으로 바뀌었다.
export const WHY = {
  label: { en: 'Solution', ko: '솔루션' },
  headline: ['공간의 제약을 넘어,', '일상의 공간이 현장이 되는 순간'],
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
  // 헤드라인("빠르게 움직이고…몰입한다") 삭제. lead(큰 줄) + body(본문)만 유지.
  // 헤드라인 아래 큰 줄(lead) + 본문(body). 본문은 줄 배열(각 줄이 조각 배열, b:true만 볼드).
  // "~펜싱 경험이다." 다음에 줄바꿈(br) 후 "VORTEX는 ~ 설계한다."가 온다.
  lead: '새로운 훈련을 시작하고, 스스로 성장하며, 현실을 넘어 몰입한다.',
  body: [
    [
      { t: 'XR은 단순히 훈련을 디지털화하는 기술이 아니라, ' },
      { t: '사용자의 움직임을 이해하고 성장 과정을 함께 만들어가는 새로운 펜싱 경험', b: true },
      { t: '이다.' },
    ],
    [
      { t: 'VORTEX는 ' },
      { t: 'Transformative', b: true },
      { t: ', ' },
      { t: 'Guide', b: true },
      { t: ', ' },
      { t: 'Immersion', b: true },
      { t: '을 중심으로 기술과 사용자가 자연스럽게 연결되는 트레이닝 경험을 설계한다.' },
    ],
  ],
};

// 키워드 3종. 참조 SVG(Slide 79)에서 확정한 문구. 카드 배경은 dk_1/2/3 이미지.
// caption(설명)은 이미지 위 흰 텍스트로 카드 하단에 얹힌다. 각 줄은 문자열이다.
export const KEYWORDS = [
  {
    key: 'transformative',
    en: 'Transformative',
    ko: '변화를 만드는',
    img: '/images/keyword/dk_1.png',
    caption: ['XR 기술로 기존 펜싱 훈련 방식을 새롭게 확장하며,', '더 효율적인 트레이닝 경험을 제안한다'],
  },
  {
    key: 'guide',
    en: 'Guide',
    ko: '이끄는',
    img: '/images/keyword/dk_2.png',
    caption: ['실시간 분석과 직관적인 피드백으로 사용자가', '올바른 움직임을 스스로 익힐 수 있도록 안내한다'],
  },
  {
    key: 'immersion',
    en: 'Immersion',
    ko: '몰입하는',
    img: '/images/keyword/dk_3.png',
    caption: ['현실과 디지털을 자연스럽게 연결하여 훈련에', '온전히 집중할 수 있는 몰입형 경험을 제공한다'],
  },
];

// 로고 모티프 (참조 Slide 84). moti.png 풀블리드 배경 + 상단 흰 밴드(텍스트) + 사진 중앙 흰 심볼.
export const LOGO_MOTIF = {
  label: { en: 'Logo Motif', ko: '로고 모티프' },
  // 본문 두 줄. 줄 배열이 곧 br. b:true 조각만 볼드.
  body: [
    [{ t: "'VORTEX'의 의미인 소용돌이와 경기의 몰입감을 시각적으로 표현하기 위해," }],
    [{ t: '소용돌이 속에서 교차하는 펜싱 칼날', b: true }, { t: '을 모티프로 로고를 디자인하였다.' }],
  ],
  symbol: '/images/assets/logo.svg', // 흰 심볼(다크 사진 위)
  bg: '/images/moti/moti.png',
};

// 로고 가이드 (참조 Slide 85 벤토 그리드). 헤드라인 문장 없음. 라벨은 영문만.
// 좌 조합형(네이비 그라디언트, 2행 span, 흰 로고) / 우상 로고타입(실버, 잉크 워드마크)
// / 우하좌 심볼(실버, 잉크 심볼) / 우하우 그리드 버전(실버, 그리드 오버레이 lgoo_line).
// 그리드 셀 라벨 'Grid'는 참조에 없어 최소로 지어 넣었다(다른 셋은 참조 확정).
export const LOGO_GUIDE = {
  label: { en: 'Logo Guide', ko: '로고 가이드' },
  items: [
    { key: 'combination', en: 'Combination Mark', asset: '/images/assets/logo_main.svg', tone: 'navy', area: 'comb' },
    { key: 'logotype', en: 'Logotype', asset: '/images/assets/black_wm.svg', tone: 'silver', area: 'type' },
    { key: 'symbol', en: 'Logo Symbol', asset: '/images/assets/logo_black.svg', tone: 'silver', area: 'symbol' },
    { key: 'grid', en: 'Grid', asset: '/images/assets/lgoo_line.svg', tone: 'silver', area: 'grid' },
  ],
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
  headline: '브랜딩 네이비는 깊이 있는 몰입과 기술적 신뢰를, 브랜딩 실버는 정교한 인터페이스와 직관적인 사용성을 표현한다.',
  sub: '두 컬러는 사용자의 집중을 돕는 균형 잡힌 대비를 이루며, VORTEX만의 일관된 XR 브랜드 경험을 완성한다.',
  brandingNavy: 'Branding Navy',
  brandingSilver: 'Branding Silver',
  hex: 'HEX',
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

// 컨셉 슬라이드 재구성(참조 Slide 16_9 - 103.svg). 글래스 원 좌우로 갈라 앉는 두 문구.
// 원문 tspan: 좌 "소용돌이처럼 몰아치는"(x60), 우 "경기의 긴장감"(x1728). SUIT 24.
export const CONCEPT_SCENE = {
  textLeft: '소용돌이처럼 몰아치는',
  textRight: '경기의 긴장감',
};

// 컨트롤러 제품 슬라이드 (참조 Slide 16_9 - 113.svg). 텍스트는 참조 SVG에서 그대로 읽었다(임의 창작 아님).
// 참조 아이브로우 'Solution/솔루션'은 다른 슬라이드 템플릿 잔재라 슬라이드 주제 'Controller/컨트롤러'로 둔다.
export const CONTROLLER = {
  label: { en: 'Controller', ko: '컨트롤러' },
  headline: ['펜싱의 상징적인 곡선을 재해석한', '미래형 인터페이스 컨트롤러'],
  // 설명 2문단. b:true 조각만 볼드(참조의 강조 구간).
  desc: [
    [
      { t: '손을 자연스럽게 감싸는 ' },
      { t: '인체공학적 그립', b: true },
      { t: '으로 장시간 플레이에도 안정적인 그립과 조작성을 제공' },
    ],
    [
      { t: '메쉬 인서트 패널을 적용', b: true },
      { t: '하여 마스크와 통일된 CMF 아이덴티티 구현' },
    ],
  ],
  bg: '/images/pro/pro-con1.png', // 손에 쥔 컨트롤러 큰 렌더(풀블리드 배경)
  // 뷰 이미지(글래스 카드 안). 라벨은 참조 SVG 원문.
  views: [
    { label: 'Front View', img: '/images/pro/front1.png' }, // 정면 뷰(세로)
    { label: 'Top View', img: '/images/pro/pro2.png' }, // 상면 뷰(가로)
  ],
};

// 마스크 제품 슬라이드 (참조 Slide 16_9 - 125.svg). 컨트롤러 슬라이드와 동일 문법. 텍스트는 참조 SVG 원문.
// 아이브로우 'Concept/제품 컨셉'(참조 원문). 상단 표기 '2026 KDM+ AI Workshop'은 규율대로 제거.
// desc para1 끝은 참조가 '제공합'(절단)이라 자연스러운 '제공합니다'로 완성.
export const MASK = {
  label: { en: 'Concept', ko: '제품 컨셉' },
  headline: ['펜싱경험을 극대화 시킨,', '몰입형 XR'],
  desc: [
    [
      { t: '기존 ' },
      { t: '메쉬 시야 구조를 넓은 XR 글라스로 재해석', b: true },
      { t: '하여 몰입감 있는 시야를 제공합니다' },
    ],
    [
      { t: '불필요한 부피를 줄이고 보호 구조를 재구성하여 가볍고 역동적인 착용 경험을 제공' },
    ],
  ],
  bg: '/images/mask/mask-back.png', // XR 마스크 착용 렌더(풀블리드 배경)
  view: { label: 'Side View', img: '/images/mask/mask1.png' }, // 글래스 카드 안, 좌우반전
};

// 인터랙션 4종 (원본 `바인더1.pdf` 6페이지의 4카드 그리드).
// icon은 lucide-react 아이콘 이름. 컴포넌트가 이름으로 골라 쓴다.
// name과 desc의 각 줄은 전부 문자열이다.
// 원본은 나열에 가운데점을 쓰지만 프로젝트 텍스트 규칙이 금지하므로 쉼표로 바꿨다.
export const EXPERIENCE = {
  label: { en: 'EXPERIENCE', ko: '핵심 인터랙션' },
  // 원본 PDF 문구는 '포르테를 이루는 네 가지 핵심 XR 인터렉션'이다.
  // 포르테(PORTÉE)는 구 제품명이라 확정명 VORTEX로 바꾸고 '인터렉션' 오타도 바로잡았다.
  headline: 'VORTEX를 이루는 네 가지 핵심 XR 인터랙션',
  // 헤드라인 아래 설명 본문. **줄 배열이 곧 br**(각 줄이 별도 문단). b:true 조각만 볼드.
  //   1줄: "~제공한다." / 2줄: "트래킹부터 ~ 하나의 인터랙션으로 연결한다."
  body: [
    [
      { t: 'XR 기술을 활용해 사용자의 움직임과 경기 상황을 실시간으로 분석', b: true },
      { t: '하고, 필요한 정보를 직관적으로 제공한다.' },
    ],
    [
      { t: '트래킹부터 자세 교정, 검 끝 인식, 리포스트 판독', b: true },
      { t: '까지 펜싱 훈련의 전 과정을 하나의 인터랙션으로 연결한다.' },
    ],
  ],
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
    desc: ['검끝 속도, 각도 추적, 명중 순간', '진동으로 타격 반동을 재현'],
  },
  {
    key: 'feint',
    icon: 'Brain',
    name: '페인트, 리포스트 판독',
    desc: ['가짜 동작과 진짜 공격을 구분해', '카운터 타이밍을 학습'],
  },
];

// 유파별 AI (원본 Slide 16_9 - 7.svg). 배열 순서가 곧 서브 진행 순서다.
// **문구는 brand copy.js DUELISTS 확정본과 통일한다**(두 사이트가 같은 유파를 같은 문장으로 말한다).
// 어미를 다듬은 버전(유발한다, 불리해진다, 승리다)과 서브(진화한다)로 맞추고 인용부호를 걷었다.
// VORTEX_DESIGN_SYSTEM 3.11 원문도 이 확정본으로 함께 개정했다.
export const DUELIST = {
  label: { en: 'AI DUELIST', ko: '유파별 AI' },
  headline: '실력에 따라, 유파를 선택하며 더욱 몰입할 수 있습니다.',
  // 설명 한 문장을 2단 서브 2줄 레이아웃에 나눠 싣는다(쉼표에서 줄바꿈).
  sub: [
    'AI 대전자는 유파별 거리 습관을 가진 별도의 인격으로 설계되며,',
    '사용자의 패턴을 학습해 세 스타일을 조합하고 진화시키는 코치이자 상대입니다.',
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
    quote: '긴장감을 조성해 실수를 유발한다',
    img: '/images/duelist/style-1.png',
  },
  {
    key: 'ver2',
    school: '프랑스 에페 유파',
    badge: 'Ver.2 카운터형',
    style: '거리를 일정하게 유지하며 상대를 기다리는 스타일',
    quote: '먼저 움직이면 불리해진다',
    img: '/images/duelist/style-2.png',
  },
  {
    key: 'ver3',
    school: '헝가리안 유파',
    badge: 'Ver.3 심리전형',
    style: '페인트와 리듬 브레이크로 판단을 교란하는 스타일',
    quote: '침착한 관찰이 곧 승리다',
    img: '/images/duelist/style-3.png',
  },
];

// 셸 섹션 목록. App.jsx가 이 배열로 섹션을 세운다.
// **id는 의미 이름이다.** 예전에는 s1~s12 번호였는데 앞에 섹션을 끼울 때마다 전부 밀려
// 위임과 렌더 분기가 같이 깨졌다. 이제 순서를 바꿔도 id는 그대로이고
// App.jsx가 위임과 컴포넌트 선택을 전부 id로 하므로 삽입이 안전하다.
export const SECTION_LABELS = [
  { id: 'cover', ko: '표지', en: 'COVER' },
  { id: 'painpoint', ko: '인사이트', en: 'PAIN POINT' },
  { id: 'why', ko: '문제', en: 'WHY' },
  { id: 'target', ko: '대상', en: 'TARGET' },
  { id: 'keyword', ko: '디자인 키워드', en: 'DESIGN KEYWORD' },
  { id: 'logo-motif', ko: '로고 모티프', en: 'LOGO MOTIF' },
  { id: 'logo-guide', ko: '로고 가이드', en: 'LOGO GUIDE' },
  { id: 'color', ko: '컬러 시스템', en: 'COLOR SYSTEM' },
  { id: 'concept', ko: '컨셉', en: 'CONCEPT' },
  { id: 'mask', ko: '제품 컨셉', en: 'MASK' },
  { id: 'controller', ko: '컨트롤러', en: 'CONTROLLER' },
  { id: 'experience', ko: '인터랙션', en: 'EXPERIENCE' },
  { id: 'duelist', ko: '유파', en: 'AI DUELIST' },
  { id: 'workflow', ko: 'AI 워크플로우', en: 'AI WORKFLOW' },
  { id: 'outputs', ko: '산출물', en: 'OUTPUTS' },
  { id: 'demo', ko: '데모', en: 'DEMO' },
];

export const PLACEHOLDER_SUFFIX = '플레이스홀더';
