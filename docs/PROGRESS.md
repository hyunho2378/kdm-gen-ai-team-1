# PROGRESS

## 완료
- SETUP: 저장소 구조, 의존성, 설정 파일 생성
  - 폴더 5개(presentation, brand, arena, controller, server) + shared, docs 생성
  - shared/tokens.js, shared/protocol.js 작성. 각 앱 src/tokens.js는 재수출만
  - 프런트 4개 앱 Vite + React 18 + Tailwind 3 + React Router 6 + lucide-react 설치
  - arena, controller에 socket.io-client 추가. 골격 모듈 파일 생성
  - server Express + Socket.io + cors, 방 코드 페어링과 릴레이 최소 구현, 스모크 통과
  - 금지 항목 grep 전부 0건, vercel.json 4개, .env.example 5개
- docs v2: 간합 기준 문서 전면 교체
  - DESIGN.md v2(블랙 + 크롬 + 쨍한 레드, 대비 실측 포함)
  - IA.md, ROUTES.md, COMPONENTS.md, PATTERNS.md 간합 버전으로 교체(이전 프로젝트 내용 폐기)
  - AGENTS.md 간합 병렬 구조로 재작성, BACKEND.md 삭제 후 SERVER.md로 대체
  - shared/tokens.js v2 교체(radius, glow 추가, 네이비 팔레트 폐기)
- PHASE 0 마무리 (P-0 docs+shared 트랙, 종료)
  - MOTION, RESPONSIVE, PITFALLS, CLAUDE 4개에 표준 문서 배너 삽입(본문 무수정)
  - shared/protocol.js MSG에 PEER_LEFT, ERROR 추가. SERVER.md 프로토콜과 1:1
  - server: disconnect 시 peer_left 통지, 같은 방 재접속 허용(옛 소켓 슬롯 인계), 10분 유휴 GC(lastSeenAt 기준, 스윕 60초)
  - 페어링 실패를 room{ok:false}에서 error{reason}으로 분리. 소켓 스모크 6항목 통과
  - arena/.env.example에 VITE_CONTROLLER_URL 추가
  - 4개 앱 index.css 첫 페인트 예외를 #0B0B0E / #F2F6FF로 교체
  - 4개 앱 tailwind extend를 v2 토큰 그룹(bg, red, blue, steel, trail, txt, line)으로 재매핑. accent 폐기
  - build:all 4개 성공, 네이비 잔재 코드 0건, HEX 하드코딩 예외 밖 0건, 이모지 0건
- PHASE 0 마감 수정 (P-0b 트랙, 종료)
  - steel.gradient는 colors 매핑에서 제외, style 경유 전용. tokens.js의 값 자체는 유지
  - 스킬 경로 .claude/skills/coding으로 통일, SESSION_HEADER와 SKILL.md 표기 정정
  - 커밋 3분할: docs+tokens+server / 스킬 배치 / vendor 반입
- P-C C1 arena 키보드 모드 (트랙 종료, 확인 대기)
  - loop.js 고정 타임스텝(1/60 누적기) + 가변 렌더, 로직 시계에만 timeScale, 탭 비활성 정지
  - machine.js phase 8종 순수 전이 함수 + 진입 이탈 훅. 키보드는 PAIRING과 CALIBRATION 건너뜀
  - judge.js 결정적 판정. 거리 35~55, 쿨다운 350ms, 리포스트 600ms 2점, FEINT 무페널티, REAL 가드 패리
  - opponents.js 유파 2종(이탈리아 세이버, 프랑스 에페), rng.js mulberry32 시드 난수
  - renderer/ 4레이어 canvas 2D(배경, 선수 실루엣 + 잔상, 궤적 가산 블렌딩, 파티클 풀링)
  - HUD DOM 6종 + IDLE, MATCH_END, 1024 미만 차단 화면
  - 입력 추상화 input.js(키보드와 C3 소켓 action이 같은 큐로 수렴), F9 전 phase 동작
  - 검증: 셀프테스트 6/6, 결정성 서명 일치, 5점 완주 양방향, 실브라우저 1분 교전 p50 59.9fps
  - 시간 팽창 지속 1200ms와 쿨다운 8000ms 실측, reduced motion 비활성 확인
  - C4 웹캠 지표 주입 인터페이스(shouldDilate의 extra 인자) 선반영
  - 명중 4분기 규칙 승인 완료. COMPONENTS.md judge 항목으로 승격(사양 확정)
  - 패리가 phase를 멈추지 않도록 수정. 리포스트 윈도우가 만료되던 버그 해소
- P-A A1 presentation 스크롤 엔진과 8섹션 골격 (확인 대기)
  - gsap 3.15 + lenis 1.3 도입. @bsmnt/scrollytelling은 채택하지 않음
    (React 18 peer는 맞으나 2024-02 이후 배포 정지, Radix portal과 slot 의존 2개를 끌고 온다.
     PITFALLS 서드파티 절대로 발표 중 죽으면 복구가 없어 ScrollTrigger 직접 제어로 간다)
  - lib/motionMode.js 전역 분기 유틸. 이 트랙의 모든 연출은 이 파일을 거친다
  - lib/scroll.js Lenis + gsap ticker 동기, lagSmoothing 0. reduced면 Lenis 미기동(네이티브 스크롤)
  - Section 8종(IA 2절 id와 1:1), ProgressRail, StageBackground 전역 1회
  - content/sections.js 카피 단일 원천. lorem 없음, 팀 확정분은 TODO 카피 4곳

## 진행중
- (P-A A1 종료. A2 착수 전 확인 대기)
- (착수 전 여기에 트랙 선점 선언. P-A presentation / P-B brand / P-C arena+controller)

## 다음 작업
- P-C C2 controller 센서 (C1 확인 후 착수). C1 판정 규칙 보강분 승인 여부를 먼저 확인할 것
- P-A presentation / P-B brand는 계정별 선점 후 병렬 착수 가능
- 배경 이미지 재생성: 네이비 톤 도장 이미지 폐기, 블랙 기조로 생성
- 시각디자이너 워드마크 SVG 슬롯 전달(크롬 레터링)

## 미해결 이슈
- dev 포트 고정: arena 5173, controller 5174, presentation 5175, brand 5176
- 루트 package.json "type": "module" 유지 필요(shared ESM 로드)
- hello의 방 코드 필드: SERVER.md는 room, 기존 골격은 code. 서버가 room ?? code로 둘 다 받는다.
  클라이언트 구현 시 room으로 통일하고 code 폴백을 제거할 것
- arena favicon.ico 404. 네 앱 공통으로 favicon이 없다. PHASE 2 배포 정리에서 함께 처리
- arena fps 실기 확인이 남았다. 측정이 헤드리스 소프트웨어 렌더링이었다.
  발표 노트북에서 1분 교전 육안 확인을 PHASE 2 리허설에 포함
- **shared/tokens.js 수정 제안 (읽기 전용이라 P-A가 직접 고치지 않음).**
  typography.title의 clamp 상한이 3rem(48px)이라 1920, 2560, 3840에서 제목 크기가 48px로 고정된다.
  RESPONSIVE 4K 절의 "본문 텍스트가 상대적으로 작아 보이지 않을 것"에 걸린다. display도 6rem에서 멈춘다.
  상한을 올리거나 vw 계수를 키우는 편이 맞다. 단독 커밋으로 반영 후 네 앱 재검증 필요
- presentation ProgressRail 구조 결정: md(768) 미만은 우측 세로 레일이 본문 제목을 덮어(320, 390 실측)
  하단 가로 행 4개씩 2줄로 전환한다. 320에 44px 타깃 8개를 한 줄로 넣으면 352px라 넘치기 때문
- presentation 레일 라벨은 hover와 focus에서만 뜬다. 상시 노출하면 768~1440에서 본문을 덮는다(실측).
  현재 섹션 표시는 red.light 점과 aria-current가 맡는다
- arena 선수 실루엣과 배경은 임시 도형과 그라디언트다. 자세 스틸 5포즈 x 2인과 블랙 기조 도장
  이미지가 도착하면 renderer의 setPoses와 setBackgroundImage로 교체한다(인터페이스 준비 완료)
