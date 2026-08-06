# presentation-v2 파운데이션 (PV1)

발표 덱 presentation-v2의 **새 디자인 시스템 파운데이션**. brand/arena/controller와 별개다.
값의 단일 원천은 `presentation-v2/src/tokens.js`. **HEX/rgba 하드코딩 금지**(전부 토큰 파생).

## 색 (다크 → 라이트 반전)

- **배경 `#F6F6F6`(`colors.bg`) + 잉크 `#101010`(`colors.ink`)가 전역 기준.** 전 슬라이드 이 둘.
- 흑 계열 텍스트/선은 `inkA(a)`로 파생(`text.*`, `line.*`, `surface.*`). 밝은 파생은 `whiteA`/`bgA`.
- **브랜드 레드(`#E60D15`)와 블랙 견본, 미드나잇 네이비(`#263E5F`)는 컬러 시스템 슬라이드 안에서만.**
  전역 액센트로 쓰지 않는다. 네이비는 그 슬라이드 아이브로우 tone에만 얹었다.
- 전역 액센트는 잉크 단색이다. 컴포넌트(Eyebrow/StepDots/Badge)와 CTA/아이콘 원/글로우를 전부 잉크로 내렸다.
- 첫 페인트 예외는 `index.css`의 `#F6F6F6`/`#101010`(토큰과 같은 값).

## 폰트 (본문/아이브로우 분리)

- `fontFamily.body = SUIT`, `fontFamily.eyebrow = Pretendard`, `fontFamily.display = Pretendard(미정)`.
- 두 웹폰트는 `index.html`에서 CDN 로드(jsDelivr, 버전 고정). 미로드 시 시스템 한글 스택으로 fallback.
- 본문은 `typography.family`(= SUIT), 아이브로우는 `Eyebrow`가 `typography.eyebrow.family`(= Pretendard).

## 타이포 스케일 (PV2, 역할별 단일)

**슬라이드마다 크기를 다시 적지 않는다.** `tokens.typography`의 role 하나씩만 참조한다.
기준은 컬러 시스템 슬라이드(그리드 기준 슬라이드)의 실측값이다. **절제된 크기 + 굵기/여백 위계**
(레퍼런스 정신: 작고 굵고 여백). 헤드라인과 본문 크기 차이를 크게 벌리지 않는다.

| role | clamp | weight | 1440 실측 | 쓰임 |
|---|---|---|---|---|
| eyebrow | 1.3125rem 고정 | 700 | 21px | 섹션 라벨(좌상단, Pretendard) |
| headline | clamp(0.92rem, 1.35vw, 1.5rem) | 700 | 19.4px | 전 슬라이드 설명형 헤드라인 |
| body | clamp(0.72rem, 1.04vw, 1.16rem) | 400 | 15px | 설명, 카드 본문, 인용 |
| caption | clamp(0.62rem, 0.94vw, 1.05rem) | 400 | 13.5px | 소형 라벨, 부라벨, HEX/RGB |
| display | clamp(2.6rem, 9.4vw, 8.6rem) | 300 | 135px | 대형 워드마크(컨셉/네이밍 VORTEX, 데모 ENTER)만 |

- **전 슬라이드 헤드라인이 headline 하나를 쓴다.** 슬라이드별 개별 헤드라인/본문 크기 지정은 전량 제거.
  가장 긴 헤드라인(TARGET)이 1440에서 1350px = 콘텐츠 폭에 한 줄로 들어간다(실측). 마진 밖으로 안 넘친다.
- **위계는 크기 대비가 아니라 굵기와 여백이 낸다.** 헤드라인 700 vs 본문 400, 카드 제목은 본문 크기 + 700.
  1440에서 eyebrow(21) ≳ headline(19.4)이고 1920에서 headline이 24로 eyebrow를 넘는다(컬러 시스템과 동일).
- 숫자/배지 등은 크기만 role에 맞추고 자간/행간은 자기 값을 유지(예: TARGET 원 안 번호는 headline 크기 + 숫자 자간).

## 2단 헤더 틀 (PV3, 전 슬라이드 공용)

**컬러 시스템 슬라이드 구조를 공용 `SlideHeader`(Bits.jsx) 하나로 뽑아 전 슬라이드에 적용한다.**
슬라이드마다 헤더를 다시 짜지 않는다.

- **구조:** `[아이브로우(좌, flex 0 0 auto) | gap | 헤드라인+서브(우, flex 1 1 auto)]` 한 줄, 콘텐츠는 아래로.
  두 열 top 정렬. gap `clamp(16px, 4vw, 96px)`. 아이브로우는 전역 그리드 좌상단(marginX, marginTop) 고정.
- **컬러 시스템 실측(1440):** 아이브로우 left 45(marginX)·top 65(marginTop), gap 58, 우측 열 left 251·right 1395.
  우측 열 시작 x는 아이브로우 라벨 폭에 따라 슬라이드마다 다르다(reference도 라벨 폭이 달라지면 같은 원리).
- **적용:** 프롤로그, WHY, 타겟, 디자인 키워드, 네이밍, 인터랙션, 유파(+ 워크플로우/산출물 플레이스홀더).
  STACKED(헤드라인이 아이브로우 아래)였던 WHY/타겟/인터랙션/유파와 가운데 정렬이던 프롤로그를 전부 이 틀로.
- **`SlideHeader` props:** `eyebrow{en,ko?,tone?}`, `headline`(문자열/배열/노드), `sub`(문자열/배열),
  `headlineColor`, `rightStyle`(유파 포커스 페이드처럼 우측 열만 애니메이션할 때). 헤드라인/본문 크기는 PV2 role 토큰.
- **콘텐츠가 안 맞으면 크기가 아니라 배치로.** 헤드라인은 우측 열(마진 안)에서 줄바꿈하고 마진 밖으로 안 넘는다.
- **제외(사유):** **컨셉**(명시 제외, 사진+대형 워드마크 성격). **컬러 시스템**(틀의 기준, 이미 이 구조).
  **표지/데모(ENTER)**(포스터/디스플레이 성격). **페인포인트**(PAIN POINT→INSIGHT 2밴드 비교 매트릭스라
  단일 헤드라인이 없다. 두 라벨은 행 축 라벨이고 이미 marginX 좌열 정렬이라 틀과 어긋나지 않는다).

## 그리드 (컬러 시스템 슬라이드 실측 → 전역)

컬러 시스템 슬라이드를 1920x1080에서 실측(좌우 60px, 상단 78px, 하단 59px)해 `grid` 토큰으로 뽑았다.
**전 슬라이드가 이 그리드를 공통으로 쓴다**(페이지마다 다른 마진 금지).

- `grid.marginX = clamp(16px, 3.13vw, 76px)`
- `grid.marginTop = clamp(28px, 7.2vh, 78px)`  ← 아이브로우 top
- `grid.marginBottom = clamp(20px, 5.5vh, 60px)`
- **아이브로우는 항상 좌상단(marginX, marginTop) 고정.** 헤드라인은 그 오른쪽/아래 일관된 자리.

## 표지 시그니처

- 표지 VORTEX 텍스트(메탈릭/드롭섀도우)를 **`logo_main.svg`로 교체, `#101010` 평면**(질감/섀도우 0).
  원본 에셋을 안 건드리게 CSS `mask`로 알파만 취해 잉크 박스를 로고 모양으로 오린다(`S1Cover LOGO_MASK`).
- 다른 슬라이드의 VORTEX 워드마크(S3 컨셉, S5 네이밍)도 메탈릭을 걷고 잉크 평면으로.

## 사진 슬라이드 규칙 (라이트 위)

인물-온-블랙/컷아웃 사진이 라이트 배경과 충돌한다. 다음 규칙으로 정리했다.

- **인물-온-블랙(표지 등):** 의도된 다크 패널로 두고, 잉크 텍스트는 겹치지 않게 상단 라이트 밴드에 앉힌다.
- **컷아웃(유파 카드):** 투명 배경이라 라이트 위에 그대로 얹힌다(가장 깨끗).
- **텍스트가 사진 위에 올 때:** `bgA` 라이트 스크림/디스크로 받쳐 잉크 가독을 보장한다(S2Why 밴드, S4Keyword 원반, S3Concept 좌→우 스크림).
- 다크 스크림/글로우(레드 radial, 검은 딤)는 전부 걷었다.

## 기타

- 우하단 `01/14` 카운터 제거. 새로고침은 항상 첫 섹션(`history.scrollRestoration='manual'` + `scrollTo(0,0)`).
- 불릿 없음(원래도 리스트 불릿 0. 구분은 여백/타이포/판으로).
- **미보수:** 루트 `build:all`은 구 `presentation`을 빌드한다(presentation-v2 미포함). 발표 경로가 v2로
  확정되면 그 한 줄을 바꾼다. 이번 트랙(presentation-v2 전용)에서는 루트 config를 안 건드렸다.
