# BRAND 미디어 인터랙션 계획 (프레임 시퀀스 · 호버 재생 · 웨이브)

brand 사이트의 미디어 인터랙션 로직 3종을 일반화한다. **에셋(영상/프레임)은 아직 없어 플레이스홀더로 로직을
세우고 slot으로 둔다.** 실제 에셋이 오면 컴포넌트의 prop만 채운다. 전부 transform/opacity 위주, reduced-motion 대응.

공통 규율: 라이트 팔레트, 네이비 프라이머리 #263E5F, SUIT. 어두운 레드까지(r-b>40) 잔존 0.

---

## A. 미디어 프레임 시퀀스 (`components/MediaSequence.jsx`)

**GLB 아님. 이미지 시퀀스**(ffmpeg로 쪼갠 프레임)를 스크롤/트리거에 매핑한다.

### A.1 ffmpeg 프레임 파이프라인 (영상 → webp 프레임)

영상이 확보되면 아래로 프레임을 쪼갠다. **fps와 총 프레임 수를 변수로 둔다.**

```bash
# 변수
SRC=input.mp4          # 원본 영상
FPS=24                 # 초당 프레임 수 (시퀀스 재생 fps와 일치시킨다)
OUT=public/frames/<name>   # 출력 폴더

mkdir -p "$OUT"
# webp로 가볍게. frame-000.webp ~ 로 0패딩(정렬/프리로드 URL 생성 편의).
ffmpeg -i "$SRC" -vf "fps=$FPS,scale=1024:-1:flags=lanczos" -q:v 70 "$OUT/frame-%03d.webp"

# 총 프레임 수 확인(컴포넌트에 N으로 넘긴다)
ls "$OUT" | wc -l
```

- **webp**로 가볍게, `scale`로 폭 고정(원본 그대로면 프리로드가 무겁다).
- 프레임 URL 배열을 `frames` prop으로 넘긴다: `Array.from({length:N}, (_,i)=>` `` `/frames/<name>/frame-${String(i).padStart(3,'0')}.webp` `` `)`.
- `fps`는 enter 모드의 재생 속도(`dur = N/fps`)에 쓴다.

### A.2 두 재생 방식 (한 컴포넌트로 일반화)

| mode | 동작 | 자리 |
|---|---|---|
| `scroll` | **스크롤 진행 0~1을 프레임 0~N에 매핑.** 바깥이 스크롤 길이(200dvh), 안쪽 `sticky`로 붙는다. blur→sharp 수렴 함께 | 딥다이브형 미디어 |
| `enter` | **진입(IntersectionObserver) 1회 재생.** 흐림→선명으로 한 번 돌고 **마지막 프레임 고정** | 히어로/대표 미디어 |

- **회전 또는 흐림에서 선명 수렴 both 지원.** 프레임 자체가 회전이면 프레임 스왑이 회전을, blur 필터가 선명 수렴을 낸다.
- **프리로드**: 마운트 시 모든 프레임을 `new Image()`로 디코드해 스왑 끊김을 없앤다.
- **플레이스홀더**: `placeholderFrames(n)`이 SVG data-URI 프레임 n장(프레임 번호 + 진행)을 만들어 에셋 없이 로직을 테스트한다.
  실측: 대표 미디어 enter 모드가 `frame 000`(blur)에서 `frame 023`(sharp)까지 1회 재생 후 고정됨을 확인.

### A.3 pin/워프 충돌 방지

**`sticky`다. GSAP pin(`fixed`)이 아니다.** transform이 걸린 조상(R3 ScrollWarp)에서 `fixed`는 뷰포트 기준을
잃는다(PITFALLS 실측: pin 섹션이 top 0 → -1836으로 날아감). scroll 모드는 sticky 무대(`top: var(--pnav-h)`)라 이 함정을 안 밟는다.

### A.4 reduced-motion

`prefers-reduced-motion: reduce`면 연출 없이 **마지막(선명) 프레임 하나**만 세운다.

---

## B. 호버 자동 재생 (`components/HoverMedia.jsx`)

지정 슬롯(제품 뷰, 미디어 카드)에 마우스가 오면 그 위 영상이 재생, 떼면 정지+첫 프레임 복귀.

- **`<video muted playsInline loop>`.** 자동재생 정책상 `muted` 필수, `playsInline`이라 모바일에서 전체화면 안 뜬다.
  호버 진입 `play()`, 이탈 `pause()` + `currentTime = 0`. 클릭 유도 없이 마우스만으로 미리보기.
- **커스텀 커서(R1 `Cursor.jsx`)와 연동.** 슬롯에 `data-cursor`를 달면 Cursor의 위임 셀렉터(HOT)에 자동으로 걸려
  호버 시 커서가 커진다. Cursor가 document 위임이라 나중에 생긴 요소도 별도 배선 없이 걸린다(실측: 뷰 슬롯 3개 `data-cursor` 확인).
- **영상 없을 때(slot)**: `src`가 없으면 영상 태그 대신 대기 표면(`이미지/영상 첨부 예정`)만 둔다. 호버/커서 로직은 그대로 살아 있다.
- **프레임 시퀀스 호버 재생**이 필요하면 A의 MediaSequence를 호버 진행에 연결한다(현재는 video 우선).
- reduced-motion·터치(`hover: none`)에서는 자동재생을 걸지 않는다(호버 개념이 없다).

**배선**: 제품 페이지 뷰 슬롯(Side/Front/Top)이 HoverMedia 플레이스홀더다. 영상이 오면 `src`만 채운다.

---

## C. 파도 웨이브 (`components/WaveReveal.jsx`)

**용도 판단(보고).** 두 용도 중 **요소 등장 웨이브**를 택했다.

| 용도 | 판단 |
|---|---|
| 배경 앰비언트 물결 왜곡(WebGL 셰이더) | **보류.** 상시 렌더라 저사양에서 프레임을 먹고(성능 부담), 라이트 팔레트에 은은해야 해 존재감도 약하다. |
| **요소 등장 웨이브(채택)** | 텍스트/카드가 파도처럼 순차로 물결치며 등장. 기존 `data-beat` 리빌 시스템의 **stagger 확장**이라 가볍다. |

- 직속 자식이 웨이브 단위. 각 자식이 `y + opacity`에서 **stagger(sine 이징)**로 물결친다. transform/opacity만.
- ScrollTrigger `once: true`(되감아도 안 사라진다). ProductLayout의 `data-beat`와 겹치지 않게 자식엔 data-beat를 안 단다.
- reduced-motion에서 **비활성**(정적으로 그대로 보인다).
- **배선**: 제품 뷰 슬롯 3개(Side/Front/Top)가 WaveReveal로 물결치며 등장.

앰비언트 물결이 꼭 필요하면 히어로 배경에 가벼운 CSS 기반(느린 background-position/mask 왜곡)으로 별도 추가한다(성능 우선).

---

## 대기 (slot)

- 실제 영상/프레임 에셋 전량(ffmpeg 파이프라인으로 쪼갠 webp 프레임, 호버 재생용 mp4/webm).
- 제품 뷰 이미지(Side/Front/Top). 확보된 렌더(front1, pro2 등)를 뷰 슬롯 `src`에 넣으면 된다.
