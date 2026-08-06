// brand 화면 문구 단일 원천. **컴포넌트에 문자열 하드코딩 금지.**
// arena/src/copy.js, presentation-v2/src/copy.js와 같은 규약이다.
//
// 표기 규칙(DESIGN 14절): 능동태, 명사형 종결 우선, 불필요한 조사 제거.
// 금지 문자 이모지, em대시, 가운데점, 박스라인.
//
// **구조는 페이지 네임스페이스다.** 화면을 열면 어느 상수를 고쳐야 할지가 이름으로 보인다.
//
// index.html의 <title>은 정적 HTML이라 이 상수를 못 읽는다. 값이 바뀌면 거기도 함께 고친다.

export const BRAND = 'VORTEX';
export const APP_NAME = 'VORTEX Brand';

// ---------------------------------------------------------------------------
// 미확정 문구. **여기 다섯 개가 이 파일에서 유일하게 확정이 아니다.**
// 값을 빈 문자열로 두면 자리가 접혀 레이아웃이 무너지므로 자리표시 문장을 넣는다.
// 확정되면 이 상수의 값만 바꾼다. 참조처는 손대지 않는다.
// ---------------------------------------------------------------------------
const TODO_MARK = '확정 예정';

export const TODO_XR_GLASS_DETAIL = `XR 글라스 상세 ${TODO_MARK}`;
export const TODO_BRANDING_LINE = `브랜딩 한 줄 ${TODO_MARK}`;
export const TODO_BRANDING_DETAIL = `브랜딩 상세 ${TODO_MARK}`;
export const TODO_BRANDING_HERO = `브랜딩 히어로 제목 ${TODO_MARK}`;
export const TODO_EXPERIENCE_NOTICE = `데모 주의 사항 ${TODO_MARK}`;

// 섹션 식별자. 랜딩 앵커가 쓴다.
export const SECTION = {
  HERO: 'hero',
  WORLD: 'world',
  GATES: 'gates',
};

// ---------------------------------------------------------------------------
// header
// ---------------------------------------------------------------------------
export const HEADER = {
  wordmark: BRAND,
  nav: [
    { to: '/products', label: 'PRODUCTS' },
    { to: '/duelists', label: 'DUELISTS' },
    { to: '/experience', label: 'EXPERIENCE' },
  ],
  cta: '체험하기',
};

// ---------------------------------------------------------------------------
// landing
// ---------------------------------------------------------------------------
export const LANDING = {
  hero: {
    eyebrow: { en: 'IMMERSIVE FENCING XR', ko: '몰입형 펜싱 XR' },
    wordmark: BRAND,
    sub: '거리와 타이밍을 몸으로 익히는 몰입형 펜싱 훈련',
    scrollHint: '아래로 진입',
    team: '2026 KDM+ AI Workshop',
  },
  world: {
    eyebrow: { en: 'WORLDBUILDING', ko: '월드빌딩' },
    title: '일상의 공간이 도장이 된다',
    body: '검과 검 사이, 찌르기가 성립하는 찰나의 거리를 몸이 먼저 읽는다. VORTEX는 그 순간의 감각을 훈련으로 옮긴다.',
  },
  // 관문 셋. 랜딩에서 다 보여주지 않고 유인만 한다
  gates: [
    {
      key: 'products',
      to: '/products',
      eyebrow: 'PRODUCTS',
      title: '검을 이루는 네 개의 장치',
      line: 'XR 글라스부터 데모 앱까지, 훈련을 완성하는 제품군',
      link: '제품 보기',
    },
    {
      key: 'duelists',
      to: '/duelists',
      eyebrow: 'DUELISTS',
      title: '매번 다른 상대가 마주 선다',
      line: '세 유파의 AI 대전자가 거리와 리듬으로 겨룬다',
      link: '유파 보기',
    },
    {
      key: 'experience',
      to: '/experience',
      eyebrow: 'EXPERIENCE',
      title: '지금 거리 안으로 들어선다',
      line: '노트북과 폰 하나로 결투를 시작한다',
      link: '체험하기',
    },
  ],
};

// ---------------------------------------------------------------------------
// products. slug가 곧 라우트다(/product/<slug>)
// ---------------------------------------------------------------------------
export const PRODUCTS = {
  index: {
    eyebrow: { en: 'PRODUCTS', ko: '제품군' },
    title: '검을 이루는 네 개의 장치',
    line: '각 장치가 거리, 자세, 타이밍, 대결을 맡는다',
  },
  cards: [
    {
      slug: 'xr-glass',
      name: 'XR 글라스',
      line: '검끝과 거리를 실시간으로 추적하는 시야',
      detail: TODO_XR_GLASS_DETAIL,
      demoCta: true,
    },
    {
      slug: 'controller',
      name: '모의 검 컨트롤러',
      line: '폰이 검이 되는 모션 컨트롤러',
      detail: '폰 센서로 찌르기와 거리를 읽어 검의 움직임으로 옮긴다',
      demoCta: false,
    },
    {
      slug: 'branding',
      name: '브랜딩',
      line: TODO_BRANDING_LINE,
      detail: TODO_BRANDING_DETAIL,
      demoCta: false,
    },
    {
      slug: 'demo-app',
      name: '인터랙티브 데모 앱',
      line: '지금 바로 겨루는 브라우저 데모',
      detail: '설치 없이 노트북과 폰으로 결투를 체험한다',
      demoCta: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// productDetail. 히어로 제목만 slug별이고 나머지는 공통이다
// ---------------------------------------------------------------------------
export const PRODUCT_DETAIL = {
  hero: {
    'xr-glass': '보는 것이 곧 겨루는 것',
    controller: '손안의 검',
    branding: TODO_BRANDING_HERO,
    'demo-app': '설치 없이, 지금',
  },
  labels: {
    overview: 'OVERVIEW',
    features: 'FEATURES',
    experience: 'EXPERIENCE',
  },
  back: '제품군으로',
  cta: '체험하기',
  visualPlaceholder: `대표 비주얼 ${TODO_MARK}`,
  notFound: '없는 제품이다',
};

// ---------------------------------------------------------------------------
// duelists. 유파 3종
// ---------------------------------------------------------------------------
export const DUELISTS = {
  header: {
    eyebrow: { en: 'AI DUELIST', ko: '유파별 AI' },
    title: '당신과 마주 서는 것은, 매번 다른 유파',
    sub: 'AI 대전자는 유파별 거리 습관을 가진 별도의 인격이다. 사용자의 패턴을 학습해 세 스타일을 조합하고 진화한다.',
  },
  cards: [
    {
      key: 'sabre',
      ver: 'Ver.1',
      name: '이탈리아 세이버 유파',
      trait: '공격형',
      style: '빠른 풋워크로 거칠게 좁혀오는 스타일',
      quote: '긴장감을 조성해 실수를 유발한다',
    },
    {
      key: 'epee',
      ver: 'Ver.2',
      name: '프랑스 에페 유파',
      trait: '카운터형',
      style: '거리를 일정하게 유지하며 상대를 기다리는 스타일',
      quote: '먼저 움직이면 불리해진다',
    },
    {
      key: 'hungarian',
      ver: 'Ver.3',
      name: '헝가리안 유파',
      trait: '심리전형',
      style: '페인트와 리듬 브레이크로 판단을 교란하는 스타일',
      quote: '침착한 관찰이 곧 승리다',
    },
  ],
  // 셀렉션 안무는 B7이고 지금은 라벨만 자리를 잡는다
  selection: {
    guide: '유파를 선택한다',
    enter: '겨루기',
  },
};

// ---------------------------------------------------------------------------
// experience. arena로 나가는 문이다
// ---------------------------------------------------------------------------
export const EXPERIENCE = {
  eyebrow: { en: 'EXPERIENCE', ko: '체험' },
  title: '거리 안으로 들어선다',
  body: '노트북은 도장이 되고 폰은 검이 된다. 방 코드로 둘을 잇고 결투를 시작한다.',
  steps: ['접속', '캘리브레이션', '결투'],
  cta: '데모 시작',
  notice: TODO_EXPERIENCE_NOTICE,
  // 주소가 없을 때 화면에 낼 말. 조용히 죽지 않고 사람이 고칠 곳을 알린다
  unavailable: '데모 주소가 아직 설정되지 않았다',
};

// ---------------------------------------------------------------------------
// notFound
// ---------------------------------------------------------------------------
export const NOT_FOUND = {
  code: '404',
  title: '없는 주소다',
  line: '거리를 벗어났다',
  home: '처음으로',
};
