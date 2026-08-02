# SERVER.md 간합 중계 서버 명세

이전 프로젝트 BACKEND.md를 대체한다. 간합 server는 DB 없는 Socket.io 릴레이다. Postgres, 인증, 마이그레이션 전부 없음.

## 역할 한 줄

arena와 controller를 방 코드로 짝지어 메시지를 그대로 중계한다. 판정하지 않는다. 판정은 arena가 소유한다(결정적 판정의 심사 방어 논리).

## 스택

Node 20 + Express + Socket.io. 상태는 메모리 Map에만. 프로세스 재시작 시 소멸을 전제한다. 배포 Render, GET /health로 상태 확인.

## 방 생명주기

1. arena가 `hello {role: "arena"}` → 방 코드 4자리 생성(혼동 문자 0 O 1 I L 제외), `room {code}` 회신
2. controller가 `hello {role: "controller", room}` → 존재하면 조인, 양쪽에 `paired` 브로드캐스트. 없으면 `error {reason: "not_found"}`
3. 이후 모든 메시지는 같은 방 상대에게 그대로 릴레이
4. 한쪽 disconnect 시 상대에게 `peer_left` 통지. 방은 10분 유휴 후 GC
5. 같은 방 재접속 허용(controller 새로고침 복구 경로)

## 프로토콜 (shared/protocol.js와 1:1)

```json
{ "t": "hello", "role": "arena" }
{ "t": "hello", "role": "controller", "room": "GH42" }
{ "t": "room", "code": "GH42" }
{ "t": "paired" }
{ "t": "peer_left" }
{ "t": "error", "reason": "not_found" }
{ "t": "calib", "q": [0, 0, 0, 1] }
{ "t": "motion", "acc": [0, 0, 0], "rot": [0, 0, 0], "ts": 0 }
{ "t": "action", "kind": "thrust", "power": 0.0 }
{ "t": "haptic", "pattern": "hit" }
{ "t": "state", "phase": "EN_GARDE", "d": 47, "score": [2, 1] }
```

action.kind: thrust, guard, advance, retreat. haptic.pattern: hit, parry, lose.

controller는 motion 원본을 30Hz로 보내되 THRUST 같은 이산 판정은 폰에서 1차 감지해 action으로도 보낸다(지연 대비 이중화). 서버는 스로틀하지 않는다. 송신 측이 30Hz를 지킨다.

## 규율

- 서버에 게임 로직, 판정, 상태 해석을 넣지 않는다. 방 존재 확인 외 검증 없음
- CORS origin은 env CORS_ORIGINS 배열로만, 끝 슬래시 없이 정확히. credentials 불필요(쿠키 없음)
- 환경 변수: PORT, CORS_ORIGINS. 하드코딩 금지
- Render 무료 티어 콜드 스타트 대비: arena가 PAIRING 진입 전에 /health를 먼저 때려 깨운다. 실패 시 "서버 깨우는 중" 문구
- 로그는 접속, 페어링, 단절만. motion 스트림 로깅 금지(로그 폭주)
