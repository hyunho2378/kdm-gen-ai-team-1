# SERVER.md 간합 중계 서버 명세

이전 프로젝트 BACKEND.md를 대체한다. 간합 server는 Socket.io 릴레이이고, **그 위에 경기 기록 하나만 얹혀 있다.**

**릴레이가 본체이고 기록은 부속이다.** `DATABASE_URL`이 없으면 기록만 꺼지고 중계는 그대로 돈다.
데모가 DB 때문에 멈추면 안 된다. 방 상태는 여전히 메모리 Map이고 DB에 안 들어간다.

## 역할 한 줄

arena와 controller를 방 코드로 짝지어 메시지를 그대로 중계한다. 판정하지 않는다. 판정은 arena가 소유한다(결정적 판정의 심사 방어 논리).

## 스택

Node 20 + Express + Socket.io + Postgres(pg). 방 상태는 메모리 Map에만 들고 프로세스 재시작 시 소멸을 전제한다.
경기 기록만 Postgres에 남는다. 배포 Render, DB는 Neon 등 외부 Postgres, GET /health로 상태 확인
(`{"ok":true,"records":true|false}`의 records가 기록 저장소 연결 여부다).

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

## 경기 기록

**서버가 쓴다. 폰이 점수를 직접 써넣는 경로를 열지 않는다.** arena가 MATCH_END에 보내는
`result`를 중계하는 김에 그대로 append할 뿐이고, 서버가 값을 다시 계산하지 않는다.
쓰기 조건이 "보낸 소켓의 역할이 arena"라서 폰이 result를 흉내 내도 저장되지 않는다.

신원은 **httpOnly 쿠키 `vx_id`의 익명 UUID** 하나다. 로그인이 아직 없어서 신원 종류를 나누지
않는다. 소켓 핸드셰이크가 그 쿠키를 실어 오므로 **앱은 소켓을 붙이기 전에 `/api/me`를 한 번
불러야 한다.** 그 순서가 어긋나면 그 판의 기록이 주인을 못 찾는다.

| 경로 | 하는 일 |
|---|---|
| `GET /api/me` | 신원 보장. 없으면 발급하고 Set-Cookie |
| `GET /api/records` | 쿠키 신원의 누적 기록. 질의로 남의 것을 부를 방법이 없다 |

**비파괴가 규율이다.** 스키마는 `CREATE TABLE IF NOT EXISTS`와 `ALTER ... ADD COLUMN IF NOT EXISTS`뿐이고
쓰기는 append뿐이다. `server/src/db.js`에 DROP, TRUNCATE, DELETE가 한 건도 없다. 부팅마다 스키마를
다시 돌려도 기존 행에 손대는 경로 자체가 존재하지 않는다.

저장하는 것은 **arena가 이미 내던 지표뿐이다.** 승패, 스코어, 상대 유파 이름, thrusts, hits,
리포스트, 피스트아웃, 경기 시간, 부위 분포. 폰 통계(파워, 손떨림, 가드 수)는 폰 안에서만 계산되고
서버를 거치지 않아서 저장하지 않는다(저장하려면 폰이 쓰는 경로를 열어야 하고 그게 신뢰 경계를 깬다).

## 규율

- 서버에 게임 로직, 판정, 상태 해석을 넣지 않는다. 방 존재 확인 외 검증 없음.
  **기록 append는 판정이 아니다.** 확정된 결과를 받아 적는 부수효과이고 실패해도 경기가 안 끊긴다
- CORS origin은 env CORS_ORIGINS 배열로만, 끝 슬래시 없이 정확히.
  **credentials가 필요하다**(신원 쿠키). Express와 Socket.io 양쪽에 켠다
- 프런트와 서버 도메인이 다르면 쿠키에 SameSite=None과 Secure가 둘 다 필요하고 `trust proxy`도 켜야 한다.
  `NODE_ENV=production`이 그 스위치다. 로컬은 localhost끼리라 포트가 달라도 same-site로 쳐서 Lax로 충분하다
- 환경 변수: PORT, CORS_ORIGINS, DATABASE_URL, NODE_ENV. 하드코딩 금지
- Render 무료 티어 콜드 스타트 대비: arena가 PAIRING 진입 전에 /health를 먼저 때려 깨운다. 실패 시 "서버 깨우는 중" 문구
- 로그는 접속, 페어링, 단절만. motion 스트림 로깅 금지(로그 폭주)

## 배포 절차 (C3)

세 서비스가 서로의 주소를 알아야 하므로 **순서가 있다.** 서버를 먼저 띄우고 그 주소를 두 프런트에 넣는다.

1. **Render에 server 배포.** Node 웹 서비스, 무료 플랜. 루트 디렉터리 `server`, 빌드 `npm install`, 시작 `npm start`.
   환경 변수는 `CORS_ORIGINS`, `DATABASE_URL`, `NODE_ENV=production` 셋이다(PORT는 Render가 준다).
   `CORS_ORIGINS`는 이 시점에 프런트 주소를 아직 모르므로 비워 두고 3단계에서 채운다.
   **`DATABASE_URL`이 비면 기록만 꺼지고 서버는 정상으로 뜬다.** `/health`의 `records`가 false면 그 상태다.
   **`NODE_ENV`를 빼면 신원 쿠키가 안 붙는다**(도메인이 달라 SameSite=None과 Secure가 필요하다).
   배포 후 `https://<서비스>.onrender.com/health`가 `{"ok":true}`를 내면 산 것이다.
2. **Vercel의 arena와 controller에 서버 주소를 넣는다.**
   - arena: `VITE_SERVER_URL=https://<서비스>.onrender.com`, `VITE_CONTROLLER_URL=https://<controller>.vercel.app`
   - controller: `VITE_SERVER_URL=https://<서비스>.onrender.com`
   - **Vite는 빌드 타임에 값을 박는다.** 환경 변수를 바꾸면 반드시 재배포한다. 런타임에 안 읽는다.
3. **Render의 `CORS_ORIGINS`에 두 Vercel 주소를 넣고** 서버를 재시작한다. 끝 슬래시를 붙이지 않는다.

### HTTPS 페이지는 wss만 연결할 수 있다

Vercel은 HTTPS이고 브라우저는 그 페이지에서 평문 `ws://` 연결을 혼합 콘텐츠로 차단한다.
`VITE_SERVER_URL`을 **반드시 `https://`로 적는다.** socket.io가 그 주소에서 `wss://`를 유도한다.
`http://`로 적으면 로컬에서는 되고 배포에서만 조용히 안 붙는다. 가장 흔한 실패다.

폰도 같은 이유로 HTTPS여야 한다. **iOS는 보안 컨텍스트가 아니면 동작 센서 권한 자체를 안 준다.**
로컬 폰 테스트를 하려면 Vercel 프리뷰 URL을 쓰는 편이 빠르다.

### Render 무료 플랜 콜드 스타트

15분 유휴 뒤 잠들고 다음 요청이 깨우는 데 수십 초가 걸린다. arena는 그동안 PAIRING 화면에
"서버를 깨우는 중이다"를 띄우고 **키보드로 시작 버튼을 계속 열어 둔다.** 소켓은 백그라운드에서
계속 재시도하므로 서버가 늦게 깨어나면 그때 방 코드가 뜬다. 리허설 10분 전에 한 번 열어 깨워 두면 된다.
