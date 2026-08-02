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
  canvas 풀스크린, zIndex.content. 레이어: 배경 이미지, 실루엣 크로스페이드 + 잔상, 궤적 리본, 파티클. motion.budget 상한 참조. WebGL 실패 시 2D 폴백.
- **machine** `game/machine.js` / 상태 머신(컴포넌트 아님)
  phase 8종 소유. IDLE→PAIRING→CALIBRATION→EN_GARDE→EXCHANGE→JUDGE→SCORE→MATCH_END.
- **judge** `game/judge.js` / 판정(결정적, LLM 없음)
  거리 유효 범위, THRUST 임계, FEINT와 REAL, 리포스트 윈도우 600ms, 쿨다운 350ms.
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
