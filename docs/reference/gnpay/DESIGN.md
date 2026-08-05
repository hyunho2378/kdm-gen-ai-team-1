# DESIGN.md — 강릉페이 Phase 2 리디자인
팀: 마카모예 | UX Concept: 내 돈이 내 편인 앱

---

## UX Concept

**Concept Statement**
"내 돈이 내 편인 앱"

**핵심 인사이트**
사용자는 '내 돈인데 내가 통제하지 못한다'는 금융 불안감을 가진다.
이 불안을 확신으로 바꾸는 것이 디자인의 목표.

**두 축**
1. 투명한 정보 노출
2. 막힘없는 직진형 프로세스

---

## 7대 전략 (모든 디자인 결정의 근거)

| ID | 전략 | 축 | 근거 인사이트 |
|----|------|----|----|
| S1 | 앱 진입 전 잔액 선제 노출 (위젯) | 투명 | 관찰미션 전원 사전 확인 루틴 |
| S2 | 환불의 동등한 위계 노출 | 투명 | 환불 기능 4인 전원 발견 못함 |
| S3 | 혜택 현황의 즉각 체감 구조 | 투명 | 캐시백 단일 동인, 미가시화 |
| S4 | 충전 플로우 3단계 압축 | 직진 | 2030도 단점으로 지적 |
| S5 | 잔액 부족 사전 차단 알림 | 직진 | 계산대 앞 민망함 사후 대응 |
| S6 | 가맹점 정보 실시간 신뢰 구조 | 투명 | 가맹점주도 본인 가게 등록 모름 |
| S7 | 첫 사용자 단계별 맥락 안내 (코치마크) | 직진 | 카드 신청 복잡해 포기 발화 |

---

## 휴리스틱 준수 매핑 (필수)

### 닐슨 10 휴리스틱스

| # | 원칙 | 강릉페이 적용 방식 |
|---|------|-------------------|
| 1 | Visibility of system status | 잔액·캐시백·충전상태 항상 메인 노출 (S1, S3) |
| 2 | Match between system and real world | "강릉머니" 등 시스템 용어 → "잔액"으로 통일 |
| 3 | User control and freedom | 모든 화면 좌상단 ← 버튼, undo 가능 동작 명시 |
| 4 | Consistency and standards | 컴포넌트 패턴 통일, 아이콘·버튼 일관성 |
| 5 | Error prevention | 충전 전 잔액 부족 사전 알림 (S5), 비활성 버튼 사유 명시 |
| 6 | Recognition rather than recall | 업종 아이콘+텍스트 병기 (S6), 빠른금액 칩, 최근 결제 자동 노출 |
| 7 | Flexibility and efficiency of use | 위젯(S1), 빠른 충전 금액 칩, 단축 경로 |
| 8 | Aesthetic and minimalistic design | 메인 정보 위계 명확, B2B 분리, 불필요 배너 제거 |
| 9 | Help users recover from errors | 인라인 에러 메시지, 해결 액션 버튼 포함 |
| 10 | Help and documentation | 코치마크 온보딩 (S7), 맥락별 도움말 |

### 슈나이더만 8 황금 규칙

| # | 원칙 | 강릉페이 적용 방식 |
|---|------|-------------------|
| 1 | Strive for consistency | tokens.js 단일 소스, 동일 동사 동일 위치 |
| 2 | Frequent users use shortcuts | 위젯(S1), 빠른 금액 칩, 자주 쓰는 매장 즐겨찾기 |
| 3 | Offer informative feedback | 모든 액션 햅틱+시각 피드백, 진행 상태 표시 |
| 4 | Design dialog to yield closure | 충전 3단계 명확 (입력→확인→완료), 완료 시 명시적 알림 |
| 5 | Simple error handling | 오류 시 한국어 평문 메시지 + 해결 버튼 |
| 6 | Permit easy reversal | 충전 직후 취소 가능 시간 명시, 즐겨찾기 즉시 해제 |
| 7 | Internal locus of control | 알림 설정 사용자 통제, 위젯 사용 여부 선택 |
| 8 | Reduce short-term memory load | 충전 금액 입력 중 한도 항상 노출, 단계 표시기 |

**모든 컴포넌트 구현 시 위 두 표에서 관련 항목 ID를 주석으로 명시한다.**

---

## 색상 토큰

### Primary (브랜드)
```
primary-50    #EFF6FF
primary-100   #DBEAFE
primary-500   #3B82F6
primary-600   #2563EB
primary-700   #1D4ED8   ← 주요 버튼, 강조 텍스트
primary-800   #1E3A8A   ← 잔액 카드 다크
primary-900   #1E2D6B
```

### Accent (캐시백·혜택)
```
teal-400      #2DD4BF
teal-500      #14B8A6   ← 캐시백 진행바
```

### Semantic
```
error         #EF4444   ← 잔액 부족, 결제 실패
warning       #F59E0B   ← 잔액 임계치 알림
success       #10B981   ← 충전 완료, 결제 성공
info          #3B82F6
```

### Neutral
```
gray-50       #F9FAFB
gray-100      #F3F4F6
gray-200      #E5E7EB   ← 구분선
gray-300      #D1D5DB
gray-400      #9CA3AF   ← 비활성, placeholder
gray-500      #6B7280   ← 보조 텍스트
gray-700      #374151
gray-800      #1F2937
gray-900      #111827   ← 제목 텍스트
```

### Surface
```
background    #F2F4F8   ← 앱 배경
card          #FFFFFF
darkCard      #1B4FD8   ← 잔액 카드
overlay       rgba(0,0,0,0.5)
```

---

## 타이포그래피 (HIG 기준)

```
폰트 패밀리:
  -apple-system, BlinkMacSystemFont,
  'Apple SD Gothic Neo', 'Pretendard',
  'Noto Sans KR', sans-serif

스케일:
  Large Title   34px 700 line-height 41px   ← 메인 화면 잔액
  Title 1       28px 700 line-height 34px
  Title 2       22px 700 line-height 28px
  Title 3       20px 600 line-height 25px
  Body          17px 400 line-height 22px   ← 기본 본문
  Callout       16px 400 line-height 21px
  Subheadline   15px 400 line-height 20px
  Footnote      13px 400 line-height 18px
  Caption 1     12px 400 line-height 16px
  Caption 2     11px 400 line-height 13px   ← 바텀탭 레이블

자간:
  본문         -0.01em
  제목         -0.02em
```

---

## 간격 시스템

8pt 그리드 (4px 배수)
```
1   4px
2   8px      ← 거터
3   12px
4   16px     ← 기본 좌우 마진
5   20px
6   24px     ← 섹션 간 간격
8   32px
10  40px
12  48px
```

---

## 레이아웃

```
플랫폼:        A형 (앱 고정, 430px 최대)
기준 뷰포트:    390px (iPhone 14)
그리드:        4컬럼, 16px 마진, 8px 거터
터치 최소:     44px × 44px
탑바 높이:     44px
바텀나브 높이:  83px (49px + safe area 34px)
QR플로팅바:    56px
```

---

## 모서리 둥글기

```
radiusCard     16px
radiusButton   12px
radiusModal    20px (바텀시트 상단)
radiusChip     20px
radiusPill     999px
radiusSmall    8px
```

---

## 그림자

```
card    0 2px 8px rgba(0,0,0,0.08)
modal   0 -4px 20px rgba(0,0,0,0.12)
button  0 2px 6px rgba(29,78,216,0.25)
nav     0 -1px 0 rgba(0,0,0,0.08)
```

---

## 컴포넌트 스타일 규칙

### 버튼
```
Primary:    bg-primary-700, text-white, h-44px+, radiusButton
Secondary:  bg-white, border primary-700, text-primary-700
Tertiary:   text-primary-700, no border
Disabled:   bg-gray-200, text-gray-400, 사유 항상 명시
Pill:       radiusPill, 환불·큰글씨 등 토글 형태
```

### 카드
```
기본:       bg-white, radiusCard, shadow-card, padding-16
잔액카드:    bg-darkCard, text-white, radiusCard, padding-20
빈상태카드:  중앙 일러스트 + 메시지 + CTA 버튼
```

### 입력
```
높이:       48px (터치 44px 이상)
border:    1px gray-200, focus 시 primary-600
placeholder: gray-400
에러:       border error, 인라인 메시지 하단
```

### 탭
```
바텀탭:     5개 고정, 아이콘 24px + 레이블 11px
활성:       primary-700
비활성:     gray-400
```

### 모달
```
바텀시트:   상단 핸들 4px×40px gray-300,
            radiusModal, 슬라이드업
공지팝업:   최소화 → 인라인 배너로 대체
```

---

## 핵심 화면 디자인 원칙

### 홈 (HomePage)
```
S1 위젯 안내 배너 (선택)
잔액 카드 (Large Title 잔액, 캐시백 진행바 통합)
↓
[충전] [환불] [QR결제]   ← S2: 환불 동등 노출
↓
S3 캐시백 누적·잔여한도·이번달 사용액
↓
서비스 바로가기
최근 결제
결제가능 매장
```

### 충전 (ChargePage)
```
S4 3단계: 금액 입력 → 확인 → 완료
단계 표시기 항상 노출 (Shneiderman 8: 단기기억 부담 감소)
한도 항상 표시 (Nielsen 1: visibility)
빠른 금액 칩
```

### 결제매장 (StorePage)
```
S6 업종 아이콘+텍스트 병기
"마지막 업데이트" 날짜 표시
가맹점주 정보 수정 진입점 (B2B 분리된 영역)
```

### 코치마크 (S7)
```
첫 실행 시:
  화면 어둡게 처리
  눌러야 할 버튼만 하이라이트
  말풍선으로 다음 행동 안내
  "다음" / "건너뛰기" 버튼 제공
```

---

### 아이콘 라이브러리

기본 사용 (필수)
- lucide-react — https://lucide.dev
  모든 인터페이스 아이콘은 여기서만 가져온다.

보조 허용 (사용 시 사용자 사전 승인 필요)
- Bootstrap Icons — https://icons.getbootstrap.com
- react-icons — https://react-icons.github.io/react-icons
- Heroicons — https://heroicons.com

규칙
- 한 페이지 내에서 아이콘 라이브러리 섞어 쓰지 않는다. 보조 라이브러리 도입 시 해당 페이지 내 모든 아이콘을 동일 라이브러리로 통일한다.
- AGENT는 임의로 보조 라이브러리 도입 금지. 사용자 승인 후에만 추가.
- 아이콘 사이즈 16 / 20 / 24 / 32 / 48px 다섯 단계만 사용. 임의 사이즈 금지.
- 아이콘 색상은 정의된 텍스트 토큰 (text-text-pri, text-text-sec, text-text-meta, text-primary, text-white) 중 하나만 사용.

### 일러스트 라이브러리

허용
- unDraw — https://undraw.co/illustrations
  컬러 변경 가능한 SVG 일러스트.

규칙
- 일러스트 사용 위치는 EmptyState, 가입/로그인 페이지, 온보딩 화면, 404/500 에러 페이지로 한정.
- 카드 그리드, 거점 상세, 패키지 상세 등 콘텐츠 페이지에서 일러스트 사용 금지.
- 일러스트 + 사진 한 화면 혼용 금지. 둘 중 하나만.
- 일러스트 메인 컬러는 프라이머리 #60A5FA 또는 흑백으로 통일. unDraw에서 다운로드 시 컬러를 #60A5FA로 변경한 후 사용. 알록달록한 다색 일러스트 절대 금지.
- 일러스트 파일은 SVG로 저장하여 `client/public/images/illustrations/` 에 보관.
---


## 절대 금지 사항

- 이모지 사용 (lucide-react 또는 inline SVG만)
- 색상·간격·폰트 하드코딩 (tokens.js만)
- 팝업 모달로 정보 전달 (인라인 배너 우선)
- B2B 콘텐츠 B2C 화면 노출
- "강릉머니" 등 시스템 용어
- localStorage / sessionStorage
- TypeScript
- 휴리스틱 위배 결정 (위 매핑표 외 결정 시 사용자 확인 필수)