// brand 화면 문구 단일 원천. **컴포넌트에 문자열 하드코딩 금지.**
// arena/src/copy.js, presentation-v2/src/copy.js와 같은 규약이다.
//
// 표기 규칙(VORTEX_DESIGN_SYSTEM 2.3): 명사형 종결, 능동태, 나열은 쉼표.
// 금지 문자 이모지, em대시, 가운데점, 박스라인.
//
// **출처 표시.** 확정 원문에는 근거 절을 적어 둔다. 근거가 없는 것은 TEMP로 표시하고
// 화면에도 임시임이 드러나게 둔다. 지어낸 문장을 확정 카피처럼 두지 않는다.
//
// index.html의 <title>은 정적 HTML이라 이 상수를 못 읽는다. 값이 바뀌면 거기도 함께 고친다.

export const BRAND = 'VORTEX';
export const APP_NAME = 'VORTEX Brand';

// 섹션 식별자. 랜딩 앵커와 라우팅에서 같은 값을 쓴다.
export const SECTION = {
  HERO: 'hero',
  WORLD: 'world',
  PRODUCTS: 'products',
  DUELISTS: 'duelists',
  DEMO: 'demo',
};

// 히어로. 워드마크와 한 줄 정의는 VORTEX_DESIGN_SYSTEM 0절 원문.
export const HERO = {
  eyebrow: { en: 'IMMERSIVE FENCING XR', ko: '몰입형 펜싱 XR' },
  wordmark: BRAND,
  sub: '거리와 타이밍을 몸으로 익히는 몰입형 펜싱 XR',
  team: '2026 KDM+ AI Workshop',
};

// 월드빌딩. **확정 카피 없음.** BRAND_SITE_GUIDE 2.1에 "검술 도장 세계관"이라는
// 주제만 있고 문장은 아직 없다. 지어내지 않고 자리만 잡아 둔다.
export const WORLD = {
  eyebrow: { en: 'WORLDBUILDING', ko: '월드빌딩' },
  headline: null,
  body: null,
  todo: '검술 도장 세계관 카피 확정 예정',
};

// 제품군 4종. 이름은 BRAND_SITE_GUIDE 2.1 확정, **한 줄 카피는 TEMP다.**
// slug가 곧 라우트다(/product/<slug>).
export const PRODUCTS_SECTION = {
  eyebrow: { en: 'PRODUCTS', ko: '제품군' },
  headline: '네 갈래로 벌어지는 하나의 경험',
  headlineTemp: true,
};

export const PRODUCTS = [
  {
    slug: 'xr-glass',
    name: 'XR 글라스',
    line: '거리, 자세, 타이밍을 실시간으로 읽는 착용형 장비',
    temp: true,
    demoCta: true,
  },
  {
    slug: 'controller',
    name: '모의 검 컨트롤러',
    line: '쥐는 순간 검이 되는 손안의 입력 장치',
    temp: true,
    demoCta: false,
  },
  {
    slug: 'branding',
    name: '브랜딩',
    line: '검끝 한 줄에서 시작하는 색과 타이포와 모션 체계',
    temp: true,
    demoCta: false,
  },
  {
    slug: 'demo-app',
    name: '인터랙티브 데모 앱',
    line: '폰과 노트북 두 화면으로 즉시 겨루는 체험판',
    temp: true,
    demoCta: true,
  },
];

// 유파 3종. **VORTEX_DESIGN_SYSTEM 3.11 원문 그대로다.** 발표 사이트와 같은 문구를 쓴다.
export const DUELISTS_SECTION = {
  eyebrow: { en: 'AI DUELIST', ko: '유파별 AI' },
  headline: '당신과 마주 서는 것은, 매번 다른 유파로 구성',
  sub: 'AI 대전자는 유파별 거리 습관을 가진 별도의 인격으로 설계되며, 사용자의 패턴을 학습해 세 스타일을 조합하고 진화시키는 코치이자 상대',
};

export const DUELISTS = [
  {
    key: 'sabre',
    name: '이탈리아 세이버 유파',
    ver: 'Ver.1',
    trait: '공격형',
    style: '빠른 풋워크로 거칠게 좁혀오는 스타일',
    quote: '긴장감을 조성해서 실수를 유발시키자.',
  },
  {
    key: 'epee',
    name: '프랑스 에페 유파',
    ver: 'Ver.2',
    trait: '카운터형',
    style: '거리를 일정하게 유지하며 상대를 기다리는 스타일',
    quote: '먼저 움직이면 불리해진다.',
  },
  {
    key: 'hungarian',
    name: '헝가리안 유파',
    ver: 'Ver.3',
    trait: '심리전형',
    style: '페인트와 리듬 브레이크로 판단을 교란하는 스타일',
    quote: '침착한 관찰력이 곧 승리다.',
  },
];

// 체험해보기. 헤드라인 3줄과 아이브로우는 VORTEX_DESIGN_SYSTEM 3.14 원문.
export const DEMO = {
  eyebrow: { en: 'IMMERSIVE FENCING XR', ko: '체험해보기' },
  headline: ['ENTER', 'THE', 'VORTEX.'],
  cta: '체험해보기',
  // 주소가 없을 때 화면에 낼 말. 조용히 죽지 않고 사람이 고칠 곳을 알린다.
  unavailable: '데모 주소가 아직 설정되지 않았다',
};

// 상세페이지 공통 골격 라벨.
export const DETAIL = {
  back: '뒤로 가기',
  visualPlaceholder: '대표 비주얼 예정',
  notFound: '없는 제품이다',
};

// 화면에 임시임을 드러내는 꼬리표. 확정 카피가 오면 temp 플래그를 지운다.
export const TEMP_MARK = '임시';
