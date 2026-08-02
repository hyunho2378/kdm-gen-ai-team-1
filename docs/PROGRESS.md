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

## 진행중
- (착수 전 여기에 트랙 선점 선언. P-A presentation / P-B brand / P-C arena+controller)

## 다음 작업
- PHASE 1 착수: P-C arena 키보드 모드 우선(상태머신 + 판정 + 궤적 렌더). P-A, P-B는 계정별 선점 후 병렬
- 배경 이미지 재생성: 네이비 톤 도장 이미지 폐기, 블랙 기조로 생성
- 시각디자이너 워드마크 SVG 슬롯 전달(크롬 레터링)

## 미해결 이슈
- dev 포트 고정: arena 5173, controller 5174, presentation 5175, brand 5176
- 루트 package.json "type": "module" 유지 필요(shared ESM 로드)
- hello의 방 코드 필드: SERVER.md는 room, 기존 골격은 code. 서버가 room ?? code로 둘 다 받는다.
  클라이언트 구현 시 room으로 통일하고 code 폴백을 제거할 것
