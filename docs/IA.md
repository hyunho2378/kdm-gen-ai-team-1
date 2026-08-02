# IA.md — 정보 구조

> 강의 기획서 6장(플랫폼 기능 명세)과 1:1 대응. 지역명 하드코딩 금지, 모든 지역·현안은 cohort 설정 데이터.

## 1. 사용자 역할

두 축으로 구분(BACKEND.md §2.1). 권한 등급(role)과 계정 출처(account_source)는 별개다.

권한 등급(role):
- participant 참가자: 자기 작업방 쓰기, 공용 콘텐츠 읽기, 검토 요청, 질문
- assistant 조력자: 전 참가자 작업방 읽기, 코멘트 쓰기
- operator 운영자: 전부 + CMS + 기수 설정 + 사용자 관리

계정 출처(account_source):
- seeded 지정 계정: 운영자가 시드로 넣은 계정. 회원가입 없이 최초 로그인 시 비밀번호 등록. 관리자군(operator·assistant)은 여기 속함.
- self_registered 공개 가입: 시민이 회원가입으로 만든 계정. role=participant. 가입 즉시 여정 시작.
- 세션: operator·assistant 30일 / participant(출처 무관) 1일. 출처는 권한을 주지 않고 세션 길이·가입 경로만 가른다.

## 2. 페이지 목록

### 공개 (비로그인)
> [W-PUB] 단일 과정 → 3트랙 + 공통 기초로 확장. 트랙 A "시빅해킹"은 이제 플랫폼명이 아니라 트랙 이름. 카피 소스 BRAND-COPY.md.

| 화면 | 경로 | 내용 |
|---|---|---|
| 홈 | / | 히어로(아이소 그래픽) + 3트랙 카드(+공통 기초) + 넘버나인 성과 프리뷰 + 로고 벨트 + 이원 CTA + 푸터 |
| 트랙 소개 | /tracks/:key | civic(시빅해킹)·local(온라인 자립)·automation(업무 자동화)·basics(디지털 리터러시). 대상·산출물·과정 개요. civic만 리빙랩 4P (TrackPage 단일 컴포넌트). [W-TRACK-D] 서버 program_type은 automation이 아니라 work(클라 표시 키 automation과 불일치, 별도 통일 예정) |
| 대상별 안내 | /audiences/:key | [W-BIZPUB] 마케팅 패키징 층(DB 트랙 아님). youth·general·worker·public-servant·senior·merchant 6종이 기존 4트랙 조합을 추천. 교육 과정 드롭다운에서 진입 |
| 설립목적과 비전 | /about/purpose | [W-IDENTITY] 서사형. 비전·미션·설립 배경·Core Values 4개(About에서 이관) |
| CI | /about/ci | [W-IDENTITY] 정보형. 워드마크 표기 원칙·이름 의미(AX·ION)·태그라인·브랜드 색 견본·로고 슬롯 |
| 조직구성 | /about/team | [W-IDENTITY] Leadership 그리드. Founders 2 + AI 교육 강사진 5(content/team.js) |
| ~~연혁 / 찾아오시는 길~~ | (예약) | [W-IDENTITY] 콘텐츠 확보 전 미신설. 기관소개 표준 IA 예약 항목(GIDP 참조) |
| 사례 아카이브 | /cases · /cases/:slug | [W-EVIDENCE] 데이터 주도(content/cases.js). 목록 + CaseStudy 템플릿. Impact 선행 사례 축에서 링크(헤더 메뉴 아님) |
| 재현 방법론 | /method | [W-EVIDENCE] 공개 정보형. 제안서 부록·논문 대응물·진행자 교재 원천. Partners·도입 안내에서 링크 |
| 활용 사례 | /usecases | [W-USECASE] 공개. 목적별 AI 활용 사례집(8분류: write·research·visual·data·meeting·store·office·verify). 분류·대상·난이도 필터 + 검색, TermCard식 인라인 확장(새 페이지 없음). 순수 클라 정적(content/static/usecases.js, API 없음). 헤더는 배움 그룹(참가자 "활용 사례")에 편입. 하단 참고 자료 절(출처 표기). 콘텐츠 자체 작성(원자료 문장·분류 미사용) |
| 성과 리포트 | /admin/report/org-report | [W-EVIDENCE] 운영자 전용, 인쇄 A4 PDF. 헤더 노출 아님(관제 내부) |
| 선행 사례 | /cases/numer9 | 넘버나인 케이스(운영진 실적, 팀 성과 표기). 실측 수치 + 검증 링크 슬롯(손님 데이터 대시보드 링크·비밀번호 미포함) |
| ~~시빅해킹 소개(구)~~ | /civichacking | **deprecated → /tracks/civic 리다이렉트.** 구 링크 보존용(CivicHacking.jsx 파일 보존) |
| 프로그램 소개 | /program | 트랙 A 커리큘럼(M0~M9)·도구 체인·완주 산출물(수료증 포함)·운영 방식 (BRAND-COPY §2) |
| 도입 문의 | /partners | B2G·B2B 랜딩. 기관이 얻는 것·정책 정합성·도입 절차·문의 폼(→ contact_inquiries) (BRAND-COPY §3) |
| 성과 | /impact | 완주 갤러리(전체)·기수별 지표(파일럿 전엔 진행 중 표기)·연구/기록 아카이브 (BRAND-COPY §4) |
| 소식 | /news | posts(공지/모집/소식) 목록·상세. CMS 관리(CMS.md). 빈 상태 EmptyState |
| 소개 | /about | [W-ABOUT] 브랜드 소개(aXion). Naming·Philosophy·Brand Promise·산출물 3·기관소개 허브·운영 주체·CTA. Vision·Mission·Core Values·Brand Story는 /about/purpose 이관(W-IDENTITY). 기관·투자·협력 대상. 콘텐츠 원문 W-ABOUT §5 |
| 완주 갤러리 | /gallery | 공개 결과물 카드 그리드(서비스명, 화면, 배포 링크). is_public 프로필 소유 결과물만 노출 |
| 기관 도입 안내 | /pricing | pages/pricing/AdoptionGuide.jsx. 공개(가격 없음). 기관 도입 안내, 문의는 /partners 연결 [ONBOARD] |
| 대회 공개 결과 | /contests/:id/results | pages/contest/PublicResults.jsx. 공개(비로그인). 순위·배포 URL 목록(published/closed만, 그 전 404). 갤러리 연계 [CONTEST] |
| 개인정보처리방침 | /privacy | 읽기 전용 문서. 수집 항목·목적·보유 기간·이용자 권리(초안, 시행 전 전문가 검토 필요) |
| 이용약관 | /terms | 읽기 전용 문서. 서비스 이용 조건·책임·중지(초안, 시행 전 전문가 검토 필요) |
| 로그인·회원가입 | 모달 | 별도 페이지 없음. white 카드 모달, 로그인/회원가입 두 탭. 로그인 탭: 지정 계정 이메일 입력→최초 로그인 시 비밀번호 등록. 회원가입 탭: 시민 신규 가입(이메일·비밀번호·이름·약관 동의) |

### 참가자 (로그인)
| 화면 | 경로 | 내용 |
|---|---|---|
| 내 여정 | /journey | 현재 단계로 리다이렉트(3열 레이아웃은 단계 상세가 소유). 신규는 M0 자동 오픈. [W-PT C] 등록 0건(GET /api/journey needs_enrollment)이면 트랙 선택 화면(GET /api/tracks, 트랙 카드 등록). 다중 트랙 등록 시 여정 화면 상단 트랙 전환 세그먼트(헤더 메뉴 안 늘림). civic 단독은 기존과 픽셀 동일(전환 UI 미노출) |
| 단계 상세 | /journey/:stepId | **3열 레이아웃**. 좌: 전체 단계 사이드바(≤1068px 상단 가로 스텝 바). 중앙: 컨텍스트 패널(이전 산출물 릴레이) + 서브스텝 탭(blocks.done 기반, 탭별 체크→진행률) + 작업 도구(캔버스 임베드 M1~M3·자기 선별 별표·산출물 등록) + 막히면 + 상태 전이. 우: 예상 시간·관련 방법론·프롬프트 |
| 포스트잇 캔버스 | /canvas | **단계 내부로 이동**(W3-B). /canvas는 현재 단계로 리다이렉트. 캔버스는 M1~M3 단계 상세의 작업 도구로 임베드 |
| 프롬프트 카탈로그 | /prompts | Jotform식 좌측 트리 + 카드 그리드. 검색, 단계 필터 칩, 카드 클릭 시 전문 모달(제목·단계·언제·본문 전체·빈칸 하이라이트·복사·팁). 목록 카드만 미리보기 잘림 |
| 배움터 | /library | **방법론 + 용어 통합 라이브러리(W3-C)**. 상단 카테고리 토글[방법론\|용어] + 검색. 방법론: [여정 순/가나다 순] 토글 + 단계 칩(M0~M9) + 카드 그리드. 용어: 가나다 정렬, 카드 인라인 확장(용어·영문·전체 풀이·비유·관련 방법론, 잘림 없음). /methods·/glossary는 여기로 리다이렉트(?cat=terms) |
| 방법론 상세 | /methods/:slug | 상단 아이콘·사진 슬롯 → 이름·한 줄 정의·여정 단계 배지 → 무엇인가/언제/이렇게/주의/관련 프롬프트/관련 방법론/템플릿(잘림 없음) |
| 내 산출물 | /workspace | 단계별 산출물 아카이브. 업로드 파일, 링크, 피드백 스레드 |
| 시안 피드백 | /workspace/review/:artifactId | 이미지 위 핀 코멘트. 스레드, 상태(열림/수행/검토완료) |
| 질문 게시판 | /questions | 단계 태그 질문 목록 + 작성. 같은 에러 3회 호출 버튼 연결 |
| 팀 작업방 | /team | 팀 협업(W4-T). 팀 없으면 생성(이름→초대 코드 자동, 생성자 리드 자동 부여)/참여(코드+역할 기획·디자인·개발 3종 — 리드 선택 불가, 서버 400) 화면. 있으면 작업방: 멤버·역할 배지(pearl 캡슐), 팀 진행 현황(멤버별 여정 단계 서버 집계), 공동 캔버스(팀 스코프 포스트잇, 폴링 12초), 팀 산출물(텍스트+파일), 팀 코멘트 스레드(@멘션 자동완성). 진입은 헤더 참가자 메뉴 "팀"(내 여정 다음, W4-T 후속 확정) |
| 내 리포트 | /report | 전 단계 산출물 자동 편집 미리보기 + PDF/MD 다운로드. M9 완료 시 수료증 보기 버튼 노출 |
| 수료증 | /report/certificate | 인쇄 최적화 전용 화면(A4 비율). 플랫폼명·참가자명·기수명·완주 결과물 서비스명·URL·수료일·운영 주체. 브라우저 인쇄로 PDF 저장. 발급 자격 서버 판정(GET /api/report/certificate/:userId?track=, 본인·운영자). [W-PT C] 완주 판정은 서버 권위(enrollments status=completed, 코드 M9 판정 폐기). 완주 트랙 여럿이면 선택 UI, 하나면 바로 열림. 단일 civic은 트랙 라벨 미노출로 기존과 동일. W3-H |
| 프로필 | /profile | 본인 정보 수정. 아바타 업로드, 지역·관심주제·한줄소개 편집, 공개 여부(is_public) 토글 |
| 내 카드 | /pass | pages/pass/ParticipantCard.jsx. 참가자 카드(본인). 헤더 참가자 메뉴 "내 카드"로 진입 [ONBOARD] |
| 구글 온보딩 | /onboarding, /onboarding/:moduleId | pages/onboarding/(Onboarding·OnboardingModule). 여정과 분리된 별도 학습 탭. app_settings 'onboarding' 전역 토글 on(또는 operator)일 때만 헤더 노출·접근(서버 게이팅). MarkdownPlayground 포함. 본 것 체크(서버 저장) [ONBOARD] |
| 대회 — 내 출품작 | /contests, /contests/:id/entry | pages/contest/(MyContests·MyEntry). 참가자 본인 출품작 목록·소개·추가자료·결과 확인 [CONTEST] |
| 심사 — 심사위원 | /judge, /judge/contests/:id, /judge/contests/:id/entries/:eid | pages/judge/(JudgeHome·JudgeContest·JudgeReview). 배정 심사위원 전용(서버 requireJudge 배정 확인, 미배정 403). 관제와 분리된 단순 화면 [CONTEST] |

### 운영자·조력자
> 관제 영역 공통 골격(W3-D): 좌 고정 사이드바(운영자 이름·역할 + 내비 항목[대시보드·참가자 현황·단계별 현황·검토 큐·대회(op)·최근 활동·문의함(op)·기수 리포트(op)·CMS(op)·기수 설정(op)·사용자 관리(op)·인사이트(owner)], operator 전용 항목은 역할 필터, 인사이트는 is_owner 소유자에게만) + 우 콘텐츠 2열. 사이드바 항목마다 화면 분리(한 페이지 적층 금지). 각 섹션 헤더 우측 새로고침 아이콘 버튼(그 섹션 데이터만 재요청), 폴링 15초 유지.

| 화면 | 경로 | 내용 |
|---|---|---|
| 관제 대시보드 | /admin | 홈. 카운트 카드 4(전체/완료/진행/막힘) + 참가자x단계 매트릭스(본색 솔리드 셀, hover 툴팁, 클릭 이동) |
| 참가자 현황 | /admin/participants | 행 목록(이름, 현재 단계, 상태 필 본색 솔리드, 마지막 활동, 진행률 바). 행 클릭 상세. 마지막 활동은 activity_log 최근 100건 파생(사용자 결정) |
| 참가자 상세 | /admin/participants/:id | 그 사람의 여정·산출물·피드백 이력 통합 뷰 |
| 단계별 현황 | /admin/steps | M0~M9 단계별 인원 분포와 상태 구성의 표 + 분포 막대 |
| 최근 활동 | /admin/activity | 활동 피드 전체 화면 |
| 검토 큐 | /admin/reviews | 검토 요청 목록. 승인(게이트 M2·M4)·반려·코멘트 |
| 대회 관리 | /admin/contests, /admin/contests/new, /admin/contests/:id | pages/admin/contest/(ContestList·ContestCreate·ContestManage). 운영자 전용. 대회 생성·기간·기준·심사위원 배정·출품 현황·심사 진행률·집계·결과 공개. 계약 CONTEST-API.md §A [CONTEST] |
| 소유자 인사이트 | /admin/insight | pages/admin/insight/(OwnerInsight·InsightCharts). OWNER_EMAILS 소유자에게만 나비 링크 노출, 서버가 접근 재검증(소유자 아니면 404로 숨음). 참가자 이탈·체류·게이트 행동 데이터 [WAVE-NEXT] |
| CMS | /admin/cms | 방법론 카드·프롬프트·용어·현안 카드·소식(posts) CRUD (CMS.md 참조) |
| 도입 문의함 | /admin/inquiries | contact_inquiries 목록 + 처리 상태 관리(GET/PATCH). 신규/처리중/완료 |
| 기수 리포트 | /admin/cohort-report | B2G 성과 보고 산출물. 기수 선택 → 참여 인원·완주율·단계별 분포·결과물 목록(서비스명·참가자·URL)·막힘 통계·기간 집계. 인쇄 최적화(그대로 인쇄 시 성과 보고서). GET /api/admin/cohort-report. W3-H |
| 기수 설정 | /admin/cohort | 지역명, 기간, 현안 카드 세트, 참가자 등록(이메일만) |
| 사용자 관리 | /admin/users | 역할 부여, 초기화 |

## 3. 네비게이션

- 공개 헤더: [W-DESIGN] 로고=**aXion**(BRAND_NAME, 표기 고정) / **소개(/about, 맨 앞)** / **교육 과정 ▾**(드롭다운 = 4트랙) / 성과(/impact) / 도입 안내(/pricing) / 소식(/news) / 도입 문의(/partners, 우측 세컨더리 버튼) / 로그인 버튼(우측 pill, 클릭 시 모달). 교육 과정 드롭다운은 아바타 메뉴와 동일 패턴. 모바일 트레이는 소개 → "교육 과정" 라벨 + 4트랙 → 나머지 순서. 갤러리·선행 사례는 성과·푸터에서 진입.
- 참가자 헤더: 로고 / 내 여정 / 팀(/team, W4-T 후속 — 발견 가능성 우선) / 프롬프트 / 배움터(라벨 "용어 사전", /library) / 질문 / 대회(/contests) / 구글 온보딩(전역 토글 on 또는 operator일 때만, me.onboarding_enabled, /onboarding) / 우측 아바타 메뉴(프로필·내 산출물·내 리포트·내 카드(/pass)·로그아웃). 방법론·용어사전 → 배움터로 통합(W3-C). 캔버스 독립 메뉴 삭제(단계 내부화, W3-B). 아바타는 avatar_url 있으면 이미지, 없으면 기본 프로필 아이콘
- 알림 종(W4-T): 로그인 사용자 헤더의 아바타 왼쪽에 종 아이콘(lucide Bell 24/stroke2) + 미읽음 뱃지(statusBlocked 본색 솔리드 원 + onPrimary 숫자, 9+ 표기). 드롭다운 알림 목록(유형별 한글 문구·상대시각), 클릭 시 대상 위치 이동 + 읽음 처리. 폴링 15초. 인앱 전용(푸시·이메일 없음)
- 운영자: 참가자 헤더 + 관제 진입 아이콘 버튼(lucide LayoutDashboard, primary 색, aria-label 필수. W3-D — 텍스트 메뉴 대체)
- 푸터: 프로그램 소개·갤러리 / 배움터·질문 / 개인정보처리방침·이용약관(법적 고지 열)
- 모바일(833px 이하): 햄버거 트레이. 하단 도크 없음(데스크탑 중심 서비스, 모바일은 열람 위주)

## 4. 핵심 흐름

1) 온보딩 (두 갈래)
   - 지정 계정(seeded): 이메일 수령 → 로그인 탭에서 이메일+비밀번호 → 최초 로그인이면 그 비밀번호로 등록 → /journey 랜딩 → M0 체크리스트
   - 공개 가입(self_registered): 회원가입 탭 → 이메일·비밀번호·이름·약관 동의 2종 → 가입 즉시 계정 생성 + 여정 M0 todo 초기화 → /journey 랜딩
1-1) 프로필·공개: /profile에서 아바타·지역·관심주제·한줄소개 편집, 공개 토글. is_public=true여야 완주 결과물이 갤러리·공개 뷰에 노출(기본 비공개)
2) 단계 진행: /journey → 단계 상세 → 산출물 등록 → 완료 조건 충족 → (게이트 단계면) 검토 요청 → 운영자 승인 → 다음 단계 해제
3) 시안 피드백 루프: Stitch 이미지 업로드 → 운영자 핀 코멘트(열림) → 참가자 반영 후 체크(수행) → 운영자 확인(검토완료)
4) 막힘: 단계 상세의 막히면 블록 → 탈출 프롬프트 → 그래도 3회 실패 → 질문 게시판 자동 프리필

## 5. 분기 규칙

- M2, M4는 운영자 승인 게이트. 승인 전 다음 단계 비활성(보드에서 pearl 비활성 + 한 줄 사유, 자물쇠 없음). **게이트는 별도 마커 없음**(DESIGN-V3 #4) — 참가자가 그 단계를 마치면 StatusPill "검토 대기"로 드러남. 서버 status='locked'·unlock 로직은 무변경, 표현만.
- 그 외 단계는 완료 조건 자동 체크(등록 항목 수·업로드 존재·URL 접속 확인)로 자가 완료.
- 배포 URL 제출(M8)은 서버가 접속 확인 후 완료 처리.