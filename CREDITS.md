# CREDITS

간합이 쓰는 서드파티 자산과 라이선스. 라이브러리나 폰트나 에셋을 추가하면 **같은 커밋에서** 이 파일에 한 줄을 더한다.

채택 판정과 조사 근거는 `docs/LIBRARIES.md` 상단 판정표를 따른다.

## 라이브러리

| 이름 | 라이선스 | 적용 위치 | 링크 |
|---|---|---|---|
| React | MIT | 전 앱 | https://github.com/facebook/react |
| React Router | MIT | 전 앱 라우팅 | https://github.com/remix-run/react-router |
| Vite | MIT | 전 앱 빌드 | https://github.com/vitejs/vite |
| Tailwind CSS | MIT | 전 앱 유틸리티 | https://github.com/tailwindlabs/tailwindcss |
| lucide-react | ISC | 전 앱 아이콘 | https://github.com/lucide-icons/lucide |
| GSAP | GreenSock 표준 "No Charge" 라이선스 | presentation 스크롤 연출 전반(ScrollTrigger, SplitText, Flip), brand 히어로 진입 타임라인과 월드빌딩 ScrollTrigger pin과 제품 카드 상세 Flip 전환(3.15.0, presentation과 같은 버전) | https://github.com/greensock/GSAP |
| Lenis | MIT | presentation 스무스 스크롤, brand 전역 스무스 스크롤(1.3.26, `autoRaf`) | https://github.com/darkroomengineering/lenis |
| Socket.IO | MIT | arena, controller, server 실시간 릴레이 | https://github.com/socketio/socket.io |
| Express | MIT | server HTTP와 헬스체크 | https://github.com/expressjs/express |
| magnetic-elements | MIT | presentation demo 섹션 CTA 자석 인력 | https://github.com/ToonRombaut/magnetic-elements |
| three.js | MIT | **arena 1인칭 렌더러.** brand에서는 걷었다(아래 주 참고) | https://github.com/mrdoob/three.js |
| ~~three.js OrbitControls (애드온)~~ | MIT | **폐기.** 쓰던 곳(brand 제품 상세 360 뷰어)이 사라졌다 | https://github.com/mrdoob/three.js |
| postprocessing | Zlib | arena 후처리(Bloom, Afterimage, ShockWave, ChromaticAberration, Vignette, HueSaturation) | https://github.com/pmndrs/postprocessing |
| 궤적 리본 | 자체 구현 | arena 궤적. `ribbon-geometry`(MIT)를 검토했으나 생성자 전용이라 in-place 갱신이 없고 폭이 단일 상수여서 나이별 감쇠를 못 한다. 매 프레임 지오메트리를 새로 만들면 가비지가 쌓여 미채택 | (참고) https://github.com/yomotsu/ribbon-geometry |
| ~~궤적 리본 재사용~~ | 자체 구현(사내) | **폐기.** brand 히어로가 `arena/src/game/render/three/trail.js`의 `createTrailRibbon`을 import하던 것인데 표지 구도 히어로로 바뀌며 `HeroTrail`이 사라졌다. arena 원본은 그대로 살아 있고 arena가 쓴다 | (사내 모듈) |
| 카메라 셰이크 (trauma 방식) | MIT, **로직 포팅** | arena 명중 연출. `three-screenshake`가 npm에 없어(404) `sajmoni/screen-shake`의 trauma 방식을 JS로 포팅 | https://github.com/sajmoni/screen-shake |
| snoise (simplex 3D) | MIT, **GLSL 코드 이식** | presentation 배경 셰이더(StageShader). Ashima/stegu webgl-noise의 3D simplex를 프래그먼트에 그대로 이식. three.js 없이 raw WebGL 사용(P5 판정) | https://github.com/stegu/webgl-noise |
| qrcode-generator | MIT | arena PAIRING 화면 QR(`components/QRPanel.jsx`). **인코딩만 라이브러리가 하고 그리기는 우리가 한다.** 모듈 배열만 받아 SVG 사각형으로 직접 그려 canvas도 이미지도 만들지 않는다. 2.0.4, 의존성 0. npm 메타와 `dist/qrcode.js` 헤더 양쪽에서 MIT를 확인했다(Copyright 2009 Kazuhiko Arase). 저장소에 별도 LICENSE 파일은 없고 소스 헤더가 라이선스 표기다 | https://github.com/kazuhikoarase/qrcode-generator |
| @paper-design/shaders | **Apache-2.0** (Copyright 2026 Paper). **NOTICE 동봉 의무 있음. 아래 이행 기록 참고** | brand 히어로 워드마크 크롬. `components/HeroWordmark.jsx`가 `liquidMetalFragmentShader`와 자체 런타임 `ShaderMount`를 쓴다. 0.0.78 고정, 의존성 0 | https://github.com/paper-design/shaders |
| ogl (Polyline) | **Unlicense**(퍼블릭 도메인). 아래 라이선스 실사 참고 | presentation-v2 S1 표지 커서 궤적. `components/VortexLine.jsx`. **공식 예제 `examples/polylines.html` 코드를 출발점으로 가져왔다**(스프링/프릭션 추적 루프, vertex 셰이더 전문, resize 처리). ogl 1.0.11 버전 고정 | https://github.com/oframe/ogl |

**@paper-design/shaders Apache-2.0 의무 이행(2026-08-06).** 이 리포에서 **Apache-2.0을 배포까지 지는 첫 라이브러리다.**
MIT와 달리 지켜야 할 것이 넷이라 배포물에 실제로 실었다. `brand/public/licenses/paper-design-shaders/`에 있고
빌드하면 `dist/licenses/paper-design-shaders/`로 그대로 나간다(실측).

- **라이선스 사본**: `LICENSE`. 설치본의 Apache 2.0 전문을 그대로 복사했다
- **NOTICE 동봉**: `NOTICE`. Apache-2.0 4항은 원본에 NOTICE가 있으면 재배포본에 그 내용을 유지하라고 한다.
  `Paper Shaders / Copyright 2026 Paper / Powered by Paper Shaders: https://shaders.paper.design`
- **변경 사실 표시**: `CHANGES.txt`. 4항 b가 요구하는 고지다. 아래 두 줄이 우리가 바꾼 전부다
- **저작권 고지 유지**: 패키지 소스를 고쳐 쓰지 않는다. `node_modules` 설치본을 그대로 import한다

**바꾼 것은 셰이더 상수 두 줄이고 런타임 문자열 치환이다.** 파일을 수정하지 않는다.
원문의 밝은 스톱 `vec3(.98, 0.98, 1.)`과 어두운 스톱 `vec3(.1, .1, .1 + ...)`이
**유니폼이 아니라 셰이더 상수**라 밖에서 넘길 방법이 없었다. 어두운 쪽 0.1이 우리 무대 배경
`#101010`(0.063)과 거의 붙어 글자 안의 어두운 띠가 배경에 잠겼다(DESIGN 1절 1항).
그래서 둘을 DESIGN 2절 크롬 스톱(`steel.hi`, `steel.shadow`)으로 바꿨다.
치환 앵커가 유일하지 않으면 셰이더를 그대로 두고 `steelText`로 내려앉는다(버전이 바뀌면 색 통제를 못 하므로).

README가 권하는 "Powered by Paper Shaders" 가시 크레딧은 **의무가 아니라 권장**이다(appreciated).
NOTICE 파일에 그 문구가 그대로 실려 배포된다.

**brand에서 three.js를 걷었다(2026-08-07).** 쓰던 곳이 둘이었는데 둘 다 사라졌다. 히어로 궤적 리본
(`HeroTrail`)은 발표 표지 구도로 히어로가 바뀌면서, 제품 상세 360 뷰어(`ProductViewer`)는 실제 제품
렌더가 확보되면서 걷었다(뷰어가 띄우던 것은 실제 모델이 아니라 플레이스홀더 프리미티브였다).
`npm uninstall three`와 `vite.config.js`의 `dedupe` 제거까지 같은 커밋이다. **arena는 그대로 쓴다.**
아래 OrbitControls 항목은 그 뷰어 하나만 쓰던 것이라 함께 폐기됐고, 기록으로만 남긴다.

**three.js OrbitControls는 새 설치가 아니었다(2026-08-06 확인, 지금은 폐기).** 이미 채택한 `three` 패키지 안의 파일이라
별도 npm 설치도 clone도 없다. 그래도 별 행으로 남기는 이유는 **애드온을 실제로 코드에 들였다는 사실**이
CREDITS에 드러나야 하기 때문이다. 라이선스 근거 셋을 직접 확인했다. 설치본 루트 `LICENSE`가
The MIT License(Copyright 2010-2026 three.js authors), `package.json`의 `license` 필드가 `MIT`,
그리고 `examples/jsm/controls/OrbitControls.js`에 **별도 라이선스 헤더가 없어** 저장소 LICENSE가 그대로 덮는다.
LIBRARIES 판정표의 three.js(MIT) 채택 확정과 같은 근거이므로 판정표에 새로 더할 항목은 없다.

**ogl 라이선스 실사(2026-08-05 확인).** 표기가 하나로 모이지 않아 실제 아티팩트를 직접 확인했다.

- npm 레지스트리 `license` 필드: **Unlicense**
- 저장소 `package.json` `license` 필드: **Unlicense**
- 저장소 루트에 **LICENSE 파일이 없다.** `raw.githubusercontent.com/oframe/ogl/master/LICENSE`는 404이고
  GitHub API가 감지한 license도 `null`이다. 설치본(`node_modules/ogl/`)에도 LICENSE 파일이 동봉되지 않는다
- 즉 **MIT 표기는 어디에도 없다.** 근거는 저자가 직접 적은 SPDX 식별자 `Unlicense` 둘뿐이다
- **판정: 채택.** Unlicense는 퍼블릭 도메인 헌정이라 허용 범위가 가장 넓다.
  다만 이 저장소는 "정식 LICENSE 파일 없음"이라는 점에서 아래 *사용하지 않기로 한 것*의 기각 사유와 형식이 같다.
  갈린 지점은 **ogl은 저장소와 npm 양쪽 package.json에 기계 판독 가능한 SPDX 식별자를 명시**한다는 것이고,
  기각한 셋은 README 문구뿐이거나 아무 표기도 없었다. `ahrs` 항목과 같은 불일치 기록 규율을 따른다

## 3D 에셋

| 이름 | 라이선스 | 적용 위치 | 링크 |
|---|---|---|---|
| Antique Rapier Sword | CC-BY-4.0 (저작자 표시 필수, 상업 이용 허용) | arena 1인칭 내 검. `arena/public/assets/sword/` | https://sketchfab.com/3d-models/antique-rapier-sword-910eb65ba53d49f3b810c0d3917a6840 |

배포 시 아래 문구를 그대로 유지한다(원본 `license.txt`의 크레딧 문구 전문).

> This work is based on "Antique Rapier Sword" (https://sketchfab.com/3d-models/antique-rapier-sword-910eb65ba53d49f3b810c0d3917a6840) by GabrielUCG (https://sketchfab.com/GabrielUCG) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)

텍스처 3장은 4096에서 1024로 리사이즈했다(36.0MB → 3.8MB). 지오메트리와 파일명은 원본 그대로다.

## 폰트

| 이름 | 라이선스 | 적용 위치 | 링크 |
|---|---|---|---|
| Pretendard Variable | SIL Open Font License 1.1 | 전 앱 본문과 제목 | https://github.com/orioncactus/pretendard |

## 대기 중

brand 작업에서 확정되면 그때 추가한다.

- liquidGL — `vendor/liquidGL`에 반입만 해 둔 상태. brand 제품 상세 카드 후보. 판정표는 ybouane/liquidglass(MIT)를 1순위로 둔다
- honzaap/SlashSaber — CC BY-4.0. arena WebGL 승격 시 참고하면 출처 표기 필수

## 사용하지 않기로 한 것

라이선스 문제로 코드를 가져오지 않는다. 개념 참고만 한다.

- **Tubes Cursor — CC BY-NC-SA. presentation-v2 S1 표지에서 제외했다.**
  **비상업 조건이 대회 제출물의 상업성 여부에 걸린다.** 그 리스크를 표지에 지고 갈 이유가 없어
  퍼블릭 도메인인 ogl Polyline으로 갈아탔다. `components/TubesBackground.jsx` 파일은 지우지 않고 보존한다(현재 import 0건)

- **@newkrok/three-particles. MIT지만 미채택(brand 히어로 궤적 후보 B).**
  실제로 설치해 확인했다. 3.0.0, LICENSE 파일 있음(MIT, Copyright 2021 Istvan Krisztian Somoracz),
  `RendererType.TRAIL`과 `TrailConfig`(length, widthOverTrail, opacityOverTrail, colorOverTrail)가 실재한다.
  **기각 사유 둘.** (1) peer가 `three@^0.182.0`이라 리포 표준 0.185.1과 충돌한다
  (`npm install three@0.185.1`에서 ERESOLVE 경고를 실측했다). (2) 검끝 한 줄을 그리려고
  파티클 엔진과 전이 의존성 셋(@newkrok/three-utils, easing-functions, three-noise)을 들인다.
  arena 리본이 이미 단일 리본이고 검증돼 있어 후보 A를 택했다. **설치본은 임시 폴더에서만 확인하고 리포에 남기지 않았다**
- ZiCog/madgwick.js — LICENSE 파일 없음. 기본적으로 사용 불가
- EmmaPoliakova/WebRTCSmartphoneController — LICENSE 파일 없음. 기본적으로 사용 불가
- naughtyduk/glitchGL — 개인 무료와 상업 유료 듀얼 라이선스
- Muggleee/liquid-glass — README에만 MIT 표기, 정식 LICENSE 파일 없음

## MediaPipe Tasks Vision (R5)

- `@mediapipe/tasks-vision` 0.10.14, Apache-2.0. **CDN 로드이고 번들에 포함하지 않는다.**
  `arena/src/game/faceTracker.js`가 jsdelivr에서 `vision_bundle.mjs`와 wasm을 받는다.
- FaceLandmarker 모델 `face_landmarker.task`(float16/1)는 Google 배포본을 그대로 참조한다.
  로드 실패 시 게임은 성공률 근사 폴백으로 계속 돈다.

## ahrs (controller C2)

- `ahrs` 1.3.3 (psiphi75/ahrs). **동봉된 LICENSE 파일은 Apache License 2.0이다.**
  `controller/src/sensors/orientation.js`에서 Madgwick 필터로 자세를 융합한다.
- **메타데이터 불일치 기록.** npm 패키지의 `package.json` `license` 필드는 `APSL-2.0`으로 적혀 있는데
  실제 동봉 LICENSE 파일은 Apache-2.0이다. 업스트림 표기 오류로 보이고
  **동봉 LICENSE 파일이 우선한다.** LIBRARIES.md 판정표의 Apache-2.0 표기와 일치한다.
- 참고만 하고 코드를 복사하지 않은 것: PiyuSX/GameProtoType(구조 참고),
  ZiCog/madgwick.js와 EmmaPoliakova/WebRTCSmartphoneController(무라이선스라 개념만).
