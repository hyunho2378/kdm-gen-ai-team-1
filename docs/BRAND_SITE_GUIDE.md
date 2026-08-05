# VORTEX brand 사이트 제작 가이드

발표 사이트(presentation-v2)와 별개인 산출물 2, 브랜드/제품 소개 사이트(brand 패키지)의 단독 기준 문서다. 이 파일과 VORTEX_DESIGN_SYSTEM.md 두 개를 같이 읽으면 brand를 처음부터 만들 수 있다. 색과 브랜드 규칙은 VORTEX_DESIGN_SYSTEM.md를 따르고, 이 문서는 brand만의 구조와 라이브러리와 규율을 정한다.

---

## 0. 정체와 발표 사이트와의 차별

- brand는 일반 스크롤 + 상세페이지가 있는 제품 소개 사이트다. presentation-v2의 방향키 셸을 쓰지 않는다.
- 존재 이유. 제품 상세의 체험해보기 버튼이 arena로 이동한다. 이 연결이 brand의 핵심이다.
- 발표 사이트와 100퍼센트 겹치면 감점이다. brand는 발표가 안 하는 것을 한다. 제품군 4종 상세, 스크롤 스토리텔링, 마우스 인터랙션, 갤러리. 발표는 서사와 심사 설득, brand는 제품과 몰입.
- 브랜드 값은 VORTEX_DESIGN_SYSTEM.md 2절과 동일. black #101010, white #FDFDFD, red #E60D15, redDeep #80070C, Brand Gradient, Pretendard, 검끝 한 줄 모티프. 과거 brand 초안의 네이비와 #0A0A0B와 #B3122C는 폐기하고 이 값으로 통일한다.

---

## 1. 기술 스택

- React 18 + Vite + JSX. TypeScript와 Next 금지.
- 라우팅 React Router v6. 랜딩(원페이지 스크롤) + 제품 상세페이지 여러 장.
- 스크롤 GSAP + ScrollTrigger + Lenis. 텍스트 SplitType.
- 3D three.js r0.185 + postprocessing(presentation, arena와 동일 버전, dedupe).
- 색은 tokens.js 한 파일, 문구는 copy.js 한 파일. 하드코딩 금지.
- 배포 Vercel.

---

## 2. 사이트 구조

### 2.1 랜딩(원페이지 스크롤)
1. 히어로. 풀스크린 궤적 모션 또는 셰이더 배경. 검끝 한 줄 궤적 모티프.
2. 월드빌딩. 검술 도장 세계관.
3. 제품군 4종. XR 글라스, 모의 검 컨트롤러, 브랜딩, 인터랙티브 데모 앱. 카드 클릭 시 각 상세페이지로 이동.
4. 유파 소개. 이탈리아 세이버, 프랑스 에페, 헝가리안. 발표의 유파 문구와 동일(VORTEX_DESIGN_SYSTEM 3.11).
5. 체험해보기. arena로 연결되는 CTA.

### 2.2 라우팅
- `/` 랜딩.
- `/product/xr-glass`, `/product/controller`, `/product/branding`, `/product/demo-app` 상세 4종.
- arena URL은 상수 VITE_ARENA_URL로. 하드코딩 금지.
- 카드에서 상세로는 GSAP Flip 기반 shared element 전환(카드가 확대되며 상세로 morph). React는 useLayoutEffect로 렌더 타이밍 처리.

### 2.3 상세페이지 공통 골격
- 히어로(제품명, 한 줄 카피, 대표 비주얼), 스펙 또는 특징, 스크롤 연동 3D 또는 갤러리, 체험해보기 CTA(해당되면).
- 4종 각각의 세부 레이아웃은 착수 후 별도 확정. 우선 공통 골격과 라우팅부터.

---

## 3. 코드 출처 계약 (위반 시 작업 무효)

추론이나 자체 재현으로 만들지 않는다. 우리 편에 실제 파일이 있는 것만 쓴다. 없으면 안 쓴다. 비슷하게 짜지도 않는다.

1. 모든 비주얼 라이브러리는 npm 실설치 또는 git clone으로 실제 파일을 확보한 뒤 시작한다. 설치 후 node_modules 안 실제 구현 파일을 열어 읽고 API를 파악한다. 추측한 API 사용 금지.
2. 예제 기반 작업은 예제 원문 파일을 받아 읽고 그 코드를 출발점으로 복사한 뒤 우리 토큰과 구조에 맞게만 변형한다.
3. 클론, 설치, 다운로드가 실패하면 그 자리에서 멈추고 보고한다. 실패 상태에서 기억이나 추론으로 유사 구현을 짜는 것을 금지한다.
4. 무라이선스 저장소는 가져오기는 물론 열람과 참고도 하지 않는다. 대상. 게임 클론 전체(geddski, saikiranpatil, macadiz, sans-script), mkkellogg/TrailRendererJS, adrianhajdin 원본, olivierlarose 전체, cortiz2894, KalebKloppe. 필요한 메커니즘은 라이선스 확보된 대체재로만 채운다.
5. 설치하거나 이식한 모든 것을 같은 커밋에서 CREDITS.md에 기록한다. glitchGL은 상업 유료 듀얼 라이선스이므로 도입 금지.

---

## 4. 라이브러리 채택표 (라이선스 확보분만)

리서치 근거는 별도 아티팩트 참조. 아래는 채택 대상만 추린 것이다. 전부 실설치 또는 실클론 후 파일을 읽고 쓴다.

| 용도 | 채택 | 라이선스 | 설치 |
|---|---|---|---|
| 검끝 궤적(1순위) | NewKrok/three-particles TRAIL | MIT | npm @newkrok/three-particles |
| 검끝 궤적(대안) | yomotsu/ribbon-geometry | MIT | npm |
| 이미지 디스토션 호버 | robin-dela/hover-effect | MIT | npm |
| 파티클 스파크, 레드 글로우 | @tsparticles/react | MIT | npm |
| 메시 글로우 | ektogamat/fake-glow-material-r3f | MIT | git/파일 |
| 홀로그램 HUD | ektogamat holographic-material | MIT | git/파일 |
| 프레넬 rim | OtanoStudio/Fresnel-Shader-Material | 확인 후 | git/파일 |
| 텍스트 스태거 | lukePeavey/SplitType | MIT | npm split-type |
| 마그네틱 버튼 | @phucbm/magnetic-button 또는 Halo-Lab/magnetic-hover | MIT, ISC | npm |
| 호버 영상 카드 | Gyanreyer/react-hover-video-player | MIT | npm |
| 카드 상세 morph 전환 | GSAP Flip | GSAP 무료 | gsap |
| 스무스 스크롤 | Lenis | MIT | npm |
| 유리 재질 | ybouane/liquidglass, drei MeshTransmissionMaterial | MIT | npm |
| 커스텀 커서(brand 전용) | react-creative-cursor | MIT | npm |
| Zentry 럭셔리 문법 | freddyfavour 또는 himanshu-tyd zentry-clone(MIT 파생본) | MIT | git clone 후 파일 참고 |

도입 금지. glitchGL(상업 유료). 무라이선스 게임 클론 전체. adrianhajdin 원본. TrailRendererJS.

주의. 각 저장소는 LICENSE 파일을 실제로 열어 재확인한다. README 문구만으로 판단하지 않는다. three r0.185 호환은 설치 후 테스트로 확인한다.

---

## 5. 유리 재질 실패 방지 (presentation-v2 교훈)

- ybouane/liquidglass는 뒤 배경을 캡처해 굴절한다. presentation-v2 S4에서 CSS 그라디언트 배경을 못 잡아 두꺼운 사각형으로 폴백한 사례가 있었다.
- brand에서 유리를 쓸 때는 굴절 대상 배경을 반드시 실제 이미지나 캔버스 텍스처로 깐다. CSS 그라디언트만 두면 실패한다.
- 진입 직후 캡처 지연으로 몇 초 블랙아웃하는 이슈도 있었다. 정적 폴백을 먼저 깔고 유리 준비 완료 후 크로스페이드한다.

---

## 6. 검증 방식 (완성 선언 조건)

canvas 주입 여부나 콘솔 에러 0으로 완성 판정하지 않는다. 실제 픽셀로 확인한다.

- dev 서버를 띄우고 각 섹션과 각 상세페이지를 실제 스크롤하며 스크린샷으로 육안 확인.
- 유리 카드는 마우스를 올려 뒤 배경이 실제로 굴절되는지 확인. 두껍고 투박한 반투명 사각형이면 실패.
- 궤적은 실제로 선이 그려지는지 픽셀로 확인. 헤드리스에서 rAF가 얼면 픽셀 샘플 수치와 함께 실브라우저 확인 필요를 명시.
- 카드 상세 morph 전환이 끊기지 않는지, 라우팅 후 스크롤 위치가 리셋되는지 확인.

---

## 7. 작업 규율

1. 섹션 하나 또는 페이지 하나씩 완성하고 실제 픽셀 확인 후 다음. 한 번에 여러 개 벌리지 않는다.
2. 색은 tokens.js, 문구는 copy.js. 하드코딩 금지.
3. 애니메이션은 transform과 opacity 위주. reduced-motion 대응.
4. 영역 소유. brand와 presentation은 다른 패키지라 충돌은 없지만, arena 리본 모듈을 import하는 경우 arena 파일은 읽기만 하고 수정하지 않는다.
5. 커밋 메시지 `[brand] 한 일`. 세션 끝에 PROGRESS.md에 완료, 진행중, 미해결(이미지 교체 필수 포함) 기록.
6. 이미지는 전부 미확인 시안 간주. 팀 자체 제작 확정분만 CREDITS 채택. 나머지는 제출 전 교체 필수로 PROGRESS 기록.

---

## 8. arena 리본 재사용

- brand 히어로나 제품 소개에 arena 궤적 리본을 재사용할 수 있다.
- 경로 arena/src/game/render/three/trail.js. 인터페이스 createTrailRibbon({core, glow, width}) 반환 {mesh, push, update, build, markHit, clear, dispose}.
- 도표로 다시 그리지 말고 실제 모듈을 import한다. arena 파일은 수정 금지.

---

## 9. 착수 후 확정할 것

- 제품 상세 4종 각각의 레이아웃과 갤러리 구성.
- 체험해보기에서 arena로 넘어가는 전환 방식(단순 이동 또는 displacement 전환).
- 유파 소개 섹션 비주얼(유리 카드 3장 재사용 또는 다른 문법).
- 히어로 궤적을 three-particles TRAIL로 갈지 arena 리본 재사용으로 갈지(1차 프로토타입 후 결정).