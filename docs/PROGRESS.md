# PROGRESS

## 완료
- SETUP: 저장소 구조, 의존성, 설정 파일 생성
  - 폴더 5개(presentation, brand, arena, controller, server) + shared, docs 생성
  - shared/tokens.js, shared/protocol.js 작성. 각 앱 src/tokens.js는 재수출만
  - 프런트 4개 앱 Vite + React 18 + Tailwind 3 + React Router 6 + lucide-react 설치
  - arena, controller에 socket.io-client 추가. 골격 모듈 파일 생성
  - server Express + Socket.io + cors, 방 코드 페어링과 릴레이 최소 구현, 스모크 통과
  - 금지 항목 grep 전부 0건, vercel.json 4개, .env.example 5개
- docs v2: 간합 기준 문서 전면 교체
  - DESIGN.md v2(블랙 + 크롬 + 쨍한 레드, 대비 실측 포함)
  - IA.md, ROUTES.md, COMPONENTS.md, PATTERNS.md 간합 버전으로 교체(이전 프로젝트 내용 폐기)
  - AGENTS.md 간합 병렬 구조로 재작성, BACKEND.md 삭제 후 SERVER.md로 대체
  - shared/tokens.js v2 교체(radius, glow 추가, 네이비 팔레트 폐기)
- PHASE 0 마무리 (P-0 docs+shared 트랙, 종료)
  - MOTION, RESPONSIVE, PITFALLS, CLAUDE 4개에 표준 문서 배너 삽입(본문 무수정)
  - shared/protocol.js MSG에 PEER_LEFT, ERROR 추가. SERVER.md 프로토콜과 1:1
  - server: disconnect 시 peer_left 통지, 같은 방 재접속 허용(옛 소켓 슬롯 인계), 10분 유휴 GC(lastSeenAt 기준, 스윕 60초)
  - 페어링 실패를 room{ok:false}에서 error{reason}으로 분리. 소켓 스모크 6항목 통과
  - arena/.env.example에 VITE_CONTROLLER_URL 추가
  - 4개 앱 index.css 첫 페인트 예외를 #0B0B0E / #F2F6FF로 교체
  - 4개 앱 tailwind extend를 v2 토큰 그룹(bg, red, blue, steel, trail, txt, line)으로 재매핑. accent 폐기
  - build:all 4개 성공, 네이비 잔재 코드 0건, HEX 하드코딩 예외 밖 0건, 이모지 0건
- PHASE 0 마감 수정 (P-0b 트랙, 종료)
  - steel.gradient는 colors 매핑에서 제외, style 경유 전용. tokens.js의 값 자체는 유지
  - 스킬 경로 .claude/skills/coding으로 통일, SESSION_HEADER와 SKILL.md 표기 정정
  - 커밋 3분할: docs+tokens+server / 스킬 배치 / vendor 반입
- P-C C1 arena 키보드 모드 (트랙 종료, 확인 대기)
  - loop.js 고정 타임스텝(1/60 누적기) + 가변 렌더, 로직 시계에만 timeScale, 탭 비활성 정지
  - machine.js phase 8종 순수 전이 함수 + 진입 이탈 훅. 키보드는 PAIRING과 CALIBRATION 건너뜀
  - judge.js 결정적 판정. 거리 35~55, 쿨다운 350ms, 리포스트 600ms 2점, FEINT 무페널티, REAL 가드 패리
  - opponents.js 유파 2종(이탈리아 세이버, 프랑스 에페), rng.js mulberry32 시드 난수
  - renderer/ 4레이어 canvas 2D(배경, 선수 실루엣 + 잔상, 궤적 가산 블렌딩, 파티클 풀링)
  - HUD DOM 6종 + IDLE, MATCH_END, 1024 미만 차단 화면
  - 입력 추상화 input.js(키보드와 C3 소켓 action이 같은 큐로 수렴), F9 전 phase 동작
  - 검증: 셀프테스트 6/6, 결정성 서명 일치, 5점 완주 양방향, 실브라우저 1분 교전 p50 59.9fps
  - 시간 팽창 지속 1200ms와 쿨다운 8000ms 실측, reduced motion 비활성 확인
  - C4 웹캠 지표 주입 인터페이스(shouldDilate의 extra 인자) 선반영
  - 명중 4분기 규칙 승인 완료. COMPONENTS.md judge 항목으로 승격(사양 확정)
  - 패리가 phase를 멈추지 않도록 수정. 리포스트 윈도우가 만료되던 버그 해소
- P-A A1 presentation 스크롤 엔진과 8섹션 골격 (확인 대기)
  - gsap 3.15 + lenis 1.3 도입. @bsmnt/scrollytelling은 채택하지 않음
    (React 18 peer는 맞으나 2024-02 이후 배포 정지, Radix portal과 slot 의존 2개를 끌고 온다.
     PITFALLS 서드파티 절대로 발표 중 죽으면 복구가 없어 ScrollTrigger 직접 제어로 간다)
  - lib/motionMode.js 전역 분기 유틸. 이 트랙의 모든 연출은 이 파일을 거친다
  - lib/scroll.js Lenis + gsap ticker 동기, lagSmoothing 0. reduced면 Lenis 미기동(네이티브 스크롤)
  - Section 8종(IA 2절 id와 1:1), ProgressRail, StageBackground 전역 1회
  - content/sections.js 카피 단일 원천. lorem 없음, 팀 확정분은 TODO 카피 4곳
- tokens 타이포 clamp 상한 상향 (단독 커밋 00dd3ed)
  - title 3rem → 4.25rem, display 6rem → 8.5rem. tracking과 leading은 유지
  - 재검증: 4앱 빌드 성공. 제목 1920 이상에서 48 → 68px, arena display 96 → 136px
  - arena MATCH_END ChromeText를 1024와 3840에서 실제로 띄워 확인. 넘침 0, 가로 스크롤 0
  - DESIGN 4절 타이포 표도 같은 값으로 갱신(사양과 코드 불일치 방지)
- P-A A2 섹션 콘텐츠와 등장 연출 (확인 대기)
  - 확정 카피 4곳 문자 그대로 반영(cover 정의와 부제, background 문제 진술, insight 근거, concept 서사)
  - Reveal 컴포넌트가 등장의 유일한 통로. ScrollTrigger once로 재진입 재실행 차단
  - cover만 SplitText 글자 단위 1회. 다른 섹션 글자 분해 0건 실측
  - interactions pin 스크롤 4스텝. reduced motion과 lg 미만은 세로 나열 폴백
  - 자체 제작 SVG 도식 6종. 원본 영상과 사진 미사용
  - WorkflowRow, 산출물 3종 카드, DemoCta. VITE_ARENA_URL 미설정은 콘솔 경고만
  - 검증: 8섹션 렌더, 재진입 opacity 1.00 유지, 등장 역행 프레임 0, 9개 폭 가로 스크롤 0
- P-A A3 스크롤 궤적 라인 (확인 대기)
  - ScrollTrail.jsx. 문서를 관통하는 검끝 곡선 SVG 하나. 콘텐츠 컬럼 왼쪽 여백에 fixed 세로 띠
  - 띠 폭과 위치를 CSS min과 max로만 계산해 리사이즈에서도 레이아웃을 읽지 않는다
  - 리듬: 마디마다 완만한 준비 곡선 뒤 짧고 급한 찌르기 직선. 마디 수는 섹션 수와 같다
  - 마디 경계를 섹션 경계에 정확히 맞춘다. 경계 진행률과 path 길이 앵커 테이블을 refresh에서 만들고
    스크롤 중에는 산술 보간만 한다. 실측 오차 0.0(viewBox 800 기준)
  - 색: 상단 크롬, 76~100퍼센트 구간에서 red.light로 전이. demo 섹션에서 레드로 완성
  - reduced motion에서 전 구간 dashoffset 0(정적 완성), 스크럽 비활성
  - 검증: 스크럽 단조 감소, 9개 폭 본문 겹침 0과 레일 겹침 0과 화면 밖 0,
    non-scaling-stroke로 3840에서도 stroke 2px 유지, 스크롤 중 60fps에 30미만 프레임 0
- P-A 강화 패스 (라이브러리 전수조사 반영, 확인 대기)
  - docs/LIBRARIES.md에 조사 원문 배치. 상단에 채택 판정표 삽입. 원문 sha 삽입 전후 동일(무수정)
  - 루트 CREDITS.md 신설. 지금까지 쓴 것 소급 기록. Tubes Cursor와 liquidGL은 대기 항목으로 명시
  - Preloader 자체 구현. 검끝 곡선 stroke-dashoffset 그리기, 폰트 준비 시 이탈, 상한 2.5초
  - lib/boot.js 부팅 신호. cover SplitText가 프리로더 이탈 뒤에 시작한다(실측 순서 확인)
  - magnetic-elements(MIT 1.1.0) demo CTA 한 곳. 래퍼로 감싸 press scale(0.97)과 공존
  - PATTERNS 12절에 한글 분해 규칙 추가. cover 워드마크만 char, 자소 분리 0건 실측
  - 검증: A1~A3 무결(8섹션, 레일 8점, ScrollTrail 단조 감소, 등장 1회성),
    9개 폭 가로 스크롤 0과 trail 겹침 0, 라이브러리 로드 차단 시 버튼 정상 동작
- P-C 승격 V0~V3 설계 확정
  - LIBRARIES 판정표 arena 행을 승격 확정으로 갱신, DESIGN 9절 1인칭 재작성, COMPONENTS GameCanvas 인터페이스화
  - V1 경계 보고: 재활용 966줄, 인터페이스화 641줄. 검끝 좌표는 로직이 참조하지 않아 렌더러 소유 확정
  - ARENA_SCENE.md: 카메라, 프리셋 4자세, 가시성 증명(8자세 전부 프러스텀 안), fx 계약, 폴백 3경로
  - d 매핑 정정: judge.js가 d를 근접도로 정의하므로 dist(d) = 6.0 - (d/100)*4.4
  - ARENA_INPUT.md: 이산과 연속 채널 분리, setSwordPose 판별 유니온, 결정성 세 고리 봉쇄
- P-C 승격 V4a 1인칭 씬 골격 (확인 대기)
  - three 0.185.1(MIT), postprocessing 6.39.4(Zlib), ribbon-geometry 0.1.0(MIT) 도입. CREDITS 기록
  - three-screenshake는 npm 404. 셰이크는 trauma 방식 로직 포팅으로 확정
  - render/ 신설. ThreeRenderer 기본, Canvas2dRenderer 폴백. 기존 renderer/를 render/canvas2d/로 이동(git mv)
  - game/pose.js 연속 채널 신설. engine이 import하지 않는다
  - GameCanvas render 콜백 통합. setTimeScale과 drainFx는 GameCanvas 잔류
  - 검증: 셀프테스트 6/6, **기준 서명 완전 일치**, 2D와 three 양 경로 5점 완주,
    폴백 3경로(URL, WebGL 생성 실패, 컨텍스트 손실) 전부 2D 전환과 경기 지속 확인
  - 검끝 화면 좌표 실측이 설계값과 일치(휴식 67%/61% 대 67.9%/65.0%, 가드 57%/19% 대 57.9%/23.0%)
- P-C 승격 V4b 궤적 리본과 블룸 (확인 대기)
  - 궤적 리본 2개 자체 구현. 사전 할당 BufferGeometry 제자리 갱신, 정점 색 itemSize 4로 알파까지 전달
  - ribbon-geometry 미채택. 생성자 전용이라 in-place 갱신이 없고 폭이 단일 상수다.
    매 프레임 지오메트리 재생성은 파티클을 풀링한 것과 같은 이유로 피했다. 의존성 제거, CREDITS 정정
  - 나이별 폭과 알파 감쇠, 명중 시 최근 18구간 흰 코어 고정. 리본은 카메라를 향해 폭 방향을 잡는다
  - postprocessing 컴포저 도입. RenderPass → EffectPass(Bloom). render(delta)로 delta 전달 구조 확정
  - **Bloom 초기값 확정(ARENA_SCENE 15절 미해결 해소): threshold 0.42, smoothing 0.28,
    intensity 1.15, radius 0.62, resolutionScale 0.5, kernelSize MEDIUM**
  - 실측: 하늘 영역 평균 휘도 6.4/255로 배경이 뜨지 않는다. 궤적 최대 176/255로 발광 확인
  - 셀프테스트 6/6, 기준 서명 일치 유지

- P-C 승격 V4c 확장 (승격 종료, 확인 대기)
  - 상대 빌보드: 512x1024 오프스크린 5포즈(대기 전진 텔레그래프 런지 피격) 생성 1회 후 재사용.
    평면 2장이 텍스처 공유, 크로스페이드 120ms, MeshBasicMaterial, renderOrder 빌보드 1 리본 2
  - **림 밝기 실측 정정.** 알파 합성이 sRGB가 아니라 선형 버퍼에서 일어난다. 흰 림은 알파가 곧 선형 휘도라
    0.52는 선형 0.58로 threshold 0.42를 넘어 상대 전체가 블룸에 걸리고 있었다(다리 구간 192/255).
    알파 0.26 + 글로우 0.10으로 내려 159/255(선형 0.347)로 확정. 대신 림 두께를 3 → 5px로 키웠다
  - **정규 좌표 비등방 함정.** 512x1024라 x의 0.1은 51px, y의 0.1은 102px다.
    머리 반지름을 x 0.082 y 0.073으로 주었더니 84x150px 달걀이 나왔다. x 반지름을 y의 두 배로 잡아야 원이다
  - 거리 매핑 상수 재조정: dist(d) = 4.4 - (d/100)*3.1. 유효 범위 d 35~55에서 화면 높이 40.9~50.3퍼센트.
    d 52 실측 48.3퍼센트 대 계산 48.7퍼센트(림 글로우 두께분 0.4퍼센트포인트)
  - AI 검끝을 리본 실소스로 연결. 샘플링은 aiMode가 IDLE이 아니거나 aiLunge가 살아 있는 구간만.
    끊겼다 이어질 때 리본을 비워 화면을 가로지르는 직선을 막았다
  - FEINT와 REAL 구분: 1차는 형태(REAL 검끝이 어깨 위 y 1.76까지 크게, FEINT는 가드 근처 y 1.26에서 짧게),
    2차는 림 색조. 텔레그래프 텍스처는 한 장 공유라 총 5장을 지켰다
  - 피격 틴트: hitOwner가 ME면 득점자가 나이므로 **맞은 쪽이 상대다.** 프롬프트의 (hitOwner가 AI)는 반대라 정정.
    엔진 단독 구동 3회 전부 owner ME, 틴트 120ms(실측 133ms, 스텝 경계 포함), 피격 포즈 633ms
  - **리본 흰 코어 영구 잔존 버그 수정(V4b 회귀).** 해제 조건이 없어 명중 구간이 화면에 박혀 있었다.
    JUDGE 800ms 뒤 보통 구간처럼 사라진다. 코어 폭 1.9 → 1.3배, 구간 18 → 12개(포화 + 블룸으로 과대해 보였다)
  - XR 글라스 팔각형 프레임 GlassFrame.jsx. 뷰포트 실픽셀 SVG + ResizeObserver, 컷 clamp(48px, 6vw, 120px).
    딤(evenodd) / 크롬 스트로크(steel 그라디언트, non-scaling-stroke) / red.light 코너 액센트 3겹.
    CSS filter와 blur 0, 등장 페이드 300ms 1회, reduced에서 생략
  - HUD 5요소를 frameInset = 컷 + 12px 하나로 통합. 게이지를 하단 변 중앙으로 이동.
    JudgeText만 중앙 유지(800ms 전용이라 상주 정보가 아니다). 미터 켜지면 하단 행 62px 상향
  - **잔상을 SavePass + TextureEffect로 세웠다.** postprocessing에 AfterimagePass가 없다(v6.39 전수 확인).
    three examples/jsm의 것은 다른 컴포저의 Pass라 안 꽂힌다. damp 평시 0.82 → **0.70**
    (60fps 18프레임 뒤 0.0016으로 소멸. 0.82는 0.47초를 끌었다). 팽창 0.92는 설계값 유지
  - ?fps=1 미터 신설. dev이거나 파라미터가 있으면 뜨고 **프로덕션 빌드에서도 동작 확인**.
    현재 / 60초 평균 / 최저(1초 버킷 최소, 순간 역수 아님) / cpu / draw / tex / seg. 갱신 초당 2회
  - 검증: 셀프테스트 6종 PASS, **기준 서명 일치**, 5점 완주 2D와 three 양 경로, 다시 재개 OK, 콘솔 에러 0
  - 대리 지표: 드로우콜 28 → **31(+3, 상한 10)**, 텍스처 33 → **38(정확히 +5)**, 업로드 9.9MB 증가
  - 프레임 좌표 대조: 7개 뷰포트에서 컷 침범 0, HUD 겹침 0, 가로 스크롤 0.
    6절 검 8좌표 최소 여유 179px(1024x576) ~ 780px(4K)
  - judge.js machine.js opponents.js 무변경 유지. HEX 0, r3f 0, 이모지 0, localStorage 0, TS 0

- P-C 검 모델 교체 (확인 대기)
  - Antique Rapier Sword(GabrielUCG, CC-BY-4.0) glTF로 박스 검 교체. 메시 6개, 머티리얼 1개 공유
  - **위치는 public이어야 한다.** scene.gltf가 .bin과 텍스처를 상대 경로 문자열로 참조해
    src/assets에 두면 Vite가 .gltf만 해시 URL로 번들하고 나머지가 404가 난다.
    에셋이 미추적 상태였으므로 이동과 경량화를 먼저 끝내고 경량본만 커밋했다(4K 원본은 이력에 없다)
  - 텍스처 3장 4096 → 1024 리사이즈. **36.0MB → 3.8MB(89.5퍼센트 절감).** 파일명 유지라 gltf 무수정.
    PNG 유지(normal을 JPEG로 바꾸면 압축 아티팩트로 법선이 깨진다). KTX2는 보류
  - 정규화는 바깥 컨테이너 그룹에만. 내부 노드를 만지지 않는다(에셋 교체 시 재작업 방지).
    Box3로 장축 판별 후 -z 정렬, 손잡이 중심을 원점으로, 칼끝이 0.68m가 되게 uniform scale 0.758
  - **칼끝 화면 좌표 67.2% / 61.7%.** V4a 박스 검 실측 67% / 61%과 같다. 6절 궤적 좌표가 그대로 산다
  - 칼날(Blade_low)만 머티리얼 clone 후 emissive red.light, intensity 0.35.
    텍스처는 참조 공유라 추가 GPU 업로드 없음. 손잡이와 가드는 원본 금속 텍스처 유지
  - 칼날 휘도 실측 = 0.283 + 0.748 x intensity. 0.283은 금속 반사분.
    0.35에서 0.592로 threshold 0.42를 넘지만 의도한 것이다. 검신과 궤적이 하나의 붉은 선으로 이어져야 하고
    번지면 안 되는 것은 검 전체다. 손잡이는 emissive 0이라 번지지 않는다
  - frustumCulled = false 전 메시(1인칭 무기 표준 처리). 환경맵은 V4a PMREM 재사용
  - 로드는 모듈 캐시로 1회. 실패 시 박스 검 유지 + 콘솔 경고(실측 확인: draw 31 tex 25로 폴백)
  - 검증: 셀프테스트 6종, 기준 서명 일치, 5점 완주 2D와 three 양 경로, dev와 프로덕션 빌드 양쪽 로드 성공
  - 대리 지표: 드로우콜 31 → **33(+2. 레이피어 메시 6개 - 박스 검 4개)**, 텍스처 25 → **28(+3)**
  - CREDITS.md에 license.txt 크레딧 문구 전문 기록

- P-C 게임필 개편 D0 색 체계 개정 (확인 대기)
  - **상시 red emissive 폐지.** 칼날에 레드를 늘 얹으면 레드가 배경색이 되어 득점 순간이 묻힌다.
    DESIGN 2절에 "검과 레드의 관계" 개정을 신설하고 ARENA_SCENE 5절을 다시 썼다
  - finish 두 종 신설: chrome(내 검)과 antique(상대 검, D2에서 사용).
    chrome은 baseColor 맵을 떼고 steel.mid로 덮어 청동 톤을 지운다. metalness 0.97, roughness 0.16.
    **노멀맵과 거칠기 맵은 유지**해 표면 디테일과 마모가 산다. 맵을 유지한 채로는 픽셀별 색을 못 바꾼다
  - 머티리얼을 둘로 갈랐다. 칼날 1장 + 나머지 5메시 공유 1장. 전에는 칼날만 clone이라 힐트가 원본이었다
  - 득점 플레어: fx HIT/RIPOSTE가 owner ME로 들어오면 emissive가 steel.mid → red.light로 옮겨가고
    세기가 0.06 + 1.8t^2로 솟았다 dtRender/0.8로 깎여 JUDGE 800ms 안에 죽는다
  - 박스 검(폴백) 검끝 마커도 red.light → steel.mid. 평시 화면에서 레드를 전부 걷었다
  - 검증: **평시 검 영역 붉은 픽셀 0**(득점 전, 감쇠 후 모두 0). 득점 순간에만 붉은 픽셀 146 실측
    (플레어가 800ms라 헤드리스 캡처로는 못 잡아 감쇠를 8초로 늘려 촬영 후 원복했다)
  - 셀프테스트 6종, **기존 기준 서명 유지**(렌더만 바뀌었다), 5점 완주 2D와 three 양 경로, 에러 0

- P-C 게임필 개편 D1 버그 셋 (확인 대기)
  - **배경 잔상 고스트 = 8비트 양자화.** 원인을 특정했다. `EffectComposer` 기본 프레임 버퍼가 8비트라
    잔상 되먹임 out = current x 0.3 + prev x 0.7에서 prev가 1/255일 때 0.7이 반올림으로 다시 1이 된다.
    **고정점이 0이 아니라 1/255이라 영원히 안 죽는다.** 검을 한 번 휘두르면 그 자리에 유령이 박히고
    25초 뒤에도 밝기가 같았다. damp를 낮춰도 소용없다
  - 수정: `frameBufferType: HalfFloatType`. 실측 잔존 픽셀 **0**(가드 12초 뒤, 리사이즈 왕복 뒤 모두).
    리사이즈 클리어나 phase 전환 클리어 코드는 넣지 않았다. 근본 원인이 없어져 필요가 없다
  - 전환 후 재검증: 하늘 평균 7.08/255로 배경 안 뜸, 상대 림 선형 0.352로 문턱 아래 유지
  - **찌르기 히치는 이 환경에서 계측 불가.** 헤드리스 중앙 프레임이 158ms라 수 ms 히치가 분해되지 않는다.
    대신 렌더 경로에서 히치를 만드는 지점을 코드로 특정해 셋 다 제거했다
    1. 포즈 텍스처 첫 사용 업로드. 512x1024 다섯 장을 `renderer.initTexture`로 개막 전에 올린다.
       **명중 포즈는 하필 찌르기가 꽂히는 순간에 처음 뜬다**
    2. 포즈 교체마다 세우던 `material.needsUpdate` 제거. 두 텍스처 모두 존재해 define이 같은데
       세우면 three가 프로그램을 다시 훑는다
    3. `renderer.compile(scene, camera)`를 init과 검 모델 부착 직후에 호출. 첫 등장 프레임 컴파일 제거
    4. `pose.read()`가 매 프레임 새 객체를 만들던 것을 재사용 객체로 교체(초당 60개 쓰레기 제거)
  - **상대 발 잘림 = 텍스처 경계 클리핑.** 발이 v 0.984라 발 스트로크와 림과 글로우가 밖으로 나갔다.
    발을 0.952로 들이고 머리 v 0.021과 발바닥 v 0.969 사이가 정확히 1.9m가 되게 평면을 2.004m로 역산.
    화면 점유율 d 52에서 49.7퍼센트로 설계값 48.7에 더 가까워졌다(전에는 그림이 1.9m보다 짧았다)
  - 접지 그림자 블롭 추가. 씬에 직접 붙이고 z만 따라간다(빌보드 자식으로 넣으면 카메라 따라 일어선다)
  - 검증: 셀프테스트 6종, **기존 기준 서명 유지**, 5점 완주 2D와 three 양 경로, 에러 0.
    대리 지표 드로우콜 33 → 34(그림자 +1), 텍스처 28 → 30

- P-C 게임필 개편 D2 상대 완성 (확인 대기)
  - **실루엣을 흰 유니폼으로 뒤집었다.** 어두운 채움 + 밝은 림에서 밝은 몸체 + 어두운 부위 테두리로.
    2패스(굵게 어둡게 한 번, 유니폼 톤 한 번)라 겹친 팔다리가 갈린다.
    마스크는 어두운 메시 + 밝은 테두리 + 가로 결, 장갑과 신발도 어둡게 얹었다
  - **유니폼 밝기 상한.** 순백은 선형 1.0이라 상대 전체가 블룸에 번진다.
    steel.mid를 bg.deep으로 0.30 눌러 실측 167/255(선형 0.386)로 문턱 0.42 아래에 앉혔다
  - 텍스처에서 검을 뺐다. 3D 골동 레이피어가 손 앵커에 따로 붙는다(finish 'antique')
  - 손 앵커는 텍스처 좌표에서 역산. 포즈마다 위치와 겨냥이 바뀌고 겨냥 방향으로 검이 돈다
  - **겨냥을 카메라 정면으로 두면 검이 극단적으로 단축돼 점으로 보인다(실측).**
    대기와 예고는 비스듬히 세우고 런지만 카메라 쪽 성분을 키웠다
  - antique 마감을 metalness 0.90 / roughness 0.30으로 올렸다. 원본 값으로는 블랙 무대에서
    빛을 못 받아 검이 통째로 사라진다. 텍스처는 그대로라 청동 결은 유지된다
  - AI 리본 소스를 이 검의 tipAnchor로 옮겼다. 가상 포인트는 로드 실패 폴백으로만 남는다
  - **순간이동 가드 신설(리본 공통).** 겨냥이 크게 돌 때 두 점이 벌어져 화면을 가로지르는
    거대한 띠가 그려졌다(실측 24,286픽셀). max(0.35m, 12 m/s x dt)를 넘으면 이력을 버린다.
    고정 거리로 두면 저프레임 환경에서 정상 큰 걸음까지 잘려 리본이 사라진다(이것도 실측으로 확인)
  - docs/OPPONENT_IMAGE_SPEC.md 산출. 5포즈 자세 서술, 공통 조건, 밝기 상한 근거,
    영문 생성 프롬프트, setPoses 교체 절차와 검수 항목
  - 검증: 셀프테스트 6종, **기존 기준 서명 유지**, 5점 완주 2D와 three 양 경로, 에러 0.
    대리 지표 드로우콜 34 → 40(상대 검 메시 6개), 텍스처 30 → 31
  - **미검증 하나.** 상대 공격 시 파란 리본이 검끝에서 나오는 그림은 헤드리스에서 확인하지 못했다.
    7fps에서 AI 공격 구간이 한 프레임이라 리본이 2점을 못 모은다. 실기 확인이 필요하다

## 진행중
- **P-C 게임필 개편 (D3 대기). 트랙 선점.** 실플레이 크리틱 반영. 단계 D0~D5
  - **D0, D1, D2 완료.** 다음은 D3 AI 다양화와 런지(게임플레이 변경, 서명 갱신 절차). 확인 대기 중
  - 이후 D2 상대 완성 / D3 AI 다양화와 런지 / D4 막기 시각화 / D5 FUI 히트 마커
  - D0~D2는 렌더만 건드리므로 기존 기준 서명이 유지돼야 한다.
    D3은 의도적 게임플레이 변경이라 서명 갱신 절차를 밟는다
- (착수 전 여기에 트랙 선점 선언. P-A presentation / P-B brand / P-C arena+controller)

## 결정 기록

- **arena를 three.js 1인칭으로 승격한다 (V0에서 확정).**
  근거 둘: 컨트롤러가 보내는 쿼터니언이 1인칭 검 자세에 1대1로 꽂혀 C3 연동이 자연스러워진다.
  궤적 리본과 후처리가 GPU로 넘어가 CPU 예산에 여유가 생긴다.
  제약: 게임 로직(machine, judge, opponents, loop, 입력 큐, HUD, 셀프테스트)은 재활용하고 수정하지 않는다.
  루프 주도권은 loop.js가 쥔다(react-three-fiber 미도입). canvas 2D 렌더러는 삭제하지 않고 폴백으로 유지한다.
  **타임박스 3세션.** 초과 시 즉시 중단하고 그 시점 상태를 커밋한 뒤 2D 폴백으로 데모를 확정한다.

## 다음 작업
- **상대 검 blue emissive 적용.** 로더와 emissive 함수는 색 인자로 재사용 가능하게 짜 두었다.
  `attachSwordModel(parent, { emissive: colors.trail.ai, ... })` 한 줄이면 되지만
  상대는 빌보드(평면)라 3D 검을 어디에 붙일지가 먼저 정해져야 한다
- **환경(도장 배경과 조명) 작업**
- **승격 V4 타임박스 3세션 소진(V4a / V4b / V4c). 완료 서브단계 V0 V1 V2 V3 V4a V4b V4c.**
  V4d(hitstop, ShockWave, 색수차, 셰이크)와 V4e(시간 팽창 시각 세트)가 잔여다.
  **controller C2로 갈지 승격 잔여를 먼저 할지는 사용자 판단이다.** 임의 착수하지 않는다
- P-C C2 controller 센서 (C1 확인 후 착수). C1 판정 규칙 보강분 승인 여부를 먼저 확인할 것
- P-A presentation / P-B brand는 계정별 선점 후 병렬 착수 가능
- 배경 이미지 재생성: 네이비 톤 도장 이미지 폐기, 블랙 기조로 생성
- 시각디자이너 워드마크 SVG 슬롯 전달(크롬 레터링)

## 미해결 이슈
- dev 포트 고정: arena 5173, controller 5174, presentation 5175, brand 5176
- 루트 package.json "type": "module" 유지 필요(shared ESM 로드)
- hello의 방 코드 필드: SERVER.md는 room, 기존 골격은 code. 서버가 room ?? code로 둘 다 받는다.
  클라이언트 구현 시 room으로 통일하고 code 폴백을 제거할 것
- arena favicon.ico 404. 네 앱 공통으로 favicon이 없다. PHASE 2 배포 정리에서 함께 처리
- **arena fps 실기 확인.** V4b 시점 확인은 통과했다(발표 노트북 거의 60, 한 판 후 59 복귀).
  헤드리스 SwiftShader의 10fps는 환경 한계이고 그 수치로 통과 판정을 하지 않는다.
  다만 V4c에서 후처리 패스가 2개(잔상 EffectPass + SavePass) 늘고 빌보드 평면 2장이 붙었으므로
  **주소 뒤에 ?fps=1을 붙여 1분 교전 후 평균과 최저를 다시 확인해야 한다. 30 이상이면 통과다**
- **TODO 카피: ai-workflow 4행의 "AI가 한 것"과 "사람이 판단한 것".** 팀만 아는 내용이라 비워 두었고
  화면에는 "확정 예정"으로 정직하게 드러난다. content/sections.js의 WORKFLOW 배열을 채우면 된다
- outputs 3종 카드의 캡처 이미지 미확보. 지금은 "캡처 예정" 플레이스홀더다.
  arena와 brand 화면이 나오면 OutputsSection의 캡처 슬롯을 교체한다
- presentation/src/content/rules.js는 arena judge.js RULES의 사본이다(간합 유효 범위 35~55).
  앱 독립 배포 원칙상 arena를 import하지 않아 생긴 중복이다. shared/tokens.js로 승격하면 사라진다.
  judge.js를 고치면 이 파일도 같이 고쳐야 한다
- **저장소 밖 Web/ 폴더에 별도 git 저장소가 있다.** 커밋 1개("1번째 세팅"), 원격 없음,
  ganhap을 gitlink(서브모듈, 모드 160000)로 974e2be에 고정해 두었다. 그 커밋은 3분할 때 폐기되어
  이제 ganhap 이력에 없다. 즉 끊어진 참조다. Web/CREDITS.md도 빈 파일로 남아 있다.
  진짜 저장소는 ganhap이고 원격도 거기에만 붙어 있다. Web/.git 정리 여부는 사용자 판단 사항
- 좁은 폭(320, 390)에서 뷰포트보다 긴 섹션의 본문이 하단 고정 레일 아래를 지나간다.
  고정 내비의 정상 동작이라 레일 배경을 불투명 bg.raised로 두어 가린다. 레이아웃 버그 아님
- presentation ProgressRail 구조 결정: md(768) 미만은 우측 세로 레일이 본문 제목을 덮어(320, 390 실측)
  하단 가로 행 4개씩 2줄로 전환한다. 320에 44px 타깃 8개를 한 줄로 넣으면 352px라 넘치기 때문
- presentation 레일 라벨은 hover와 focus에서만 뜬다. 상시 노출하면 768~1440에서 본문을 덮는다(실측).
  현재 섹션 표시는 red.light 점과 aria-current가 맡는다
- arena 상대 실루엣과 배경은 코드로 그린 임시 텍스처와 그라디언트다. 1인칭이라 필요한 것은
  **상대 1인의 5포즈**이고(내 검은 3D 지오메트리라 스틸이 필요 없다), 블랙 기조 도장 이미지가 오면
  renderer의 setPoses와 setBackgroundImage로 교체한다(인터페이스 준비 완료, 키는 idle/advance/telegraph/lunge/hit)
