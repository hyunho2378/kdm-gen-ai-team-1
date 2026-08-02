# MOTION.md — 모션·인터랙션·재질 표준

Apple HIG(Designing Fluid Interfaces, The Details of UI Typography, Principles of Great Design)와 Emil Kowalski의 디자인 엔지니어링 표준을 웹으로 옮긴 것이다. 모션을 넣거나 고칠 때 이 문서의 수치를 그대로 인용하고, 근사치로 대체하지 마라.

---

## 0. 이걸 애니메이션해야 하나 (가장 먼저 물을 것)

| 사용 빈도 | 결정 |
|---|---|
| 하루 100회 이상 (키보드 단축키, 커맨드 팔레트) | **애니메이션 금지. 예외 없음** |
| 하루 수십 회 (hover, 목록 이동) | 제거하거나 대폭 축소 |
| 가끔 (모달, 드로어, 토스트) | 표준 애니메이션 |
| 드묾·최초 1회 (온보딩, 축하, 완료) | 연출 허용 |

**키보드로 시작된 동작은 절대 애니메이션하지 않는다.** 하루에 수백 번 반복되므로 느리고 단절된 느낌을 준다.

정당한 모션의 목적: 공간적 일관성, 상태 표시, 설명, 피드백, 급격한 변화 완화. **"멋있어서"는 자주 보이는 요소에서 정당한 이유가 아니다.**

---

## 1. 반응 속도 — 지연을 없애라

지연이 나타나는 순간 직접성이 무너진다.

- **pointer-down에 반응하고, release를 기다리지 마라.** 버튼은 눌리는 즉시 하이라이트된다. `click`을 기다려 피드백을 주면 죽은 느낌이 난다.
- 디바운스·인위적 타이머·전환 대기·300ms 탭 지연 등 입력 경로의 모든 지연을 감사하라.
- **드래그·슬라이더·드로어는 제스처 진행 중 1:1로 계속 반응해야 한다.** 제스처가 끝난 뒤에만 애니메이션하지 마라.

---

## 2. 이징 (Easing)

결정 순서:

| 상황 | 이징 |
|---|---|
| 진입·이탈(enter/exit) | **ease-out** |
| 화면 내 이동·모핑 | **ease-in-out** |
| hover·색상 변화 | ease |
| 등속 운동(마퀴, 프로그레스) | linear |
| 기본값 | **ease-out** |

**UI에 `ease-in`을 쓰지 마라.** 느리게 시작해서 사용자가 보고 있는 바로 그 순간을 지연시킨다. 200ms의 ease-out이 200ms의 ease-in보다 빠르게 *느껴진다*.

CSS 기본 이징은 약하다. 강한 커스텀 커브를 tokens에 정의해 쓴다.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* UI 진입·이탈 */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* 화면 내 이동 */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* iOS풍 드로어 */
```

---

## 3. 지속시간 (Duration)

| 요소 | 지속시간 |
|---|---|
| 버튼 press 피드백 | 100–160ms |
| 툴팁·작은 팝오버 | 125–200ms |
| 드롭다운·셀렉트 | 150–250ms |
| 모달·드로어 | 200–500ms |
| 마케팅·설명형 | 더 길어도 됨 |

**규칙: UI 애니메이션은 300ms 미만.** 180ms 드롭다운이 400ms보다 반응적으로 느껴진다.

---

## 4. 물리성 (Physicality)

- **`scale(0)` 금지.** `scale(0.9~0.97)` + `opacity: 0`에서 시작한다. 현실에서 무에서 나타나는 것은 없다.
- **팝오버는 원점을 인식해야 한다.** 트리거 요소를 기준으로 확대되어야 하며 중앙 기준이 아니다. `transform-origin`을 트리거로 설정한다. **모달은 예외** — 뷰포트 중앙에 나타나므로 `transform-origin: center` 유지.
- **버튼 press 피드백은 `transform: scale(0.97)` on `:active`, `transition: transform 160ms ease-out`.** 범위는 0.95~0.98. 누를 수 있는 모든 요소에 적용한다.
- **hover에는 scale을 쓰지 않는다.** 배경·보더·그림자 변화로 표현한다(레이아웃 흔들림·산만함 방지).

```css
.button:active {
  transform: scale(0.97);
  transition: transform 160ms var(--ease-out);
}
```

---

## 5. 스프링 (Spring)

고정 duration이 없고 파라미터로 정착한다. 드래그·모멘텀·중단 가능한 제스처·"살아있는" 요소에 쓴다.

Apple은 물리 3요소(질량/강성/감쇠) 대신 두 개의 파라미터를 쓴다.

- **Damping ratio** — 오버슈트 제어. `1.0` = 임계 감쇠, 튐 없이 부드럽게 정착. `< 1.0` = 오버슈트·진동. 낮을수록 많이 튄다.
- **Response** — 목표에 도달하는 속도(초). 낮을수록 빠릿. **duration이 아니다.**

**기본값**
- 대부분의 UI는 **damping `1.0`**(임계 감쇠)에서 시작한다.
- **제스처 자체가 모멘텀을 가졌을 때만** bounce를 넣는다(damping ~`0.8`). 페이드인만 된 메뉴의 오버슈트는 틀렸고, 튕겨 던진 카드의 오버슈트는 맞다.

**Apple 실제 사용값**

| 인터랙션 | Damping | Response |
|---|---|---|
| 이동·재배치 | 1.0 | 0.4 |
| 회전 | 0.8 | 0.4 |
| 드로어·시트 | 0.8 | 0.3 |

```js
// 기본(오버슈트 없음)
animate(el, { y: 0 }, { type: 'spring', bounce: 0, duration: 0.4 });
// 모멘텀 이후에만 약간의 bounce
animate(el, { y: target }, { type: 'spring', bounce: 0.2, duration: 0.4 });
```

bounce는 0.1~0.3으로 절제한다. 대부분의 UI에서는 bounce를 쓰지 않는다.

---

## 6. 중단 가능성 (가장 중요한 원칙)

> 생각과 제스처는 병렬로 일어난다.

모든 애니메이션은 언제든 잡아서 되돌릴 수 있어야 한다. 닫히는 중인 모달을 다시 잡으면 손가락을 따라와야 한다. 닫히기를 끝내고 다시 여는 것이 아니다.

- **전환 중 입력을 차단하지 마라.**
- **항상 현재 화면값(presentation value)에서 애니메이션을 시작하라.** 목표값에서 시작하면 눈에 보이는 점프가 생긴다. 중단 시 요소의 실제 transform을 읽어 거기서 새 애니메이션을 시작한다.
- **제스처 기반 모션에 CSS transition·keyframes를 쓰지 마라.** 중간에 잡아 되돌릴 수 없다. 스프링은 기본적으로 현재값에서 시작하므로 중단에 적합하다.
- **CSS transition은 중단·재타겟 가능하지만 keyframes는 0부터 다시 시작한다.** 빠르게 반복 트리거되는 UI(토스트 추가, 토글)에는 transition을 쓴다.
- **2D 모션은 X·Y 스프링을 독립적으로 분해한다.** 하나의 스프링으로 2D 거리를 다루면 X와 Y 속도가 다를 때 어긋난다.

```css
/* 중단 가능 — 동적 UI에 적합 */
.toast { transition: transform 400ms var(--ease-out); }
```

---

## 7. 속도 인계 (Velocity handoff)

제스처가 끝나면 애니메이션은 **손가락의 정확한 속도로 이어져야** 한다. 드래그와 애니메이션 사이에 이음매가 보이면 안 된다. release 속도를 스프링의 초기 속도로 전달한다. 정규화가 필요한 API라면 `relativeVelocity = gestureVelocity / (target − current)`.

---

## 8. 모멘텀 투사 (Momentum projection)

release 지점에서 가장 가까운 경계로 스냅하지 마라. 속도로 **정착 지점을 투사**한 뒤 그 지점에서 가장 가까운 스냅 타깃을 고른다. 이것이 플릭을 "던지는" 느낌으로 만든다.

```js
// decelerationRate ≈ 0.998(일반 스크롤 느낌), 0.99(더 빠릿)
function project(initialVelocity, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}
const projected = current + project(releaseVelocity);
const target = nearestSnapPoint(projected);
```

교과서 물리식 `v²/(2·decel)`이 아니라 위 지수 감쇠식을 쓴다.

---

## 9. 공간적 일관성

> 한 방향으로 사라진 것은 그 자리에서 다시 나타나야 한다.

- **진입과 이탈은 같은 경로로.** 오른쪽에서 들어온 패널은 오른쪽으로 사라진다. 오른쪽 진입 + 아래로 퇴장은 단절감을 준다.
- **트리거에 앵커링한다.** 메뉴·팝오버·시트는 그것을 연 요소에서 시작한다.
- **되돌릴 수 있는 전환은 이징을 대칭으로.** 양방향에 역 cubic-bezier 제어점을 쓴다.

---

## 10. 경계 처리 (Rubber-banding)

가장자리에서 딱 멈추지 말고 점진적으로 저항한다. 하드 스톱은 "얼어붙음"으로, 연속 저항은 "반응하지만 더 없음"으로 읽힌다.

```js
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
```

---

## 11. 성능

- **`transform`과 `opacity`만 애니메이션한다.** layout/paint를 건너뛰고 GPU에서 처리된다. `padding`·`margin`·`height`·`width`·`top`·`left`는 세 단계를 모두 유발한다.
- **부모의 CSS 변수로 자식 transform을 구동하지 마라.** 모든 자식의 스타일 재계산을 유발한다. 요소에 직접 `transform`을 설정한다.
- `requestAnimationFrame`을 디스플레이 동기 클럭으로 쓰고, 모션이 임박한 요소에 `will-change`를 힌트한다.
- 매우 빠른 모션에는 미묘한 모션 블러·스트레치가 딱딱한 잔상보다 낫다.

---

## 12. 재질과 깊이 (Materials & Depth)

- **네비게이션·툴바·시트는 반투명 레이어로 만든다**(`backdrop-filter: blur()` + 반투명 배경). 콘텐츠가 그 아래로 스크롤되게 한다.
- **재질 무게가 위계를 표현한다.** 어둡고 무거운 재질은 구조 영역(사이드바)을 분리하고, 가벼운 재질은 인터랙티브 요소로 주의를 끈다. **밝은 반투명 표면을 다른 밝은 반투명 위에 겹치지 마라 — 가독성이 무너진다.**
- **큰 표면은 두껍게 읽혀야 한다.** 작은 칩보다 강한 blur와 깊은 그림자를 준다.
- **집중은 흐리게, 흐름은 분리로.** 모달 작업은 딤 스크림과 함께 배경을 뒤로 밀고, 흐름을 끊지 않는 병렬 패널은 스크림 없이 반투명과 오프셋만 쓴다.
- **Vibrancy로 텍스트 가독성을 지킨다.** 반투명 위에서는 평평한 회색 대신 대비를 높이고 weight를 살짝 올리며 자간을 약간 늘린다. 색은 불투명 레이어에 두고 반투명 전경에 두지 않는다.
- **하드 구분선 대신 스크롤 엣지 효과.** sticky 헤더 밑 1px 보더 대신, 콘텐츠가 떠 있는 크롬과 만나는 지점에 작은 blur·그라디언트 마스크를 페이드한다.
- **재질은 나타나야지 단순히 페이드되면 안 된다.** 글래스 표면은 진입·이탈 시 blur 반경과 scale을 함께 애니메이션한다.

```css
.toolbar {
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255,255,255,0.4); /* 빛을 받는 윗면 */
}
```

---

## 13. 접근성 — 3종 대응 필수

**reduced motion은 피드백을 없애는 것이 아니라 전정기관을 자극하지 않는 등가물로 바꾸는 것이다.**

- `prefers-reduced-motion: reduce` — 슬라이드·스프링·패럴랙스를 짧은 opacity 크로스페이드로 대체. 탄성·오버슈트 제거. 이해를 돕는 opacity·색상 변화는 유지.
- `prefers-reduced-transparency: reduce` — 반투명 표면을 불투명하게. 배경 불투명도를 올리고 blur를 제거.
- `prefers-contrast: more` — 거의 불투명한 배경 + 명확한 대비 보더.

추가로: 전체 뷰포트를 움직이는 배경, 0.2Hz 부근의 느린 반복 진동, 급격한 밝기 점프를 피한다. 큰 물체가 이동 중일 때는 반투명하게, 큰 표면은 대규모 재배치 중 페이드아웃 후 정착 시 페이드인.

```css
@media (prefers-reduced-motion: reduce) {
  .sheet { transition: opacity 200ms ease; transform: none !important; }
}
@media (prefers-reduced-transparency: reduce) {
  .toolbar { background: var(--surface-solid); backdrop-filter: none; }
}
```

---

## 14. 제스처 세부

- **탭** — touch-down에 즉시 하이라이트, touch-up에 커밋. 타깃 주변 ~10px 히스테리시스, 드래그로 취소·복귀 허용.
- **드래그·스와이프** — 방향 확정 전 ~10px 임계값, 이후 1:1 추적.
- **가능한 제스처를 첫 이동부터 병렬로 감지**하고 의도가 명확해지면 나머지를 취소한다. 최종 상태만 알려주는 인식기(`swipeleft` 류)는 연속 피드백을 버리므로 피한다.
- Pointer Events + `setPointerCapture`로 요소 밖으로 나가도 추적을 유지하고, **잡은 지점의 오프셋을 존중한다**(중앙으로 스냅하면 환상이 깨진다).

---

## 15. 피드백의 네 종류

status(진행 상태), completion(완료), warning(경고), error(오류). 의미 있는 동작은 확인시키고, 진행 상태는 드러내고, 문제 전에 경고하고, **제출 시점이 아니라 인라인으로 검증**한다.

**Wayfinding** — 모든 화면은 답해야 한다: 나는 어디 있는가, 어디로 갈 수 있는가, 거기에 무엇이 있는가, 어떻게 나가는가. 사용자를 가두지 마라.

**그룹핑과 매핑** — 근접은 관계를 뜻한다. 컨트롤은 그것이 영향을 주는 대상 근처에 둔다. 라벨로 설명해야 이해되는 컨트롤은 매핑이 잘못된 것이다.

**직접적이고 구체적인 라벨이 안전한 일반 라벨보다 낫다.** 내용을 이름으로 쓴다("Progress", "Library"), 모호한 우산이 아니라("Home").

---

## 16. 모션 검수 체크리스트

- [ ] 이 요소의 사용 빈도상 애니메이션이 정당한가(§0)
- [ ] 진입·이탈에 ease-out을 썼는가, UI에 ease-in이 없는가
- [ ] UI 애니메이션이 300ms 미만인가
- [ ] `scale(0)`이 없는가, press 피드백은 0.95~0.98인가
- [ ] hover에 scale이 없는가
- [ ] 팝오버가 트리거 기준으로 확대되는가(모달 제외)
- [ ] `transform`·`opacity` 외의 속성을 애니메이션하지 않는가
- [ ] 빠르게 반복되는 UI에 keyframes 대신 transition을 썼는가
- [ ] 제스처 기반 모션이 중단·역전 가능한가
- [ ] 진입과 이탈 경로가 대칭인가
- [ ] reduced-motion/transparency/contrast 3종을 처리했는가
- [ ] 상태 변화(토글·필터·언어 전환)로 등장 애니메이션이 재실행되지 않는가
- [ ] 슬로모션으로 재생해 어색한 프레임이 없는가
