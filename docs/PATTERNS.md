# PATTERNS.md 간합 반복 UI 패턴

화면을 새로 만들 때 이 패턴을 재사용한다. 임의 변형 금지. 값은 전부 tokens.js 경유.

## 1. 배경
bg.base에서 bg.deep으로 떨어지는 수직 그라디언트 + 약한 방사 비네트. 단색 평면 배경 금지, 네이비 틴트 금지. 요소는 배경보다 항상 밝다(DESIGN §1 규칙 1).

## 2. 섹션 골격 (presentation, brand 공용)
라벨(hud, text.dim, 대문자) → 제목(title 또는 display, 크롬 허용) → 본문(body, text.secondary, 최대 720px) → 비주얼. 섹션 사이 spacing.section. 구분이 필요하면 TrailDivider.

## 3. 카드
bg.raised, line.default 1px 보더, radius.lg, 패딩 24px. 블랙 배경에서 그림자는 안 보이므로 쓰지 않는다. 깊이는 보더와 글로우로. hover: 보더 line.strong + glow.steel. 카드 전체가 클릭 타깃이면 커서와 focus-visible 링 필수.

## 4. CTA
화면당 ButtonPrimary 하나. 보조는 ButtonGhost. CTA 문구는 행동 동사로 시작(체험해보기, 데모 시작, 다시). 파괴적 액션 없음(이 프로젝트에 삭제류 없음).

## 5. HUD (arena 전용)
hud 타이포, 대문자 라벨 + text.primary 값. 판넬은 bg.raised 대신 overlay 알파 배경(캔버스를 가리지 않게). 숫자 변화는 트윈 없이 즉시 반영(게임 정보는 지연이 오독). 색 단독 구분 금지, 소유자 라벨 병기.

## 6. 판정 표시 (arena)
JUDGE 800ms 안에서: 궤적 코어 흰 고정(캔버스) + JudgeText 등장(DOM, ease-out 150ms) + 유지 + 이탈. 문구 4종 고정: 명중, 헛침(사유 병기: 거리 밖), 가드, 리포스트. 헛침 사유는 6자 이내.

## 7. 페어링 (arena와 controller 한 쌍)
arena: 방 코드를 display 크기로, QR을 그 옆에. 코드가 주인공이고 QR이 보조다(구두로도 불러줄 수 있게). controller: ?room= 자동 접속을 기본, 수동 입력을 폴백으로. 접속 단계 문구는 현재 상태를 서술(접속 중, 방 없음, 연결됨).

## 8. 우아한 저하 (전 앱 공통 태도)
기능이 죽어도 경기와 발표는 산다.
- 캠 거부: StatusChip "캠 없음"과 대체 지표 작동. 모달로 막지 않는다.
- 서버 단절: arena 상단 배너 한 줄 + F9 키보드 모드 안내. 자동 재접속 시도.
- 센서 미지원: controller가 탭 버튼 모드(찌르기 버튼, 가드 버튼)로 전환.
- 라이브러리 로드 실패(Tubes, liquidGL, MediaPipe): 정적 폴백. 핵심 UI를 서드파티에 인질 잡히지 않는다.
저하 상태는 숨기지 않고 칩과 문구로 정직하게 드러낸다(발표 방어 논리).

## 9. 로딩과 빈 상태
로딩은 검끝 곡선 모티프의 선 그리기 애니메이션 하나로 통일. 스피너 금지(버튼 내부 제외). 이 프로젝트에 목록형 빈 상태 없음.

## 10. 오류 문구
능동태, 원인 + 다음 행동 순서. 예: "방을 찾지 못했다. 코드를 확인하고 다시 입력." 팝업 금지, 인라인 표시.

## 11. 모바일 (controller)
세로 고정. 가로 회전 감지 시 전체 화면 안내 "세로로 돌려서 쥐기". 100vh 금지, 100dvh. 터치 타깃 44px, 입력 면은 화면 하단 절반(엄지 도달권).

## 12. 접근성 공통
focus-visible red.light 2px 전 요소. 아이콘 단독 버튼 aria-label. 대비는 DESIGN §13 실측값 준수. keep-all 줄바꿈. reduced motion에서 시간 팽창과 대형 모션 비활성.
