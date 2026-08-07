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
// **추측 예시 값 표시.** 스펙 표의 '확정 예정' 자리를 그럴듯한 예시 수치로 채우면서,
// 그 값이 실제 확정값이 아니라는 것을 값 옆에 남긴다. 확정되면 값과 이 표시를 함께 지운다.
const EXAMPLE_MARK = '(example)';

// 사양이 비어 있는 동안 대신 뜨는 문장. **특징 목록은 걷었다.** 딥다이브 비트가
// 같은 사실을 이미 문장으로 펴고 있어서 한 탭 안에서 두 번 읽혔다
export const TODO_PRODUCT_SPEC = `제품 스펙 ${TODO_MARK}`;
// **3D 모델 자리표시를 걷었다.** 뷰어가 사라지면서 이 문구를 읽는 곳이 없어졌다
// 이미지와 영상이 아직 없는 자리. **빈 박스나 다크 사각형을 두지 않는다**(REBOOT_PLAN 2.1).
// 자리표시 문구만 dim으로 둔다. 에셋이 들어오면 이 상수를 참조하는 자리가 이미지로 바뀐다
export const MEDIA_PENDING = 'Image pending';
// 영상 자리. Apple은 열두 섹션 중 하나를 영상 풀블리드로 쓴다(실측). 우리는 EXPERIENCE가 그 자리다
export const VIDEO_PENDING = 'Video pending';

// ---------------------------------------------------------------------------
// arena로 나가는 CTA. **예전에는 `/experience` 페이지의 문구 묶음이었다.**
// 그 페이지가 사라지면서 남은 것은 버튼 라벨과 주소 미설정 안내 둘뿐이라 이름을 바꿨다.
// 사이트에 EXPERIENCE라는 이름의 탭이 따로 있어서, 옛 이름을 그대로 두면
// 그 탭의 문구로 읽힌다
// ---------------------------------------------------------------------------
export const ARENA_CTA = {
  label: '데모 시작',
  // 주소가 없을 때 화면에 낼 말. 조용히 죽지 않고 사람이 고칠 곳을 알린다
  unavailable: '데모 주소가 아직 설정되지 않았다',
};

// ---------------------------------------------------------------------------
// 히어로. **랜딩에서 복구했다(`46ef601`).**
//
// 랜딩을 걷을 때 이 문구까지 함께 사라졌는데, 브랜드 한 줄과 팀 표기는 사이트에
// 다른 자리가 없다. 제품 페이지 최상단이 그 자리를 이어받는다.
// ---------------------------------------------------------------------------
// **워크숍 표기와 스크롤 안내를 걷었다.** 둘 다 제품이 아니라 이 페이지가 만들어진
// 사정을 말하는 문구였다. 워크숍 크레딧은 푸터가 이미 이고 있고, 스크롤 안내는
// 아래에 콘텐츠가 있다는 사실을 글로 다시 적는 자리라 표지의 정적을 깬다.
// **홈 영어화(개정).** 히어로는 이제 중앙에 IMMERSIVE FENCING XR 한 줄만 선다.
// ko/sub는 표지 구도 자체가 걷혀 더는 화면에 안 뜨지만, alt 텍스트 계약은 유지한다.
export const HERO = {
  eyebrow: { en: 'IMMERSIVE FENCING XR' },
  wordmark: BRAND,
  // 표지 구도의 두 요소. 장식이 아니라 제품이라 대체 텍스트를 준다(영어)
  maskAlt: 'Fencer wearing the mask',
  controllerAlt: 'Controller in hand',
};

// ---------------------------------------------------------------------------
// 영상 캐러셀(Apple 오버뷰 문법). **자동 재생 영상 + 설명 한 줄.**
//
// ── Apple 실측 (1440, 직접 열어 computed로) ─────────────────────────────────
//   컨테이너   `.scrolling-container`, clientW 1425, `scroll-snap-type: x mandatory`
//   영상 카드  820x530 (1.547:1)
//   속성      muted, loop, playsInline. controls 없음
//   **autoplay 속성이 없다.** 28개가 전부 `paused`로 대기하고 스크립트가 뷰포트
//   진입에서 play()를 부른다. preload는 `none`이다
//   화살표     36x36, `aria-label="Previous, <이름> gallery"`
//
// **구조만 옮긴다. Apple의 영상과 문구는 한 글자도 안 가져온다**(DESIGN 15절).
//
// `src`가 null이면 영상 자리표시가 선다. 파일이 오면 이 값만 채운다.
// ---------------------------------------------------------------------------
// **캡션은 제품 이름이다.** 영상이 무엇을 하는지 설명하지 않는다("한 바퀴 돈다" 같은
// 구어 서술 금지). 영상이 이미 보여주고 있는 것을 글로 되풀이하면 격이 떨어진다.
//
// `ratio`는 소스의 실제 비율이다. mask-360은 **1920x1920 정사각**이라 820x530 카드에
// 넣으면 위아래가 잘려 마스크가 깎인다(실측). 소스 비율을 그대로 쓴다.
// `rate`는 재생 속도다. 1보다 작으면 느리게 돈다.
export const VIDEO_RAIL = {
  label: 'Product films',
  prev: 'Previous film',
  next: 'Next film',
  items: [
    { key: 'mask-360', src: '/images/home/mask-360.mp4', line: 'Vortex Mask', ratio: '1 / 1', rate: 0.5 },
    // 작업 중에 도착한 파일이다. mask-360과 같은 규격(1920x1920, 5.08초)이라 같은 값을 준다
    { key: 'controller', src: '/images/home/con-360.mp4', line: 'Vortex Controller', ratio: '1 / 1', rate: 0.5 },
    { key: 'match', src: null, line: 'Vortex Duel', ratio: '1 / 1' },
  ],
};

/**
 * 흐림에서 선명으로 수렴하는 가로 영상. **스크롤 연동 섹션이다.**
 *
 * 소스는 2576x1440(1.789:1)이라 그 비율을 그대로 쓴다. 영상이 화면 폭을 다 먹지
 * 않으므로 좌우에 여백이 남고, **그 여백이 이 섹션의 절반이다.** 스크롤 진행에 따라
 * 정보 조각이 하나씩 서고 끝에서 제품 면으로 가는 문이 열린다.
 *
 * `asides`는 좌우로 갈라 세운다. 짝수가 왼쪽, 홀수가 오른쪽이다.
 */
// **홈 영어화.** eyebrow/asides의 ko는 영어 부제로 바꿨다(필드명은 그대로 두되 내용만 영문).
export const CONVERGE = {
  src: '/images/home/man-blur.mp4',
  ratio: '2576 / 1440',
  eyebrow: { en: 'FOCUS' },
  line: 'Blurred distance converges to a single point',
  asides: [
    { en: 'IMMERSIVE XR', sub: 'Full field-of-view immersion' },
    { en: 'DETERMINISTIC JUDGEMENT', sub: 'Calls decided, not guessed' },
    { en: 'MARKERLESS TRACKING', sub: 'Blade tracked without markers' },
    { en: 'TIME DILATION', sub: 'The decisive instant, extended' },
  ],
  cta: 'View product details',
  ctaTo: '/mask',
};

/**
 * 닫는 영상. **마스크를 내리는 장면이다.**
 *
 * 오버뷰의 마지막 미디어 자리에 둔다. 캐러셀이 제품을 세우고 수렴 섹션이 판정을
 * 말한 뒤, 이 자리가 겨루기 이후를 남긴다. 바로 뒤에 오는 원칙("장비가 아니라 감각을
 * 남긴다")이 이 장면의 문장이라 둘이 붙어 하나로 읽힌다.
 */
// **홈 영어화.** AFTER THE DUEL은 유지하고 나머지 국문을 자연스러운 영어로 옮겼다.
// **위로 올렸다.** 예전엔 오버뷰 맨 끝(원칙 문단 직전)이었는데, 그 자리와 "두 장치" 섹션이
// 함께 삭제되면서 이 영상(man-mak, 마스크를 내리는 장면)이 수렴 섹션 바로 다음으로 올라왔다.
export const CLOSING = {
  src: '/images/home/man-mak.mp4',
  ratio: '2576 / 1440',
  eyebrow: { en: 'AFTER THE DUEL' },
  line: 'The afterimage of lowering the mask',
  body: 'The memory of distance and timing stays in the body. What training leaves behind is not a record, but a sense.',
};

/**
 * 전환 스테이트먼트 셋. **`46ef601` 랜딩 관문 카드의 제목에서 왔다.**
 *
 * 카드 셋으로 눕혀 두던 것을 **Apple의 전환 스테이트먼트 자리로 옮겼다**(실측: 딥다이브
 * 사이사이에 큰 문장 하나짜리 섹션이 선다). 카드 나열이 금지되면서 자리가 바뀌었고,
 * 문장 자체는 그대로다. 카드가 달고 있던 부제와 링크 라벨은 스테이트먼트가 한 문장이라
 * 갈 곳이 없어졌다.
 *
 * `before`는 이 문장 뒤에 오는 탭이다. 그 탭을 여는 말이 된다.
 */
export const STATEMENTS = [
  { before: 'mask', line: '검을 이루는 두 개의 장치' },
  { before: 'vision', line: '매번 다른 상대가 마주 선다' },
  { before: 'experience', line: '지금 거리 안으로 들어선다' },
];

// ---------------------------------------------------------------------------
// 브랜드 소개. **`/about`에서 복구했다(`46ef601`).** 네이밍 의미, 원칙, 팀 셋.
// OVERVIEW 탭 아래쪽이 이 자리를 받는다. 제품을 보기 전에 왜 만드는지가 먼저 온다
// ---------------------------------------------------------------------------
// **홈 영어화.** naming을 영어로 옮겼다. **원칙 섹션은 삭제했다**(지시) — "몸으로 익히는
// 거리감 / 판정은 결정적으로, 연출은 몰입적으로 / 장비가 아니라 감각을 남긴다" 문단이 통째로
// 나갔고 렌더하는 곳이 없어져 `principles` 자체를 걷었다.
export const ABOUT = {
  naming: {
    eyebrow: { en: 'ABOUT' },
    title: 'Why VORTEX',
    body: 'A vortex draws everything toward its center. The moment distance and timing between two blades converge to a single point, the duel begins. VORTEX turns that sense of convergence into training.',
  },
  // **팀 블록은 없다.** 크레딧과 팀 이름은 푸터가 이미 같은 말로 이고 있어서
  // 한 페이지 안에서 두 번 읽혔다
};

// ---------------------------------------------------------------------------
// 유파 3종. **`/duelists`에서 복구했다(`46ef601`).**
//
// **VISION 탭에 둔다.** 마스크 비트가 이미 "마주 선 상대의 유파를 시야에 세워
// 대응을 미리 고른다"고 말한다. 유파는 시야가 보여주는 것이라 비전화면이 제 자리다.
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
// 체험 관문. **`/experience`에서 복구했다(`46ef601`).** EXPERIENCE 탭이 받는다.
// **cta는 없다.** 버튼 라벨은 위 ARENA_CTA 하나가 쥔다(두 벌로 두면 갈린다)
// ---------------------------------------------------------------------------
export const EXPERIENCE = {
  title: '거리 안으로 들어선다',
  body: '설치 없이 브라우저에서 겨룬다. 노트북은 도장이 되고 폰은 검이 된다. 방 코드로 둘을 잇고 결투를 시작한다.',
  // **셋을 목록으로 눕히지 않는다**(카드 나열 금지). 한 줄 흐름으로 읽는다
  flow: '접속, 캘리브레이션, 결투',
  notice: `데모 주의 사항 ${TODO_MARK}`,
};

// ---------------------------------------------------------------------------
// 제품 내비. Apple Vision Pro의 로컬 내비 자리이고 사이트의 유일한 헤더다.
//
// **Apple 실측(1440x900).** nav가 sticky top 0, 높이 52px, 좌측 제품명 21px/600,
// 우측 탭과 CTA가 전부 12px/400. Book a demo는 알약 아웃라인, Buy는 알약 채움.
// 현재 탭은 밑줄로 표시한다.
//
// **탭은 앵커 섹션이다.** 라우트를 새로 파지 않고 한 페이지 안에서 자리로 간다.
// ---------------------------------------------------------------------------
// **영어화.** label/demo/buy/buyPending은 나비 바 안에서 매 페이지(홈 포함)에 렌더된다.
export const PRODUCT_NAV = {
  label: 'Product information',
  /**
   * **5탭이다.** Apple의 Tech Specs 한 자리를 마스크와 컨트롤러 둘로 쪼갰다.
   * 제품이 둘뿐이라 각각 자기 탭을 가지는 편이 스펙을 깊게 펴기 좋다.
   *
   * **다섯이 각자 독립 라우트다(개정).** 예전에는 한 페이지 안의 앵커였고 탭을 누르면
   * 스크롤이 움직였다. **Apple의 로컬 내비도 앵커가 아니라 라우트다**(실측:
   * `/apple-vision-pro/`, `/apple-vision-pro/specs/`, `/os/visionos/`). 탭을 누르면
   * 화면이 통째로 바뀌고 각 페이지가 자기 최상단에서 시작한다.
   */
  tabs: [
    { key: 'overview', label: 'OVERVIEW', ko: '오버뷰', to: '/' },
    { key: 'mask', label: 'MASK', ko: '마스크', to: '/mask' },
    { key: 'controller', label: 'CONTROLLER', ko: '컨트롤러', to: '/controller' },
    { key: 'vision', label: 'VISION', ko: '비전화면', to: '/vision' },
    { key: 'experience', label: 'EXPERIENCE', ko: '경험하기', to: '/experience' },
  ],
  demo: 'Book a demo',
  buy: 'Buy',
  // Buy는 아직 갈 곳이 없다. 눌러도 아무 일이 없는 버튼이 제일 나쁜 실패라
  // 비활성으로 두고 사유를 옆에 적는다(ArenaCta가 쓰는 것과 같은 규율)
  buyPending: 'Coming soon',
};

// 각 탭에서 아직 안 채운 자리. **다섯 다 "내용 준비 중"이던 것을 걷었다.**
// 복구 세션에서 실제 내용이 들어가 그 문구가 거짓말이 된 자리가 넷이다.
// 남은 하나는 미디어 에셋이라 MEDIA_PENDING이 이미 말하고 있다

/**
 * 다섯 탭 섹션의 머리. **히어로는 위 HERO가 따로 쥔다.**
 * 예전에는 여기 hero 키가 있었는데 랜딩 히어로를 복구하면서 그쪽으로 합쳤다.
 */
export const PRODUCT_SITE = {
  /**
   * 마스크와 컨트롤러 사이에 눕는 짧은 전환. **`a7f73c2`의 딥다이브 브리지에서 복구했다.**
   * 미디어 없이 한 문장만 둔다. Apple도 짧은 섹션에는 고정 미디어를 안 둔다(실측).
   */
  bridge: {
    eyebrow: { en: 'AND', ko: '그리고' },
    line: '보는 장치와 쥐는 장치가 만나야 한 자루의 검이 된다',
  },
  /**
   * 섹션 머리. **마스크와 컨트롤러는 여기 없다.**
   * 그 둘은 딥다이브가 자기 헤드라인과 리드를 이미 갖고 있어서, 여기에도 두면 같은 문장이
   * 한 섹션 안에서 두 번 뜬다(실측으로 잡았다. "보는 것이 곧 겨루는 것"이 h2와 h3로 겹쳤다).
   * 딥다이브 쪽이 리드가 한 문장 더 길어서 그쪽을 남겼다.
   */
  sections: {
    // **overview 키를 걷었다.** "두 장치가 하나로 움직인다" 섹션이 지시로 삭제되면서
    // 이 값을 읽는 곳이 없어졌다(Overview.jsx).
    vision: { title: '시야가 판정을 말한다', line: '거리와 타이밍과 명중이 화면 위에서 읽힌다.' },
    experience: { title: '지금 거리 안으로 들어선다', line: '노트북과 폰 하나로 결투를 시작한다.' },
  },
};

// ---------------------------------------------------------------------------
// 제품 딥다이브. **`a7f73c2`의 PRODUCT_DEEPDIVE에서 복구했다.**
//
// **Apple Vision Pro 문법을 구조로만 가져왔다. 문장은 우리 것이다.**
// **beats는 이제 스택이 아니라 순차다.** Apple 실측: 긴 딥다이브(7000~10000px) 동안
// 미디어가 고정되고 **텍스트가 바뀐다.** 넷을 세로로 눕히면 그것이 카드 나열이라
// 한 번에 하나만 세우고 스크롤이 다음으로 넘긴다.
//
// **브리지는 위 PRODUCT_SITE.bridge로 복구했다.** 아웃로는 사라진 제품 상세로 보내는
// 자리라 갈 곳이 없어 복구하지 않았다.
// ---------------------------------------------------------------------------
// **마스크/컨트롤러 페이지 영어화.** eyebrow.ko를 걷고 headline/lead/beats를 영어로 옮겼다.
export const PRODUCT_DEEPDIVE = {
  mask: {
    eyebrow: { en: 'MASK' },
    headline: 'To see is to duel',
    lead: 'Blade tip and distance, read within the field of view. The eye knows first, the body follows.',
    beats: [
      { title: 'Blade Tracking', body: 'Reads the blade tip\'s position and speed without markers, overlaid on the field of view.' },
      { title: 'Touch Indicator', body: 'Marks the instant of contact in view, so the call is confirmed by sight.' },
      { title: 'Time Dilation', body: 'The view stretches at the optimal moment, lengthening the decisive instant.' },
      { title: 'Style Recognition', body: 'Places the opponent\'s fencing style in view, so a response is chosen in advance.' },
    ],
  },
  controller: {
    eyebrow: { en: 'CONTROLLER' },
    headline: 'The blade in hand',
    lead: 'The phone becomes the blade. The angle and speed of the grip become the blade\'s motion.',
    beats: [
      { title: 'Motion Input', body: 'Reads grip posture and thrusts across two axes, acceleration and gyro.' },
      { title: 'Speed Translation', body: 'Converts the speed and direction of a thrust into the blade tip\'s trajectory.' },
      { title: 'Impact Feedback', body: 'The grip vibrates on contact, so the hand knows the touch landed.' },
      { title: 'Distance Mapping', body: 'Turns advances and retreats into engagement distance, so footwork builds distance.' },
    ],
  },
};

// 제품 컨셉과 뷰. **우리 자체 제품 콘텐츠**(presentation-v2 마스크/컨트롤러 슬라이드와 같은 문구).
// Apple Tech Specs 문법(좌 라벨 / 우 값)으로 컨셉·제품 컨셉을 눕히고, 뷰는 Side/Front/Top 이미지 슬롯.
// 상단 표기(2026 KDM+ AI Workshop 등)는 발표 표지용이라 웹에는 안 넣는다.
// **마스크/컨트롤러 페이지 영어화.** 라벨과 컨셉 문장을 영어로 옮겼다.
export const PRODUCT_CONCEPT = {
  conceptLabel: 'Concept',
  productConceptLabel: 'Product Concept',
  viewsLabel: 'Views',
  mask: {
    concept: 'Immersive XR, built to maximize the fencing experience',
    productConcept:
      'Reinterprets the conventional mesh field of view as a wide XR glass for immersive vision. Trims unnecessary bulk and reworks the protective structure for a light, dynamic wearing experience.',
    // **실제 렌더다.** 발표에 쓴 것과 같은 원본에서 왔다. 마스크는 탑 뷰 렌더가 아직
    // 없어 그 자리만 대기 표면으로 남는다(지어내지 않는다)
    views: [
      { label: 'Side View', src: '/images/product/mask-side.jpg' },
      { label: 'Front View', src: '/images/product/mask-front.jpg' },
      { label: 'Top View', src: null },
    ],
  },
  controller: {
    concept: 'A future interface controller, reinterpreting fencing\'s iconic curve',
    productConcept:
      'An ergonomic grip that wraps the hand naturally, holding stable grip and control through long play. A mesh insert panel carries the same CMF identity as the mask.',
    views: [
      { label: 'Side View', src: '/images/product/con-side.jpg' },
      { label: 'Front View', src: '/images/product/con-front.jpg' },
      { label: 'Top View', src: '/images/product/con-top.jpg' },
    ],
  },
};

// ---------------------------------------------------------------------------
// 제품 면의 미디어. **3D 뷰어를 걷어낸 자리다.**
//
// 예전에는 딥다이브 고정 미디어가 three.js 뷰어(플레이스홀더 프리미티브)였다. 실제
// 제품 렌더가 확보되면서 짐작으로 세운 도형을 띄울 이유가 없어졌다.
//
// **마스크 대표 미디어는 프레임 시퀀스다.** `mask-360.mp4`(1920x1920, 5.08초)에서 뽑은
// webp 30장이고, 진입에서 흐림에서 선명으로 한 바퀴 돌고 마지막 프레임에 선다.
// 영상 태그가 아니라 프레임이라 진행을 우리가 쥔다.
//
// **원본 렌더는 2048x2048 PNG로 한 장에 3~6MB다.** 그대로 실으면 다섯 장이 24MB라
// 1200px JPEG로 내려 `images/product/`에 둔다(다섯 합 692KB).
// ---------------------------------------------------------------------------
const MASK_FRAME_COUNT = 30;
// **컨트롤러도 이제 프레임 시퀀스다.** `con-360.mp4`(1920x1920, 5.08초, mask-360과 동일 규격)에서
// ffmpeg+cwebp로 30장을 뽑아 마스크와 같은 문법으로 심었다(`public/frames/con-360/frame-000~029.webp`).
// 정지 사진(con-front 등)이 서던 대표 미디어 자리가 이제 진입 1회전 시퀀스로 바뀐다.
// 뷰 슬롯(Side/Front/Top, PRODUCT_CONCEPT.controller.views)은 그대로 정지 렌더를 쓴다 — 건드리지 않는다.
const CONTROLLER_FRAME_COUNT = 30;

export const PRODUCT_MEDIA = {
  mask: {
    frames: Array.from(
      { length: MASK_FRAME_COUNT },
      (_, i) => `/frames/mask-360/frame-${String(i).padStart(3, '0')}.webp`
    ),
    // 소스가 정사각이라 시퀀스도 정사각이다
    leadRatio: '1 / 1',
    dive: { src: '/images/product/mask-front.jpg', alt: 'Mask front render' },
  },
  controller: {
    frames: Array.from(
      { length: CONTROLLER_FRAME_COUNT },
      (_, i) => `/frames/con-360/frame-${String(i).padStart(3, '0')}.webp`
    ),
    leadRatio: '1 / 1',
    dive: { src: '/images/product/con-side.jpg', alt: 'Controller side render' },
  },
};

// ---------------------------------------------------------------------------
// 제품 사양과 특징. **`1f914ed`의 제품 상세에서 복구했다.**
// 상세 페이지의 히어로 제목과 세로 탭과 되돌아가기 링크는 갈 곳이 없어 복구하지 않았다.
// ---------------------------------------------------------------------------
export const PRODUCT_DETAIL = {
  /**
   * 사양. **Apple Tech Specs 문법이다(실측 재현).**
   *
   * 그쪽 `.techspecs-row`는 좌측 카테고리 라벨 24px/600이 216px 열에 서고, 우측 값이
   * 17px로 735px 열에 여러 줄 눕는다(1440에서 라벨 x223, 값 x467, 갭 28).
   * **구조만 가져온다. Apple의 스펙 문구와 수치는 옮기지 않는다.**
   *
   * 카테고리는 PRODUCT_PAGE_APPLE_MAPPING 2.2가 우리 제품에 맞게 정해 둔 목록이다.
   * **값은 우리 것이고, 실제 하드웨어 수치는 지어낼 수 없어 자리표시로 둔다.**
   * 확정되면 이 배열의 값만 바꾸고 참조처는 안 건드린다.
   */
  /**
   * **값은 추측 예시다(TODO_MARK 대신).** 실제 하드웨어 수치가 아직 없어 XR 펜싱 마스크/
   * 컨트롤러에 그럴듯한 값을 넣어 자리를 채운다. 확정되면 이 배열의 값만 바꾸고
   * 참조처는 안 건드린다 — 그래서 `EXAMPLE_MARK`로 값 끝에 표시해 예시임을 남긴다.
   */
  spec: {
    mask: [
      { label: 'Display', values: [`Resolution 2160 x 2160 per eye ${EXAMPLE_MARK}`, `Refresh rate 90Hz ${EXAMPLE_MARK}`] },
      { label: 'Field of View', values: [`110° diagonal ${EXAMPLE_MARK}`] },
      { label: 'Tracking', values: ['Markerless blade-tip tracking', 'Opponent style recognition', 'In-view touch indicator'] },
      { label: 'Time Processing', values: ['View dilation at the optimal moment'] },
      { label: 'Audio', values: [`Built-in spatial audio ${EXAMPLE_MARK}`] },
      { label: 'Battery', values: [`3 hours continuous use ${EXAMPLE_MARK}`] },
      { label: 'Weight', values: [`420g ${EXAMPLE_MARK}`] },
      { label: 'Dimensions', values: [`260 x 220 x 300mm ${EXAMPLE_MARK}`] },
      { label: 'Connectivity', values: ['Wireless'] },
    ],
    controller: [
      { label: 'Input', values: ['Motion sensor'] },
      { label: 'Sensing Axes', values: ['Accelerometer', 'Gyroscope'] },
      { label: 'Translation', values: ['Thrust speed and direction to blade-tip trajectory', 'Advance and retreat to engagement distance'] },
      { label: 'Haptics', values: ['Vibration feedback'] },
      { label: 'Battery', values: [`8 hours continuous use ${EXAMPLE_MARK}`] },
      { label: 'Weight', values: [`180g ${EXAMPLE_MARK}`] },
      { label: 'Dimensions', values: [`180 x 60 x 60mm ${EXAMPLE_MARK}`] },
      { label: 'Connectivity', values: ['Wireless'] },
    ],
  },
  /**
   * In the Box. **벤토 그리드로 눕는다.**
   * Apple Vision Pro 스펙 면에는 이 섹션이 없다(직접 열어 확인했다). 우리 기획이라
   * 베낄 대상 자체가 없고, 구성품은 우리 제품의 것이다.
   */
  boxLabel: 'In the Box',
  box: {
    mask: ['Mask unit', 'Charging cable', `Carrying case ${EXAMPLE_MARK}`],
    controller: ['Controller unit', 'Charging cable', `Wrist strap ${EXAMPLE_MARK}`],
  },
  specLabel: 'Specifications',
  // **viewer 문구 묶음을 걷었다.** 3D 뷰어가 사라지면서 조작 안내("드래그해 돌린다")와
  // WebGL 실패 안내가 가리킬 대상이 없어졌다. 제품 면은 이제 스펙과 렌더만 이고 있다
  cta: 'Experience it',
};

// ---------------------------------------------------------------------------
// footer. **랜딩에 있던 것을 제품 페이지 아래로 옮겼다.**
// 사이트가 한 페이지로 줄면서 랜딩이 사라졌고, 그대로 두면 크레딧과 팀과 저작권이
// 사이트에서 통째로 없어진다. **메뉴 줄만 뺐다.** 갈 페이지가 남지 않았다
// ---------------------------------------------------------------------------
// **영어화(개정).** 크레딧의 '강원 지부'를 영어로, 팀 이름을 로마자 표기로 옮겼다.
export const FOOTER = {
  wordmark: BRAND,
  credit: '2026 KDM+ Generative AI Workshop, Gangwon Chapter',
  team: 'Dayoung Kim, Hyunho Ju, Sohee Yoon',
  copyright: '© 2026 VORTEX',
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
