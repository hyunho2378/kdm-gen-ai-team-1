# [brand 라이선스 게이트 판정표. B5 이후 세션의 유일한 채택 근거다]

리서치가 후보로 올린 저장소의 라이선스를 **실제로 열어** 확인한 결과다. README 문구나 리서치 요약으로 판정하지 않았다.

**확인 방법.** GitHub API `repos/{owner}/{repo}/license`로 라이선스 파일의 존재와 SPDX를 받고, **채택 가능으로 넘어간 것은 파일 본문을 내려받아 첫 줄과 저작권자를 눈으로 확인했다.** 파일이 안 잡힌 것은 루트 목록을 받아 `LICENSE` `LICENCE` `COPYING` `LEGAL` 어느 이름으로도 없는 것을 확인했다.

**판정 규칙.** LICENSE 파일에 MIT, Apache-2.0, ISC, Zlib, CC0가 명시되면 채택 가능. MPL-2.0은 파일 단위 소스 공개 의무 경고를 달고 보류. **파일이 없거나 커스텀 제한이거나 확인 실패면 사용 불가이고 열람도 하지 않는다.**

확인 일자 2026-08-06.

| 저장소 | 실확인한 라이선스 | 판정 | 용도 후보 | 확인 일자 |
|---|---|---|---|---|
| gnss-creative-lab/webgl-particle-simulation | MIT (LICENSE, Copyright 2026 GNSS) | 채택 가능 | vortex 배경 파티클 | 2026-08-06 |
| Saganaki22/MetalFlow | MIT (LICENSE, Copyright 2025 drbaph) | 채택 가능 | 크롬 타이포 재질 | 2026-08-06 |
| wass08/r3f-ultimate-character-configurator | **없음** (루트에 라이선스류 파일 0, package.json license 필드도 없음) | **사용 불가** | 셀렉션 UI. R3F라 어차피 기각 기본값 | 2026-08-06 |
| Cuberto/bglines | **없음** (루트에 라이선스류 파일 0, package.json license 필드도 없음) | **사용 불가** | 배경 라인 | 2026-08-06 |
| niccolofanton/image-trail-shader | MIT (LICENSE, Copyright 2026 Niccolo Fanton) | 채택 가능 | 이미지 트레일 | 2026-08-06 |
| 23x2/generative-flow-field | MIT (LICENSE, Copyright 2025 Mikolaj Czyz) | 채택 가능 | 플로우 필드 배경 | 2026-08-06 |
| danlex/particles | MIT (LICENSE, Copyright 2026 Alexandru DAN) | 채택 가능 | 파티클 | 2026-08-06 |
| amandaghassaei/VortexShedding | **없음** (루트에 라이선스류 파일 0) | **사용 불가** | vortex 유체 시뮬 | 2026-08-06 |
| marcofugaro/webgl-iridescence-twerk | MIT (LICENSE, Copyright Marco Fugaro) | 채택 가능 | 이리데슨스 재질 | 2026-08-06 |
| heinergiehl/threejs-cursor-trail | MIT (LICENSE, Copyright 2025 Heiner Giehl) | 채택 가능 | 커서 트레일. **히어로는 arena 리본으로 이미 해결** | 2026-08-06 |
| PANDAKO-GitHub/threejs-trail-ribbon | MIT (LICENSE, Copyright 2026 PANDAKO-GitHub) | 채택 가능 | 트레일 리본. 위와 같은 이유로 우선순위 낮음 | 2026-08-06 |
| daniel-cotton/segue | MIT (**파일명이 `LICENCE`**, 본문에 "MIT License" 제목이 없고 Copyright 2023 DANIEL COTTON으로 시작하는 MIT 전문) | 채택 가능 | 페이지 전환 | 2026-08-06 |
| codrops/GridLayoutAnimation | MIT (LICENSE, Copyright 2009-2021 Codrops) | 채택 가능 | 그리드 레이아웃 전환 | 2026-08-06 |
| codrops/FullscreenLayoutPageTransitions | **없음** (루트에 라이선스류 파일 0) | **사용 불가** | 풀스크린 페이지 전환 | 2026-08-06 |
| JosephASG/codrops-cinematic-scroll-animations | **없음** (루트에 라이선스류 파일 0, package.json license 필드도 없음) | **사용 불가** | 시네마틱 스크롤 | 2026-08-06 |
| pmndrs/meshline | MIT (LICENSE, Copyright 2016 Jaume Sanchez) | 채택 가능 | 라인 지오메트리 | 2026-08-06 |
| protectwise/troika | MIT (LICENSE, Copyright 2019 ProtectWise, 2021 Jason Johnston) | 채택 가능 | SDF 텍스트 | 2026-08-06 |

## 2차 게이트 (2026-08-06 확인)

1차와 같은 방법이다. `repos/{owner}/{repo}/license`로 라이선스 파일을 받고 **본문을 내려받아 눈으로 확인했다.**
2차부터는 **R3F 의존 여부**를 함께 적는다. arena와 brand 모두 react-three-fiber를 도입하지 않았으므로
R3F 전용 저장소는 vanilla three에 그대로 못 얹는다(판정표 arena 행의 R3F 미도입 원칙).

| 저장소 | 실확인 라이선스 | 판정 | R3F 의존 | 용도 후보 | 확인 일자 |
|---|---|---|---|---|---|
| nytimes/three-story-controls | **Apache-2.0**(LICENSE, Copyright 2021 The New York Times Company). 아래 불일치 기록 참고 | 채택 가능 | 없음(three ^0.137 직접 의존) | **스크롤 카메라 시네마틱.** 월드빌딩과 제품 상세의 카메라 이동을 스크롤에 묶는 자리 | 2026-08-06 |
| PavelDoGreat/WebGL-Fluid-Simulation | MIT (LICENSE, Copyright 2017 Pavel Dobryakov) | 채택 가능 | 없음(package.json 자체가 없는 플레인 JS) | **vortex 유체 배경.** 히어로 뒤 소용돌이를 유체로 대체할 때의 1순위 | 2026-08-06 |
| cloydlau/webgl-fluid | MIT (LICENSE, Copyright 2020-present Cloyd Lau) | 채택 가능 | 없음(three 의존도 없음) | 위 저장소의 ESM 포크. npm 설치가 필요하면 이쪽 | 2026-08-06 |
| deepkolos/three-js-trail | MIT (LICENSE, Copyright 2023 DeepKolos) | 채택 가능 | 없음(three ^0.160 직접 의존) | **검끝 궤적 대안.** 지금은 arena 리본을 재사용 중이라 우선순위 낮음 | 2026-08-06 |
| svartmc/trails | MIT (LICENSE, Copyright 2020 svartmc) | 채택 가능 | 없음(플레인 JS) | 궤적 대안 2순위 | 2026-08-06 |
| richardevcom/threejs-z-fold-gift-card | MIT (LICENSE, Copyright 2025 richardevcom) | 채택 가능 | 없음(three ^0.181 직접 의존) | 접히는 카드 전환. 제품 상세 morph 후보 | 2026-08-06 |
| Saganaki22/MetalFlow | MIT (LICENSE, Copyright 2025 drbaph) | 채택 가능(1차 판정 재확인) | 없음(플레인 JS) | 크롬 타이포 재질 | 2026-08-06 |

**nytimes/three-story-controls 불일치 기록(ogl, segue, ahrs와 같은 규율).**

- GitHub API가 감지한 SPDX는 **`NOASSERTION`**이다. 즉 기계 판독으로는 라이선스가 안 잡힌다.
- 이유는 LICENSE 파일이 **Apache-2.0 전문이 아니라 짧은 고지문**이기 때문이다. 8행이고
  "Licensed under the Apache License, Version 2.0"과 "AS IS" 면책 문단만 있으며 본문 링크가 마크다운으로 적혀 있다.
- 다만 `package.json`의 `license` 필드는 **`Apache-2.0`**으로 명시돼 있다.
- **판정: 채택 가능.** 규칙이 요구하는 "LICENSE 파일에 Apache-2.0 명시"를 문자 그대로 만족한다.
  기계 판독이 실패했을 뿐 사람이 읽으면 어느 라이선스인지 한 줄로 드러난다.
  **도입 시 Apache-2.0 의무를 진다**(저작권 고지와 라이선스 사본 동봉, 변경 파일 표시). CREDITS에 그 사실을 함께 적는다.

## 열람 금지 목록 추가분 (B3 게이트)

아래 다섯은 **코드를 가져오지 않는 것은 물론 열어 보지도 않는다.** 기존 금지 목록(olivierlarose 전 저장소, cortiz2894, KalebKloppe, TrailRendererJS, adrianhajdin 원본, 게임 클론 전체)에 같은 지위로 더한다.

- wass08/r3f-ultimate-character-configurator
- Cuberto/bglines
- amandaghassaei/VortexShedding
- codrops/FullscreenLayoutPageTransitions
- JosephASG/codrops-cinematic-scroll-animations

**codrops 계정이라고 통과시키지 않는다.** 같은 계정 안에서도 `GridLayoutAnimation`은 LICENSE 파일이 있고 `FullscreenLayoutPageTransitions`는 없다. 저장소 단위로 확인한다.

**2차 게이트에서 추가된 금지 대상은 없다.** 7개 전부 라이선스 파일이 실재했다.

## 채택 가능이 곧 도입은 아니다

이 표는 **라이선스 게이트만** 통과시킨 것이다. 실제 도입은 BRAND_SITE_GUIDE 3절 코드 출처 계약대로 npm 실설치 또는 실클론 후 파일을 열어 읽고 결정하며, 도입한 것만 같은 커밋에서 CREDITS.md에 기록한다. **이 세션은 아무것도 설치하지 않았으므로 CREDITS는 건드리지 않았다.**

---

> # [presentation 개편 스택 판정 — 이 표가 조사 원문 추천보다 우선한다]
>
> 이 문서 하단 "presentation 개편 조사"(compass A 원문)의 추천 중 아래와 어긋나는 부분은 **이 판정표를 따른다.** 원문은 무수정으로 보존하되 채택은 이 표가 결정한다.
>
> ## 스택 판정 (조사와 다른 부분, 이 판정이 조사보다 우선)
>
> | 영역 | 조사 원문 추천 | 간합 판정 | 사유 |
> |---|---|---|---|
> | 통합 기반 | r3f-scroll-rig + R3F 도입 | **미도입** | A1에서 Lenis+ScrollTrigger 동기 루프가 이미 돌고 ScrollTrail 앵커 테이블이 그 위에 섰다. 스크롤 엔진 교체는 전면 회귀 위험. 스크럽은 canvas 2D로 충분해 three.js가 스크럽에는 불필요 |
> | 영상 스크럽 | canvas-scroll-clip(MIT) 설치 | **1순위: GSAP imageSequence 헬퍼 로직 포팅** (우리 ScrollTrigger 안에서 프레임 인덱스 트윈 + snap "frame" + curFrame 비교 redraw 방지). canvas-scroll-clip(MIT)은 포팅이 막힐 때의 **폴백**으로만 문서에 남긴다 | canvas-scroll-clip은 자체 스크롤 처리를 갖고 있어 우리 루프와 이중 리스너가 된다. 로직을 소유하면 ScrollTrail과 같은 진행률 원천을 쓴다 |
> | 배경 셰이더 | Codrops DOM 왜곡(원형) | **three.js 최소 도입(P5): 풀스크린 쿼드 1장 + snoise 프래그먼트, R3F 없이 플레인.** 콘텐츠 뒤 fixed 캔버스 레이어의 독립 일렁임 | DOM 왜곡 방식은 우리 구조상 불가. R3F 배제 판정과 일관 |
>
> **P5 실제 채택(갱신):** 위 표는 "three.js 최소 도입"이라 적었으나, 풀스크린 쿼드 1장 + snoise 프래그먼트 하나에는 three.js가 과해 **raw WebGL로 구현**했다(의존성 0, 번들 +5KB, R3F 배제 판정과 일관, 출력 동일). snoise만 Ashima/stegu(MIT) 이식.
>
> ## 라이선스 절대 규칙 (전 단계)
>
> - **MIT(와 GSAP 무료, Apache)만 코드 채택.** GSAP은 2025-04 전면 무료(Flip, ScrollTrigger, SplitText 포함, 상업 이용 포함).
> - **무라이선스 3종 복붙 절대 금지, 개념 학습만**: olivierlarose 전 저장소(64개, LICENSE 없음), cortiz2894/mouse-effects, KalebKloppe/scroll-image-sequence. 이들 코드가 한 줄이라도 복사되면 안 된다.
> - **Codrops와 CodePen 소스는 로직 개념 포팅이 기본**이고, 코드 복사는 해당 저장소의 LICENSE 파일을 실제로 확인해 MIT임을 검증한 뒤에만. 검증 못 하면 개념으로 자체 구현.
> - **셰이더 노이즈는 Ashima/stegu webgl-noise(MIT)의 snoise만 사용.**
> - **도입한 전부 CREDITS.md 기록**(이름, 라이선스, 위치, 링크). 안 쓰는 것 기재 금지.
>
> ---

> [채택 판정 확정] 이 조사에서 간합이 실제로 쓰는 것과 보류, 제외는 아래와 같다. 조사 원문의 추천과 다른 부분은 이 표가 우선한다.
>
> | 영역 | 지금 채택 | 보류(WebGL 승격 시) | 제외와 사유 |
> |---|---|---|---|
> | presentation | magnetic-elements(MIT). 한글 분해는 word 모드 기본 규칙. 프리로더는 자체 구현 | 없음 | SplitType 계열(GSAP SplitText 사용 중이라 중복), react-creative-cursor(brand로), barba(단일 페이지라 개념만) |
> | brand | ybouane/liquidglass(MIT) 1순위, react-creative-cursor(MIT), magnetic-elements 공용 | drei MeshTransmissionMaterial | glitchGL(듀얼 라이선스, postprocessing GlitchEffect로 대체 가능), Muggleee/liquid-glass(정식 LICENSE 파일 없음) |
> | arena | **승격 확정.** three.js(MIT), postprocessing(Zlib, AfterimagePass 포함), ribbon-geometry(MIT), three-screenshake(MIT, npm 상태 부실 시 로직 포팅), hitstop 자체 구현 | 없음 | rhy-game(자체 judge 완성으로 불필요), 무라이선스 2종(madgwick.js, WebRTCSmartphoneController), react-three-fiber(loop.js가 루프 주도권을 쥐어야 해서 미도입) |
> | controller | psiphi75/ahrs(Apache-2.0) C2에서 채택 | 없음 | WebRTC 계열(Socket.io 확정이라 개념만) |
>
> 원칙(갱신): arena는 three.js 1인칭으로 승격한다. 근거는 컨트롤러 쿼터니언이 1인칭 검 자세에 1대1로 꽂히고
> 궤적 리본과 포스트프로세싱이 GPU로 넘어가 성능 여유가 생긴다는 것이다.
> 단 **canvas 2D 렌더러를 삭제하지 않는다.** 렌더러 인터페이스 뒤로 옮겨 폴백으로 유지하고,
> WebGL 실패나 컨텍스트 손실 시 자동 전환한다. 이것이 렌더의 비상 컷이다.
> SlashSaber(CC-BY-4.0)는 구조를 참고하면 크레딧을 표기한다. 타임박스 3세션, 초과 시 2D 폴백으로 데모를 확정한다.

# GANHAP XR 펜싱 프로젝트 — 재사용 가능한 오픈소스 코드/기법 전수조사 보고서

## TL;DR
- **즉시 도입 가능한 "진짜 쓸 수 있는" 오픈소스는 확인됨**: 검격 트레일(yomotsu/ribbon-geometry MIT + honzaap/SlashSaber 구현 참고), 리퀴드 글래스(ybouane/liquidglass MIT, dashersw/liquid-glass-js MIT), 포스트프로세싱(pmndrs/postprocessing Zlib), 센서 퓨전(psiphi75/ahrs Apache-2.0)이 4개 영역(presentation/brand/arena/controller)을 모두 커버한다.
- **라이선스 지뢰 2종 + 조건부 3종 발견**: ZiCog/madgwick.js, EmmaPoliakova/WebRTCSmartphoneController은 **라이선스 파일이 없어 기본적으로 법적 사용 불가**(개념 참고만). naughtyduk/glitchGL은 **상업용 유료 라이선스**, honzaap/SlashSaber은 **CC-BY-4.0(출처표기 필수 + "star the repository" 조건)**, Muggleee/liquid-glass는 **README-only MIT(정식 LICENSE 파일 없음)**. 반면 SplitType는 무라이선스가 아니라 **ISC(허용형)**로 확인되어 사용 가능하다.
- **가장 안전한 채택 전략**: 코드 그대로 쓸 것은 MIT/Apache/Zlib/ISC 레포로 한정하고, 무라이선스·CC-NC·유료 레포는 "로직 포팅" 또는 "개념만"으로 다운그레이드하라. Vite+React 이식은 대부분 로직 포팅 수준이며, three.js 기반 라이브러리는 프레임워크 무관하게 그대로 이식 가능하다.

## Key Findings

### 라이선스 등급 요약 (경고 우선)
- 🟢 **그대로 사용 가능 (MIT/Apache/Zlib/ISC — OSI 허용형)**: pmndrs/postprocessing(Zlib), ybouane/liquidglass(MIT), dashersw/liquid-glass-js(MIT), yomotsu/ribbon-geometry(MIT), psiphi75/ahrs(Apache-2.0), juneekim7/rhy-game(MIT), felixmariotto/three-screenshake(MIT), sajmoni/screen-shake(MIT), ToonRombaut/magnetic-elements(MIT), lukePeavey/SplitType(ISC), three.js AfterimagePass(MIT), drei MeshTransmissionMaterial(MIT), xioTechnologies/Fusion(MIT)
- 🟡 **주의 (README-only MIT / 출처표기 / 유료조건)**: Muggleee/liquid-glass(정식 LICENSE 파일 없이 README만 MIT), honzaap/SlashSaber(CC-BY-4.0, 출처표기 + repo star 조건), naughtyduk/glitchGL(개인 무료·상업 유료 듀얼)
- 🔴 **경고 — 무라이선스 (기본 법적 사용 불가, 개념 참고만)**: ZiCog/madgwick.js, EmmaPoliakova/WebRTCSmartphoneController

## Details

### A. 발표/섹션 전환 인터랙션 (presentation)

**1. barbajs/barba (+ karanmhatre1/barba-page-transition-example)**
- URL: https://github.com/barbajs/barba , 예제 https://github.com/karanmhatre1/barba-page-transition-example
- 라이선스: barba 본체 MIT / 활동: 성숙한 표준 라이브러리, 예제 레포는 소규모
- 라이브 데모: 있음 | 영역: **presentation**
- 훔칠 핵심 기법: leave/enter/once 훅으로 로딩스크린 커튼 전환 구조화
- 이식 난이도: React SPA에서는 개념만(barba는 멀티페이지 전제) — Vite+React라면 클립패스 커튼 로직만 포팅

**2. Codrops "Custom Page Transitions in Astro with Barba.js + GSAP" (2026-04)**
- URL: https://tympanus.net/codrops/2026/04/08/creating-custom-page-transitions-in-astro-with-barba-js-and-gsap/
- 라이선스: Codrops 데모 코드는 통상 관대하나 각 데모 개별 확인 필요 | 영역: **presentation**
- 훔칠 핵심 기법: WebGL 노이즈 셰이더 리빌 전환(WebGLPageTransition 클래스), SVG 모핑/오버레이 전환
- 이식 난이도: 로직 포팅(셰이더 GLSL은 그대로 사용)

**3. thomson159/scrollytelling** (basementstudio 포크 — 본가는 이미 확보하여 제외했으나 포크 존재 명시)
- URL: https://github.com/thomson159/scrollytelling | 영역: **presentation**
- 훔칠 핵심 기법: GSAP ScrollTrigger를 React Context로 추상화한 Root/Animation/Waypoint 컴포넌트

**텍스트 등장 애니메이션 (SplitText 대안)**

**4. lukePeavey/SplitType** 🟢 (등급 상향 — 무라이선스 아님)
- URL: https://github.com/lukePeavey/SplitType , 데모 https://lukepeavey.github.io/SplitType
- 스타/활동: 약 726 stars, 최신 릴리스 v0.3.3(2022-10-29) — 기능적으로 안정되었으나 신규 개발은 정체
- 라이선스: **ISC**(package.json 및 npm `split-type` 명시. 소스 헤더에 `@license MIT` 혼재하나 배포 기준 ISC = OSI 허용형) → **사용 가능**
- 영역: presentation/brand (제목 등장) | 라이브 데모: 있음
- 훔칠 핵심 기법: 텍스트를 line/word/char span으로 분해, GSAP와 결합
- 이식 난이도: 그대로 씀. **단 한글은 char 분해 시 조합형/자소 분리 검증 필요**

**5. BytexDigital/splittext (React 네이티브 대안)** 🟢
- URL: https://github.com/BytexDigital/splittext | 영역: **presentation**
- 훔칠 핵심 기법: `<SplitText mode="char|word|line">` React 컴포넌트, resize 디바운스 재분해, 인라인 요소 지원
- 이식 난이도: 그대로 씀(React 전용) | 한글: word 모드 권장

**6. titoasty/TextSplitr, JakubKoralewski/split-text** — 경량 무료 대안(라이선스 개별 확인, 개념 참고용)

### B. 리퀴드 글래스/유리 질감 (brand)

**7. ybouane/liquidglass** 🟢 (brand 최우선)
- URL: https://github.com/ybouane/liquidglass , 데모 https://liquid-glass.ybouane.com/
- 스타/활동: 약 287 stars, 68 commits, 활동 중 | 라이선스: **MIT**(jsDelivr @ybouane/liquidglass v1.0.3 MIT 확인)
- 라이브 데모: 있음 | 영역: **brand**
- 훔칠 핵심 기법: "It captures the DOM content behind each glass element, processes it through a multi-pass rendering pipeline, and composites the result in real time" — 굴절+색수차+Fresnel+멀티라이트 스펙큘러+drop shadow, 유리-온-유리 레이어드 합성
- 이식 난이도: 그대로 씀(JS/TS, 프레임워크 무관). **주의**: 각 인스턴스가 자체 WebGL 컨텍스트를 열고(브라우저 상한 ~16개), html-to-image DOM 래스터화 비용이 큼 → arena canvas와 동시 사용 시 성능 검증 필수

**8. dashersw/liquid-glass-js** 🟢
- URL: https://github.com/dashersw/liquid-glass-js , 데모 https://dashersw.github.io/liquid-glass-js/
- 스타/활동: 약 302 stars, **단 1 커밋(단일 드롭 레포, 유지보수 기대 낮음)** | 라이선스: **MIT**(LICENSE 파일 있음)
- 영역: **brand**
- 훔칠 핵심 기법: 도형별(rounded rect/circle/pill) 셰이더 노멀 계산, 라이브 파라미터 컨트롤 패널, 네스티드 글래스(자식이 부모 출력 샘플링)
- 이식 난이도: 그대로 씀

**9. Muggleee/liquid-glass** 🟡
- URL: https://github.com/Muggleee/liquid-glass , 데모 http://liquid-glass.liziyang.design
- 스타/활동: 약 136 stars, 16 commits | 라이선스: **README만 MIT 표기, 정식 LICENSE 파일 없음**(법적 근거 약함 → 원저자에 파일 추가 요청 권장)
- 영역: **brand**
- 훔칠 핵심 기법: Vue3+Vite, SDF(sdCircle) 기반 굴절, WebGL2/GLSL ES 3.0, VAO 최적화
- 이식 난이도: 로직 포팅(Vue→React, 셰이더 GLSL은 그대로)

**10. pmndrs drei MeshTransmissionMaterial** 🟢
- URL: https://github.com/pmndrs/drei , 문서 https://drei.docs.pmnd.rs/shaders/mesh-transmission-material
- 라이선스: **MIT** | 영역: **brand** (+arena 유리검 옵션)
- 훔칠 핵심 기법: transmission/thickness/chromaticAberration/anisotropicBlur/distortion/temporalDistortion 파라미터로 물리 유리 재질, transmissionSampler로 버퍼 공유
- 이식 난이도: 그대로 씀(R3F 환경). **주의**: r3f v9.0 조합에서 "Feedback loop formed between Framebuffer and active Texture" 버그 보고 있음(#2261) → 버전 조합/샘플러 옵션 확인

### C. 궤적/트레일/잔상/파티클 (arena)

**11. honzaap/SlashSaber** 🟡 (arena 게임 전체 레퍼런스로 최고)
- URL: https://github.com/honzaap/SlashSaber , 데모 https://slashsaber.com
- 스타/활동: 약 72 stars / 14 forks, 91 commits | 라이선스: **CC-BY-4.0**(threejs3d.com 프로젝트 DB 확인. Blender 에셋은 "free to use under the condition that you star the repository" 명시) — 코드 재사용 시 **크레딧 표기 필수**
- 영역: **arena** (검격 게임 전체 스택)
- 훔칠 핵심 기법: three.js + cannon-es 물리 + three-nebula 파티클 + TrailRendererJS(TS 재작성)로 검 궤적, 방향 제한 슬래시 판정
- 이식 난이도: 로직 포팅(Vue→React). **이미 Vite 기반이라 빌드/에셋 파이프라인은 그대로 이식 가능**

**12. yomotsu/ribbon-geometry** 🟢 (arena 검끝 리본 최우선)
- URL: https://github.com/yomotsu/ribbon-geometry , 데모 https://yomotsu.github.io/ribbon-geometry/examples
- 스타/활동: 약 7 stars, 2 commits(최소/정체 — 자체 확장 전제) | 라이선스: **MIT**(npm `ribbon-geometry`)
- 영역: **arena** (검끝 리본 궤적)
- 훔칠 핵심 기법: three.js 주입식 리본 지오메트리 클래스(curve/twist/normal/twist-weight), 검끝 포인트 리스트→스트립 메시
- 이식 난이도: 그대로 씀(three.js)

**13. Averyano/wendel-moretti-gallery (RGB shift + film grain)**
- URL: https://github.com/Averyano/wendel-moretti-gallery | 영역: brand/arena
- 훔칠 핵심 기법: GLSL RGB shift + 노이즈 필름그레인, 무한 갤러리 스크롤(mesh 화면 밖 재배치)
- 이식 난이도: 로직 포팅(라이선스 개별 확인)

**14. GPGPU/FBO 파티클 (curl noise)**
- URL: mystaticself/curl-noise-particles, juniorxsound/Particle-Curl-Noise, iagokrt/curl-noise-threejs / R3F 참고 https://github.com/benjaminpreiss/gpgpu-curl-noise-dof-nextjs (**Next.js — Vite 이식 필요**)
- 영역: **arena** (명중 파티클 폭발/모핑)
- 훔칠 핵심 기법: ping-pong FBO로 백만 단위 파티클 위치 업데이트, curl noise 속도장(cabbibo/glsl-curl-noise + glslify)
- 이식 난이도: 로직 포팅(three 버전 주의, Next 예제는 useLoader 경로 조정)

**히트 이펙트 (screen shake / hitstop / time dilation)**

**15. felixmariotto/three-screenshake** 🟢
- URL: https://github.com/felixmariotto/three-screenshake , 데모 jsfiddle.net/e4h931co
- 스타/활동: 약 19 stars, 14 commits | 라이선스: **MIT** | 영역: **arena** (명중 카메라 셰이크)
- 훔칠 핵심 기법: `screenShake.shake(camera, new THREE.Vector3(0.1,0,0), 300)` — three.js 카메라 클라이맥스 오프셋 셰이크
- 이식 난이도: 그대로 씀

**16. sajmoni/screen-shake** 🟢
- URL: https://github.com/sajmoni/screen-shake , npm `screen-shake`
- 스타/활동: 약 5 stars, 최신 릴리스 v0.2.1(2025-02-25), 의존성 0, TypeScript | 라이선스: **MIT**
- 영역: **arena** (canvas 2D 셰이크)
- 훔칠 핵심 기법: trauma 기반 노이즈 보간(angle/offsetX/offsetY 반환), maxAngle/duration/speed 설정 — 게임루프 친화
- 이식 난이도: 그대로 씀

**17. hitstop/game-feel 개념 레퍼런스**
- URL: https://valdemird.com/blog/game-feel-on-the-web/
- 영역: **arena** | 훔칠 핵심 기법: "At the exact frame of impact, the game stops time for a few dozen milliseconds" — 충돌 프레임에서 setTimeout 60~90ms 프리즈(hitlag)로 타격감 연출(슬라이더 데모 포함)
- 이식 난이도: 개념만(자체 구현)

### D. 셰이더 이펙트 모음 (arena + brand)

**18. pmndrs/postprocessing** 🟢 (arena+brand 셰이더 코어, 전체 최우선)
- URL: https://github.com/pmndrs/postprocessing , 데모 https://pmndrs.github.io/postprocessing
- 스타/활동: 약 2.8k stars, ~2,888 commits, 최신 릴리스 **v6.38.2(2025-12-22)** — 생태계 최고 활발
- 라이선스: **Zlib** (README: "This library is licensed under the Zlib license. The original code ... written by mrdoob and the three.js contributors and is licensed under the MIT license." — 둘 다 허용형)
- 영역: **arena + brand 공용**
- 훔칠 핵심 기법: EffectPass 자동 병합(단일 셰이더로 다중 이펙트), BloomEffect/GlitchEffect/ChromaticAberration/ShockWaveEffect(충격파·물결), 커스텀 Effect의 `mainImage()` 작성
- 이식 난이도: 그대로 씀(three.js). R3F는 @react-three/postprocessing 래퍼

**19. ShockWave 이펙트 (충격파/물결)**
- URL: 원본 postprocessing ShockWaveEffect / Vue 문서 https://post-processing.tresjs.org/guide/pmndrs/shock-wave
- 영역: **arena** (명중 순간 물결) | 훔칠 핵심 기법: epicenter를 화면좌표로 project 후 시간기반 radius 확장(반드시 render 루프에 delta 전달 — delta 누락이 흔한 버그)
- 이식 난이도: 로직 포팅(코어는 #18에서 그대로)

**20. naughtyduk/glitchGL** 🟡
- URL: https://github.com/naughtyduk/glitchGL , 데모 있음, npm `glitch-gl`
- 스타/활동: 약 86 stars, v1.0.6 | 라이선스: **듀얼(개인/포트폴리오/학술 무료, 상업 유료)** — **상업 프로젝트면 유료 라이선스 필요**
- 영역: **arena + brand** (글리치/CRT/픽셀레이션)
- 훔칠 핵심 기법: pixelation+crt+glitch 모듈 조합, rgbShift/curvature/scanline/dithering(floyd-steinberg·bayer) 파라미터
- 이식 난이도: 그대로 씀(단 라이선스 조건 확인 필수)

**21. jeromeetienne/threex.badtvpproc, josdirksen/learning-threejs (RGBShiftShader)**
- 영역: arena/brand | 훔칠 핵심 기법: RGBShiftShader, bad TV 후처리(스캔라인/왜곡), 12종 셰이더 스위처
- 이식 난이도: 로직 포팅(오래된 three 버전 → 최신 API 갱신 필요)

**모션블러/잔상**

**22. three.js AfterimagePass (공식 addon)** 🟢 (arena 잔상 최우선)
- URL: https://threejs.org/examples/webgl_postprocessing_afterimage.html , docs pages/AfterimagePass
- 라이선스: **MIT**(three.js) | 영역: **arena** (검격 잔상/고스팅)
- 훔칠 핵심 기법: `new AfterimagePass(0.9)` damp 값(0.0~1.0)으로 잔상 강도 런타임 조절
- 이식 난이도: 그대로 씀

**23. gkjohnson per-object motion blur**
- URL: https://github.com/mrdoob/three.js/pull/14510 , 데모 https://gkjohnson.github.io/threejs-sandbox/motionBlurPass/
- 라이선스: MIT(three.js 생태계) | 영역: **arena** (검 오브젝트 모션블러)
- 훔칠 핵심 기법: velocity buffer(이전/현재 프레임 위치)로 오브젝트별 스미어, samples/expand/smearIntensity/maxSmearFactor 옵션
- 이식 난이도: 로직 포팅(샌드박스 코드)

### E. 마감/폴리시/마이크로 인터랙션

**24. ToonRombaut/magnetic-elements** 🟢
- URL: https://github.com/ToonRombaut/magnetic-elements , 데모 magnetic-elements.netlify.app
- 스타/활동: 약 2 stars, 8 commits | 라이선스: **MIT**(npm `@toon.rombaut/magnetic-elements`)
- 영역: **brand/presentation** (자석 버튼)
- 훔칠 핵심 기법: lerp 보간 자석 인력, triggerArea/magneticForce/interpolationFactor 설정, 외부 RAF 연동 가능
- 이식 난이도: 그대로 씀

**25. ehsan-shv/react-creative-cursor** 🟢
- URL: https://github.com/ehsan-shv/react-creative-cursor
- 영역: **brand** (블렌드모드/젤리 커서) | 훔칠 핵심 기법: isGelly 젤리 애니메이션, data-cursor-magnetic 속성, exclusion 블렌드모드(cuberto/14islands 영감)
- 이식 난이도: 그대로 씀(React 전용)

**26. ajmnz/custom-cursor-react, Phazr-Inc/react-custom-cursor**
- 영역: brand | 훔칠 핵심 기법: difference 블렌드모드 커서, 타겟 셀렉터 hover 스케일, SSR 호환
- 이식 난이도: 그대로 씀

**프리로더**

**27. Experience-Monks/webgl-react-boilerplate**
- URL: https://github.com/Experience-Monks/webgl-react-boilerplate
- 영역: **arena/presentation** (WebGL 프리로드 + 씬 관리)
- 훔칠 핵심 기법: GPU 오브젝트 프리로드, Transition Pass(씬 블렌딩), FXAA/Film Pass 표준 구조
- 이식 난이도: 로직 포팅(Flow 타입 → JSX)

**28. 14islands progressive enhancement 패턴**
- URL: https://14islands.com/blog/progressive-enhancement-with-webgl-and-react
- 영역: presentation/brand | 훔칠 핵심 기법: 프리로더 애니메이션 중 전체 WebGL 오브젝트 생성 + 텍스처 프리렌더로 GPU 업로드 랙 제거
- 이식 난이도: 개념만

**View Transitions API / 오디오 반응 / 햅틱**: 검색 예산 소진으로 이번 라운드 미검증(Caveats 참조).

### F. 펜싱/검술/스포츠 시각화 (콘텐츠 직결)

**29. Sebachowa/pixel-wars (펜싱 게임)**
- URL: https://github.com/Sebachowa/pixel-wars | 영역: **arena** (펜싱 게임 로직)
- 훔칠 핵심 기법: HTML/CSS/JS 펜싱 대전 상태머신
- 이식 난이도: 로직 포팅(라이선스 개별 확인 필요)

**30. MindDock/sport-vision (실시간 골격 추적 + 동작 인식)**
- URL: https://github.com/MindDock/sport-vision | 영역: **arena/controller** (포즈 스켈레톤 오버레이)
- 훔칠 핵심 기법: MediaPipe 13 keypoints → WebSocket JSON → Canvas 스켈레톤 오버레이 + 게이지/히트맵, 다크 네온 디자인 시스템
- 이식 난이도: 로직 포팅(백엔드 FastAPI, 프론트 Canvas 부분만 발췌)

**31. davidpagnon/Sports2D (2D 포즈/각도)**
- URL: https://github.com/davidpagnon/Sports2D | 영역: arena (모션 각도 시각화 참고)
- 훔칠 핵심 기법: 웹캠/영상에서 2D 관절 각도 계산·스켈레톤 렌더
- 이식 난이도: 개념만(Python)

**32. deep2universe/YouTube-Motion-Tracking (모션→게임/이펙트)**
- URL: https://github.com/deep2universe/YouTube-Motion-Tracking | 영역: **arena** (모션 트래킹 이펙트)
- 훔칠 핵심 기법: TensorFlow.js MoveNet 포즈 감지 + Proton 파티클로 스켈레톤 이펙트(불꽃/서리/번개 13종)
- 이식 난이도: 로직 포팅(크롬 확장 → 웹앱)

**리듬/타이밍 판정 게임**

**33. juneekim7/rhy-game** 🟢 (arena 판정 로직 최우선)
- URL: https://github.com/juneekim7/rhy-game , 데모 rhy-game.netlify.app
- 스타/활동: 약 14 stars, 95 commits | 라이선스: **MIT**(npm `rhy-game`)
- 영역: **arena** (명중 타이밍 판정)
- 훔칠 핵심 기법: `new Judgement(name, time, scoreRatio, isCombo)` 판정 윈도우(예: perfect 50ms / great 100ms / bad 500ms), miss 자동 생성, 콤보·스코어 계산
- 이식 난이도: 그대로 씀(순수 로직 라이브러리)

### G. 폰 센서/멀티디바이스 (controller)

**34. EmmaPoliakova/WebRTCSmartphoneController** 🔴
- URL: https://github.com/EmmaPoliakova/WebRTCSmartphoneController , 데모 emmapoliakova.github.io/WebRTCSmartphoneController
- 스타/활동: 약 10 stars, 151 commits | 라이선스: **라이선스 파일 없음 → 기본 법적 사용 불가**(개념 참고만)
- 영역: **controller** (폰→PC 컨트롤러)
- 훔칠 핵심 기법: PeerJS/WebRTC + QRcode 페어링, 폰 입력 패키징 전송, nipplejs 조이스틱/handpose 핸드트래킹
- 이식 난이도: 개념만(무라이선스 + 프로젝트는 Socket.io 사용이므로 아키텍처 참고만)

**35. Smilebags/realtime-p2p-game (WebRTC 멀티디바이스)**
- URL: https://github.com/Smilebags/realtime-p2p-game | 영역: **controller**
- 훔칠 핵심 기법: PeerJS로 폰이 중앙화면 호스트에 직접 연결, 저지연 로컬네트워크 컨트롤러 PoC
- 이식 난이도: 로직 포팅(라이선스 개별 확인)

**36. marcoklein/remotegamepad**
- URL: https://github.com/marcoklein/remotegamepad , 데모 marcoklein.github.io/remotegamepad | 영역: **controller**
- 훔칠 핵심 기법: PeerJS로 폰 게임패드를 네이티브 Gamepad API에 매핑, HTML5 canvas 패드/버튼 클래스
- 이식 난이도: 로직 포팅

**37. yuanchuan/game-controller**
- URL: https://github.com/yuanchuan/game-controller | 영역: controller
- 훔칠 핵심 기법: 폰을 게임 컨트롤러로 쓰는 최소 구현
- 이식 난이도: 로직 포팅

**센서 퓨전 (쿼터니언/Madgwick)**

**38. psiphi75/ahrs** 🟢 (controller 센서 최우선 — madgwick.js 대체)
- URL: https://github.com/psiphi75/ahrs , npm `ahrs`
- 스타/활동: 약 91~96 stars, 52 commits | 라이선스: **Apache-2.0**(허용형)
- 영역: **controller** (검 자세 추정)
- 훔칠 핵심 기법: "The Madgwick or Mahony algorithms can be used to filter data in real time" — compass/gyro/accel 융합, `getQuaternion()`(x,y,z,w) 반환, sampleInterval/beta/kp/ki 튜닝
- 이식 난이도: 그대로 씀

**39. ZiCog/madgwick.js** 🔴
- URL: https://github.com/ZiCog/madgwick.js
- 스타/활동: 약 35 stars, 방치(구 three.js/Chrome앱 시대) | 라이선스: **라이선스 파일 없음 → 기본 법적 사용 불가**
- 영역: controller | 훔칠 핵심 기법: MadgwickAHRS.c/MahonyAHRS.c의 JS 수동 이식
- 이식 난이도: 개념만 — **psiphi75/ahrs(Apache-2.0)로 대체하라**

**40. xioTechnologies/Fusion (원본, 알고리즘 참고)** 🟢
- URL: https://github.com/xioTechnologies/Fusion | 라이선스: **MIT** | 영역: controller
- 훔칠 핵심 기법: Madgwick 박사논문 개정 AHRS(가속도/자기 rejection, startup recovery, NWU/ENU/NED 축)
- 이식 난이도: 개념만(C/Python) — 알고리즘 정본으로 참고

## Recommendations

### 카테고리별 최우선 채택 Top 3
1. **arena 시각효과**: ① pmndrs/postprocessing(Zlib) — 글리치/블룸/충격파 원스톱 ② three.js AfterimagePass(MIT) — 검격 잔상 ③ yomotsu/ribbon-geometry(MIT) — 검끝 리본 (게임 전체 구조는 honzaap/SlashSaber을 CC-BY 크레딧 조건으로 참고)
2. **brand 유리질감**: ① ybouane/liquidglass(MIT) — DOM 위 유리 UI ② drei MeshTransmissionMaterial(MIT) — 3D 유리검/오브젝트 ③ dashersw/liquid-glass-js(MIT)
3. **controller 센서**: ① psiphi75/ahrs(Apache-2.0) — 쿼터니언 필터 ② Smilebags/realtime-p2p-game — WebRTC 컨트롤러 구조 ③ marcoklein/remotegamepad — Gamepad API 매핑

### 전체 즉시 도입 Top 10 (라이선스 안전 + 활동성 우선)
1. **pmndrs/postprocessing** (Zlib) — arena/brand 셰이더 코어, 2025-12 릴리스로 가장 활발
2. **ybouane/liquidglass** (MIT) — brand 히어로 유리
3. **three.js AfterimagePass** (MIT) — arena 잔상
4. **psiphi75/ahrs** (Apache-2.0) — controller 자세추정
5. **drei MeshTransmissionMaterial** (MIT) — brand/arena 유리재질
6. **yomotsu/ribbon-geometry** (MIT) — arena 검격 리본
7. **felixmariotto/three-screenshake** (MIT) — arena 명중 셰이크
8. **juneekim7/rhy-game** (MIT) — arena 타이밍 판정 로직
9. **ToonRombaut/magnetic-elements** (MIT) — presentation/brand 자석버튼
10. **lukePeavey/SplitType** (ISC) 또는 BytexDigital/splittext(React) — presentation 텍스트 등장

### 단계별 실행안 및 판정 기준
- **1단계(주차 1)**: 라이선스 그린리스트 확정 후 postprocessing + AfterimagePass + ribbon-geometry로 arena 프로토타입. **벤치**: 노트북 브라우저에서 60fps 유지 여부. 미달 시 AfterimagePass damp↓ 또는 파티클 수 축소.
- **2단계(주차 2)**: liquidglass/drei로 brand 히어로 구축. **판정 기준**: liquidglass의 html-to-image 래스터화 + WebGL 컨텍스트가 arena canvas와 동시 구동 시 프레임 드랍하면 → brand/arena를 라우트 분리하거나 brand는 CSS backdrop-filter 폴백으로 다운그레이드.
- **3단계(주차 3)**: psiphi75/ahrs + Socket.io로 controller. **판정 기준**: 검끝 자세 지터가 크면 Madgwick beta를 0.4→0.1로 하향(지연↑ 대신 안정), 그래도 드리프트면 Mahony(kp/ki) 전환.
- **재평가 트리거**: 🟡/🔴 레포를 프로덕션에 쓰려면 → SlashSaber(CC-BY: 크레딧 명기), glitchGL(상업 유료 구매 or postprocessing GlitchEffect로 교체), madgwick.js/WebRTCSmartphoneController(무라이선스: 자체 구현 or 대체재로 교체), Muggleee/liquid-glass(원저자에 LICENSE 파일 요청).

## Caveats
- **검색 예산 소진으로 미검증 항목**: curtains.js 히어로 클립패스 리빌, View Transitions API 최신 SPA 사례/폴리필, howler.js 이후 오디오 반응 라이브러리(타격음 레이턴시), 햅틱 패턴 웹 구현 — 후속 조사 필요.
- **라이선스는 스냅샷**: 스타/커밋/릴리스/라이선스는 2026년 8월 확인 기준이며 GitHub 렌더링 한계로 일부 레포의 정확한 "마지막 커밋 날짜"는 미확정(커밋 수로 대체). 정식 채택 전 각 레포 LICENSE 파일 재확인 필수, 특히 **README-only MIT 표기(Muggleee/liquid-glass)**는 정식 파일이 아니다.
- **무라이선스 = 저작권 전부 보유**: GitHub 공개 ≠ 사용 허가. madgwick.js/WebRTCSmartphoneController은 원저자 허락 없이는 개념 참고만 가능. **정정**: 초안에서 무라이선스로 분류했던 SplitType는 실제로 ISC(package.json/npm 기준)이므로 사용 가능하다.
- **CC-BY-4.0(SlashSaber) 주의**: 코드용으로 이례적인 라이선스로, 재사용 시 원저자 크레딧 표기 의무가 있고 에셋은 "레포 star" 조건이 붙는다. 상업 배포 시 법률 검토 권장.
- **Next.js/Vue 전용 주의**: GPGPU curl-noise R3F 예제(benjaminpreiss)는 Next.js, Muggleee/liquid-glass와 ShockWave(TresJS)는 Vue 기반 — Vite+React 이식 시 three 버전·useLoader 경로·컴포넌트 래퍼 조정 필요. 셰이더 GLSL 자체는 프레임워크 무관하게 그대로 이식된다.
- **한글 텍스트 분해**: SplitText류(SplitType/splittext)는 라틴 문자 기준 설계 — 한글 char 분해 시 조합형/자소 분리 및 줄바꿈(word-break) 검증을 반드시 수행할 것. word 모드가 가장 안전하다.

---

## presentation 개편 조사 (compass A 원문, 무수정)

# 간합(GANHAP) XR 펜싱 프레젠테이션: 오픈소스 인터랙션 기법 전수조사

> 결론부터: 최우선 과제인 "펜싱 선수 영상 스크럽"은 자체 엔진을 흉내 낼 필요 없이 **MIT 라이선스 오픈소스 3종(canvas-scroll-clip · react-scroll-media · GreenSock imageSequence 헬퍼)** 으로 코드를 거의 그대로 가져와 만들 수 있으며, ffmpeg 전처리까지 `scroll-scrub-starter`가 통째로 제공한다. 나머지 4개 기법(유리 카드·마우스 셰이더·섹션 전환·통합 스타터)도 채택 가능한 MIT 소스가 충분하지만, 인기 튜토리얼의 상당수는 **LICENSE 파일이 없는 "무라이선스(all rights reserved)"** 이므로 반드시 제외·경고 처리해야 한다.

## TL;DR
- **1번(영상 스크럽, 최우선):** `m5kr1pka/canvas-scroll-clip`(MIT, 115★, 무의존) + `iam-saiteja/react-scroll-media`(MIT, TS·의존성 0) + GreenSock 공식 `imageSequence` 헬퍼(2025년 4월부터 GSAP 전면 무료)로 즉시 구현. 영상→프레임 파이프라인은 `timkosters/scroll-scrub-starter`(MIT)의 `./build.sh video.mp4` 한 줄로 해결.
- **2~5번:** 유리 카드(Codrops 3D Glass Portal + GSAP stagger), 마우스 셰이더(Codrops Water/Pixel Distortion), 섹션 전환(GSAP Flip·clip-path·gl-transitions), 통합 스타터(`14islands/r3f-scroll-rig` MIT, `darkroomengineering/satus` MIT) — 모두 소스 공개. 단 **olivierlarose 튜토리얼 전체(64개 저장소)·cortiz2894/mouse-effects·KalebKloppe/scroll-image-sequence는 무라이선스라 복붙 금지, 개념만 학습**.
- **구현 원칙:** Vite+R3F 스켈레톤 → Lenis+ScrollTrigger 동기화 → 영상 스크럽 → 유리 카드 → 배경 셰이더 → 전환 순서로 쌓으면 회귀·할루시네이션을 최소화. 화려함보다 정보 위계 우선, 과한 효과는 명시적으로 경고.

## Key Findings
1. **이미지 시퀀스 스크럽이 가장 풍부**하며, 드물게 React 이식·타입스크립트·접근성까지 끝난 MIT 라이브러리가 2개(`canvas-scroll-clip`, `react-scroll-media`) 존재한다. 펜싱 아이디어의 핵심을 사실상 "설치만으로" 확보 가능.
2. **무라이선스 함정이 크다.** 검색 상위에 노출되는 인기 창작 튜토리얼 저자 **olivierlarose는 64개 공개 저장소(팔로워 1.3k)를 운영하지만 어느 것에도 LICENSE 파일이 없다**(awwwards-landing-page ★211, nextjs-framer-page-transition ★82, cards-parallax ★68, 3d-distorted-glass-effect ★55 등 — 출처 github.com/olivierlarose). 코드는 공개돼 열람·학습 가능하나, 법적으로는 "all rights reserved"이므로 MIT/Apache/CC0/CC-BY 요건 미충족 → **개념 학습만, 복붙 금지**.
3. **GSAP은 2025년 4월 Webflow의 GreenSock 인수 이후 100% 무료**가 되었다. Codrops/Webflow 공식 발표(2025-05-14) verbatim: *"we've all read the wonderful news about GSAP now becoming 100% free, for everyone. Thanks to Webflow's support, all of the previously paid plugins in GSAP are now accessible to everyone"* — SplitText·MorphSVG·ScrollTrigger·**Flip 포함, 상업적 이용 포함**(출처 tympanus.net/codrops, webflow.com/blog/gsap-becomes-free). 따라서 GreenSock 공식 CodePen 데모는 전부 안전하게 채택 가능.
4. **Codrops 데모는 대부분 GitHub(codrops org)에서 MIT로 공개**되나, 개별 저장소마다 라이선스 재확인이 필요(일부는 블로그 본문 스니펫만 제공).

---

## Details

### 1. 스크롤 연동 이미지 시퀀스 / 영상 프레임 스크러빙 (최우선 · 펜싱 선수)

가장 많이 조사한 영역이다. 채택 우선순위 순으로 정렬했다.

**A. m5kr1pka/canvas-scroll-clip** ⭐ 1순위
- URL: https://github.com/m5kr1pka/canvas-scroll-clip · 데모: Storybook(m5kr1pka.github.io/canvas-scroll-clip)
- 라이선스: **MIT (LICENSE 파일 확인, GitHub 감지됨)** · 115★
- 라이브 데모: 있음(Storybook + React Gist 예제)
- 섹션: **영상스크럽(펜싱 선수)**
- 이식 난이도: **그대로 씀** — npm 설치. npm 레지스트리 확인 결과 `canvas-scroll-clip@1.3.2`, MIT, 119kB, **third-party 의존성 0**.
- 훔칠 핵심: `new CanvasScrollClip(el, {framePath, frameCount, scrollArea})` 세 옵션만. 기본 `scrollArea`는 이미지 높이의 2배, 시퀀스 파일명은 최소 2자리 leading-zero 필요(예: `frame_0001.jpg`).

**B. iam-saiteja/react-scroll-media** ⭐ React 네이티브 1순위
- URL: https://github.com/iam-saiteja/react-scroll-media · 데모: react-scroll-media.pages.dev
- 라이선스: **MIT** — README 라이선스 섹션 verbatim: *"MIT © 2026 Thanniru Sai Teja"*. 릴리스 5개(최신 v1.1.0 "Enhance security features", 2026-02-13).
- 라이브 데모: 있음
- 섹션: **영상스크럽**
- 이식 난이도: **그대로 씀** — TypeScript 100%, 의존성 0, 번들 gzip ~7.11kB, SSR 안전, `prefers-reduced-motion` 자동 감지 + canvas `role="img"` 접근성 내장.
- 훔칠 핵심: CSS sticky로 컴포지터 스레드 처리 → 지터 제거. **메모리 벤치마크(1080p 기준): eager 500프레임=46MB, 1000프레임=57MB(High RAM); lazy 1000프레임=45MB로 평탄 유지(⭐권장), 기본 lazy 버퍼 ±10프레임.** 펜싱 영상이 길면 `lazy` 모드로.

**C. GreenSock `imageSequence` 공식 헬퍼**
- URL: https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub/ · 데모: https://codepen.io/GreenSock/pen/VwgevYW
- 라이선스: **GSAP 무료(2025년 4월 전면 무료)**
- 라이브 데모: 있음
- 섹션: 영상스크럽(라이브러리 대신 로직 직접 소유하고 싶을 때)
- 이식 난이도: 로직 포팅(React `useGSAP` 훅 안에서 호출)
- 훔칠 핵심: `playhead={frame:0}` 프록시를 ScrollTrigger로 트윈하고 `snap:"frame"`으로 정수 프레임 스냅, `curFrame` 비교로 불필요한 redraw 방지 후 canvas에 `drawImage`.

**D. timkosters/scroll-scrub-starter** (ffmpeg 전처리 파이프라인)
- URL: https://github.com/timkosters/scroll-scrub-starter · 데모 4개(video-scroll-*.vercel.app)
- 라이선스: MIT(README에 *"MIT. Fork it, ship it."* 명시 — 단 별도 LICENSE 파일은 없음. 의도는 명확한 MIT)
- 라이브 데모: 있음(4개)
- 섹션: **영상스크럽 전처리**(CLI/에이전트 스킬, JS 라이브러리 아님)
- 이식 난이도: 개념/CLI 활용
- 훔칠 핵심: `./build.sh video.mp4` → 영상을 프레임(JPEG/WebP)으로 추출 → 정적 스크럽 사이트 자동 생성. `--transparent` 플래그는 ffmpeg colorkey로 흰/녹/검 배경 제거(펜싱 선수를 배경에서 오려낼 때 유용). 10초·24fps=240프레임.

**E. React + GSAP 튜토리얼 (Pragmattic / Loopspeed)**
- URL: https://blog.pragmattic.dev/scroll-driven-image-sequence-header , https://blog.loopspeed.co.uk/scroll-driven-image-sequence-header
- 라이선스: 블로그 게시 코드 스니펫(참고·학습용; 저작권 표기 확인 권장)
- 라이브 데모: 있음
- 섹션: **표지 히어로 스크럽**
- 이식 난이도: 그대로 씀에 가까움(React `useGSAP` + canvas pin, 헤더 높이 200vh)
- 훔칠 핵심: 마운트 시 전 프레임 프리로드 → 프레임 1 즉시 렌더 → ScrollTrigger progress로 프레임 인덱스 계산. 투명 프레임은 매 프레임 `clearRect` 필수.

**F. AliKlein React CodePen**
- URL: https://codepen.io/AliKlein/pen/dyOqrEB
- 라이선스: CodePen 기본(참고용)
- 섹션: 영상스크럽 + 텍스트 레이아웃
- 이식 난이도: 로직 포팅
- 훔칠 핵심: canvas는 `position:sticky; top:50%`, 텍스트는 `.content`(position:relative)로 스크롤 시 생기는 빈 공간에 배치 → "스크롤에 따라 텍스트가 나타나는" 요구사항 그대로 충족.

**G. 프리로딩·성능 최적화 (Motion.page 문서)**
- URL: https://motion.page/docs/sdk/image-sequence
- 훔칠 핵심(수백 장 로딩 대비): ① `HTMLImageElement.decode()`/`createImageBitmap()`로 디코드 선처리(메인 스레드 밖) ② IntersectionObserver로 섹션 근접 시 지연 프리로드 ③ `Math.min(devicePixelRatio, 2)`로 DPR 캡(고밀도 화면 버퍼 과대화 방지) ④ WebP/AVIF 우선(알파 필요할 때만 PNG) ⑤ 필요 시 2프레임당 1장 스킵으로 요청 반감 ⑥ 프레임 1은 로드 즉시 그려 빈 canvas 방지.

**⚠️ 제외: KalebKloppe/scroll-image-sequence** — https://github.com/KalebKloppe/scroll-image-sequence · **LICENSE 파일 없음 = 무라이선스(all rights reserved)**, 0★, 라이브 데모 없음. `<img>` 대상 sticky 방식 아이디어만 참고, 코드 복붙 금지.

---

### 2. 리퀴드 글래스 / 글래스모피즘 카드 (가로 3개 부상)

이미 확보한 `ybouane/liquidglass`, `dashersw/liquid-glass-js`, drei `MeshTransmissionMaterial` 외의 추가 소스, 특히 **스크롤 결합 패턴** 위주.

**A. Codrops "3D Glass Portal Card" (R3F + MeshTransmissionMaterial + Gaussian Splatting)**
- URL: https://tympanus.net/codrops/2023/11/29/3d-glass-portal-card-effect-with-react-three-fiber-and-gaussian-splatting/
- 라이선스: Codrops(대체로 MIT — codrops GitHub org 저장소 확인 권장)
- 라이브 데모: 있음(본문에 데모/코드 링크)
- 섹션: **리서치카드**
- 이식 난이도: 로직 포팅
- 훔칠 핵심: `state.gl.setRenderTarget(buffer)`로 유리 뒤 씬을 **한 번만** 렌더 → `<MeshTransmissionMaterial buffer={buffer.texture}>`로 포털 효과 + 렌더 최적화 동시 달성. 유리엔 반드시 HDR/EXR 환경광 필요.

**B. GSAP 카드 stagger 부상 (GreenSock 공식)**
- URL: https://codepen.io/GreenSock/pen/NWqEepW (스크롤 위치 기반 fade-in) · https://codepen.io/narliecholler/pen/WNKZWvv (yPercent:100 stagger)
- 라이선스: **GSAP 무료**
- 라이브 데모: 있음
- 섹션: **리서치카드**(가로 3개 순차 부상)
- 이식 난이도: 그대로 씀
- 훔칠 핵심: `gsap.from('.card',{yPercent:100, stagger:0.5, scrollTrigger:{trigger:'.cards', scrub:true, pin:true}})` — 아래에서 순차로 떠오름. 유리 카드 3개에 `stagger:0.15` 정도로 절제.

**C. jmarellanes "Interactive Team Reveal" (GSAP + Lenis 스택 카드)**
- URL: https://codepen.io/jmarellanes/full/PwzMQrm
- 라이선스: CodePen 기본(참고용)
- 라이브 데모: 있음
- 섹션: 리서치카드
- 훔칠 핵심: 카드 pin + 순차 진입 + CSS `@layer`·logical property 반응형. Lenis와 이미 결합돼 있어 우리 스택과 정합.

**⚠️ 제외: olivierlarose "3D Glass Effect"** — https://blog.olivierlarose.com/tutorials/3d-glass-effect · 저장소 무라이선스. MeshTransmissionMaterial 사용법 **개념만** 학습(대체재로 위 A·drei 공식 예제 사용).

---

### 3. 마우스 반응 셰이더 배경 (파도/왜곡/일렁임)

**A. Codrops "Water-like Distortion Effect"**
- URL: https://tympanus.net/codrops/2019/10/08/creating-a-water-like-distortion-effect-with-three-js/
- 라이선스: Codrops(저장소 확인 권장)
- 라이브 데모: 있음
- 섹션: **배경 인터랙션**
- 훔칠 핵심: canvas에 ripple을 그려 색상 채널에 데이터 인코딩 → 포스트프로세싱에서 render 왜곡. ripple은 나이 들수록 `intensity = 1 - age/maxAge`로 opacity 감소.

**B. Codrops "Pixel Distortion Effect"**
- URL: https://tympanus.net/codrops/2022/01/12/pixel-distortion-effect-with-three-js/
- 라이선스: Codrops
- 라이브 데모: 있음
- 섹션: 배경 인터랙션(커서 주변 왜곡)
- 훔칠 핵심: DataTexture 그리드 각 셀에 마우스 위치/속도 기록 → `gl_FragColor = texture2D(uTexture, newUV - 0.02*offset.rg)`로 UV 왜곡, 정지 시 relax로 자연 감쇠.

**C. VoXelo "Interactive 3D Shader Ripple" (CodePen, three.js r128)**
- URL: https://codepen.io/VoXelo/pen/GRVbwbw
- 라이선스: CodePen 기본(전체 소스 공개)
- 라이브 데모: 있음
- 섹션: 배경 인터랙션
- 훔칠 핵심: simplex noise(`snoise`) 기반 프래그먼트 셰이더 + `mouse`/`clickPosition` 유니폼으로 어두운 배경 위 은은한 일렁임. 전체 인라인 소스라 참고 편함.

**⚠️ 제외: cortiz2894/mouse-effects & dghez/mouse-effects-webgl-water** — https://github.com/cortiz2894/mouse-effects (29★) 및 그 fork. **LICENSE 파일 없음 = 무라이선스**. water ripple/image trail/liquid mask 3종 묶음이 매력적이나 코드 복붙 금지. 라이브 데모(mouse-effects.vercel.app)는 **느낌 참고 전용**.

**⚠️ 위계 경고:** 배경 셰이더는 어두운 배경 위 **낮은 displacement 강도의 은은한 일렁임만** 허용. 텍스트/카드 가독성을 해치면 즉시 강도 축소 또는 제거. 마우스 왜곡이 정보 위에서 춤추면 발표 내용 전달을 방해한다.

---

### 4. 섹션 전환 (빨려들어가는/모핑 전환)

barba.js 본체는 이미 확보했으므로 **셰이더/모핑 전환 데모** 위주.

**A. gl-transitions/gl-transitions**
- URL: https://github.com/gl-transitions/gl-transitions
- 라이선스: 오픈 컬렉션(저장소 라이선스 확인 권장 — GL Transitions는 통상 자유 이용)
- 라이브 데모: 갤러리(gl-transitions.com)
- 섹션: **전환**
- 훔칠 핵심: `progress` 0→1로 from/to 텍스처를 전환하는 GLSL 컬렉션 수십 종(디졸브·한 점 수렴·displacement 등) — "빨려들어가는" 전환에 바로 쓸 프리셋 다수.

**B. Codrops "Custom Page Transitions in Astro with Barba.js + GSAP" (2026)**
- URL: https://tympanus.net/codrops/2026/04/08/creating-custom-page-transitions-in-astro-with-barba-js-and-gsap/
- 라이선스: Codrops
- 라이브 데모: 있음
- 섹션: 전환
- 훔칠 핵심: `uProgress` 유니폼을 GSAP로 1.5까지 트윈해 디졸브 셰이더가 화면을 덮음 → 완료 후 WebGL canvas `autoAlpha:0`. barba 훅과의 정리(cleanup) 패턴 포함. MorphSVG 전환도 함께 다룸.

**C. GSAP Flip: 카드 → 상세 확대 모핑**
- URL: https://codepen.io/GreenSock/pen/LYZYPpE (Expanding Grid Item) · 문서 https://gsap.com/docs/v3/Plugins/Flip/
- 라이선스: **GSAP 무료(Flip 포함)**
- 라이브 데모: 있음
- 섹션: **전환(리서치 카드 → 상세)**
- 이식 난이도: 로직 포팅
- 훔칠 핵심: `Flip.getState(targets)` → DOM에서 카드를 상세 컨테이너로 이동 → `Flip.from(state, {absolute:true})`로 위치/스케일/회전 자동 모핑. 중첩 transform·flex/grid에서도 동작.

**D. clip-path 리빌 전환 (tutsplus)**
- URL: https://codepen.io/tutsplus/pen/abgxGaE
- 라이선스: CodePen 기본(전체 소스)
- 라이브 데모: 있음
- 섹션: 전환
- 훔칠 핵심: `clipPath:"inset(0 0 100% 0)"` stagger + ScrollTrigger `pin`으로 섹션을 겹쳐 리빌. 각 슬라이드 `z-index` 역순 배치.

**E. kimamov/WebGL-Image-Transition**
- URL: https://github.com/kimamov/WebGL-Image-Transition
- 라이선스: 저장소 확인 권장
- 라이브 데모: 리포 내 예제
- 섹션: 전환
- 훔칠 핵심: displacement map 텍스처(`dis.jpg`)로 두 이미지를 무의존 전환. `new Transition(container, img1, img2, dis, {duration})`.

---

### 5. 스크롤텔링 프레임워크 / 스타터 (통합)

basementstudio/scrollytelling은 이미 확보했으므로 그 외.

**A. 14islands/r3f-scroll-rig** ⭐ 통합 기반 1순위
- URL: https://github.com/14islands/r3f-scroll-rig
- 라이선스: **MIT**
- 라이브 데모: 예제 다수
- 섹션: **통합 기반(전 섹션)**
- 이식 난이도: 그대로 씀(`@react-three/fiber` + Lenis 스무스 스크롤과 정합)
- 훔칠 핵심: `<GlobalCanvas>` + `<SmoothScrollbar>`로 DOM 요소를 추적해 그 자리에 Three.js 오브젝트를 정확한 스케일/위치로 렌더(프로그레시브 인핸스먼트). WebGL 컨텍스트 1개로 다중 뷰포트 관리 → 컨텍스트 한계 회피.

**B. darkroomengineering/satus**
- URL: https://github.com/darkroomengineering/satus
- 라이선스: **MIT**
- 라이브 데모: 랜딩(로컬 실행 시 단계별 매뉴얼)
- 섹션: 통합 기반(구조 참고)
- 이식 난이도: 개념(Next.js 16 기반이라 Vite로는 패턴만 이식)
- 훔칠 핵심: Lenis(darkroom 제작)+GSAP+R3F+Theatre 통합, 통합 격리(`lib/integrations`, env 설정 시에만 활성) 구조. WebGL은 `lib/webgl`로 분리.

**C. Codrops "Crafting Scroll Based Animations in Three.js" (Bruno Simon)**
- URL: https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/ (starter/final zip 제공)
- 라이선스: Codrops/Three.js Journey 제공 스타터
- 섹션: 통합 기반(기초)
- 훔칠 핵심: 섹션별 카메라/오브젝트를 스크롤에 매핑하는 최소 셋업.

**D. Codrops "Theatre.js + R3F 카메라 플라이스루" (2023)**
- URL: https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/
- 섹션: 통합 기반(시네마틱 카메라)
- 훔칠 핵심: `<ScrollControls pages={5}>` + `sheet.sequence.position = scroll.offset * sequenceLength`로 스크롤=타임라인. 시네마틱 카메라 이동에 최적.

**E. wawasensei "Scroll animations with R3F and GSAP"**
- URL: https://dev.to/wawasensei/scroll-animations-with-react-three-fiber-and-gsap-273j
- 섹션: 통합 기반
- 훔칠 핵심: `useScroll` + `tl.current.seek(scroll.offset * tl.current.duration())`로 GSAP 타임라인을 R3F 스크롤에 결합.

**F. Codrops "Scroll-Revealed WebGL Gallery (GSAP+Three+Astro+Barba)" (2026)**
- URL: https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/
- 섹션: **리서치카드 + 전환 복합**
- 훔칠 핵심: WebGL plane과 DOM `<img>`를 정확히 동기화 → 스크롤 시 셰이더 리빌 → 클릭 시 이미지가 상세로 이동하는 seamless 페이지 전환. 우리 "카드→상세" 흐름의 완성형 레퍼런스.

**감상용(느낌 참고 전용 · 소스 비공개/자체 엔진 · 채택 불가):** activetheory.net(자체 엔진 Dreamwave), Lusion, Immersive Garden, Bruno Simon 포트폴리오. 무드·리듬·전환 타이밍만 벤치마크하고 코드는 기대하지 말 것.

---

## 즉시 도입 Top 10 (라이선스 안전 · 이식성 순)
1. **m5kr1pka/canvas-scroll-clip** (MIT, 115★, 무의존) — 영상 스크럽 코어
2. **iam-saiteja/react-scroll-media** (MIT, TS·의존성 0) — React 스크럽(길면 lazy 모드)
3. **GreenSock imageSequence 헬퍼** (GSAP 무료) — 스크럽 로직 직접 소유용
4. **14islands/r3f-scroll-rig** (MIT) — DOM/WebGL 동기화 통합 기반
5. **GSAP Flip** (무료) — 카드 → 상세 확대 모핑
6. **GSAP 카드 stagger CodePen** (무료) — 리서치 유리 카드 순차 부상
7. **timkosters/scroll-scrub-starter** (MIT) — ffmpeg 영상→프레임 전처리
8. **gl-transitions** — 섹션 전환 GLSL 프리셋
9. **Codrops 3D Glass Portal Card** — 유리 카드(renderTarget 최적화)
10. **Codrops Water/Pixel Distortion** — 배경 셰이더(약하게)

## 섹션별 배정표
| 섹션 | 1순위 채택 | 보조/대안 |
|---|---|---|
| 표지 | react-scroll-media 히어로 스크럽 | Pragmattic pin 헤더(200vh) |
| 영상스크럽(펜싱) | canvas-scroll-clip | imageSequence 헬퍼 / react-scroll-media(lazy) |
| 리서치 카드(유리 3개) | GSAP stagger(yPercent) | Codrops Glass Portal(renderTarget) |
| 배경 인터랙션 | Codrops Water Distortion | VoXelo ripple / Pixel Distortion |
| 섹션 전환 | GSAP Flip(카드→상세) | clip-path 리빌 / gl-transitions / Codrops Astro+Barba |
| 통합 기반 | 14islands/r3f-scroll-rig + Lenis | satus 구조 참고 / Theatre.js 카메라 |

## 구현 로드맵 (회귀·할루시네이션 최소화 순서)
1. **스켈레톤**: Vite + React + JSX + three.js/R3F + GSAP + Lenis 설치. `ReactLenis` root + `gsap.ticker.add(t => lenis.raf(t*1000))` + `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.lagSmoothing(0)`로 **스크롤 동기화 1개 루프** 먼저 확정(이후 모든 효과가 여기 얹힘).
2. **에셋 전처리**: 펜싱 영상 → `scroll-scrub-starter`로 프레임 추출 → WebP 변환, 동일 해상도/압축 통일, DPR 캡, 필요 시 프레임 스킵. 배경 오려낼 땐 `--transparent` 또는 Runway로 선처리.
3. **영상 스크럽 섹션 먼저 완성**(최우선 리스크). canvas-scroll-clip 붙이고 `decode()`/`createImageBitmap()` 프리로드·프레임1 즉시 렌더 검증. 여기서 성능(수백 장 로딩)을 통과해야 나머지 진행.
4. **리서치 유리 카드**: GSAP `from(yPercent:100, stagger)` + ScrollTrigger pin. 유리 질감은 drei `MeshTransmissionMaterial`(이미 확보) 또는 CSS backdrop-filter로 시작, 무거우면 후자로 폴백.
5. **배경 셰이더(마지막에서 두 번째, 약하게)**: Water/Pixel Distortion을 fixed 배경 레이어로. 위계 해치면 강도 축소.
6. **섹션 전환**: GSAP Flip(카드→상세) → clip-path/gl-transitions(섹션 간 "빨려들어감"). barba는 SPA 라우팅이 필요할 때만.
7. **감사(audit)**: LCP/CLS/INP 측정, `prefers-reduced-motion` 분기(스크럽·전환 축약), 모바일 프레임 수 축소 세트. 각 단계마다 배포·리뷰 후 다음 단계 진행(한 번에 다 넣지 말 것).

## Caveats
- **무라이선스(반드시 제외 — 복붙 금지, 개념 학습만):** olivierlarose 튜토리얼 전체(64개 저장소, LICENSE 없음), `cortiz2894/mouse-effects`(29★, LICENSE 없음), `KalebKloppe/scroll-image-sequence`(LICENSE 없음). 공개돼 열람은 되지만 법적으로 "all rights reserved"라 MIT/Apache/CC0/CC-BY 요건 미충족.
- **README에만 MIT 명시(형식 LICENSE 파일 없음):** `scroll-scrub-starter`. 기계 감지형 라이선스가 필요하면 별도 확인/문의 권장.
- **Codrops·CodePen 데모 라이선스는 저장소/펜별로 재확인** 필요(본문 스니펫만 있는 경우 상업 발표 전 확인).
- **GSAP 무료화는 2025년 4월(Webflow 인수) 이후** 사실이며 Flip·ScrollTrigger·SplitText·MorphSVG 상업 이용 포함. 그 이전 문서/블로그가 "유료 플러그인"이라 적었더라도 현재는 무료.
- **화려함 < 정보 위계.** 발표용 사이트이므로 심사·청중이 내용을 읽어야 한다. 배경 왜곡·전환이 텍스트/데이터 가독성을 해치면 효과를 줄이거나 제거하라. activetheory 수준의 "감상"은 참고하되, 우리 목표는 "읽히는 시네마틱"이다.