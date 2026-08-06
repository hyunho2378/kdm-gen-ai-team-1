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
// 미확정 문구. **여기 셋이 이 파일에서 유일하게 확정이 아니다.**
// 값을 빈 문자열로 두면 자리가 접혀 레이아웃이 무너지므로 자리표시 문장을 넣는다.
// 확정되면 이 상수의 값만 바꾼다. 참조처는 손대지 않는다.
// ---------------------------------------------------------------------------
const TODO_MARK = '확정 예정';

export const TODO_MASK_DETAIL = `마스크 상세 ${TODO_MARK}`;
export const TODO_EXPERIENCE_NOTICE = `데모 주의 사항 ${TODO_MARK}`;
// 상세 탭 정보 패널. **스펙표와 특징 목록은 아직 확정된 것이 하나도 없다.**
// 지어내지 않는다. 아래 PRODUCT_DETAIL.spec과 .features가 비어 있는 동안 이 문장이 대신 뜬다
export const TODO_PRODUCT_SPEC = `제품 스펙 ${TODO_MARK}`;
export const TODO_PRODUCT_FEATURES = `제품 특징 ${TODO_MARK}`;
// 실제 제품 3D 모델이 없어 뷰어가 플레이스홀더 프리미티브를 띄운다. 모델이 들어오면 이 자리가 사라진다
export const TODO_PRODUCT_MODEL = `제품 3D 모델 ${TODO_MARK}`;
// 제품군이 4종에서 3종으로, 다시 2종으로 줄었다(REBOOT_PLAN 3.1). 원래 문장
// "각 장치가 거리, 자세, 타이밍, 대결을 맡는다"가 네 개 전제라 처음부터 안 맞았고
// 지금은 더 안 맞는다. 새 문장을 지어내지 않고 자리표시로 둔다
export const PRODUCTS_INDEX_LINE_TODO = `제품군 한 줄 ${TODO_MARK}`;
// 이미지와 영상이 아직 없는 자리. **빈 박스나 다크 사각형을 두지 않는다**(REBOOT_PLAN 2.1).
// 자리표시 문구만 dim으로 둔다. 에셋이 들어오면 이 상수를 참조하는 자리가 이미지로 바뀐다
export const MEDIA_PENDING = '이미지 첨부 예정';

// 섹션 식별자. 랜딩 앵커가 쓴다. **월드빌딩 섹션은 제거했다(R5).**
export const SECTION = {
  HERO: 'hero',
  GATES: 'gates',
  CTA: 'cta',
  NEWSLETTER: 'newsletter',
};

// ---------------------------------------------------------------------------
// header
// ---------------------------------------------------------------------------
export const HEADER = {
  wordmark: BRAND,
  // ABOUT을 맨 앞에 둔다. 데스크톱 바와 모바일 시트가 이 배열 하나를 같은 순서로 렌더하고
  // 탭 순서와 현재 표시(aria-current, 레드 점)도 여기서 파생된다
  nav: [
    { to: '/about', label: 'ABOUT' },
    { to: '/products', label: 'PRODUCTS' },
    { to: '/duelists', label: 'DUELISTS' },
    { to: '/experience', label: 'EXPERIENCE' },
  ],
  cta: '체험하기',
  // md 미만 햄버거. **아이콘 단독 버튼이라 aria-label이 필수다**(DESIGN 11절).
  // 라벨이 상태를 말한다. 열림과 닫힘을 같은 문장으로 두면 무엇이 일어날지 안 읽힌다
  menuOpen: '메뉴 열기',
  menuClose: '메뉴 닫기',
  menuLabel: '주 메뉴',
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
  // **월드빌딩 섹션은 제거했다(R5).** 문구는 PROGRESS에 보존해 About 등 재사용에 대비했다.
  // 관문 셋. 랜딩에서 다 보여주지 않고 유인만 한다
  gates: [
    {
      key: 'products',
      to: '/products',
      eyebrow: 'PRODUCTS',
      // 제품군이 2종으로 줄었다(REBOOT_PLAN 3.1). 인터랙티브 데모 앱은 제품이 아니라
      // 체험이라 /experience로 옮겼다. 여기 한 줄도 남은 둘의 이름으로 다시 쓴다
      title: '검을 이루는 두 개의 장치',
      line: '마스크와 컨트롤러, 훈련을 완성하는 두 장치',
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
  // 랜딩 하단 세 블록(R6). CTA 초대 → 뉴스레터 리빌 → 푸터.
  outro: {
    cta: {
      title: '함께 겨루자',
      // /experience로 나가는 레드 채움 링크. 채움과 press는 .vx-cta 클래스가 쥔다
      button: '체험하기',
      to: '/experience',
    },
    newsletter: {
      title: '결투 소식을 받는다',
      label: '이메일',
      placeholder: '이메일',
      button: '구독',
      note: '새 유파와 업데이트 소식을 보낸다',
      // **전송 백엔드가 없다.** 제출은 자리표시 동작이라 이 안내만 띄운다(PROGRESS 기록)
      pending: '구독 기능 준비 중',
    },
    footer: {
      wordmark: BRAND,
      // 메뉴는 HEADER.nav를 그대로 재사용한다(About, Products, Duelists, Experience). 컴포넌트에서 참조
      credit: '2026 KDM+ Generative AI Workshop 강원 지부',
      team: '김다영 주현호 윤소희',
      copyright: '© 2026 VORTEX',
    },
  },
};

// ---------------------------------------------------------------------------
// products. slug가 곧 라우트다(/product/<slug>)
// ---------------------------------------------------------------------------
export const PRODUCTS = {
  index: {
    eyebrow: { en: 'PRODUCTS', ko: '제품군' },
    title: '검을 이루는 두 개의 장치',
    line: PRODUCTS_INDEX_LINE_TODO,
  },
  // **인터랙티브 데모 앱은 여기 없다(REBOOT_PLAN 3.1).** 그것은 제품이 아니라 체험이라
  // /experience가 소개를 맡는다. 라우트도 함께 사라져 /product/demo-app은 NotFound로 떨어진다
  cards: [
    {
      slug: 'mask',
      name: '마스크',
      line: '검끝과 거리를 실시간으로 추적하는 시야',
      detail: TODO_MASK_DETAIL,
      demoCta: true,
    },
    {
      slug: 'controller',
      name: '컨트롤러',
      line: '폰이 검이 되는 모션 컨트롤러',
      detail: '폰 센서로 찌르기와 거리를 읽어 검의 움직임으로 옮긴다',
      demoCta: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// 제품 딥다이브(BV2-4). /products가 두 제품을 한 편의 스크롤로 판다.
//
// **Apple Vision Pro 문법을 구조로만 가져왔다. 문장은 우리 것이다.**
// 실측한 것은 자리의 역할과 길이다.
//
//   긴 딥다이브 섹션   2.4~14.5화면, 고정 미디어 + 텍스트 순차 등장
//   짧은 브리지 섹션   1화면 내외, 고정 미디어 없음, 전환만
//   미디어 보유율      섹션의 75퍼센트
//   자리별 길이        큰 헤드라인은 한 문장, 그 아래 본문은 한두 줄
//
// beats는 고정 미디어 옆을 지나며 하나씩 드러나는 덩어리다. 제목은 짧게, 본문은 한 문장.
// PRODUCT_DETAIL.features와 같은 사실을 말하되 여기서는 문장으로 편다.
// ---------------------------------------------------------------------------
export const PRODUCT_DEEPDIVE = {
  eyebrow: { en: 'PRODUCTS', ko: '제품군' },
  title: '검을 이루는 두 개의 장치',
  line: '마스크와 컨트롤러, 훈련을 완성하는 두 장치',
  // 두 딥다이브 사이에 눕는 짧은 전환. 미디어 없이 한 문장만 둔다
  bridge: {
    eyebrow: { en: 'AND', ko: '그리고' },
    line: '보는 장치와 쥐는 장치가 만나야 한 자루의 검이 된다',
  },
  // 마감. 상세로 보내는 자리다
  outro: {
    eyebrow: { en: 'SPECS', ko: '사양' },
    line: '각 제품의 사양과 특징을 따로 본다',
  },
  detailCta: '상세 보기',
  products: {
    mask: {
      eyebrow: { en: 'MASK', ko: '마스크' },
      headline: '보는 것이 곧 겨루는 것',
      lead: '검끝과 거리를 시야 안에서 읽는다. 눈이 먼저 알고 몸이 뒤따른다.',
      beats: [
        { title: '검끝 추적', body: '마커 없이 검끝의 위치와 속도를 읽어 시야에 겹친다.' },
        { title: '명중 표시', body: '닿은 순간을 시야 안에서 알려 판정을 눈으로 확인한다.' },
        { title: '시간 팽창', body: '최적 타이밍에 시야가 늘어나 결정의 순간이 길어진다.' },
        { title: '유파 식별', body: '마주 선 상대의 유파를 시야에 세워 대응을 미리 고른다.' },
      ],
    },
    controller: {
      eyebrow: { en: 'CONTROLLER', ko: '컨트롤러' },
      headline: '손안의 검',
      lead: '폰이 검이 된다. 쥔 손의 각도와 속도가 그대로 검의 움직임이다.',
      beats: [
        { title: '모션 입력', body: '가속도와 자이로 두 축으로 쥔 자세와 찌르기를 읽는다.' },
        { title: '속도 변환', body: '찌르기의 속도와 방향을 검끝의 궤적으로 옮긴다.' },
        { title: '타격 반동', body: '명중 순간 손잡이가 떨려 닿았다는 것을 손이 안다.' },
        { title: '거리 환산', body: '전진과 후퇴를 간합으로 바꿔 발이 거리를 만든다.' },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// productDetail. 히어로 제목만 slug별이고 나머지는 공통이다
// ---------------------------------------------------------------------------

// 탭 라벨. tabs와 labels가 같은 문자열을 봐야 해서 밖으로 뺐다
const DETAIL_LABELS = {
  overview: 'OVERVIEW',
  features: 'FEATURES',
  experience: 'EXPERIENCE',
};

export const PRODUCT_DETAIL = {
  hero: {
    mask: '보는 것이 곧 겨루는 것',
    controller: '손안의 검',
  },
  labels: DETAIL_LABELS,
  // 왼쪽 세로 탭. 오버워치의 스킨 리스트 자리를 이 둘이 대신한다.
  // **영문 라벨만으로는 무엇이 바뀌는지 안 읽혀서 국문을 함께 세운다**(색 단독 구분 금지와 같은 방향)
  tabs: [
    { key: 'overview', label: DETAIL_LABELS.overview, ko: '스펙' },
    { key: 'features', label: DETAIL_LABELS.features, ko: '특징' },
  ],
  tabsLabel: '제품 정보',
  // 탭 정보 패널의 내용. spec 항목은 { name, value }, features 항목은 문자열이다.
  // 비면 화면에 위 TODO 자리표시가 뜬다(참조부는 그 분기를 그대로 둔다).
  //
  // **값이 `TODO_MARK`인 넷은 실제 하드웨어 사양이라 지어낼 수 없는 자리다.**
  // 시야각, 디스플레이, 무게, 배터리. 항목 이름은 확정이고 값만 미확정이라 행은 세워 둔다.
  // 리터럴로 네 번 적지 않는다. 확정될 때 고칠 자리가 넷으로 흩어진다
  spec: {
    mask: [
      { name: '추적 방식', value: '마커리스 검끝 추적' },
      { name: '시야각', value: TODO_MARK },
      { name: '디스플레이', value: TODO_MARK },
      { name: '무게', value: TODO_MARK },
      { name: '연결', value: '무선' },
    ],
    controller: [
      { name: '입력 방식', value: '모션 센서' },
      { name: '감지 축', value: '가속도와 자이로' },
      { name: '햅틱', value: '진동 피드백' },
      { name: '배터리', value: TODO_MARK },
      { name: '연결', value: '무선' },
    ],
  },
  features: {
    mask: [
      '검끝과 거리를 실시간으로 추적하는 시야',
      '명중 순간을 시야에 겹쳐 표시',
      '최적 타이밍에 시야가 팽창하는 시간 감각',
      '상대 유파를 시야에 식별 표시',
    ],
    controller: [
      '폰이 검이 되는 모션 컨트롤러',
      '찌르기 속도와 방향을 검의 움직임으로 변환',
      '명중 순간 손잡이 진동으로 타격 반동 재현',
      '전진과 후퇴를 거리로 환산',
    ],
  },
  specTodo: TODO_PRODUCT_SPEC,
  featuresTodo: TODO_PRODUCT_FEATURES,
  viewer: {
    // 마우스 전용 조작이라는 사실을 글로 알린다. 뷰어를 못 쓰는 사람은 탭 정보만으로 제품을 이해한다
    hint: '드래그해 돌린다',
    placeholder: TODO_PRODUCT_MODEL,
    // WebGL을 못 얻었을 때. 뷰어가 죽어도 페이지는 살아 있다는 것을 알린다
    unavailable: '3D 뷰어를 표시할 수 없다',
  },
  back: '제품군으로',
  cta: '체험하기',
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
  selection: {
    guide: '유파를 선택한다',
    enter: '겨루기',
    // 대전 진입은 아직 연결되지 않았다. 버튼 옆에 사유를 적어 둔다
    pending: '대전 진입 준비 중',
  },
};

// ---------------------------------------------------------------------------
// experience. arena로 나가는 문이다
// ---------------------------------------------------------------------------
export const EXPERIENCE = {
  eyebrow: { en: 'EXPERIENCE', ko: '체험' },
  title: '거리 안으로 들어선다',
  // **인터랙티브 데모 앱을 여기로 흡수했다(REBOOT_PLAN 3.1).** 그 제품이 하던 소개를
  // 이 문단이 대신한다. 데모 앱 문구 중 방 코드 연결과 3단계와 노트북과 폰은 이미
  // 이 페이지에 있었고(body 뒷문장, steps), 없던 것은 "설치 없이 브라우저"뿐이라
  // 그 한 가지만 앞에 붙였다. 새 자리를 만들지 않았다
  body: '설치 없이 브라우저에서 겨룬다. 노트북은 도장이 되고 폰은 검이 된다. 방 코드로 둘을 잇고 결투를 시작한다.',
  steps: ['접속', '캘리브레이션', '결투'],
  cta: '데모 시작',
  notice: TODO_EXPERIENCE_NOTICE,
  // 주소가 없을 때 화면에 낼 말. 조용히 죽지 않고 사람이 고칠 곳을 알린다
  unavailable: '데모 주소가 아직 설정되지 않았다',
};

// ---------------------------------------------------------------------------
// about. 브랜드 소개(REBOOT_PLAN 3.2). 네이밍 의미, 원칙, 팀 세 섹션.
// 발표의 네이밍과 컬러 서사를 사이트 문법으로 옮긴다. lusion 어바웃은 참고하지 않는다.
// ---------------------------------------------------------------------------
export const ABOUT = {
  naming: {
    eyebrow: { en: 'ABOUT', ko: '소개' },
    title: '왜 VORTEX인가',
    body: '소용돌이는 중심으로 빨아들인다. 검과 검 사이의 거리와 타이밍이 한 점으로 수렴하는 순간, 결투가 성립한다. VORTEX는 그 수렴의 감각을 훈련으로 만든다.',
  },
  principles: {
    title: '우리가 지키는 것',
    items: [
      '몸으로 익히는 거리감',
      '판정은 결정적으로, 연출은 몰입적으로',
      '장비가 아니라 감각을 남긴다',
    ],
  },
  team: {
    title: '만든 사람들',
    body: '2026 KDM+ Generative AI Workshop 강원 지부. 김다영, 주현호, 윤소희.',
    // 이미지 자리. **빈 박스를 두지 않는다**(REBOOT_PLAN 2.1). dim 문구만 둔다
    imagePending: '팀 이미지 첨부 예정',
  },
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
