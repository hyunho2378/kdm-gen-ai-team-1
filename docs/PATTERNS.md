# PATTERNS.md — 반복 UI 패턴

> 화면을 새로 만들 때 반드시 이 패턴을 재사용한다. 임의 변형 금지.

## 1. 카드
- 기본 카드: canvas 배경, 1px hairline 보더, rounded.lg(18px), 패딩 spacing.lg(24px). 그림자 없음.
- 스크린샷 프레임 카드만 shadow.product 허용.
- 카드 hover: **호버 3종(§인터랙션 마감 · DESIGN-v2 §14)** 적용. 순수 콘텐츠 카드는 보더 강조 또는 e1→e2, 컨트롤 면(면 전체가 클릭 타깃)은 bg-pearl. (구 규칙 "무조건 배경 pearl"은 W-POLISH로 폐기.)

## 2. 목록 페이지 공통 골격
상단부터. 페이지 제목(displayLg) → 한 줄 설명(body, inkMuted80) → 컨트롤 행(SearchInput + 칩/토글) → "지금 보는 것" 상태 라벨(captionStrong) → 그리드/리스트 → EmptyState(비었을 때).

## 3. 상세 페이지 공통 골격
브레드크럼(caption, inkMuted80) → 제목(displayLg) → 메타 배지 행 → 본문(최대 720px) → 관련 콘텐츠 → 하단 이전/다음 내비.

## 4. 상태 표현
- 4상태 = StatusPill 단일 수단. **본색 솔리드 배경 + 색별 텍스트색(tokens.js onStatusXxx, WCAG AA)** — progress·done은 ink, review·blocked은 흰(DESIGN-v2 §2). soft 파스텔 폐기. 색 4종 외 추가 금지. 텍스트 라벨 항상 병기(색만으로 구분 금지, 접근성).
- 매트릭스 셀·차트도 본색 솔리드 배경 + onStatusXxx 아이콘/텍스트(색별 AA). 연한 파스텔 금지.
- 좌측 4px 컬러 바는 그룹·큐 행 등 **상태·그룹 정보를 담은 기능 바에만**. 장식용 손톱 바 금지(§8).

## 5. 폼
- 라벨 위, 인풋 아래, 도움말 caption(inkMuted80) 아래.
- 오류: 인풋 보더 statusBlocked + 아래 caption 오류 문구. 팝업 금지.
- 제출 버튼은 폼 하단 우측 ButtonPrimary 1개. 보조는 좌측 TextLink.
- 저장 성공 Toast, 실패 Toast + 입력 보존.

## 6. 모달
- 데스크탑 중앙 다이얼로그 최대 560px, 모바일 바텀시트. 딤 rgba(0,0,0,.4).
- 닫기: 우상단 x, ESC, 바깥 클릭. 파괴적 액션은 확인 모달(취소 좌 / 확인 우).

## 7. 빈 상태·로딩·오류
- 로딩: 스켈레톤(pearl 펄스). 스피너는 버튼 내부만.
- 목록 빈 상태: EmptyState 패턴. 첫 사용 유도 문구는 행동 동사로.
- 서버 오류: 인라인 안내 + 다시 시도 ButtonSecondary. 콜드 스타트(백엔드 슬립) 대비 "깨우는 중" 문구 분기.

## 8. 프롬프트 표시
- 프롬프트 본문은 pearl **단색** 배경 블록, rounded.md, 패딩 spacing.md. **좌측 액센트 보더 없음**(장식용 손톱 바 금지 — DESIGN-v2 §8).
- [빈칸]은 PromptBlank 스팬(단색 배경 + primary 텍스트·보더). 복사 버튼은 블록 우상단 아이콘 버튼(24px).
- 복사 시 빈칸 미채움 상태면 Toast "빈칸을 채우면 더 좋아요" 안내(차단은 안 함).

## 9. 단계 배지
- M0~M9 배지: pearl 배경 + ink 텍스트 캡슐, captionStrong. 게이트 단계(M2·M4)도 **별도 마커 없음**(DESIGN-V3 #4 — ShieldCheck 폐지). 게이트는 참가자가 그 단계를 마치는 순간 StatusPill "검토 대기"로 드러난다(상시 표시 불필요, 클러터↓). 잠금 단계는 아이콘 없이 pearl 비활성 + ink 텍스트 + 한 줄 사유(자물쇠·회색 금지).

## 10. 접근성 공통
- 터치 타깃 최소 44px. focus-visible에 primaryFocus 2px 아웃라인 전 요소.
- 이미지 alt 필수. 아이콘 단독 버튼 aria-label 필수.
- 대비 4.5:1 이상(회색 inkMuted48 폐지). 본문은 ink, 보조·캡션·힌트는 inkMuted80(#333, 가독 확보).
- 아이콘 크기 20 이상, strokeWidth 2 이상(DESIGN-v2 §9). 얇은·작은 아이콘 금지.
- 한국어 줄바꿈: 전역 word-break keep-all + overflow-wrap break-word. 어절 단위 줄바꿈, 좁은 max-width 강제 줄바꿈 컨테이너 금지(DESIGN-v2 §8).
## 인터랙션 마감 [W-POLISH]
호버 3종(링크=색 / 카드=보더·e2 / 컨트롤 면=bg-pearl), 트랜지션은 Tailwind 기본 또는 motion 토큰, 상태 3종 의무. 상세는 DESIGN-v2 §14·COMPONENTS.md.
