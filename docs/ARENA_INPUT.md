# ARENA_INPUT.md arena 입력 추상화 설계

목적은 하나다. **컨트롤러와 키보드가 같은 판정으로 흘러가되, 결정성이 깨지지 않는다.**

관련 문서: 씬은 `ARENA_SCENE.md`, 판정 규칙은 `COMPONENTS.md`의 judge 항목, 프로토콜은 `SERVER.md`.

---

## 0. 설계 원칙: 확장은 더하기만 한다

기존 `game/input.js`(107줄)의 **공개 동작을 바꾸지 않는다.** 새 스키마는 그 위에 얹는 전송 계층이다.

이유는 결정성이다. 기준 서명은 `judge.selftest.js`가 `setHeld()`와 `push(INPUT.THRUST)`를 직접 불러 만든다.
그 두 함수의 의미가 바뀌면 서명이 바뀐다. 그래서 **이산 스키마는 전송 형식이고, 홀드 상태는 그 스키마에서 파생된 뷰**로 둔다.

```
현재 engine.js가 입력을 만지는 지점은 6줄뿐이다(import 제외). 이 6줄은 승격 후에도 그대로다.
  190  input.drain()                     비활성 phase에서 큐 비우기
  196  input.isHeld(INPUT.ADVANCE)
  197  input.isHeld(INPUT.RETREAT)
  198  input.isHeld(INPUT.GUARD)
  209  for (const ev of input.drain())    thrust만 소비
  255  input.clear()
```

---

## 1. 두 채널의 분리

| | 이산 이벤트 채널 | 연속 채널 |
|---|---|---|
| 무엇 | 찌르기, 가드 on/off, 전진, 후퇴 | 검 자세 스트림 |
| 누가 읽나 | **engine → judge** (판정) | **렌더러만** |
| 결정성 | 영역 안. 시드와 함께 재현된다 | 영역 밖. 재현 대상이 아니다 |
| 사는 곳 | `game/input.js`의 큐 | `game/pose.js` (신설) |
| engine이 아나 | 안다 | **모른다. import하지 않는다** |

**이 분리가 결정성의 생명선이다.** 폰을 흔드는 아날로그 값이 판정에 새면 같은 시드가 같은 결과를 못 낸다.

---

## 2. 이산 이벤트 (판정 소비, 결정성 영역)

### 스키마

```js
{
  type: 'thrust' | 'guard_on' | 'guard_off' | 'advance' | 'retreat',
  power: 0~1,        // 세기. 키보드는 1.0 고정, 컨트롤러는 정규화된 피크
  ts: number,        // 발생 시각(ms). 로직 시계가 아니라 소스 시계다
  source: 'keyboard' | 'controller',
}
```

### source는 판정에 들어가지 않는다

**judge는 `source`를 읽지 않는다.** 읽으면 결정성이 오염된다.
`source`는 두 용도로만 존재한다. 디버깅 로그, HUD의 입력 소스 표시(StatusChip).
`judge.js`에 `source` 문자열이 등장하면 그것은 규율 위반이다. V4f grep 항목에 넣는다.

### type별 처리

| type | 성격 | 큐 처리 | engine이 보는 것 |
|---|---|---|---|
| `thrust` | 순수 이산 | 큐에 쌓임 | `drain()`으로 소비 (209줄) |
| `guard_on` / `guard_off` | 엣지 쌍 | **큐에 쌓지 않고 홀드 상태로 접힘** | `isHeld(GUARD)` (198줄) |
| `advance` / `retreat` | 엣지 | `power > 0`이면 누름, `power === 0`이면 뗌으로 접힘 | `isHeld(ADVANCE/RETREAT)` (196~197줄) |

`advance`와 `retreat`가 on/off 쌍이 아니라 단일 타입인 것은 주어진 스키마를 따른 것이다.
뗌은 `power === 0`으로 표현한다.

### input.js 확장 지점 (파일 단위)

| 함수 | 변경 | 내용 |
|---|---|---|
| `INPUT` | 유지 | 상수 그대로 |
| `SOURCE` | 값 추가 | `SOCKET`을 `CONTROLLER`로 읽히게 별칭 추가. 기존 값 유지 |
| `createInputQueue()` | **확장** | 아래 `emit()` 추가, `held`를 소스별로 분리 |
| `push(kind, source, payload)` | **유지** | 기존 시그니처 보존. 내부적으로 `emit({type:'thrust', power:1, ...})`로 위임 |
| `setHeld(kind, value)` | **유지** | 기존 시그니처 보존. 내부적으로 해당 엣지 이벤트로 위임 |
| `isHeld(kind)` | **의미 유지** | 소스별 홀드의 **OR**를 돌려준다. 소스가 하나면 결과가 이전과 동일하다 |
| `drain()` | 유지 | thrust만 담긴다. 기존과 동일 |
| `clear()` | 유지 | 전 소스 홀드와 큐를 지운다 |
| `emit(event)` | **신설** | 위 스키마를 받는 단일 입구. 이산은 큐로, 엣지는 홀드로 접는다 |
| `attachKeyboard()` | 소폭 | 내부에서 `emit()`을 쓰도록 갈아끼운다. 외부 동작 무변경 |

`setHeld`와 `push`를 남기는 이유는 하나다. **셀프테스트 대본이 그 둘을 쓰고, 기준 서명이 거기서 나온다.**

---

## 3. 연속 채널 (렌더러 전용, 판정 절대 비소비)

### 신설 파일 `game/pose.js`

```js
createPoseChannel() -> {
  setPreset(id),          // 'rest' | 'thrust' | 'guard'
  setQuaternion(q),       // [x, y, z, w], 30Hz
  setCalibration(q0),     // 캘리브레이션 기준 쿼터니언
  read(),                 // 판별 유니온을 돌려준다. 형태는 ARENA_SCENE.md 3절 확정본
  reset(),
}
```

`read()`의 반환은 `renderer.setSwordPose()`의 인자와 **같은 객체**다.

```js
{ kind: 'preset',     value: 'rest' | 'thrust' | 'guard' }
{ kind: 'quaternion', value: [x, y, z, w] }   // 캘리브레이션 보정이 이미 적용된 값
```

`kind`가 유일한 분기 키다. 렌더러는 이 객체만 보고 입력 소스를 모른다.

### V2 스키마 9개 필드와의 구분

둘은 **경로가 다르다.**

```
engine.view (9개 필드)      ─ engine 소유 ─→ renderer.render(gameState, fx, dt)
poseChannel (연속)          ─ GameCanvas 소유 ─→ renderer.setSwordPose(pose)
```

- 9개 필드는 **판정 결과의 시각 요약**이다. engine이 판정 도중 갱신한다.
- 연속 채널은 **판정에 쓰이지 않은 원본 자세**다. engine을 거치지 않는다.

`meLunge`(9개 중 하나)와 연속 채널이 헷갈릴 수 있으니 명확히 한다.
`meLunge`는 **판정이 만든 런지 진행도**(찌르기 이벤트가 판정을 통과한 뒤 engine이 감쇠시키는 0~1)다.
연속 채널은 **폰이 실제로 향한 방향**이고 판정과 무관하다. 키보드 모드에서는 연속 채널이 프리셋 id만 낸다.

### 갈라지는 코드 지점

물리적 분기는 **소스 어댑터**에서 일어난다. 판정 경로와 렌더 경로가 여기서 갈린 뒤 다시 만나지 않는다.

```
[키보드]  attachKeyboard(queue, poseChannel)
            Space          → queue.emit({type:'thrust'})        → 판정
            Shift down/up  → queue.emit({type:'guard_on/off'})  → 판정
            방향키          → queue.emit({type:'advance/retreat'}) → 판정
            (자세)          → poseChannel.setPreset('thrust'|'guard'|'rest') → 렌더만

[컨트롤러] attachSocket(queue, poseChannel, socket)      ← C3에서 구현
            MSG.ACTION     → queue.emit({type, power, ts, source:'controller'}) → 판정
            MSG.MOTION     → poseChannel.setQuaternion(q)       → 렌더만
            MSG.CALIB      → poseChannel.setCalibration(q0)     → 렌더만
```

**engine.js는 `pose.js`를 import하지 않는다.** `GameCanvas`가 poseChannel을 들고 있다가
매 프레임 `renderer.setSwordPose(poseChannel.read())`를 부른다. 이것이 유일한 소비처다.

### IRenderer 확정

`setSwordPose(pose)`로 일반화 **승인 완료**. 키보드 프리셋과 컨트롤러 쿼터니언이 같은 경로로 흐르므로
렌더러가 입력 소스를 모르는 채 검 자세를 그린다. 인자는 `poseChannel.read()`의 반환값이고,
객체 형태는 `ARENA_SCENE.md` 3절의 판별 유니온이 확정본이다.

---

## 4. 컨트롤러에서 이산과 연속이 갈라지는 방식

같은 폰 모션에서 둘을 **따로 뽑는다.** C3에서 구현하고 지금은 인터페이스만 판다.

| 폰에서 | 무엇 | 어디로 |
|---|---|---|
| DeviceMotion 가속도 | 하이패스 + EMA 후 **피크 감지** → THRUST 판정 | `MSG.ACTION` (이산) |
| DeviceOrientation 자세 | 쿼터니언 30Hz 스로틀 | `MSG.MOTION` (연속) |
| 정지 3초 감지 | 기준 쿼터니언 | `MSG.CALIB` (연속, 1회) |

`SERVER.md`가 정한 이중화 그대로다. 폰이 THRUST를 1차 감지해 `action`으로도 보내는 이유는 지연 대비다.
**연속 스트림에서 arena가 THRUST를 재추론하지 않는다.** 재추론하면 아날로그 값이 판정에 새어 결정성이 깨진다.

### 캘리브레이션 오프셋 적용 지점

**`poseChannel` 안에서만 적용한다.** 판정 경로에는 나타나지 않는다.

```
보정 자세 = q_calibration⁻¹ ⊗ q_raw
```

`setCalibration(q0)`이 기준을 저장하고, `read()`가 보정된 값을 돌려준다.
렌더러는 보정 여부를 모르고 결과만 받는다.

### 컨트롤러 미연결 시 폴백

| 상황 | 연속 채널 | 이산 채널 |
|---|---|---|
| 컨트롤러 없음 | `kind: 'preset'`. 키보드가 프리셋을 민다 | 키보드만 |
| 컨트롤러 연결, 자세 미수신 | 마지막 프리셋 유지. 첫 쿼터니언 도착 시 전환 | 양쪽 |
| 연결 중 끊김(`peer_left`) | 즉시 `kind: 'preset'`으로 복귀 | 키보드만 |

**연속 채널이 비어도 경기는 돈다.** 자세는 장식이고 판정은 이산 이벤트만 본다(PATTERNS 8절 우아한 저하).

---

## 5. F9 키보드 단독 모드

기존 규칙을 유지한다. 어느 phase에서든 즉시 전환하고, **페어링 상태에서도 키보드 병행을 허용**한다(리허설 편의).

| 대상 | F9 전환 시 |
|---|---|
| 이산 채널 | 키보드 소스가 항상 열려 있다. 컨트롤러 소스도 닫지 않는다(병행) |
| 연속 채널 | `mode`를 `quaternion` → `preset`으로 전환. 현재 프리셋은 `rest`로 시작 |
| 홀드 상태 | 컨트롤러 소스의 홀드를 해제한다. 키보드 홀드만 남는다 |
| engine | `forceKeyboard()`가 `input.clear()`를 호출하는 기존 동작 그대로 |

F9는 게임 입력이 아니라 모드 토글이므로 큐에 들어가지 않는다(현재 `attachKeyboard`의 처리 유지).

---

## 6. 검증 포인트 자답

### 6.1 judge와 machine이 연속 채널을 참조하는 경로가 0인가

**설계상 0이다. import 그래프로 증명된다.**

```
pose.js  ←── GameCanvas.jsx      (소유)
         ←── ThreeRenderer       (setSwordPose로 주입받음)

engine.js ──→ input.js            (이산만)
judge.js  ──→ (입력 모듈 없음)
machine.js──→ (입력 모듈 없음)
opponents.js ─→ (입력 모듈 없음)
```

현재도 `judge.js`, `machine.js`, `opponents.js`는 **input을 전혀 참조하지 않는다**(실측 0건).
연속 채널이 들어와도 이 사실은 변하지 않는다. `pose.js`를 import할 수 있는 파일은 `GameCanvas`와 렌더러뿐이다.

**V4f grep 항목에 추가한다.**
- `game/judge.js`, `game/machine.js`, `game/opponents.js`, `game/engine.js`에 `pose` 문자열 0건
- `game/judge.js`에 `source` 문자열 0건

### 6.2 기준 서명이 그대로 나온다는 것과 이 설계의 연결

세 고리로 연결된다.

1. **서명 생성 경로가 안 바뀐다.** `judge.selftest.js`는 `setHeld()`와 `push(INPUT.THRUST)`를 쓴다.
   두 함수의 시그니처와 의미를 보존하므로 대본이 그대로 돈다.
2. **engine의 소비 5줄이 안 바뀐다.** `isHeld()`가 소스별 OR을 돌려주는데, 셀프테스트는 소스가 하나뿐이라
   OR 결과가 이전 단일 불리언과 항상 같다.
3. **연속 채널이 판정에 도달할 경로가 없다.** engine이 `pose.js`를 import하지 않으므로
   아날로그 값이 `state`에 섞일 통로 자체가 없다.

따라서 기준 서명 `JUDGE:0-0:45.767|JUDGE:0-0:50.033|JUDGE:0-1:50.367|SCORE:0-1:52.100|SCORE:0-1:50`은
**설계상 보존된다.** V4a와 V4f에서 실측으로 확인한다.

### 6.3 두 소스가 동시에 들어올 때 충돌 처리

페어링 상태에서 F9로 키보드를 병행하면 두 소스가 같은 큐에 쓴다.

**홀드(가드, 전진, 후퇴): 소스별로 따로 기록하고 `isHeld()`가 OR을 돌려준다.**

| 상황 | 결과 |
|---|---|
| 키보드 Shift 누름 + 컨트롤러 가드 안 함 | 가드 켜짐 |
| 둘 다 가드 | 가드 켜짐 |
| 키보드 Shift 뗌, 컨트롤러는 계속 가드 | **가드 유지** |

소스별로 나누지 않으면 한쪽의 뗌이 다른 쪽의 누름을 지운다. 이것이 소스별 홀드가 필요한 이유다.
소스가 하나일 때는 OR이 항등이라 기존 동작과 완전히 같다.

**이산(찌르기): 새 규칙을 넣지 않는다.**

두 소스가 거의 동시에 thrust를 보내면 큐에 둘 다 쌓이고 engine이 순서대로 소비한다.
첫 번째가 판정되면 `state.lastThrustAt`이 갱신되고, 두 번째는 `judge.js`의 **기존 350ms 쿨다운**에 걸려
연출 없이 무시된다(`MISS_REASON.COOLDOWN` 경로, engine.js 212줄의 `continue`).

**큐 레벨에서 중복 제거를 새로 넣지 않는다.** 새 로직은 판정 타이밍을 바꿔 서명을 깨뜨릴 위험이 있다.
이미 있는 쿨다운이 정확히 이 일을 한다.

**연속: 컨트롤러가 우선한다.**

컨트롤러가 연결되어 쿼터니언이 흐르는 동안에는 `kind: 'quaternion'`이고 키보드 프리셋은 무시된다.
F9를 누르면 `kind: 'preset'`으로 내려온다. 두 자세가 섞이지 않는다.

---

## 7. 구현 순서 (V4 중 어디에 들어가나)

| 항목 | 단계 |
|---|---|
| `emit()` 추가, 소스별 홀드, `attachKeyboard` 내부 교체 | V4a |
| `pose.js` 신설, 키보드 프리셋 연결, `setSwordPose` | V4a |
| 컨트롤러 어댑터 `attachSocket` | **C3** (이번 승격 범위 아님) |
| 캘리브레이션 오프셋 실동작 | **C3** |

V4a 완료 시점에 **`?renderer=2d`로 5점 완주 + 기준 서명 재확인**으로 무변경을 증명한다.

---

## 8. 미해결

- `power` 정규화 기준. 컨트롤러 피크 가속도를 0~1로 어떻게 매핑할지는 C2 실기기 측정 후 확정한다.
  판정은 현재 `power`를 쓰지 않으므로(유효 범위와 상태만 봄) 결정성에 영향은 없다.
  쓰기 시작하면 그때 결정성 재검토가 필요하다
- `ts`의 시계 기준. 소스 시계(`performance.now`)를 쓰되 판정은 engine의 로직 시계를 쓴다.
  둘을 섞지 않는다. 지연 보정을 도입하려면 별도 설계가 필요하다
