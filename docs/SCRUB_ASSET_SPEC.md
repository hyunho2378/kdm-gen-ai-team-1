> [표준 문서 아님] 이 문서는 presentation 히어로 영상 스크럽(P3) 에셋 사양이다. 채택 판정은 docs/LIBRARIES.md 상단 판정표가 우선한다.

# SCRUB_ASSET_SPEC.md — 히어로 영상 스크럽 프레임 사양

표지(cover) 히어로는 스크롤에 맞춰 펜싱 영상 프레임을 1:1로 넘긴다(imageSequence 로직, P3). 실물 펜싱 영상은 아직 없다. **이 문서는 팀이 실물을 준비하는 절차와, 개발이 실물 없이 진행하기 위한 임시 프레임 규약을 함께 고정한다.** 실물이 오면 **폴더만 갈아끼우면** 반영되도록 경로·명명·매니페스트를 못박는다.

---

## 1. 최종 경로와 명명 (절대 고정)

```
presentation/public/frames/hero/
  frame_0001.webp
  frame_0002.webp
  ...
  frame_0072.webp
  manifest.json
```

- 런타임 경로는 `/frames/hero/frame_0001.webp` (Vite가 `public/`를 루트로 서빙).
- **파일명은 leading-zero 4자리 고정**: `frame_%04d.webp`. 1부터 시작(0 아님).
- 포맷은 **WebP** 통일. 한 시퀀스 안에서 확장자·해상도를 섞지 않는다.
- `manifest.json`이 프레임 수와 규격의 단일 원천이다. P3 로더는 이 파일을 읽는다.

```json
{ "count": 72, "pattern": "frame_%04d.webp", "width": 1280, "height": 720, "fps": 24, "placeholder": true }
```

실물 교체 절차: (1) 실물 프레임을 위 명명으로 이 폴더에 덮어쓴다 → (2) `manifest.json`의 `count`·`width`·`height`·`fps`를 실제값으로 바꾸고 `placeholder`를 `false`로 → **끝.** 코드 수정 없음.

---

## 2. 팀이 준비할 실물 영상 요건

- **동작**: 펜싱 찌르기/전진 한 동작. **5~10초.** 카메라 고정(핸드헬드 흔들림 금지). 한 방향으로 진행하는 동작이라야 스크럽이 서사가 된다.
- **배경**: **어두운 배경 또는 단색 배경**으로 촬영하거나 생성한다(bg.base `#0B0B0E` 계열이 이상적). 배경이 복잡하면 프레임 간 노이즈가 스크럽에서 지글거린다.
- **해상도**: **1080p(1920×1080)** 촬영, 프레임은 그 비율 유지. 히어로가 전폭이므로 16:9 가로.
- **프레임레이트**: **24fps** 기준. 5초면 120장, 10초면 240장 원본이 나온다.
- **조명/노출**: 검신·검끝이 배경과 분리되게. 얼굴·상표·타인 등 권리 이슈 소지는 프레이밍에서 배제.

---

## 3. 영상 → 프레임 파이프라인

### 3-1. scroll-scrub-starter (MIT)로 추출

`timkosters/scroll-scrub-starter`(MIT, https://github.com/timkosters/scroll-scrub-starter )가 ffmpeg 전처리를 스크립트 한 줄로 제공한다. **코드를 우리 앱에 반입하지 않는다**(빌드타임 도구로만 사용). 로직/앱 채택이 아니므로 CREDITS 기재 대상 아님.

```bash
# 저장소 클론 후
./build.sh video.mp4        # frames/ 에 시퀀스 추출 + 리사이즈
```

직접 ffmpeg를 쓸 경우 동등 절차:

```bash
# 24fps로 프레임 추출, 가로 1280 리사이즈(높이 자동)
ffmpeg -i video.mp4 -vf "fps=24,scale=1280:-1" frame_%04d.png
```

### 3-2. WebP 변환·최적화

```bash
# png/jpg → webp 일괄 (cwebp, quality 80)
for f in frame_*.png; do cwebp -q 80 "$f" -o "${f%.png}.webp"; done
```

- **해상도 동일 통일**: 모든 프레임 폭·높이를 하나로. 섞이면 canvas drawImage에서 프레임마다 스케일이 튄다.
- **파일명 leading-zero 재확인**: 추출 도구가 1자리부터 시작하면 정렬이 깨진다. `%04d` 보장.

### 3-3. 프레임 수 권장

- **240 내외**를 상한으로 본다(10초 24fps). 그 이상은 프리로드·메모리 부담만 커진다.
- 스크럽 부드러움은 240이면 충분하고, **필요 시 2프레임당 1장씩 스킵**해 120으로 줄여도 스크럽 체감은 유지된다(P7 모바일 축소 세트가 이 스킵을 쓴다).
- 하한은 60. 그 아래는 스크럽이 끊겨 보인다.

### 3-4. 투명 배경(선택)

검신만 남기고 배경을 지우려면 두 경로 중 하나:

- 추출 후 배경 제거 도구로 알파를 뚫고 **투명 WebP**로 저장. (scroll-scrub-starter는 `--transparent` 옵션 계열을 제공)
- 또는 촬영 단계에서 단색 배경으로 사전 처리(크로마/루마 키) 후 추출.

투명 프레임을 쓰면 **P3 렌더러는 매 프레임 `clearRect`가 필수**다(불투명이면 이전 프레임을 덮어써 clear 불필요). manifest에 `"transparent": true`를 추가하면 로더가 분기한다.

---

## 4. 임시 프레임 (실물 도착 전 개발용)

- 생성기: `presentation/scripts/gen_temp_frames.py` (Python + Pillow). 재생성 가능.
- 산출: 위 1절 경로에 **72장**(`frame_0001.webp`~`frame_0072.webp`) + `manifest.json`(`placeholder: true`).
- 내용: DESIGN 10절 검끝 곡선 모티프가 진행되는 시퀀스. 준비 곡선 뒤 짧고 급한 찌르기, 검끝이 크롬→red.light로 물든다. tokens 색만 사용.
- 프레임마다 우하단에 `TEMP · NNN/072` 흐린 라벨 — **명백한 플레이스홀더 표식이자 스크럽 검증 보조**(실물엔 없음).
- 규격은 실물 목표와 동일(1280×720, 24fps 가정)이라 P3 로더 경로가 임시/실물에서 바뀌지 않는다.

재생성:

```bash
python3 presentation/scripts/gen_temp_frames.py
```
