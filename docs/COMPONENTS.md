# COMPONENTS.md — 컴포넌트 명세

> 여기 없는 컴포넌트는 만들지 않는다. 필요하면 질문 후 이 문서에 먼저 추가한다.
> 모든 값은 tokens.js 토큰 참조. 표기 형식: 파일 경로 / 사용처 / 스펙.

## 공용 레이아웃

- **Container** `components/Container.jsx` / 전 페이지
  variant="read"(max readMax, 1441+에서 readMaxWide) | "board"(boardMaxFhd, 2560+에서 boardMaxQhd). 좌우 패딩 spacing.lg, 모바일 spacing.md. 헤더·본문·푸터 좌측선 픽셀 일치.
- **Header** `components/Header.jsx` / 전 페이지
  높이 52px, **parchment 배경(순백 금지) + 하단 보더 강화(border-b-2 hairline)**. 로그인 상태별 메뉴는 IA.md 3장. 활성 링크 ink, 비활성 inkMuted80, hover ink. [W-DESIGN] 로고 자리 = **BRAND_NAME("aXion")**(구 PLATFORM_NAME 교체). 공개 메뉴 = **소개(/about, 맨 앞)** → 교육 과정 드롭다운(TRACKS 4트랙, ChevronDown, eduOpen — 아바타 메뉴 패턴) → 성과·도입 안내·소식. 모바일 트레이도 소개 → 교육 과정 라벨+4트랙 → 나머지. Footer 브랜드·© 줄도 BRAND_NAME(가칭 표기 제거).
- **Footer** `components/Footer.jsx` / 공개·참가자 페이지 — **법적 블록 포함형(BACKEND/IA 확장). 내용은 BRAND-COPY.md §5 그대로.**
  parchment 배경, **상단 보더 강화(border-t-2 hairline)**로 마감 CTA와 경계 분명. 패딩 상하 64px.
  상단: 좌 [플랫폼명](가칭) + 운영(한림대 디지털인문예술전공 x 한림 G@lab) + 개발 취지 한 줄 + 문의 이메일 / 우 링크 컬럼(caption — 프로그램·성과·소식·도입 문의·이용약관·개인정보처리방침).
  하단 법적 줄: 이용약관 | 개인정보처리방침, © 2026 [플랫폼명], 콘텐츠 무단 전재·재배포 금지 문구(finePrint, inkMuted80).
  **예약 슬롯(주석 처리)**: 사업자등록번호 / 통신판매업 신고 / 원격평생교육시설 신고 — 법인화·유료화 시점에 채움.
- **AuthModal** `components/AuthModal.jsx`
  white 카드, rounded.lg, 최대 420px, 딤 rgba(0,0,0,.4). ESC·바깥 클릭 닫기, 포커스 트랩.
  상단 세그먼트 토글 [로그인 | 회원가입](SortToggle 문법 계승 — pearl 트랙, 선택 canvas+ink). 오류는 인라인(PATTERNS §5), 입력 보존.
  - 로그인 모드: 이메일+비밀번호. 최초 로그인 안내 문구("처음이면 지금 입력한 비밀번호가 등록됩니다").
  - 회원가입 모드: 이메일 · 비밀번호 · 비밀번호 확인 · 이름 · 약관 동의 체크박스 2종(이용약관 /terms · 개인정보처리방침 /privacy 링크, 새 탭) · 가입 버튼.
    검증: 비밀번호 확인 일치, 최소 8자, 두 동의 필수. 미충족 시 버튼 비활성 또는 인라인 오류. 약관 링크 텍스트는 TextLink.

## 버튼·입력 (DESIGN-apple 문법 계승)

- **ButtonPrimary** `components/ui/Button.jsx` / 전역 유일 CTA
  primary 배경, onPrimary 텍스트, rounded.pill, 패딩 11px 22px, body. active에 motion.press. 큰 버전 size="lg"(14px 28px, 18px/300).
- **ButtonSecondary** 같은 파일 / 보조 액션
  canvas 배경, primary 텍스트, rounded.pill, hairline 보더.
- **TextLink** / 인라인 액션. primary 색, body.
- **SearchInput** `components/ui/SearchInput.jsx` / 카탈로그·방법론·용어사전
  rounded.pill, 높이 44px, 패딩 12px 20px, leading 검색 아이콘 14px inkMuted80.
- **FieldInput / FieldTextarea** `components/ui/Field.jsx` / 폼 전반
  rounded.sm, hairline 보더, 포커스 시 primaryFocus 2px 아웃라인. 라벨 captionStrong.

## 상태·여정

- **StatusPill** `components/ui/StatusPill.jsx` / 보드·대시보드·피드백
  status(progress|done|blocked|review) prop. **본색 솔리드 배경 + onStatusXxx 텍스트(색별 WCAG AA — progress·done ink, review·blocked 흰)**, rounded.pill, captionStrong, 패딩 4px 12px. 라벨 텍스트 항상 병기(색 단독 금지). soft 파스텔·도트 폐기(DESIGN-v2 §2).
> **제거됨(2026-07, 미사용 dead code)**: JourneyBoard·StepBlock·CompletionChecklist. 여정은 StepDetail 3열(StepSidebar) + SubstepTabs가 담당(잠금/게이트 표현은 StepSidebar·Journey 화면 참조). 재생성 금지.
> **[W-PT 게이트 C] 여정 상수 트랙 래핑**: `journeyPhase.js`(phaseOf·phasesOf·canvasStepsFor)·`journeyTime.js`(estMinutesFor)·`journeyCarry.js`(resolveCarry) 접근 함수는 `programType` 인자(기본 `'civic'`). 값은 `{civic:{...}}`로 래핑(civic 1비트 불변, `client/journey-parity.check.mjs`로 동치 증명). modular 트랙은 맵 키 부재 → null/빈값 → phase 구획·이월 패널·캔버스 미렌더(맵 부재 + mode 게이트 이중 안전). `phaseOf(code, pt)`/`resolveCarry(code, steps, pt)`/`canvasStepsFor(pt)`로 호출하며 pt는 step.program_type. 잠금 표시는 서버 status만으로(코드/인덱스 추정 금지) — modular은 status=locked가 없어 자동 무잠금. 트랙 선택 화면(TrackSelect)·다중 트랙 전환 세그먼트는 JourneyOverview 내부(헤더 메뉴 불변).
- **StuckPanel** `components/journey/StuckPanel.jsx` (JOURNEY-LX B-2)
  > **렌더 제거됨(JOURNEY-V2 #5-2, 2026-07-24)**: StepDetail에서 렌더·import·reportStuck 제거. 파일은 보존(재사용 여지). 막힘 진입은 질문 게시판(Header "질문"·Footer)으로 생존. POST /api/stuck 클라 진입점 없음(막힘 지표 공급 중단 — 운영자 판단 대상). **재생성·재배선 전 PROGRESS.md JOURNEY-V2 #5-2 확인.**
  (원 스펙) 막힘 3버튼 패널(ButtonSecondary, 가로 랩·모바일 세로). (a) 막힌 부분 풀어보기(blocks.stuck 펼침) (b) 이 단계 프롬프트 다시 보기(우측 레일 #step-prompts 스크롤+포커스) (c) 질문 남기기(질문 게시판 딥링크, 단계 태그 자동). 기존 "같은 에러 3번" 로직 (c)에 흡수.

## 카탈로그·라이브러리

> 배움터(W3-C): 방법론 + 용어를 `pages/Library.jsx` 한 페이지로 통합. 상단 CategoryToggle[방법론|용어] + 검색, 방법론에만 SortToggle·StepChips. /methods·/glossary → /library 리다이렉트. 미리보기 잘림은 목록 카드에서만, 상세·모달은 잘림 금지(task 5).

- **CatalogSidebar** `components/catalog/CatalogSidebar.jsx` / /prompts
  카테고리 트리 + 개수 배지(pearl 배경 캡슐). 선택 항목 primary 텍스트.
- **PromptCard** `components/catalog/PromptCard.jsx`
  프리뷰 영역(pearl 배경, 첫 3줄, 말줄임) + 이름 bodyStrong + 단계 배지 + 언제 쓰나 + "전문 보기". 카드 전체가 버튼 — 클릭 시 onOpen(prompt)로 PromptModal 오픈(잘린 프리뷰 대신 전문 확인).
- **PromptModal** `components/catalog/PromptModal.jsx` / /prompts
  프롬프트 전문 모달(PATTERNS §6). 제목 displayMd + 단계 배지 + 언제 쓰나 + 본문 전체(pearl 블록, [빈칸] 하이라이트, 잘림 없음) + 복사 아이콘 버튼(우상단 24px, "복사됨" 1.5초) + 사용 팁. 데스크탑 중앙 560px·모바일 바텀시트, 딤 rgba(0,0,0,.4), ESC·바깥·x 닫기, 포커스 트랩.
- **PromptBlank / withBlanks** `components/catalog/PromptCard.jsx` export / 프롬프트 본문 내 [빈칸]
  **pearl 단색 배경 + primary 텍스트 + primary 1px 보더**(반투명 알파 금지 — DESIGN-v2 §8), rounded.xs, 패딩 1px 6px. PromptCard·PromptModal 공용.
- **CategoryToggle** `components/methods/CategoryToggle.jsx` / /library
  [방법론 | 용어] 세그먼트. 선택 canvas 배경 + ink, 비선택 inkMuted80. pearl 트랙, rounded.pill(SortToggle 문법 계승). value: methods|terms.
- **MethodCard** `components/methods/MethodCard.jsx`
  이름 bodyStrong + 단계 배지 + 소요시간 caption.
- **TermCard** `components/methods/TermCard.jsx` / /library 용어 뷰
  용어 카드 + 인라인 확장. 접힘: 용어 bodyStrong + 영문 caption + 풀이 2줄 말줄임(목록 카드만 잘림 허용). 펼침: 전체 풀이(잘림 없음) + 비유 + 관련 방법론 TextLink. 헤더만 버튼(aria-expanded, ChevronDown/Up 20), 관련 방법론 Link는 버튼 밖(중첩 인터랙티브 방지).
- **SortToggle** `components/methods/SortToggle.jsx` / /library 방법론 뷰
  [여정 순 | 가나다 순] 세그먼트. 선택 canvas 배경 + ink, 비선택 inkMuted80. pearl 트랙, rounded.pill.
- **StepChips** `components/methods/StepChips.jsx` / 배움터(방법론)·프롬프트·질문 공용
  M0~M9 필터 칩. 선택 시 primaryFocus 2px 보더(configurator-chip-selected 문법).

## 캔버스

- **StickyCanvas** `components/canvas/StickyCanvas.jsx` / /canvas
  보드 영역 pearl 배경, rounded.lg. 줌 없음, 팬 스크롤만(첫 버전).
- **StickyNote** `components/canvas/StickyNote.jsx`
  160x140px 기본, 색 5종(연노랑 #FFF7CC, 연분홍 #FDE7EC, 연하늘 #E3F0FB, 연초록 #E9F5EC, 연보라 #EFEDFA. 캔버스 전용 예외 팔레트, tokens에 canvasNote로 등록해 사용). 텍스트 caption, 더블클릭 편집, 드래그 이동, 우상단 x 삭제.
- **NoteGroup** `components/canvas/NoteGroup.jsx`
  점선 hairline 묶음 프레임 + 이름 라벨 captionStrong.

## 서브스텝 블록 (슘페터 세분화, JOURNEY-SUBSTEP-V2)

> 단계 상세 SubstepTabs 탭 내부를 구성하는 표준 블록 6종. 콘텐츠는 journey_steps.substep_blocks(jsonb, migrations/002)에 배열로 저장 — CMS 6키 blocks와 분리(소실 안전). 선택 결과는 기존 산출물(POST /api/artifacts) 경로로 저장(별도 저장체계 신설 금지). tokens.js만, 밝은 톤(슘페터 다크 테마 미참고). 공통 계약: (block, draft, onDraft(key,value), onSaveArtifact({kind,body,msg}), busy).

- **BlockRenderer** `components/journey/blocks/BlockRenderer.jsx` / StepDetail SubstepTabs 내부
  substep_blocks[activeTab].blocks 배열을 type별 컴포넌트로 렌더하는 디스패처. 미등록 type은 무시. 없으면 기존 작업 위젯만(하위호환).
- **ChoiceCardGrid** `components/journey/blocks/ChoiceCardGrid.jsx`
  선택지 카드 그리드(제목+설명+사례). mode single|multi("최대 N개"). 카드 white/hairline/rounded.lg, 선택 시 border-primary + 제목 primary. 선택 결과 draft[emitKey] → onSaveArtifact.
- **ChipLibrary** `components/journey/blocks/ChipLibrary.jsx`
  대량 선택지 칩 라이브러리. 카테고리 탭(border-2 primaryFocus) + 칩(선택 primary 솔리드, 미선택 pearl) + "직접 입력" 폴백 + "선택 N개" 카운터. draft[emitKey] 배열.
- **CollapsibleTip** `components/journey/blocks/CollapsibleTip.jsx`
  접이식 팁. pearl 카드, 1줄 미리보기(truncate) + 자세히 보기(ChevronDown/Right 20). 상태 없음(읽기 전용).
- **PromptLauncher** `components/journey/blocks/PromptLauncher.jsx`
  템플릿 [토큰]을 draft(칩·카드 선택)+inline 입력으로 클라 치환(서버 호출 없음). 완성 프롬프트 pearl 블록(미충족 [토큰] primary 보더 하이라이트) + 복사 + "{tool}에서 열기"(새 탭) + "내 저장소에 담기"(완성본 산출물 저장).
- **ProfileBuilder** `components/journey/blocks/ProfileBuilder.jsx`
  페르소나형 조립(select/text 필드). 완성 프로필 kind persona 저장 → ContextPanel 릴레이(CARRY_KINDS).
- **GridCanvas** `components/journey/blocks/GridCanvas.jsx`
  BMC형 N칸 텍스트 셀 그리드("내용 추가"). 기존 포스트잇 CanvasBlock(canvas/)과 별개 — 텍스트 셀 경량. 완성본 kind text 저장.
- **MethodCardInline** `components/journey/blocks/MethodCardInline.jsx` (JOURNEY-LX B-1)
  블록 타입 "method"(method_cards slug 참조). 접힘: 이름 + 한 줄 정의(summary) + 소요시간 배지. 펼침: "이렇게 하라"(how) + 템플릿 받기. "자세히 보기" → /methods/:slug(페이지 이탈은 링크로만). BlockRenderer가 methods 목록 주입.
- PromptLauncher는 `promptRef`(prompt_catalog seed_key)로 카탈로그 본문을 단일 원천 참조(중복 하드코딩 금지, JOURNEY-LX C-2). BlockRenderer가 prompts 목록 주입. `template` 인라인은 폴백.

## 피드백

- **PinOverlay** `components/review/PinOverlay.jsx` / 시안 리뷰
  이미지 위 클릭 좌표(% 기준 저장)에 번호 핀. 핀은 primary 원 24px + onPrimary 숫자. 열림 핀 primary, 검토완료 핀 statusDone.
- **CommentThread** `components/review/CommentThread.jsx`
  우측 패널. 코멘트 카드(작성자 captionStrong + 본문 body + 상태 StatusPill). 참가자 "반영했어요" 체크 → status 수행. 운영자 "확인" → 검토완료.

## 대시보드 (운영자)

- **AdminLayout** `components/admin/AdminLayout.jsx` / /admin 전 화면 (W3-D, W3-H)
  좌 고정 사이드바(240px 구조 폭. 운영자 이름 bodyStrong·역할 caption + 내비 10항목 captionStrong, 활성 pearl 배경+ink, operator 전용 항목 역할 필터) + 우 Outlet. board Container. 1068px(sd) 미만 사이드바 상단 가로 랩. 사이드바는 sticky 독립 스크롤. **인쇄 시(print:) 헤더·사이드바 숨김** — 기수 리포트를 그대로 인쇄하면 보고서 본문만 남는다.
- **Certificate** `pages/Certificate.jsx` / /report/certificate (W3-H)
  수료증 인쇄 화면. A4 세로 시트(max-w 794px, border-2 ink 프레임). 플랫폼명·수료증 제목·성명(displayLg)·기수·완주 결과물(서비스명·URL)·완료 과정·수료일·운영 주체(OPERATOR_ORG). 컨트롤 바(뒤로·인쇄) print:hidden. 자격은 서버 판정(M9 done 아니면 409 → 자격 안내). 배경 채움 없이 보더·텍스트.
- **CohortReport** `pages/CohortReport.jsx` / /admin/cohort-report (W3-H)
  기수 성과 리포트(AdminLayout 하위). 기수 select + 인쇄 버튼(print:hidden) → 표제(플랫폼명·기수·기간·발행 주체) + 핵심 지표 4카드(등록·참여율·완주·완주율) + 단계별 분포 표(본색 솔리드 보조 막대) + 결과물 목록 + 막힘 통계. 인쇄하면 성과 보고서.
- **SectionHead / RefreshButton** `components/admin/SectionHead.jsx` / 관제 전 섹션 (W3-D)
  섹션 제목(tagline) + 우측 새로고침 아이콘 버튼(lucide RefreshCw 20, strokeWidth 2, 44px 타깃, aria-label "{제목} 새로고침"). 그 섹션 데이터만 재요청, 폴링 15초 별개 유지.
- **StatWidget** `components/admin/StatWidget.jsx`
  카운트 카드. 숫자 displayMd, 라벨 captionStrong(600 — W3-D 상향) + 상태 본색 솔리드 도트.
- **ProgressMatrix** `components/admin/ProgressMatrix.jsx`
  참가자 x 단계 그리드. 셀 28px, **본색 솔리드 상태색 배경 + onStatusXxx 아이콘(색별 AA)**(soft 폐기), 중립 상태(locked·todo)는 pearl(잠금은 아이콘 없음, todo는 Minus). hover 시 툴팁(단계명+상태 — 갱신 시각 데이터 부재로 제외, 웨이브5 events 도입 시 재검토). 클릭 → 참가자 상세.
- **ReviewQueueList** `components/admin/ReviewQueueList.jsx`
  status-review 좌측 바 리스트 행. 행 클릭 → 산출물 검토 패널.
- **ActivityFeed** `components/admin/ActivityFeed.jsx`
  최근 활동 caption 리스트, 시각 상대 표기.

## 프로필 (참가자)

- **ProfilePage 골격** `pages/Profile.jsx` / /profile
  PATTERNS §3 상세 골격 계승(제목 → 본문 720px 단일 컬럼). 좌: AvatarUpload, 우/하: ProfileForm + 공개여부 토글. 저장 성공 Toast, 실패 Toast + 입력 보존.
- **AvatarUpload** `components/profile/AvatarUpload.jsx`
  원형 미리보기(96px, rounded.full, 없으면 이름 이니셜 pearl 배경) + 변경 버튼. 내부는 UploadDrop 재사용 또는 파일 선택 → POST /api/upload → PATCH /api/me/profile avatar_url. 업로드 중·성공·실패 문구 필수(빈 값 저장 금지).
- **ProfileForm** `components/profile/ProfileForm.jsx`
  Field 컴포넌트로 지역(FieldInput) · 관심주제(칩 다중 선택 — 저장은 topics 배열) · 한줄소개(FieldTextarea). 라벨 위·도움말 아래(PATTERNS §5). 제출 폼 하단 우측 ButtonPrimary 1개.
- **PasswordForm** `components/profile/PasswordForm.jsx` / 프로필 내 비밀번호 변경
  현재 비밀번호 · 새 비밀번호(최소 8자) · 새 비밀번호 확인 → PATCH /api/me/password. 확인 불일치·현재 오류 인라인(PATTERNS §5). 성공/실패 상위 Toast. AvatarUpload는 Avatar 컴포넌트(기본 프로필 아이콘)로 미리보기.
- **Toggle** `components/ui/Toggle.jsx` / 공개 여부 등 불리언
  pill 트랙(off=hairline, on=primary), 원형 노브(canvas). 라벨 병기 필수(색 단독 금지, 접근성). role="switch" aria-checked. 44px 터치 타깃. 상태색 아님 — on은 인터랙티브 primary.

## 문서 (공개)

- **DocPage 레이아웃** `pages/Privacy.jsx`, `pages/Terms.jsx` / /privacy, /terms
  읽기 전용 문서. PATTERNS §3 상세 골격(제목 displayLg → 본문 최대 720px 단일 컬럼). 상단 고지 캡션(inkMuted80, "법률 자문 아님 · 시행 전 전문가 검토 필요"). 섹션 제목 tagline, 본문 body, 목록 들여쓰기. 문서 텍스트는 콘텐츠 소스(LEGAL-privacy-draft.md·LEGAL-terms-draft.md)를 클라이언트 상수로 이식. 하드코딩 색 없음, 토큰만.

## 기타

- **EmptyState** `components/ui/EmptyState.jsx` / 목록 비었을 때
  중앙 정렬, 안내 문구 body + 보조 caption + 필요 시 ButtonSecondary. 일러스트 사용 시 unDraw, primary 단색 통일.
- **GlossaryTerm** 인라인 / 본문 용어 밑줄(점선) + 클릭 팝오버 풀이.
- **UploadDrop** `components/ui/UploadDrop.jsx` / 이미지·파일 업로드
  점선 hairline 프레임, 드래그오버 시 primary 보더. 업로드 중·성공·실패 상태 문구 필수, 실패 시 빈 값 저장 금지.
- **Toast** `components/ui/Toast.jsx` / 저장·복사·오류 알림. 하단 중앙, ink 배경 + onPrimary 텍스트, rounded.sm.
- **Avatar** `components/ui/Avatar.jsx` / 헤더·프로필 등 아바타 표시 공통
  avatar_url 있으면 이미지, 없으면 **기본 프로필 아이콘(lucide User) + 원형 pearl 배경**. 이니셜 표시 폐기(W3-A, 전 화면). 아이콘 크기 ≥20(size*0.58, 최소 20).

## 대회 (성과 발표·심사) [CONTEST]

> 세 화면(운영자 admin/contest · 심사위원 judge · 참가자/공개 contest)이 공용으로 쓰는 최소 공통분. 부모가 신설·등재. 출품작 카드는 화면별 형태가 달라 공용화하지 않고 각자 구현(공통은 아래 원자 컴포넌트만).

- **ContestStatusBadge** `components/contest/ContestStatusBadge.jsx` / 세 화면
  대회 6상태(draft 준비·submission 출품·judging 심사·tallying 집계·published 결과 공개·closed 종료) 배지. 상태색 4종(tokens)+중립 pearl/ink만: submission→statusProgress, judging·tallying→statusReview, published→statusDone, draft·closed→pearl+ink. 본색 솔리드 + onStatusXxx, 라벨 병기, rounded.pill, captionStrong. props: `{status}`.
- **ScoreValue** `components/contest/ScoreValue.jsx` / 집계·결과
  점수 표시 통일(소수 1자리). null이면 "미집계". props: `{value, max?, className?}`. `fmtScore(v)` 유틸 named export.
- **CompletionBar** `components/contest/CompletionBar.jsx` / 심사 진행률
  라벨 + "done / total" + primary 채움 바(pearl 트랙, 비인터랙티브 상태 채움). props: `{done, total, label?}`.
## 도구 아이콘 [ONBOARD]

- **ToolIcon** `components/ToolIcon.jsx` / 여정 사이드바 구간 헤더·단계 상세 상단·온보딩 도구 카드·프롬프트 카탈로그 도구 태그
  네 도구(Gemini·Stitch·AI Studio·Antigravity) 자체 제작 단색 도형(공식 로고 미사용, 상표 회피). currentColor 상속(text 색 토큰으로 지정, 상태색 아님), 기본 24. props: `{tool, name?, size?, className?}`. `tool`은 journeyPhase PHASES.tool 문자열("Google Gemini" 등), 또는 `name`으로 키 직접("gemini|stitch|aistudio|antigravity"). 원본 SVG는 `client/src/assets/tools/*.svg`(currentColor 24px). `toolKey(tool)` named export.

## 대회 원자 (이어서)

- **DeployLink** `components/contest/DeployLink.jsx` / 심사위원 상세·공개 결과·운영자 현황
  배포 주소 새 탭 링크(lucide ExternalLink, primary 텍스트). size="lg"로 크게(심사 핵심). url 없으면 "배포 주소 없음". props: `{url, size?, label?}`.

## 구글 온보딩·카드·기관안내 [ONBOARD]

> 여정과 분리된 별도 학습 탭 + 참가자 카드 + 기관 도입 안내. 전역 토글(app_settings 'onboarding')로 노출. 페이지는 pages/onboarding·pass·pricing. 콘텐츠는 server/data/onboarding-content.js 정적 모듈.

- **Onboarding / OnboardingModule** `pages/onboarding/(Onboarding·OnboardingModule).jsx` / /onboarding, /onboarding/:moduleId
  온보딩 모듈 목록(요약·본 것 배지) + 모듈 상세. 본 것 체크는 서버 저장(POST/DELETE /api/onboarding/seen, localStorage 금지). 참가자는 토글 on일 때만 접근(서버 404 게이팅), operator 항상.
- **MarkdownPlayground** `pages/onboarding/MarkdownPlayground.jsx` / 온보딩 모듈 내부
  마크다운 실습(좌 입력·우 결과 즉시). 6문법만(제목·굵게·목록·링크·코드블록·인용). md 저장·불러오기. dangerouslySetInnerHTML 없이 React 노드 렌더(안전). 코드/인라인 토큰만, 하드코딩 색 없음.
- **ParticipantCard** `pages/pass/ParticipantCard.jsx` / /pass
  참가자 카드(본인). 헤더 아바타 메뉴 "내 카드"로 진입.
- **AdoptionGuide** `pages/pricing/AdoptionGuide.jsx` / /pricing
  기관 도입 안내(공개, 가격 없음). 문의는 /partners 연결.
- **About** `pages/public/About.jsx` / /about [W-ABOUT]
  브랜드 소개(aXion). 히어로(BRAND_NAME+태그라인+정의) → Naming → 숫자 벨트(StatBelt) → Philosophy(2단) → Brand Promise 3 → 우리가 만든 것(산출물 3카드, numer9만 링크·동해 키오스크는 준비 중) → 기관소개 허브 3 → 운영 주체 → CTA(도입 문의/협력 제안 모두 /partners). **Vision·Mission·Core Values·Brand Story는 W-IDENTITY로 /about/purpose 이관됨**(About에서 제거). 콘텐츠 원문 W-ABOUT §5(윤색 금지). tokens.js primary 유지(§6). 브랜드 상수는 `content/site.js` **BRAND_NAME "aXion"(표기 고정) / BRAND_TAGLINE**(PLATFORM_NAME 가칭과 별개 축, 값 불변).

## 섹션 골격 [W-REBRAND 게이트2]

- **Section** `components/Section.jsx` / 공개 페이지 전 섹션
  재질과 여백을 한 곳에서 결정하는 섹션 래퍼. **페이지가 배경색·수직 패딩을 개별 지정하지 않는다**(개별 지정이 리듬 균질화의 원인). props: `{material="A"|"B"|"C", pad="lead"|"base"|"tight", fallback="A"|"B", photo, photoAlt, id, className}`.
  - `material`: **A** canvas(기본) · **B** 틴트 밴드(유채 틴트, 무채색 층 아님) · **C** 사진 밴드(photo 필요). 같은 재질 3연속 금지, 페이지당 B 1~2회. 시퀀스는 승인된 PART 3 표를 따른다.
  - **`fallback`(C 전용, 페이지가 지정)**: photo가 없을 때 쓸 배경. **컴포넌트가 일괄로 B를 강요하지 않는다** — PART 3에서 C 폴백을 페이지마다 다르게 확정했고(대형 타이포 선언·굵은 통계·짧은 타이포+큰 여백·지표 벨트·**밴드 없이 A**), 일괄 B는 merchant(A)를 깨고 13·16·20 동일화 해소 근거를 무효화한다. 밴드를 두지 않는 페이지는 `fallback="A"`를 명시한다.
  - **C 폴백으로 생긴 B는 "페이지당 B 1~2회" 계산에서 제외한다**(부모 판정, W-REBRAND 게이트2). 사진이 들어오면 C가 되어 사라지는 일시적 B이기 때문이다. 이 예외가 없으면 "B 초과"와 "A 3연속 금지"가 서로를 막아 해가 없다(홈 로고 벨트에서 실제 발생). 판정 기준은 **목표 시퀀스**의 B 횟수다.
  - **축 분리**: 이 컴포넌트는 **배경 재질과 수직 여백만** 정한다. 내부 구성(대형 타이포·통계 하나·지표 벨트 등)은 페이지가 children으로 정하며, 폴백도 배경만 바꾸고 내부 구성에 관여하지 않는다.
  - `pad`(여백 3단, 기존 spacing 조합만·신설 0): **lead** 48→80(히어로 직후·최종 CTA 직전·재질 전환 경계) · **base** 32→64(일반) · **tight** 24→48(같은 주제가 이어질 때 = A 2연속과 짝).
  - material="C" + photo: 사진 위 단색 딥블루 오버레이(`bg-photoOverlay`, DESIGN-v2 §12 알파 예외 4번, 기본 0.60). 그라데이션 금지.
  - 관제·여정(도구형)에는 쓰지 않는다(재질 리듬 미적용).

## 활용 사례 [W-USECASE]

- **UseCaseCard** `components/usecase/UseCaseCard.jsx` / /usecases
  활용 사례 카드 + 인라인 확장(TermCard 패턴 계승). 접힘: 제목 bodyStrong + 대상 배지(pearl 캡슐) + 난이도 배지 + 한 줄 설명(truncate, 밀도 우선). 펼침: 본문 + "이렇게 합니다"(steps ol) + "그대로 쓰는 프롬프트"(pearl 블록 whitespace-pre-wrap + 복사 버튼, "복사됨" 1.5초) + 주의 + 쓰는 도구 + 관련 여정 단계(텍스트) + 프롬프트 카탈로그 링크. 헤더만 토글 버튼(aria-expanded), 복사·링크는 버튼 밖(중첩 방지). props: `{item, audienceLabels, levelLabels}`. 색은 의미 토큰만.
  콘텐츠: `content/static/usecases.js`(서버 `data/usecase-content-{a,b}.js` 생성 복사본). 분류/대상/난이도 메타는 USECASE_CATEGORIES·USECASE_AUDIENCES·USECASE_LEVELS. 출처는 USECASE_SOURCES(페이지 하단 참고 자료 절).

## 소유자 인사이트 [WAVE-NEXT]

- **OwnerInsight** `pages/admin/insight/OwnerInsight.jsx` / /admin/insight
  참가자 이탈·체류·게이트 행동 데이터(events 원장). AdminLayout 하위, is_owner 소유자에게만 나비 링크·서버 재검증(소유자 아니면 404).
- **InsightCharts** `pages/admin/insight/InsightCharts.jsx` / OwnerInsight 지연 로드
  recharts 묶음(lazy). AnalyticsPanel 규약 재사용 — 데이터색만(status·ink), 인터랙티브 Action Blue 분리, 애니메이션 off, tokens.js colors만.
## 호버·인터랙션 3종 규칙 [W-POLISH]
DESIGN-v2 §14 원장. 새 호버 패턴 금지.
- **링크** = 색 변화(text-primary). / **카드** = 보더 강조 또는 e1→e2(콘텐츠 카드). / **컨트롤 면** = hover:bg-pearl(메뉴 항목·드롭다운 행·목록 행·아이콘 버튼·탭 등 면 전체가 클릭 타깃).
- 순수 콘텐츠 카드(클릭 아닌데 bg-pearl)만 카드 방식으로 교정. 트랜지션은 Tailwind 기본 유틸(150ms) 또는 motion 토큰만(임의 duration·transition-all 금지). 데이터 화면은 빈·로딩·오류 3종 의무(공개=폴백).
