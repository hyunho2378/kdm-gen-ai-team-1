# COMPONENTS.md 간합 컴포넌트 명세

여기 없는 컴포넌트는 만들지 않는다. 필요하면 질문 후 이 문서에 먼저 추가한다. 모든 값은 tokens.js 경유. 표기: 파일 경로 / 사용처 / 스펙.

앱은 독립 배포이므로 공용 UI 패키지를 두지 않는다. Button처럼 여러 앱에 나오는 컴포넌트는 스펙을 여기서 통일하고 각 앱에 동일하게 구현한다. 스펙 이탈 금지.

---

## 공통 스펙 (전 앱 동일 구현)

- **ButtonPrimary** `components/ui/Button.jsx` / CTA
  red.fill 배경, text.onFill, radius.pill, 패딩 12px 24px. :active scale(0.97) + red.press. hover는 배경 변화 대신 glow.red + line.strong 보더. 터치 타깃 최소 44px.
- **ButtonGhost** 같은 파일 / 보조 액션
  투명 배경, line.strong 보더, text.primary. hover 시 보더 red.light.
- **ChromeText** `components/ui/ChromeText.jsx` / display, title 한정
  steel.gradient + background-clip: text. heading 이하 크기에서 사용 금지(가드 주석 필수).
- **TrailDivider** `components/ui/TrailDivider.jsx` / 섹션 구분
  검끝 곡선 한 줄 모티프 SVG. 기본 steel, 강조 맥락만 red.light. 두께가 한쪽으로 감쇠.
- **StatusChip** `components/ui/StatusChip.jsx` / 연결 상태 표시
  bg.raised, radius.pill, caption. 상태 텍스트 라벨 필수(색 단독 금지). ok는 text.primary, 저하는 red.light 텍스트.

---

## presentation

- **Section** `components/Section.jsx` / 8개 섹션 래퍼
  min-height 100dvh(100vh 금지), spacing.section 상하. id를 받아 해시 앵커.
- **ProgressRail** `components/ProgressRail.jsx` / 우측 고정 진행 레일
  섹션 8개 점, 현재 섹션 red.light. 클릭 scrollIntoView. zIndex.sticky.
- **ScrollTrail** `components/ScrollTrail.jsx` / 스크롤 연동 궤적
  스크롤 진행률로 path stroke-dashoffset 제어. steel 기본, demo 섹션 근접 시 red.light.
- **InteractionStep** `components/sections/InteractionStep.jsx` / 인터랙션 4종
  좌 텍스트(순번 hud, 제목 title, 설명 body), 우 비주얼 슬롯. 모바일 세로 스택.
- **WorkflowRow** `components/sections/WorkflowRow.jsx` / AI 워크플로우
  단계명, AI가 한 것, 사람이 판단한 것 2열 병기. 로고 이미지 금지.
- **DemoCta** `components/sections/DemoCta.jsx` / 마지막 섹션
  ButtonPrimary 대형, VITE_ARENA_URL 이동.

## brand

- **Hero** `components/Hero.jsx` / 홈 최상단
  클립패스 마스크, 크롬 워드마크 슬롯(시각디자이너 SVG), 사슬 텍스처 이미지 레이어. 100dvh.
- **TubesBackground** `components/vendor/TubesBackground.jsx` / 홈 배경
  Tubes Cursor 래핑. 로드 실패 시 정적 그라디언트 폴백(핵심 UI를 라이브러리에 인질 잡히지 않기). 크레딧은 푸터.
- **ProductCard** `components/ProductCard.jsx` / 제품군 4종 그리드
  bg.raised, line.default 보더, radius.lg, 렌더 이미지, 이름 heading, 한 줄 body. hover 보더 강조 + glow.steel. 카드 전체 링크.
- **ProductDetail** `pages/ProductDetail.jsx` / /products/:key
  content/products.js 데이터 주도. 히어로 렌더, 스펙 서사 블록, LiquidCard 최대 2개, 하단 ExperienceCta.
- **LiquidCard** `components/vendor/LiquidCard.jsx` / 제품 상세 한두 곳
  liquidGL 래핑, 실패 시 bg.raised 폴백. arena 반입 금지.
- **SchoolCard** `components/SchoolCard.jsx` / 유파 섹션
  유파명, 리듬 한 줄, 소유 색 견본. content/schools.js 데이터 주도.
- **ExperienceCta** `components/ExperienceCta.jsx` / 홈과 상세 공용
  ButtonPrimary, VITE_ARENA_URL 이동. brand의 존재 이유.
- **CreditFooter** `components/CreditFooter.jsx`
  Tubes Cursor CC BY-NC-SA 크레딧, 팀, 대회 표기. caption.

## arena

- **GameCanvas** `game/GameCanvas.jsx` / 렌더 루트
  풀스크린 마운트 지점, zIndex.content. **렌더러 구현을 직접 갖지 않고 인터페이스만 붙인다.**
  루프 주도권은 `game/loop.js`가 그대로 쥔다(react-three-fiber 미도입).

  ```
  IRenderer: init(mount, tokens), resize(w, h), render(gameState, dtRender),
             dispose(), setPoses(images), setBackgroundImage(image)
  ```

  `ThreeRenderer`가 기본이고 `Canvas2dRenderer`(기존 C1 3인칭, 동작 무변경)가 폴백이다.
  전환 조건 3종: WebGL 컨텍스트 생성 실패, 런타임 `webglcontextlost`, URL `?renderer=2d`.
  전환 시 StatusChip에 "호환 렌더"를 띄운다. 레이어 구성은 DESIGN 9절과 ARENA_SCENE.md를 따른다.
  **렌더러는 게임 상태를 읽기만 한다. 쓰기 금지.** 읽어도 되는 필드는 ARENA_SCENE.md의 표에 한정한다.
- **machine** `game/machine.js` / 상태 머신(컴포넌트 아님) — **렌더 작업 중 수정 금지**
  phase 8종 소유. IDLE→PAIRING→CALIBRATION→EN_GARDE→EXCHANGE→JUDGE→SCORE→MATCH_END.
- **judge** `game/judge.js` / 판정(결정적, LLM 없음) — **렌더 작업 중 수정 금지.**
  게임플레이 변경은 기준 서명 갱신 절차를 밟는 단계에서만 한다(D3이 그 예다).
  거리 유효 범위, THRUST 임계, FEINT와 REAL, 리포스트 윈도우 600ms, 쿨다운 350ms.
  **런지(D3)**: 전진 홀드 + 찌르기. 새 키를 만들지 않고 이산 채널을 그대로 쓴다.
  유효 범위가 먼 쪽으로 넓어지고(35~55 → **32~55**) 쿨다운이 길다(350 → **500ms**).
  가까운 쪽 상한은 넓히지 않는다. 붙어 있을 때 런지가 더 유리할 이유가 없다.
  **진입 조건만 다르고 아래 4분기 판정은 손대지 않는다.**
  **명중 4분기**: 유효 범위 안 찌르기는 상대가 열린 순간에만 명중한다. 무조건 명중으로 두면
  연타로 7초에 경기가 끝나고 FEINT 판독과 가드와 리포스트와 시간 팽창이 전부 죽는다(실측).
  | 상대 상태 | 결과 |
  |---|---|
  | RECOVER (공격 내지른 직후) | 명중 |
  | TELEGRAPH + FEINT (페인트 판독) | 명중 |
  | TELEGRAPH + REAL | 헛침 `상대 공격`. 가드로 받아야 한다 |
  | IDLE (대치) | 헛침 `막힘`. 상대 검이 선을 잡고 있다 |
  득점 경로는 둘이다. 상대 공격을 가드로 받고 600ms 안에 되찌르기(2점), 또는 상대가 내지른
  직후 준비 동작에 찔러 넣기(1점). 헛침 사유는 PATTERNS 6절대로 6자 이내.
  **패리는 phase를 멈추지 않는다.** JUDGE 800ms와 SCORE 420ms를 거치면 리포스트 윈도우가
  열리자마자 만료된다. 판정 문구 표시(showJudge)를 phase와 분리해 둔다.
- **opponents** `game/opponents.js` / AI 유파 파라미터 — 게임플레이 파일이라 렌더 작업 중 수정 금지
  두 유파가 **다르게 싸운다**는 것이 체감되어야 한다(D3). 난수는 전부 주입된 rng를 거친다.
  | 파라미터 | 뜻 |
  |---|---|
  | `tempoBands` / `tempoShiftEvery` | 공격 간격 분포를 몇 합마다 갈아탄다. 같은 리듬이 이어지면 박자를 세고 만다 |
  | `comboChance` / `comboGapMs` | 회복 직후 곧바로 두 번째 공격을 낼 확률과 그 짧은 간격 |
  | `stepFeintChance` | 대치 중 앞으로 훅 들어왔다 빠지는 거리 흔들기 확률 |
  | `ripostePressure` | 패리당해 리포스트 창이 열렸을 때 즉시 되받아치려 들 확률 |
  이탈리아 세이버는 콤보와 빠른 템포, 프랑스 에페는 거리 흔들기와 되받아치기다.
  실측 평균 공격 간격 **이탈리아 1778~2077ms 대 프랑스 3248~3748ms**.
- **HUD** `components/hud/HUD.jsx` / DOM 오버레이 루트
  zIndex.sticky~header. 하위: DistanceGauge, ScoreBoard, JudgeText, PhaseBanner, StatusChip 3개.
- **DistanceGauge** `components/hud/DistanceGauge.jsx`
  d 0~100 바, 유효 범위 밴드 red.light 표시. 헛침 사유 짧은 텍스트 슬롯.
- **JudgeText** `components/hud/JudgeText.jsx`
  판정 문구(명중, 헛침, 가드, 리포스트). judge 800ms 타이밍과 동기. hud 타이포.
- **QRPanel** `components/QRPanel.jsx` / PAIRING
  방 코드 display 크기 + qrcode 라이브러리 QR. controller URL + ?room=.
- **CalibrationRing** `components/CalibrationRing.jsx` / CALIBRATION
  3초 진행 링. SVG stroke 애니메이션(transform, opacity 규칙 준수 대상 아님, stroke-dashoffset은 SVG 예외로 허용하되 HUD 밖 남용 금지).
- **VignetteOverlay** `components/VignetteOverlay.jsx` / 시간 팽창
  zIndex.overlay, 방사 비네트 opacity만 애니메이션. timeDilation 수치 참조.
- **FaceTracker** `game/faceTracker.js` / 웹캠(컴포넌트 아님)
  MediaPipe FaceLandmarker CDN. 요 각도와 랜드마크 안정도 2지표. 거부와 실패 시 null 반환, 게임은 THRUST 성공률 대체 지표로 계속.

## controller

- **RoomJoin** `components/RoomJoin.jsx` / JOIN
  코드 4자리 커스텀 입력(네이티브 UI 금지), 자동 대문자, 실패 사유 인라인.
- **PermissionGate** `components/PermissionGate.jsx` / PERMISSION
  DeviceMotionEvent.requestPermission 버튼(사용자 제스처에서만 호출). 안드로이드 자동 통과 분기.
- **SwordScreen** `components/SwordScreen.jsx` / PLAY
  전체 화면이 입력 면. 상단 방 코드와 StatusChip, 중앙 안내 문구, 하단 스와이프 영역 표시. 시각 요소 최소.
- **HapticFlash** `components/HapticFlash.jsx`
  haptic 수신 시 vibrate, iOS는 풀스크린 플래시(red.fill 명중, steel 가드) + 짧은 사운드.
- **sensors** `sensors/motion.js`, `sensors/wakelock.js` (컴포넌트 아님)
  하이패스 필터, EMA 스무딩, 피크 감지 임계(캘리브레이션 보정), 30Hz 송신 스로틀. Wake Lock 획득과 재획득(visibilitychange).
