# BACKEND.md — 서버·데이터베이스 명세

> 스택: Node.js + Express(JS만) / Neon Postgres / Vercel Blob(public) / Render 배포 + UptimeRobot 핑.
> 인증: httpOnly 쿠키. access 15분(공통). refresh는 역할 기준 — operator·assistant 30일, 그 외 1일.
>   지정 계정(seeded)은 최초 로그인 시 비밀번호 등록, 공개 사용자(self_registered)는 회원가입으로 생성. 자세히 §2.1.
> localStorage 금지. cross-origin: 프로덕션 sameSite none + secure + trust proxy. 개발 lax. CORS credentials true.

## 1. 테이블

```sql
-- 기수 (다지역 확장 축)
cohorts(id, name, region_label, starts_on, ends_on, brand_config jsonb, created_at)

-- 사용자 (두 축: role=권한 등급, account_source=계정 출처. account_source는 권한을 부여하지 않는다)
users(id, cohort_id, email unique, name,
      role check(role in ('operator','assistant','participant')),                              -- 권한 등급
      account_source check(account_source in ('seeded','self_registered')) default 'seeded',   -- 계정 출처
      password_hash, must_set_pw boolean default true,
      -- 프로필 (별도 테이블 대신 users 컬럼 확장 — 명세가 "users 또는 별도 profile 테이블"로 위임. 단순성 택함)
      avatar_url, region, topics jsonb default '[]', bio, is_public boolean default false,
      -- 약관 동의 (self_registered는 가입 시 필수 기록. seeded는 null 허용 — 동의 흐름 이전 계정)
      agreed_terms_at, agreed_privacy_at,
      created_at)

-- 여정 단계 정의 (M0~M9, cohort별 문구 오버라이드 가능)
journey_steps(id, code, title, blocks jsonb, is_gate boolean, sort)

-- 참가자별 단계 상태
user_progress(id, user_id, step_id,
  status check(status in ('locked','todo','progress','review','done')) default 'locked',
  status_changed_at, updated_at, unique(user_id, step_id))

-- 산출물 통합
artifacts(id, user_id, step_id,
  kind check(kind in ('note','persona','concept','screen','upload','link','text')),
  body jsonb, file_url, submitted_url, url_ok boolean, created_at, updated_at)

-- 포스트잇 캔버스
canvas_notes(id, user_id, text, color, x numeric, y numeric, group_id, updated_at)
canvas_groups(id, user_id, label, created_at)

-- 핀 코멘트 (좌표는 % 저장)
comments(id, artifact_id, author_id, pin_x numeric, pin_y numeric, body,
  status check(status in ('open','acted','resolved')) default 'open',
  parent_id, created_at)

-- 운영 콘텐츠 (CMS)
method_cards(id, slug unique, name, step_code, minutes, what, when_use, how jsonb,
  caution, template_url, related jsonb, published, sort, seed_key unique)
prompt_catalog(id, name, step_code, when_line, body, tip, published, sort, seed_key unique)
glossary(id, term unique, plain, analogy, published)
issue_cards(id, cohort_id, title, summary, body, sort, published)  -- 지역 현안 카드
posts(id, title, body, category check(category in ('notice','recruit','news')), published boolean default false, created_at)  -- 소식(/news). notice 공지·recruit 모집·news 소식

-- 도입 문의 (B2G·B2B, /partners 폼 → 저장)
contact_inquiries(id, org_name, contact_name, email, phone,
  inquiry_type check(inquiry_type in ('adopt','tour','collab','etc')),  -- 도입 상담·견학/참관·협력 제안·기타
  message, agreed_at,                                                    -- 개인정보 수집 동의 시각(필수)
  status check(status in ('new','in_progress','done')) default 'new',   -- 처리 상태
  created_at)

-- 소통·연구 데이터
questions(id, user_id, step_code, title, body, answered boolean, created_at)
answers(id, question_id, author_id, body, created_at)
stuck_logs(id, user_id, step_code, kind check(kind in ('error3','manual')), note, created_at)
activity_log(id, user_id, verb, target, created_at)  -- 대시보드 피드·연구용

-- 분석 파이프라인 (웨이브5). server/migrations/003-analytics.sql — schema.sql 무수정, 별도 마이그레이션.
events(id bigserial, user_id, type, step_code, meta jsonb, created_at)  -- append-only 원장. user_id=subject(참가자). operator freepass는 미발신(오염 0). 소급 불가 → 파일럿 전 적재 시작. type: step.start/review/done/reject·artifact.create·url.ok·stuck
daily_rollups(day date, metric, value, updated_at, PRIMARY KEY(day,metric))  -- lazy 일자 집계 캐시. metric: active/start/complete/review/reject/stuck/artifact. 어제 이하만 캐시, 오늘은 라이브

-- 편집 가능 콘텐츠 (W4-L). 페이지별 노출 텍스트/본문 블록. operator 인라인 편집.
editable_content(page_slug, block_key, kind check(kind in ('text','rich')), content, updated_by, updated_at, PRIMARY KEY(page_slug, block_key))
  -- kind: text(플레인)|rich(Tiptap HTML). 디폴트는 seed(BRAND-COPY·페이지 카피). 재시드 ON CONFLICT DO NOTHING(operator 저장값 보존)

-- 팀 협업 + 인앱 알림 (W4-T). 스키마 파일은 server/migrations/001-team.sql (schema.sql 무변경).
-- migrate.js가 schema.sql 실행 후 migrations/*.sql을 파일명 순으로 추가 실행(각 파일 IF NOT EXISTS 원칙, DROP 금지).
teams(id, name, cohort_id ref cohorts, created_by ref users, invite_code unique, created_at)
team_members(id, team_id ref, user_id ref, role check(planner|designer|developer|lead — 영문 키 저장, 표시만 한글 기획|디자인|개발|리드),
  unique(team_id, user_id), created_at)
  -- "한 사람 한 기수 한 팀"은 서버 검증으로 강제: 생성·가입 시 같은 cohort(null 포함)의 다른 팀 소속이면 409
team_artifacts(id, team_id, author_id, kind, body jsonb, file_url, created_at, updated_at)
team_comments(id, team_id, artifact_id nullable ref team_artifacts, author_id, body,
  mentions jsonb default '[]', parent_id, created_at)  -- artifact_id null = 팀 작업방 스레드
team_canvas_groups(id, team_id, user_id, label, created_at, updated_at)  -- 개인 canvas_groups 미러 + team_id (+updated_at: 이름 변경 폴링 전파용 최소 확장)
team_canvas_notes(id, team_id, user_id, text, color, x numeric, y numeric, group_id, updated_at)  -- 개인 canvas_notes 미러 + team_id. 기존 canvas 테이블 무변경
notifications(id, user_id ref, type, target text, actor_id nullable, read boolean default false, created_at)
  -- 인앱 전용(브라우저 푸시·이메일 없음). 발신은 server/notify.js 헬퍼 — 실패해도 본 요청 안 막음(logActivity 패턴)

-- AI Studio 선택 단계 + 전역 설정 (migrations/004-ai-studio.sql). schema.sql 무수정.
journey_steps.optional boolean not null default false  -- MA1 등 선택(비필수) 단계 표시. 완료·게이트·unlockNext(sort 체인) 무참조
app_settings(key text PRIMARY KEY, value jsonb not null default '{}', updated_at)  -- 전역 설정 단일행. key: 'ai_studio'(AI Studio 선택 단계 노출)·'onboarding'(온보딩 노출). 기본 {"enabled":false}

-- 대회(성과 발표·심사) (migrations/005-contest.sql). 계약 원본 CONTEST-API.md. events/daily_rollups 미발신, users.role 무변경. 심사위원=contest_judges 배정.
contests(id, cohort_id ref cohorts, title, description, status check(draft|submission|judging|tallying|published|closed) default draft, starts_on, ends_on, final_method check(raw|normalized) default raw, min_judges int default 2, published_at, created_by ref users, created_at, updated_at)
contest_criteria(id, contest_id ref, label, description, weight numeric default 1, max_score int default 5, sort, created_at)  -- 대회 생성 시 기본 4종 시드
contest_entries(id, contest_id ref, user_id ref, team_id ref teams, service_name, deployed_url, summary, extra jsonb default '[]', auto_source jsonb default '[]', status check(active|withdrawn) default active, created_at, updated_at, unique(contest_id,user_id))  -- 완주 산출물서 자동 생성. extra=[{title,file_url}]
contest_judges(id, contest_id ref, user_id ref, invited_at, accepted_at, created_at, unique(contest_id,user_id))  -- 심사위원 자격의 유일한 원천(영구 role 없음)
contest_reviews(id, contest_id ref, entry_id ref contest_entries, judge_id ref users, feedback, status check(draft|submitted) default draft, submitted_at, created_at, updated_at, unique(entry_id,judge_id))
contest_scores(id, review_id ref contest_reviews, criterion_id ref contest_criteria, score numeric, unique(review_id,criterion_id))
contest_recusals(id, contest_id ref, entry_id ref, judge_id ref users, reason, auto boolean default false, created_at, unique(entry_id,judge_id))  -- auto=자기 출품작 자동 제척

-- 소유자 인사이트 인덱스 (migrations/006-insight.sql). 테이블 신설 없음, events 복합 인덱스만.
-- events(user_id, step_code, created_at) 복합 인덱스로 참가자별 step.start 이후 종료 이벤트 LATERAL 조회 보강.

-- 구글 온보딩 (migrations/008-onboarding.sql). app_settings 'onboarding' 토글 재사용 + seen 기록. 콘텐츠는 server/data/onboarding-content.js 정적 모듈(DB 시드 안 함).
onboarding_seen(id bigserial, user_id ref users on delete cascade, module_key text, created_at, unique(user_id, module_key))  -- 본 것 체크(자기 확인용, 강제 아님). localStorage 금지 → 서버 저장
-- (007 없음: 004→005→006→008로 번호 건너뜀)
```

마이그레이션 개요: schema.sql은 무수정 유지. 추가 스키마는 전부 server/migrations/*.sql로만(파일명 순 실행, 각 파일 IF NOT EXISTS·DROP 금지). 001-team·002-substep-blocks·003-analytics·004-ai-studio·005-contest·006-insight·008-onboarding (007 없음).

시드 원칙: 비파괴. TRUNCATE·DELETE 금지, seed_key + ON CONFLICT DO NOTHING, 재시드가 사용자 입력을 덮지 않음.
마이그레이션: DROP 금지, ALTER TABLE ADD COLUMN IF NOT EXISTS. account_source default 'seeded'로 기존 행 backfill(전부 지정 계정).

지정 관리자 계정 시드(비파괴). 전부 role=operator, account_source=seeded, must_set_pw=true(최초 로그인 시 비밀번호 등록),
refresh 30일(화이트리스트 소속), cohort_id null(플랫폼 운영자). 같은 사람의 여러 이메일은 각각 독립 계정, name 동일.
- 계정 목록(조영은 2·김성우 1·주현호 3)은 환경변수 `SEED_OPERATORS`(`name|email` 쉼표 구분)로 주입. 실제 주소는 gitignore된 .env에만, 커밋 소스·문서에는 넣지 않음(공개 저장소 개인정보 노출 방지).
- seed_key는 이메일 기반(예: `op-<email>`)으로 안정. ON CONFLICT DO NOTHING.

데모 계정 이력 이관(사용자 지시, 비파괴): 데모 계정(지정 6 이메일 밖)이 남긴 comments.author_id와
검토 승인·반려 기록(activity_log verb `review.approve`·`review.reject`의 user_id)을 주현호 계정(env `REVIEW_REASSIGN_EMAIL`이 가리키는 계정)으로 재배정.
행은 삭제하지 않고 소유자만 UPDATE(이력 보존). 이관 대상은 데모 계정 소유 행만 → 재실행·실사용자 데이터에 무해(멱등).

갤러리 데모 유지: 시드 갤러리 표본 소유자(완주 참가자)는 is_public=true로 시드. 그 외 시드 사용자 is_public 기본 false.

## 2. API (응답 형태: 목록 {items:[]}, 단수 {item:{}} 통일. 클라이언트 언랩 필수)

```
POST /api/auth/login            이메일+비밀번호. must_set_pw면 이 요청이 곧 등록(seeded 지정 계정)
POST /api/auth/register         공개 가입(self_registered). 이메일+비밀번호+이름+약관 동의 2종. §2.1
POST /api/auth/refresh, /logout
GET  /api/me                    (프로필 필드 + is_owner(OWNER_EMAILS 소속)·onboarding_enabled(app_settings 'onboarding' 또는 operator) 계산 필드 포함)
GET  /api/me/profile            본인 프로필 조회
PATCH /api/me/profile           avatar_url·region·topics·bio·is_public 수정 (아바타는 POST /api/upload 후 URL 저장)
PATCH /api/me/password          현재 비밀번호 확인 + 새 비밀번호(최소 8자). 현재 불일치 401, 미설정 400

GET  /api/journey               내 단계 목록+상태
GET  /api/journey/:code         단계 상세(blocks)+내 산출물
POST /api/journey/:code/start      진입 전이(todo→progress)
POST /api/journey/:code/complete   완료 조건 자동 판정 후 상태 전이
POST /api/journey/:code/review     검토 요청(status→review)

GET/POST/PATCH/DELETE /api/canvas/notes, /api/canvas/groups
GET/POST /api/artifacts         (파일은 POST /api/upload → Blob URL 반환 후 저장. 업로드 완료 전 저장 금지)
GET  /api/artifacts/:id         단건 조회 — 소유자 또는 조력자 이상(핀 코멘트 읽기와 동일 규칙)
POST /api/artifacts/:id/link    배포 URL 제출 → 서버가 fetch로 접속 확인 → url_ok 기록

GET  /api/prompts?step=&q=      GET /api/methods?step=&sort=  GET /api/methods/:slug
GET  /api/glossary?q=           GET /api/issues (cohort 현안 카드)
GET  /api/gallery               공개(비로그인). 완주 결과물 — 소유자 프로필 is_public=true인 것만 (§2.1)
GET  /api/steps                 공개(비로그인). 여정 단계 소개(journey_steps 목록 — /program·/civichacking 소개용)
GET  /api/content/:page         공개(비로그인). 페이지 편집 가능 블록 {items:[{block_key,kind,content}]} (W4-L)
GET  /api/posts?category=       공개(비로그인). 게시(published)된 소식 목록/상세 (/news). category 필터
POST /api/inquiries             공개(비로그인). 도입 문의 저장(/partners 폼). 동의 필수. §2.2

GET/POST /api/comments?artifact=   PATCH /api/comments/:id (status 전이: open→acted 참가자, acted→resolved 운영자·조력자)
GET/POST /api/questions, POST /api/questions/:id/answers
  (GET /api/questions는 answers 배열 embed. comments·questions·answers 응답에 author_name 포함 — 표시용)
POST /api/stuck                 (에러 3회 버튼·수동 기록)

-- 팀 협업 (W4-T. 전부 로그인 필요)
GET  /api/team                  내 팀 + 멤버 목록(members에 role·avatar_url). 팀 없으면 {item:null}
POST /api/team                  팀 생성 {name} → invite_code 자동 생성, 생성자는 lead로 가입. 같은 기수 팀 기소속 409
POST /api/team/join             초대 코드 참여 {invite_code, role}. 코드 없음 404, 기소속 409. 기존 멤버에게 알림(team.join)
GET  /api/team/progress         팀 진행 현황 — 멤버별 여정 단계 서버 집계 {item:{steps, members[{steps:{M0..}}], updated_at}}
GET/POST /api/team/artifacts    팀 산출물 (텍스트+파일 file_url — 기존 POST /api/upload 재사용). 등록 시 팀원 알림(team.artifact)
GET/POST /api/team/comments?artifact=   팀 코멘트. artifact 없으면 작업방 스레드. mentions=[user_id] → 멘션 알림(team.mention), 그 외 팀원 team.comment
GET/POST/PATCH/DELETE /api/team/canvas/notes, /api/team/canvas/groups   공동 캔버스(개인 canvas 미러, 팀 스코프 — 팀원 전원 편집 가능)

-- 인앱 알림 (W4-T)
GET  /api/notifications         내 것, 최신순 50 {items(actor_name 포함), unread, updated_at("최신생성#미읽음수")}
POST /api/notifications/read    {ids:[...]} 읽음 처리 (내 것만)
POST /api/notifications/read-all
  발생 지점: 팀 참여·팀 산출물·팀 코멘트·멘션(team.js) / 내 산출물 코멘트(comments.js→소유자, 자기 제외) /
  팀원 단계 완료(journey.js complete + admin.js approve → 같은 팀 멤버) / 검토 완료(admin.js reviews→해당 참가자)

-- 운영자
GET  /api/admin/overview        위젯 카운트 + 매트릭스 (참가자 x 단계 상태 일괄)
GET  /api/admin/reviews         검토 큐
POST /api/admin/reviews/:id     approve|reject + 코멘트 (게이트 M2·M4 승인 시 다음 단계 unlock)
GET  /api/admin/activity        최근 활동
-- 분석 API (웨이브5, 조력자 이상). 참가자 한정 집계 = role='participant' JOIN(operator 배제, self_registered 포함)
GET  /api/admin/analytics/funnel?cohort=              단계별 도달/완료(이탈 지점) — user_progress 스냅샷
GET  /api/admin/analytics/timeseries?from=&to=&cohort= 일자별 추이(캘린더 범위). cohort 없으면 daily_rollups(과거)+라이브(오늘), 있으면 events 라이브
GET  /api/admin/analytics/engagement?cohort=          최근7일 활성·완료·완주율·막힘 상위5
CRUD /api/admin/cms/*           method_cards, prompt_catalog, glossary, issue_cards, posts
POST /api/admin/cms/:table/reorder   순서 재정렬 {order:[id,...]}→sort. sort 있는 테이블만(method_cards·prompt_catalog·issue_cards) (운영자, W4-L)
PUT  /api/admin/content/:page/:key   편집 가능 블록 upsert {kind,content} (운영자 단독, W4-L)
PATCH /api/admin/journey-steps/:id   여정 단계 문구 편집 — title·blocks 문구만(CMS.md §1). 행 생성·삭제 금지,
                                     blocks 6키 구조·순서 잠금, prompts 원본 유지(수신값 무시),
                                     done은 문자열 배열(항목 수 원본 고정 — 배열 순서가 곧 순서, 별도 sort 없음) (운영자 단독, W4-L)
CRUD /api/admin/cohort, /api/admin/users (운영자 전용, 이메일만 등록)
GET  /api/report/:userId               리포트 데이터 번들 (본인 또는 운영자)
GET  /api/report/certificate/:userId   수료증 데이터 (본인 또는 운영자. M9 완료 시에만 발급 자격) §2.2
GET  /api/admin/cohort-report          기수 리포트 집계 (운영자) §2.2
GET  /api/admin/org-report             [W-EVIDENCE] 기관 제출용 성과 리포트 (운영자). params: program_type(필수)·cohort_id·from·to. insight/admin 집계 재조합(새 지표 없음). 개요·이수현황(B3 이원화)·산출물(url_ok)·전후수치(L1/L12·W1/W9). 이름 마스킹 기본 켬(mask=false 해제), 이메일 미포함
GET  /api/admin/org-report/tracks      [W-EVIDENCE] 선택 UI용 과정 목록(program_tracks.name 권위 원천)
GET/PATCH /api/admin/inquiries         도입 문의 목록·처리 상태 전이(new→in_progress→done) (운영자) §2.2

-- 구글 온보딩 [ONBOARD]. 콘텐츠는 server/data/onboarding-content.js 정적 모듈. /api 루트 마운트(admin.js 앞).
GET  /api/onboarding            로그인. 모듈 목록(요약)+enabled+내 seen. 참가자+토글 off면 {enabled:false, items:[], seen:[]}. operator는 토글 무관 전체
GET  /api/onboarding/:moduleId  로그인. 모듈 상세. 참가자+토글 off면 404
POST /api/onboarding/seen       로그인. {module_key} 본 것 표시(자기 확인용, 강제 아님). 참가자+토글 off면 404
DELETE /api/onboarding/seen     로그인. {module_key} 본 것 표시 해제
GET/PATCH /api/admin/settings/onboarding  온보딩 노출 전역 토글 {enabled} (운영자 단독, app_settings 'onboarding')

-- 소유자 인사이트 [WAVE-NEXT]. server/routes/insight.js, /api/insight 마운트. OWNER_EMAILS(env) 소속만, 아니면 조용히 404(403 아님).
--   전 라우트 참가자 한정 집계(role='participant', operator/assistant 행위 배제). 자기보고(막힘 버튼) 배제, events 원장 읽기 전용.
GET  /api/insight/summary       소유자. 요약 지표
GET  /api/insight/dropoff       소유자. 단계별 이탈 지점
GET  /api/insight/stay          소유자. 단계별 체류 시간(step.start 이후 종료 이벤트 LATERAL)
GET  /api/insight/gates         소유자. 게이트(M2·M4) 통과·대기

-- 대회(성과 발표·심사) [CONTEST]. 계약 원본·응답 스키마는 CONTEST-API.md(단일 원천). contest.js, /api 마운트(admin.js 앞 — /admin/contests 선점).
--   /api/admin/contests·/api/admin/criteria·/api/admin/contests/:id/{status,publish,criteria,generate-entries,entries,judges,progress,tally} (운영자)
--   /api/judge/contests·/api/judge/contests/:id/entries[/:eid][/review|/submit|/recuse] (배정 심사위원, 미배정 대회 403)
--   /api/contests/mine·/api/contests/:id/{my-entry,my-result} (참가자 본인) · /api/public/contests[/:id/results] (공개, published/closed만)
GET  /health
```

## 2.2 도입 문의·수료증·기수 리포트 (공개 사이트 확장. 구현은 웨이브3)

- **도입 문의 (contact_inquiries)**: POST /api/inquiries — 공개(비로그인). 필드 org_name·contact_name·email·phone·inquiry_type(adopt|tour|collab|etc)·message·개인정보 동의. 동의 미체크·필수 누락 400. 저장 시 status='new', agreed_at=now. 운영자: GET /api/admin/inquiries(목록, status 필터), PATCH /api/admin/inquiries/:id(status 전이 new→in_progress→done). 스팸 방지는 후속(honeypot/rate-limit 예약).
- **수료증 (certificate)**: GET /api/report/certificate/:userId — 본인 또는 운영자. **자격: 해당 사용자의 M9 완료(user_progress M9=done)일 때만 발급**. 미완주면 403/409로 자격 없음 반환. 응답 {item:{user_name, cohort, issued_on, completed_steps, deployed_url}} (표시용 데이터; 실제 PDF/이미지는 클라이언트 렌더 또는 후속).
- **기수 리포트 (cohort-report)**: GET /api/admin/cohort-report?cohort= — 운영자. 집계: 참여율(등록 대비 활동), 완주율(M9 done 비율), 단계 분포(각 단계 상태 카운트), 결과물 목록(배포 URL 포함), 막힘 통계(stuck_logs 집계). 응답 {item:{counts, stage_distribution, artifacts[], stuck_summary}}. BRAND-COPY §3.2 "자동 성과 리포트" 근거.

## 2.1 인증·세션·가입 정책 (인증 구조 확장)

- **두 축**: `role`(operator|assistant|participant)=권한 등급, `account_source`(seeded|self_registered)=계정 출처.
  account_source는 권한을 부여하지 않는다 — 세션 길이와 가입 경로만 가른다. 권한은 §4 매트릭스가 role로만 판정.
- **지정 계정(seeded)**: 회원가입 없이 시드로 존재. 최초 로그인(must_set_pw=true) 시 그 요청의 비밀번호를 등록(기존 방식 유지).
- **공개 사용자(self_registered)**: POST /api/auth/register로 생성. role=participant, account_source=self_registered,
  must_set_pw=false, password_hash 즉시 저장, agreed_terms_at·agreed_privacy_at=now, is_public=false, cohort_id=null.
  **가입 즉시 여정 시작(사용자 결정)**: 가입 트랜잭션에서 user_progress를 M0 todo·나머지 locked로 초기화(IA.md 흐름 1과 동일 초기화).
- **세션(지정 이메일 화이트리스트 기준, 사용자 결정)**: access 15분(공통). refresh는 **지정 관리자 이메일 6개에 속하면 30일, 그 외 전부 1일**
  (데모용 지정 참가자 계정 — 박철수 등 — 도 1일. 전시용일 뿐 실사용자 아님). role·account_source가 아니라 이메일 소속으로만 분기.
  화이트리스트는 서버 환경변수 `SEED_OPERATORS`(name|email 쌍)에서 파생한 이메일 집합. 실제 이메일 주소는 gitignore된 .env에만 두고 커밋 소스에 넣지 않는다(개인정보 노출 방지).
  로그인·가입·refresh 응답에서 이메일로 만료 결정(JWT exp + 쿠키 maxAge 일치).
- **회원가입 검증**: 이메일 형식 + 중복(users.email unique 위반 시 409) / 비밀번호 규칙(최소 8자 — 기본값) /
  이름 필수 / 약관 2종(이용약관·개인정보처리방침) 동의 필수. 하나라도 누락·미동의 시 400, 이메일 중복 409.
- **약관 동의 기록**: register가 agreed_terms_at·agreed_privacy_at를 now로 기록. seeded 계정은 이 필드 null 허용(동의 흐름 이전 계정 — 최초 로그인 흐름 불변).
- **프로필**: GET /api/me/profile(본인 조회), PATCH /api/me/profile(avatar_url·region·topics·bio·is_public). 본인만.
  아바타는 POST /api/upload(기존 재사용, 이미지 WebP 변환·Blob public)로 URL 확보 후 PATCH avatar_url로 저장(업로드 완료 전 저장 금지).
- **공개 노출**: is_public=true 프로필만 갤러리·공개 뷰 노출. GET /api/gallery는 소유자 users.is_public=true인 결과물만 반환.
  is_public 기본 false(privacy-by-default, 최소 수집·opt-in 원칙 — /privacy 초안과 일치).

## 3. 실시간(폴링) 규약
- /admin/overview 15초, 열린 CommentThread 10초, /journey 포커스 복귀 시 재요청.
- 응답에 updated_at 최대값 포함 → 클라이언트는 변화 없으면 리렌더 생략(깜빡임 0).
- W4-T: 알림 15초, 팀 진행 현황·팀 산출물 15초, 팀 코멘트 10초, 공동 캔버스 12초 — 전부 같은 updated_at 비교 규약.

## 4. 권한 매트릭스
- participant: 자기 자원만 쓰기. 공개 콘텐츠 읽기. (self_registered·seeded 동일 권한 — account_source는 권한과 무관)
- assistant: 전 참가자 읽기 + comments 쓰기 + acted→resolved.
- operator: 전부. CMS·cohort·users는 operator 단독.
- 프로필: 본인 프로필만 수정(GET/PATCH /api/me/profile). 타인 프로필 공개 노출은 is_public 게이트(갤러리·공개 뷰).
- 서버에서 검증(미들웨어). 프론트 숨김은 보조일 뿐. 세션 길이만 account_source가 아닌 role로 분기(§2.1).

## 5. 환경변수
server: DATABASE_URL, JWT_SECRET, BLOB_READ_WRITE_TOKEN, CLIENT_ORIGIN(끝 슬래시 없이)
client: VITE_API_URL. .env는 gitignore.

## 6. 알려진 장애 대응 (DAH 검증 지식 이식)
- Render 슬립 → /health + UptimeRobot 5분. 프론트 3초 무응답 시 "깨우는 중" 표시.
- 401 루프 → 쿠키 sameSite·secure·trust proxy 점검.
- 업로드 500 → Blob public 스토어 여부.
- 상세 빈 화면 → {item} 언랩 누락.