# OPPONENT_IMAGE_SPEC.md 상대 선수 이미지 사양서

arena 1인칭 결투의 **AI 상대 빌보드**에 쓸 스틸 5장 제작 사양이다.
지금은 코드로 그린 임시 실루엣이 서 있고, 이 사양대로 만든 이미지가 도착하면 `setPoses()`로 교체한다.

관련: 씬 사양은 `ARENA_SCENE.md` 7절, 색 규칙은 `DESIGN.md` 2절.

---

## 0. 가장 중요한 두 가지

1. **검을 그리지 마라.** 3D 골동 레이피어가 손 위치에 따로 붙는다. 이미지에 검이 있으면 검이 두 자루가 된다.
   검을 쥔 손 모양(주먹 쥔 장갑)까지만 그린다.
2. **발바닥이 프레임 맨 아래에 닿되 잘리지 않게 한다.** 발끝과 그림자와 외곽선이 경계를 넘으면
   바닥에서 잘린 그루터기로 보인다. 발바닥 선을 프레임 하단에서 **아래로 3퍼센트 띄운다.**

---

## 1. 공통 조건

| 항목 | 값 |
|---|---|
| 크기 | **1024 x 2048** (세로 2배. 지금 임시본은 512 x 1024다) |
| 형식 | **투명 배경 PNG**. 배경에 색을 깔지 마라 |
| 시점 | **정면**. 카메라 눈높이 1.6m에서 3m 거리를 본 각도 |
| 인물 | 흰 펜싱 유니폼(재킷, 니커, 긴 양말) + **펜싱 마스크**. 성별 특정하지 않는다 |
| 비례 | 머리:몸 **1:6.5**. 머리 꼭대기가 프레임 상단에서 2퍼센트, 발바닥이 하단에서 3퍼센트 |
| 조명 | **무채색 림**. 위쪽과 옆에서 오는 차가운 흰 빛. 색조명 금지 |
| 채도 | 유니폼은 흰색, 마스크는 어두운 회색 메시, 장갑과 신발은 어두운 회색. **유채색 0** |
| 밝기 | **유니폼 최대 밝기를 sRGB 0.62(약 158/255) 이하로.** 아래 2절을 반드시 읽어라 |
| 그림자 | 인물에 붙는 자체 그림자만. **바닥 그림자를 그리지 마라**(3D가 따로 깐다) |

## 2. 밝기 상한이 있는 이유 (넘기면 화면이 망가진다)

무대가 블랙이라 화면에 Bloom(발광 번짐)이 걸려 있고, 그 문턱이 **선형 휘도 0.42**다.
순백(sRGB 1.0)은 선형 1.0이라 문턱을 훌쩍 넘어 **상대 전체가 뿌옇게 번진다.**
블룸은 검 궤적의 전유물이고 상대가 번지면 궤적이 묻힌다.

sRGB 0.62면 선형 약 0.34로 문턱 아래다. 배경이 0.04이므로 **대비 15:1이라 블랙 무대에서는
이것이 충분히 흰색으로 읽힌다.** 눈으로 보고 "회색 같다" 싶어도 실제 화면에서는 희다.
마스크 테두리 같은 작은 하이라이트는 예외적으로 더 밝아도 된다(면적이 작아 번져도 티가 안 난다).

## 3. 5포즈

파일명은 아래 키를 그대로 쓴다. `setPoses()`가 이 키로 찾는다.

### `idle` 대기 (앙가르드)

두 발을 어깨너비보다 넓게 벌리고 **무릎을 바깥으로 굽힌** 기본 자세.
상체는 정면, 검 든 팔(우리 시점의 **왼쪽**)은 팔꿈치를 굽혀 허리 높이에 두고 주먹을 쥔다.
반대 팔은 팔꿈치를 굽혀 머리 뒤로 들어 올린다(펜싱의 뒷팔). 정지, 무게중심 중앙.

### `advance` 전진

앞발(우리 시점의 왼쪽)이 바닥에서 떠 앞으로 나가는 순간. 상체가 반 박자 따라간다.
`idle`보다 무게중심이 앞이고 어깨가 살짝 낮다. **한 장으로 "다가온다"가 읽혀야 한다.**

### `telegraph` 예고

**공격 직전의 준비 동작.** 검 든 어깨가 확실히 올라가고 팔꿈치가 뒤로 당겨진다.
뒷다리에 힘이 실려 몸이 눌린다. 이 자세가 플레이어에게 "온다"는 신호이므로
**실루엣만 잘라 봐도 `idle`과 명확히 달라야 한다.** 어깨 높이 차이가 핵심이다.

### `lunge` 런지

앞다리를 길게 뻗은 깊은 런지. 뒷다리는 곧게 펴지고 뒷팔은 뒤로 뻗어 균형을 잡는다.
검 든 팔은 **카메라를 향해 완전히 뻗는다**(주먹이 크게, 원근 강조).
상체가 낮아지고 앞으로 나온다. 전신 높이가 `idle`보다 낮아도 된다.

### `hit` 피격

상체가 뒤로 젖혀지고 어깨가 열린다. 두 팔이 바깥으로 흩어지고 마스크가 위를 향한다.
무릎이 살짝 꺾인다. **맞았다는 것이 한 프레임으로 읽혀야 한다.**

---

## 4. 생성형 이미지 프롬프트 (초안)

한 장씩 자세 문구만 바꿔 돌린다. 5장의 **인물 생김새와 조명이 같아야** 하므로
시드 고정이나 참조 이미지 방식을 쓴다.

> Front-facing full-body fencer in a white fencing uniform (jacket, knickers, long socks) and a
> dark mesh fencing mask, standing on a plain transparent background. **No sword, no weapon —
> the sword hand is a closed gloved fist.** Neutral achromatic rim lighting from above and the
> side, cool white, no colored lights. Dark grey glove and shoes. Head-to-body ratio 1:6.5.
> The whole figure is centered, soles near the bottom edge but fully inside the frame.
> Muted white uniform, not blown-out pure white. No ground shadow. No background elements.
> Pose: **{{자세 문구}}**

자세 문구(위 3절을 영문으로):

| 키 | 자세 문구 |
|---|---|
| `idle` | on guard stance, feet wider than shoulders, knees bent outward, sword arm bent at waist height, rear arm raised behind the head |
| `advance` | stepping forward, front foot lifted off the ground, torso leaning slightly ahead |
| `telegraph` | winding up to attack, sword shoulder clearly raised, elbow pulled back, weight loaded on the rear leg |
| `lunge` | deep lunge, front leg fully extended, rear leg straight, sword arm thrust toward the viewer with the fist large in perspective, rear arm extended back |
| `hit` | struck and recoiling, torso arched backward, arms flung outward, mask tilted up, knees buckling |

**검수 항목**: 검이 없는가 / 배경이 투명한가 / 발이 프레임 안에 완전히 들어왔는가 /
유니폼이 순백으로 날아가지 않았는가 / 5장의 인물과 조명이 같은가.

---

## 5. 교체 방법

이미지 5장을 받으면 `HTMLImageElement`로 로드해 렌더러에 넘긴다. 키는 3절의 파일명과 같다.

```js
// arena/src/App.jsx 또는 로더 모듈에서
const load = (src) => new Promise((res, rej) => {
  const img = new Image();
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = src;
});

const [idle, advance, telegraph, lunge, hit] = await Promise.all([
  load('/assets/opponent/idle.png'),
  load('/assets/opponent/advance.png'),
  load('/assets/opponent/telegraph.png'),
  load('/assets/opponent/lunge.png'),
  load('/assets/opponent/hit.png'),
]);
renderer.setPoses({ idle, advance, telegraph, lunge, hit });
```

파일은 `arena/public/assets/opponent/`에 둔다. **`src/assets`에 두지 마라.**
Vite가 번들하면서 경로가 해시로 바뀌어 로드가 깨진다(검 모델에서 이미 밟은 지뢰다).

교체 뒤 확인할 것 둘.

1. **발바닥 위치.** 텍스처 안에서 발바닥이 v 0.969에 오도록 만들어 달라고 했지만
   실제 이미지가 다르면 `opponent.js`의 `SOLE_V`와 `HEAD_V`를 실측값으로 고친다.
   이 두 값이 평면 크기를 결정하므로 여기가 틀리면 상대가 바닥에 뜨거나 파묻힌다.
2. **밝기.** 상대 다리 구간 최대 밝기가 선형 0.42를 넘지 않는지 실측한다. 넘으면 블룸에 걸린다.
