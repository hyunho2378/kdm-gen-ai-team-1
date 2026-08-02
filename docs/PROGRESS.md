# PROGRESS

## 완료
- SETUP: 저장소 구조, 의존성, 설정 파일 생성
  - 폴더 5개(presentation, brand, arena, controller, server) + shared, docs 생성
  - shared/tokens.js, shared/protocol.js 작성. 각 앱 src/tokens.js는 재수출만
  - 프런트 4개 앱 Vite + React 18 + Tailwind 3 + React Router 6 + lucide-react 설치
  - arena, controller에 socket.io-client 추가. arena/src/game 3개, arena/src/net, controller/src/sensors 2개, controller/src/net 골격 파일 생성
  - server Express 5 + Socket.io 4 + cors, 방 코드 페어링과 릴레이 최소 구현
  - 검증: npm install 5개 성공, build:all 4개 dist 생성, GET /health 200
  - 검증: 페어링 스모크 통과(방 코드 발급, paired 브로드캐스트, action 릴레이, 없는 방 거부)
  - 검증: localStorage/sessionStorage 사용 0, .ts/.tsx 0, TS 문법 0, 이모지 0
  - 검증: HEX는 shared/tokens.js와 각 index.css 예외 1줄에만 존재. 그 밖 0
  - 검증: vercel.json 4개, .env.example 5개, 커밋 대상 .env 0

## 진행중
- (착수 전 여기에 영역 선점 선언)

## 다음 작업
- DESIGN.md 확정, shared/tokens.js 본값 반영
- server 방 코드 페어링 최소 동작
- arena 상태머신 골격

## 미해결 이슈
- dev 포트를 arena 5173, controller 5174, presentation 5175, brand 5176으로 고정. server 기본 CORS_ORIGINS와 맞추기 위한 배정
- 루트 package.json에 `"type": "module"` 추가. tailwind.config.js가 저장소 루트 밖 shared/tokens.js를 ESM으로 읽으려면 필요
- docs/ 하위 AGENTS, BACKEND, CLAUDE, COMPONENTS, IA, MOTION, PATTERNS, PITFALLS, RESPONSIVE, ROUTES는 이전 프로젝트에서 유입된 문서. 간합 기준으로 재확인 필요
