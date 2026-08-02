> [채택 판정 확정] 이 조사에서 간합이 실제로 쓰는 것과 보류, 제외는 아래와 같다. 조사 원문의 추천과 다른 부분은 이 표가 우선한다.
>
> | 영역 | 지금 채택 | 보류(WebGL 승격 시) | 제외와 사유 |
> |---|---|---|---|
> | presentation | magnetic-elements(MIT). 한글 분해는 word 모드 기본 규칙. 프리로더는 자체 구현 | 없음 | SplitType 계열(GSAP SplitText 사용 중이라 중복), react-creative-cursor(brand로), barba(단일 페이지라 개념만) |
> | brand | ybouane/liquidglass(MIT) 1순위, react-creative-cursor(MIT), magnetic-elements 공용 | drei MeshTransmissionMaterial | glitchGL(듀얼 라이선스, postprocessing GlitchEffect로 대체 가능), Muggleee/liquid-glass(정식 LICENSE 파일 없음) |
> | arena | sajmoni/screen-shake(MIT, canvas 2D), hitstop 자체 구현 | postprocessing(Zlib), AfterimagePass(MIT), ribbon-geometry(MIT), SlashSaber(CC-BY-4.0, 참고 시 크레딧) | rhy-game(자체 judge 완성으로 불필요), 무라이선스 2종(madgwick.js, WebRTCSmartphoneController) |
> | controller | psiphi75/ahrs(Apache-2.0) C2에서 채택 | 없음 | WebRTC 계열(Socket.io 확정이라 개념만) |
>
> 원칙: 돌아가는 canvas 2D 렌더러를 three.js 계열 도입을 위해 뜯지 않는다. WebGL 승격은 전 기능 완성 후 여유가 있을 때만 별도 제안한다.

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