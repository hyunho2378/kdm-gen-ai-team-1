# AGENTS.md 간합 에이전트 실행 구조

이전 프로젝트 AGENTS.md를 대체한다. 간합의 병렬 구조는 앱 경계와 일치한다.

## 실행 원칙

에이전트는 명세(DESIGN, IA, ROUTES, COMPONENTS, PATTERNS, SERVER)를 벗어나는 결정을 스스로 내리지 않는다. 명세에 없는 상황은 질문 후 대기. 못한다고 말하는 것이 잘못된 결정보다 낫다. 위반값이 여러 파일에 있어도 기준 정답으로 삼지 않는다.

토큰 단일 원천은 `shared/tokens.js`. 각 앱 `src/tokens.js`는 재수출 포인터일 뿐이고 값을 넣지 않는다(값 사본이 갈라지면 지뢰다).

## 병렬과 단독 판단 (이 프로젝트 확정)

병렬 가능: 파일 소유가 앱 폴더로 갈리고 공유 계약(tokens, protocol)이 이미 파일로 확정된 작업.
단독 강제: shared/와 server/ 수정(전 앱의 계약 원본), arena의 상태머신과 판정과 소켓 연동(상호작용 상태가 얽혀 half-working이 가장 잘 생기는 구간), 그리고 모든 버그 수정.

```
PHASE 0  기반 단독        shared/tokens.js v2 교체, protocol 확정, server 릴레이 검증
PHASE 1  병렬 3 트랙
  P-A  presentation      계정 하나가 소유
  P-B  brand             다른 계정이 소유
  P-C  arena+controller  단독 트랙. 내부는 순차:
                         arena 키보드 모드 완주(판정 완성) → controller 센서 → 소켓 연동 → 웹캠
PHASE 2  통합 단독        앱 간 URL env 연결, 배포 4+1, 데모 리허설, 녹화 백업
```

P-C 내부 순서의 이유: 키보드 모드로 판정을 먼저 완성하면 폰과 서버 없이도 데모가 성립한다. 비상 컷이 공짜로 생기고, 센서와 소켓은 그 위에 입력 소스로 얹힌다.

파일 소유 계약: 각 트랙은 자기 앱 폴더만 수정한다. shared/는 전원 읽기 전용, 수정 필요 시 PROGRESS.md에 제안을 남기고 단독 커밋으로만 반영한다. 겹침 발견 시 중단 후 질문.

## 두 계정 운용 (지침 6절과 결합)

세션 시작 git pull → PROGRESS.md 읽기 → 진행중 칸에 트랙 선점 선언. 같은 시간대 두 계정이 같은 앱 폴더를 만지지 않는다. 종료 시 완료, 진행중, 다음 작업, 미해결 이슈 기록 후 커밋.

커밋 형식: `[영역] 한 일`. 영역은 presentation, brand, arena, controller, server, docs.

## 컨텍스트 관리

85% 도달 시 즉시 중단, PROGRESS.md 갱신 후 대기. 재시작 시 PROGRESS.md 먼저.

## 검증 체크리스트 (통합 단독 필수 실행)

디자인 시스템:
- [ ] Pretendard 외 폰트 없음
- [ ] HEX 하드코딩 없음(tokens 경유만. 예외: shared/tokens.js, 각 index.css 첫 페인트 1줄)
- [ ] 탁한 색 없음: steel.shadow 단독 사용 0건, text.dim보다 어두운 텍스트 0건, 네이비 잔재(#20263A, #0D1117 계열) 0건
- [ ] 크롬 그라디언트가 heading 이하 크기에 없음
- [ ] blue가 상대 표시 외 용도에 없음
- [ ] 이모지 0건, hover scale 0건, press는 scale(0.97)만

레이아웃:
- [ ] presentation, brand 320~3840 가로 스크롤 0, 급변 구간 없음
- [ ] controller 320~430 세로, 가로 회전 안내 동작
- [ ] arena 1024 미만 차단 안내 동작
- [ ] 100vh 없음(100dvh만)

게임:
- [ ] 판정이 결정적(같은 입력 같은 결과), 판정 루프에 LLM 호출 0건
- [ ] motion.budget 상한이 코드에서 참조됨, 1분 연속 교전 중 minFps 30 사수
- [ ] 캠 거부, 서버 단절, 센서 미지원 3종 저하 경로 실제 재현 확인
- [ ] F9 키보드 모드 즉시 전환
- [ ] iOS vibrate 미지원 폴백(플래시 + 사운드) 동작

연결:
- [ ] presentation→arena, brand→arena, QR→controller 실 배포 URL에서 동작
- [ ] .env 커밋 0건, .env.example 5개 최신
- [ ] localStorage, sessionStorage, TypeScript 0건
- [ ] 배포 URL 육안 검증(로컬만 보고 완료 처리 금지)

데모 리허설:
- [ ] 관객 참여 컷, 안전 컷, 비상 컷 3벌 각 1회 완주
- [ ] 핫스팟 네트워크에서 페어링 확인
- [ ] 전날 완주 녹화 확보
