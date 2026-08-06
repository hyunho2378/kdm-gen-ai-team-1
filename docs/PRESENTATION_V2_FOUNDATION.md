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
