# AGENTS.md — 에이전트 실행 구조 & 할루시네이션 방지 (시빅해킹 플랫폼 v2)

> 프로젝트 전체에 걸쳐 고정 적용. 프로젝트별 커스텀 로직은 PROGRESS.md에 기록.

---

## 실행 원칙

에이전트는 명세(DESIGN-apple.md / DESIGN-v2.md / IA.md / COMPONENTS.md / PATTERNS.md / ROUTES.md / BACKEND.md / CMS.md)를 벗어나는 결정을 스스로 내리지 않는다.
명세에 없는 상황은 **반드시 사용자에게 물어보고 대기**한다.
"못한다는 것을 말하는 것"이 "잘못된 결정을 내리는 것"보다 낫다.
디자인 시스템 검증 시 "통일 = 위반값으로 맞추기" 절대 금지.
DESIGN-apple.md + DESIGN-v2.md 기준으로 위반 파악 후 올바른 토큰으로 교체. 충돌 시 v2 우선.
위반값이 여러 파일에 동일하게 있어도 "기준 정답"으로 삼지 않는다.

**토큰 단일 원천 = `client/src/tokens.js`.** 웨이브 프롬프트 §0의 "tokens.js를 읽으라"는 이 파일을 뜻한다. 루트 `tokens.js`는 값 사본이 아니라 이 파일을 재수출하는 포인터일 뿐이다(값을 넣지 마라 — W-RETHEME 이후 갈라져 지뢰가 됐던 이력). 값 확인·수정은 항상 `client/src/tokens.js`.

---

## 병렬 / 단독 판단 기준 (이 프로젝트 확정)

병렬 가능 조건: 파일 소유가 겹치지 않고, 공유 계약(토큰·데이터 형태·API 응답)이 이미 파일로 확정된 작업.
단독 강제 조건: 그 산출물이 다른 에이전트의 계약 원본이 되는 작업(tokens, API 스키마),
상호작용 상태가 복잡해 부분 충돌 시 디버깅 비용이 큰 작업(캔버스 드래그, 핀 코멘트), 그리고 모든 수정·디버깅.

```
PHASE 0   초기 세팅                     단독 1
PHASE 1   프론트 병렬 구현               병렬 3 (A1 기반·데이터 / A2 페이지 / A3 컴포넌트)
PHASE 1.5 복잡 인터랙션                  단독 순차 2 (캔버스 → 핀 코멘트)
PHASE 2   백엔드                        단독 1 (API 계약 원본이므로 병렬 금지)
PHASE 2.5 클라이언트-서버 연동            단독 1
PHASE 3   검증(REVIEW)                  단독 1
```

이유 기록. 캔버스와 핀 코멘트는 좌표 상태·드래그·낙관적 갱신이 얽혀 병렬 분할 시 half-working 상태가 가장 잘 생기는 구간이라 단독. 백엔드는 응답 형태 {items}/{item}가 전 화면의 계약이라 원본을 한 손이 만든다. 연동은 mock 제거 작업이라 전 파일을 관통하므로 단독.

---

## PHASE 0 — AGENT-SETUP (단독)

**담당**
- client/ server/ 폴더 구조 생성, 패키지 설치
- tailwind.config.js (tokens.js 값 그대로 매핑)
- index.html (Pretendard Variable CDN), src/index.css (크로스페이드 전환, 글로벌)
- client/src/tokens.js 배치(제공본 그대로), .env.example

**완료 조건**
- npm run dev로 client 정상 실행
- 빈 App.jsx 라우팅 1개 이상 동작, bg-canvas·text-ink 등 토큰 클래스 동작

> PHASE 0 완료 전까지 PHASE 1 시작 금지

---

## PHASE 1 — 병렬 구현 (3 에이전트 동시)

### AGENT-1: 기반 + 데이터
**담당**
- tailwind.config.js 보강, src/index.css
- src/data/ mock 데이터 전체(IA.md 화면이 요구하는 형태. BACKEND.md 응답 형태 {items}/{item}와 동일 구조로 작성)
- src/App.jsx (ROUTES.md 그대로), src/main.jsx, RequireAuth 스텁
**완료 조건**: 토큰 클래스 전부 동작, 폰트 로드, mock이 BACKEND.md 스키마와 필드명 일치

### AGENT-2: 페이지 + 핵심 흐름
**담당**
- src/pages/ 전체(IA.md 페이지 목록 기준. 단, /canvas 와 /workspace/review/:id 는 뼈대만 — PHASE 1.5 소유)
- components/Header.jsx, Footer.jsx, Container.jsx
- 여정 상태 흐름(잠금·게이트 M2·M4 분기 포함) mock 기반 동작
**완료 조건**: 전 라우트 이동 동작, 게이트 잠금 표시, 6블록 단계 상세 렌더

### AGENT-3: 재사용 컴포넌트
**담당**
- src/components/ui, journey, catalog, methods, admin (COMPONENTS.md 목록 기준. canvas·review 폴더 제외 — PHASE 1.5 소유)
**완료 조건**: COMPONENTS.md 스펙 그대로, PATTERNS.md 패턴 그대로, 각 컴포넌트 단독 렌더 확인

파일 소유 계약: 세 에이전트는 위 담당 파일만 만진다. 겹침 발견 시 중단 후 질문.

---

## PHASE 1.5 — 복잡 인터랙션 (단독, 순차)

### AGENT-CANVAS (단독)
- components/canvas/* + pages/Canvas.jsx 완성. 드래그 이동, 더블클릭 편집, 색 5종, 묶음.
- 좌표는 % 저장(BACKEND.md canvas_notes 스키마와 일치).
### AGENT-REVIEWPIN (단독, CANVAS 완료 후)
- components/review/* + ArtifactReview 완성. 핀 좌표 % 저장, 상태 전이 open→acted→resolved.

---

## PHASE 2 — AGENT-BACKEND (단독)

- server/ 전체: BACKEND.md 스키마 그대로 마이그레이션 SQL, 라우트, 인증(httpOnly, 최초 로그인=등록), 업로드(Blob, 완료 후 저장), 권한 미들웨어, /health.
- 시드: 비파괴 원칙(seed_key + ON CONFLICT DO NOTHING).
**완료 조건**: 로컬에서 전 엔드포인트 수동 테스트 통과, 응답 형태 {items}/{item} 준수.

## PHASE 2.5 — AGENT-WIRE (단독)

- mock → 실 API 교체 전 화면. 폴링 규약(15초/10초, updated_at 비교 리렌더 생략) 구현.
- 콜드 스타트 "깨우는 중" 분기, 401 → AuthModal 오픈 + 경로 복귀.

## PHASE 3 — AGENT-REVIEW (단독)

PHASE 2.5까지 전부 완료 후에만 시작. 아래 CHECKLIST 전 항목 실행.

---

## CHECKLIST — AGENT-REVIEW 필수 실행

### 디자인 시스템 위배 검사
- [ ] Pretendard 외 폰트 없음 (SF Pro 잔재·system-ui 단독 fallback 제거)
- [ ] 색상 하드코딩 없음 (HEX 직접 입력 금지, tokens 경유만. 캔버스 노트 5색도 tokens.canvasNote 경유)
- [ ] 그라데이션·글래스모피즘·다크 타일 없음 (DESIGN-v2 §8)
- [ ] box-shadow는 shadow.product를 스크린샷 프레임에만
- [ ] scale transform은 버튼 press(0.95)만
- [ ] 이모지 없음 (모든 .jsx, .js, .md)
- [ ] 상태색 4종이 버튼·링크·CTA에 쓰이지 않음
- [ ] 폰트 웨이트 500 없음

### 레이아웃 검사
- [ ] 320px 콘텐츠 잘림 없음, 가로 스크롤 전역 0
- [ ] 읽기 화면 max 1280(1441+에서 1440), 관제 화면 1680/2080 규칙 적용
- [ ] 1920·2560 폭에서 대시보드·캔버스가 여백 낭비 없이 열 증가로 확장
- [ ] 여백·타이포가 tokens 스케일 그대로

### 컴포넌트·패턴 검사
- [ ] COMPONENTS.md 이탈 없음, PATTERNS.md 임의 변형 없음
- [ ] hover / focus-visible 전부 구현, 터치 타깃 44px
- [ ] StatusPill에 텍스트 라벨 병기(색 단독 구분 없음)

### 사용자 흐름 검사
- [ ] IA.md 흐름 4종(온보딩·단계 진행·피드백 루프·막힘) 전부 동작
- [ ] 게이트 M2·M4 승인 전 다음 단계 잠금
- [ ] 배포 URL 제출 시 서버 접속 확인 후 완료 처리
- [ ] 코멘트 상태 전이 권한(참가자 acted, 운영자·조력자 resolved) 서버에서 강제

### 데이터·API 검사
- [ ] 응답 {items}/{item} 언랩 일치, 필드명 mock과 실 API 동일
- [ ] 업로드 완료 전 저장 없음, 실패 시 빈 값 저장 없음
- [ ] 폴링 갱신 시 레이아웃 시프트 0
- [ ] localStorage / sessionStorage / TypeScript 없음

### 할루시네이션 방지 검사
- [ ] 명세 문서에 없는 색·컴포넌트·페이지·필드 추가 없음
- [ ] 시드가 기존 데이터를 덮지 않음

---

## 임의 결정 금지 상황
- 명세 문서 간 충돌(충돌 시 DESIGN은 v2 우선, 그 외는 질문)
- 명세에 없는 컴포넌트·색·폰트·필드·분기가 필요해 보일 때
- API 응답이 명세와 다를 때

## 사양 해석 원칙
작업 사양이 발견 사항보다 좁을 때, 사양의 정신을 따른다. 같은 파일 + 같은 패턴의 추가 위반은 모두 처리하되, 다른 파일·다른 책임으로 확장은 금지.

## 컨텍스트 관리
85% 도달 시 즉시 중단 → PROGRESS.md 갱신(완료/진행중/다음/블로커) → 대기. 재시작 시 PROGRESS.md 먼저.

## 커밋 규칙
```
[P0] chore: 초기 세팅
[A1] feat: 기반 데이터 + 라우팅
[A2] feat: 페이지 흐름
[A3] feat: 재사용 컴포넌트
[C1] feat: 포스트잇 캔버스
[C2] feat: 핀 코멘트 리뷰
[B1] feat: 백엔드 API + 스키마
[W1] feat: 클라이언트-서버 연동
[AR] fix: REVIEW 수정사항 반영
```