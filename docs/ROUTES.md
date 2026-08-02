# ROUTES.md — React Router v6 라우팅

> IA.md와 1:1. 라우트 추가·삭제는 IA.md 수정 후에만.

```jsx
// client/src/App.jsx 기준
<Routes>
  {/* 공개 */}
  <Route path="/" element={<Home />} />
  {/* [W-PUB] 3트랙 + 공통 기초. /tracks/:key = civic·local·automation·basics (TrackPage 내부 폴백) */}
  <Route path="/tracks/:key" element={<TrackPage />} />
  {/* [W-BIZPUB] 대상별 안내 — 마케팅 패키징 층(기존 트랙 조합 추천, DB 트랙 아님). key: youth·general·worker·public-servant·senior·merchant. 없는 key는 /program 폴백 */}
  <Route path="/audiences/:key" element={<AudiencePage />} />
  {/* 구 링크 보존 — 시빅해킹은 트랙 A. /civichacking → /tracks/civic */}
  <Route path="/civichacking" element={<Navigate to="/tracks/civic" replace />} />
  {/* 선행 사례 [W-PUB] — 넘버나인(운영진 실적) */}
  {/* [W-EVIDENCE] 사례 아카이브 데이터 주도. /cases 목록 + /cases/:slug 템플릿(CaseStudy). 기존 /cases/numer9 URL은 slug=numer9로 유지(Numer9.jsx 삭제) */}
  <Route path="/cases" element={<CasesList />} />
  <Route path="/cases/:slug" element={<CaseStudy />} />
  {/* [W-EVIDENCE] 재현 방법론 공개 페이지 */}
  <Route path="/method" element={<Method />} />
  {/* [W-USECASE] 활용 사례집 — 공개(비로그인). 순수 클라 정적(content/static/usecases.js), API·마이그레이션 없음. 배움 그룹 링크 */}
  <Route path="/usecases" element={<UseCases />} />
  {/* /program 유지 — 성격은 트랙 A 커리큘럼으로 좁힘 */}
  <Route path="/program" element={<Program />} />
  <Route path="/partners" element={<Partners />} />
  <Route path="/impact" element={<Impact />} />
  <Route path="/news" element={<News />} />
  {/* [W-IDENTITY] 기관소개 하위 3경로. 연혁·찾아오시는 길은 콘텐츠 확보 전 미신설(IA.md 예약) */}
  <Route path="/about/purpose" element={<Purpose />} />
  <Route path="/about/ci" element={<Ci />} />
  <Route path="/about/team" element={<Team />} />
  {/* [W-ABOUT] /about = 브랜드 소개(AXION). 구 /program 리다이렉트 제거 */}
  <Route path="/about" element={<About />} />
  <Route path="/gallery" element={<Gallery />} />
  {/* 기관 도입 안내 [ONBOARD] — 공개(가격 없음, 문의는 /partners 연결) */}
  <Route path="/pricing" element={<AdoptionGuide />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
  {/* 대회 공개 결과 [CONTEST] — 비로그인 접근(published/closed만) */}
  <Route path="/contests/:id/results" element={<PublicResults />} />

  {/* 참가자 (RequireAuth 래퍼) */}
  <Route element={<RequireAuth role="participant" />}>
    <Route path="/journey" element={<JourneyOverview />} />    {/* 여정 개요(pages/journey/JourneyOverview). 미시작자는 M0 자동 안내 */}
    <Route path="/journey/:stepId" element={<StepDetail />} /> {/* 3열 레이아웃 */}
    <Route path="/canvas" element={<Canvas />} />              {/* 현재 단계로 리다이렉트(캔버스 단계 내부화 W3-B) */}
    <Route path="/prompts" element={<PromptCatalog />} />
    {/* 배움터: 방법론 + 용어 통합(W3-C). 구 링크는 리다이렉트로 보존 */}
    <Route path="/library" element={<Library />} />                {/* ?cat=methods(기본)|terms */}
    <Route path="/methods" element={<Navigate to="/library" replace />} />
    <Route path="/methods/:slug" element={<MethodDetail />} />     {/* 방법론 개별 페이지 유지 */}
    <Route path="/glossary" element={<Navigate to="/library?cat=terms" replace />} />
    <Route path="/workspace" element={<Workspace />} />
    <Route path="/workspace/review/:artifactId" element={<ArtifactReview />} />
    <Route path="/questions" element={<Questions />} />
    <Route path="/report" element={<MyReport />} />
    <Route path="/report/certificate" element={<Certificate />} />  {/* 수료증 인쇄 화면(A4). 자격 서버 판정 W3-H */}
    <Route path="/profile" element={<Profile />} />
    <Route path="/team" element={<TeamRoom />} />                   {/* 팀 작업방(W4-T). 헤더 참가자 메뉴 "팀"으로 진입(내 여정 다음). 참여 역할은 리드 제외 3종 */}
    {/* 참가자 카드 + 구글 온보딩 [ONBOARD]. 온보딩은 전역 토글 on(또는 operator)일 때만 헤더 노출, 서버 게이팅 */}
    <Route path="/pass" element={<ParticipantCard />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/onboarding/:moduleId" element={<OnboardingModule />} />
    {/* 대회 [CONTEST] — 참가자 본인 출품작 + 심사위원(배정 확인은 서버 requireJudge). RequireAuth participant 하위 */}
    <Route path="/contests" element={<MyContests />} />
    <Route path="/contests/:id/entry" element={<MyEntry />} />
    <Route path="/judge" element={<JudgeHome />} />
    <Route path="/judge/contests/:id" element={<JudgeContest />} />
    <Route path="/judge/contests/:id/entries/:eid" element={<JudgeReview />} />
  </Route>

  {/* 운영자·조력자 (RequireAuth role="assistant" 이상). W3-D: 전 관제 화면이 AdminLayout(좌 사이드바 + Outlet) 하위 */}
  <Route element={<RequireAuth role="assistant" />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/participants" element={<AdminParticipants />} />
      <Route path="/admin/participants/:id" element={<ParticipantDetail />} />
      <Route path="/admin/steps" element={<AdminSteps />} />
      <Route path="/admin/reviews" element={<ReviewQueue />} />
      <Route path="/admin/activity" element={<AdminActivity />} />
      <Route element={<RequireAuth role="operator" />}>
        <Route path="/admin/inquiries" element={<Inquiries />} />
        <Route path="/admin/cohort-report" element={<CohortReport />} />  {/* 기수 성과 리포트(인쇄 최적화) W3-H */}
        <Route path="/admin/cms" element={<Cms />} />
        <Route path="/admin/cohort" element={<CohortSettings />} />
        <Route path="/admin/users" element={<Users />} />
        {/* 대회 관리 [CONTEST] — 운영자 전용. pages/admin/contest/* */}
        <Route path="/admin/contests" element={<ContestList />} />
        <Route path="/admin/contests/new" element={<ContestCreate />} />
        <Route path="/admin/contests/:id" element={<ContestManage />} />
        {/* 소유자 인사이트 [WAVE-NEXT] — 서버가 소유자 아니면 404(화면 자체가 NotFound로 숨음) */}
        <Route path="/admin/insight" element={<OwnerInsight />} />
      </Route>
    </Route>
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
```

규칙
- 로그인·회원가입은 라우트가 아니라 모달(헤더 버튼 또는 RequireAuth 차단 시 오픈). 로그인/회원가입 두 탭.
- /privacy·/terms·/tracks/:key·/cases/numer9·/program·/partners·/impact·/news는 공개(비로그인 접근). /profile은 RequireAuth role="participant".
- [W-PUB] /civichacking → /tracks/civic 리다이렉트(구 링크 보존). CivicHacking.jsx 파일은 보존(라우트만 이전).
- [W-ABOUT] /about = 브랜드 소개 실페이지(AXION). 기존 /program 리다이렉트 제거. 공개(비로그인).
- [W-PT 게이트 C] 신규 라우트 없음(클라 전용). 트랙 선택은 /journey 내부 상태(needs_enrollment), 트랙 전환은 /journey 상단 세그먼트, 수료증 트랙 선택은 /report/certificate 내부. 헤더 메뉴 불변.
- [W-PUB] /tracks/:key 는 civic·local·automation·basics 4키. 미상 키는 TrackPage 내부에서 /tracks/civic로 폴백.
- /methods·/glossary → /library 리다이렉트(배움터 통합, W3-C). /library는 카테고리(방법론|용어)를 ?cat= 쿼리로 받되 기본 방법론. /methods/:slug(방법론 개별)와 /prompts(프롬프트 카탈로그)는 독립 유지.
- /pricing(기관 도입 안내)·/contests/:id/results(대회 공개 결과)는 공개(비로그인). [ONBOARD]·[CONTEST]
- 대회·심사·온보딩·내 카드 라우트는 RequireAuth role="participant" 하위. 심사(/judge*)는 서버 requireJudge 배정 확인(미배정 403), 온보딩은 서버 app_settings 토글 게이팅(참가자+off면 404). 관제 대회 관리(/admin/contests*)·인사이트(/admin/insight)는 operator 하위, 인사이트는 서버 OWNER_EMAILS 재검증(소유자 아니면 404).
- 인증 실패 401 시 모달 오픈 + 원래 경로 기억 후 복귀.
- 페이지 전환 크로스페이드 150~200ms(motion 토큰). 슬라이드업 금지.