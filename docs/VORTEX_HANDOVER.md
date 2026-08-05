# VORTEX 인수인계: arena 현재 상태, 변경 계획, 앱 신설 구조

> 새 세션이 이 문서 하나로 전체 그림을 잡는다. 컨텍스트가 길어진 대화의 압축본이다. 저장 위치 docs/HANDOVER.md.

## 1. 지금까지 (arena 현재 상태)

- **모노레포**: ganhap/ 아래 arena(게임, 노트북), controller(폰), presentation(구버전, 동결), presentation-v2(VORTEX 발표, 별도 트랙 완성, 불가침), brand(백지), server(Socket.io 릴레이), shared(tokens, protocol), docs.
- **브랜드**: VORTEX 확정(팀 김다영, 주현호, 윤소희). 색: black #101010, white #FDFDFD, red #E60D15, redDeep #80070C. 갈래 B 결정: arena 궤적 소유색은 내 검 red, 상대 blue 유지, 값만 VORTEX로 통일. 네이밍 화면 표기는 영문 VORTEX만(간합 잔존 제거 작업 존재).
- **arena 완성도**: three.js 1인칭, 크롬 레이피어(칼날 그라디언트 발광, 득점 시 red 플레어), 상대 흰 유니폼 실루엣 + 골동 검, 궤적 리본(검끝 tipAnchor), FUI(팔각 히트마커, 부위 라벨, 데미지 인디케이터, 램프 패널, 피스트 스트립), 명중 연출(hitstop 70ms, ShockWave, 색수차, 셰이크), 잔움직임 생동감, 웹캠(MediaPipe 15Hz: 시간 팽창 트리거 + 헤드 패럴랙스, ?cam=1 디버그), 2D 폴백(?renderer=2d), F9 키보드 모드.
- **실룰(FIE) 게임플레이**: 피스트 절대 위치 14m(시작 나 5.0/AI 9.0, METERS_PER_D 0.05), 후방 경계 실점, 경고선. 유파별 락아웃: 세이버 170ms 시뮬타네(무득점), 에페 40ms 더블 투셰(+1/+1, 4-4 매치포인트 더블 무효). 부위는 표시 전용(점수 균일 1투셰 1점, 실룰 정합). docs/FENCING_RULES.md가 근거.
- **결정성 체계**: judge/machine/opponents가 결정적 코어. 시드 난수만 사용. 기준 서명(현재 AI-유파: 길이 1097 / 해시 c820d0f2 / 꼬리 GARDE:4-0:45.250#5-0#ME)을 judge.selftest.js BASELINE이 보관, 셀프테스트 13종이 매번 대조. 서명은 이제 진입점의 네 모드(sabre/epee/hungarian/mixed) + 기본 경로를 한 서명에 접붙인다(유파 하나가 바뀌면 잡힌다). **게임플레이 의도 변경 시 절차**: 변경 전 그린 → 변경 → 같은 시드 2회(+교차 프로세스) 동일 → 새 서명 채택 + PROGRESS 기록. 렌더/UI 작업은 서명 유지가 통과 조건.
- **채널 계약(ARENA_INPUT)**: 판정에는 이산 이벤트만(thrust, guard, advance/retreat). 쿼터니언 연속 30Hz는 setSwordPose 렌더 전용. 웹캠은 focused boolean만. 아날로그 신호의 판정 유입 절대 금지.
- **controller C2 완료**: 센서 파이프라인(중력 기준 수평/수직 분해, THRUST 4관문, ahrs Madgwick 쿼터니언, Wake Lock, 탭 폴백), 5phase 화면(JOIN/PERMISSION/CALIBRATION/PLAY/END), ?debug=1. 실기(iOS) 검증 일부 대기.
- **유파 현황**: 이탈리아 세이버(공격형), 프랑스 에페(카운터형), **헝가리안(심리전형)** 3종 + **통합 모드 MIXED**(득점마다 유파 전환 + 난이도 계수) 완성. 진입점은 `createEngine`의 `school` 인자 하나(`sabre`|`epee`|`hungarian`|`mixed`, 미지정=시드). 락아웃은 무기 계열(sabre/epee)로 매핑. 키보드 1/2/3/4가 이 진입점을 쓴다.

## 2. 앞으로 (변경 계획, 실행 순서)

1. **C3 소켓 연동** (프롬프트 CONTROLLER_C3_SOCKET.md 준비됨): 폰 이산 이벤트 → 엔진(키보드와 같은 진입점), 폰 쿼터니언 → setSwordPose, AIM_JITTER는 쿼터니언 소스일 때 비활성 분기, haptic 왕복, server 재접속, Render 배포(wss).
2. **VORTEX 네이밍 통일** (프롬프트 준비됨): 화면 표기 전부 영문 VORTEX. presentation-v2 불가침, 저장소명/내부 변수 유지.
3. ~~AI 유파 완성 (프롬프트 ARENA_AI_SCHOOLS.md)~~ → **완료(확인 대기).** 헝가리안 + MIXED + 계열 매핑. 서명 갱신 1회 수행(205/ef4b27d5 → 1097/c820d0f2, 셀프테스트 13종).
4. **VORTEX 앱 신설** (프롬프트 VORTEX_APP_BUILD.md): 아래 3절 구조. **다음 순서.** SELECT 화면의 소켓 select 메시지가 arena의 같은 진입점(createEngine의 school 인자)을 쓴다 — 이번 트랙에서 준비됨.
5. 잔여: V4e 시간 팽창 시각 세트, 생성 이미지 setPoses 교체, PHASE2(배포 상호 연결, 리허설 3컷, 발표 노트북 실기 fps).

## 3. 앱 신설 구조 (핵심 결정: controller가 앱이 된다)

**별도 앱을 만들지 않는다. controller 폴더를 확장해 VORTEX 폰 앱으로 만든다.** 이유: (a) 하나의 주소(QR 하나, 발표장 인쇄 가능), (b) C2 센서 파이프라인과 C3 소켓이 이미 controller에 있어 컨트롤러 기능을 옮기면 이중화만 생김, (c) 배포 프로젝트 1개 유지.

### 앱 화면 흐름 (controller 확장)
```
HOME(랜딩: VORTEX 워드마크, 게스트로 시작 / 로그인 스텁)
 → CONNECT(세션 코드 4자리 입력, ?room= 자동. arena 화면의 코드/QR과 페어링)
 → SELECT(AI 대전자 선택: 세이버/에페/헝가리안/통합 4카드. 선택이 소켓으로 arena에 전달)
 → PERMISSION → CALIBRATION (기존 C2)
 → PLAY(컨트롤러 = 폰이 검. 기존 C2 + C3)
 → RESULT(경기 결과: arena가 보낸 점수/명중률/부위 분포 + 폰이 자체 계산한 손떨림/찌르기 통계)
```

### arena 쪽 대응 (결정성 보호가 핵심)
- **machine.js(경기 상태 머신)는 건드리지 않는다.** 로비(페어링 대기, 유파 선택 대기)는 경기 밖 React 화면 계층으로 구현한다. 선택이 확정되면 기존 방식대로 해당 유파로 경기를 시작한다(경기는 이미 유파 파라미터를 받는 구조).
- arena 로비 화면: 세션 코드 크게 + 고정 QR(controller URL) + "폰에서 대전자 선택 중" 상태 + **키보드로 진행(1/2/3/4 유파 선택) 폴백 상시 표시**. 폰 없이도 전 플로우 완주 가능해야 발표 비상 계획이 산다.
- MATCH_END 시 arena가 result 메시지(점수, 투셰 목록과 부위, 리포스트 수, 피스트 아웃, 경기 시간)를 폰으로 emit.

### 프로토콜 추가 (shared/protocol.js)
```json
{ "t": "select", "school": "sabre" | "epee" | "hungarian" | "mixed" }
{ "t": "result", "score": [5,3], "touches": [...], "durationMs": 0, "riposteCount": 0, "pisteOut": 0 }
```

### 결과 통계의 출처 분담 (정직 노선)
- **폰 자체 계산**: 손떨림(EN_GARDE 구간 쿼터니언 각속도의 이동 분산), 찌르기 수/평균·최대 파워, 가드 수, 스와이프 수. 전부 폰 센서 스트림에서, 메모리만(localStorage 금지).
- **arena 제공**: 점수, 명중률(유효 찌르기/전체 찌르기), 부위 분포, 리포스트 성공, 피스트 아웃.
- 발표 명시: 통계는 데모 세션 한정(저장 없음), 손떨림은 자세 안정도의 근사 지표.

### 디자인 시스템 (강릉페이 이식 규칙)
- 반입된 강릉페이 리뉴얼의 DESIGN.md(iOS HIG)와 MD3.md(듀얼 시스템 학습)를 참조 원본으로. **가져오는 것은 구조와 규율**: HIG 타이포 스케일(Large Title 34 ~ Caption 11, 자간 규칙), 8pt 그리드, 44px 터치, 탑바 44px, 버튼 4위계(Filled/Tonal/Outlined/Text, 화면당 강조 1개), radius 토큰 체계, 코치마크 온보딩 패턴(S7), 닐슨 10 + 슈나이더만 8 매핑을 컴포넌트 주석으로 명시하는 규율.
- **가져오지 않는 것: 색.** 강릉페이 블루 팔레트는 배제하고 VORTEX 다크(#101010 배경, #FDFDFD 전경, #E60D15 액센트)로 스킨. 컨트롤러 PLAY 화면의 기존 블랙 문법과 이어진다.
- 코드 복사 원칙: 강릉페이 저장소는 팀장 자산이므로 컴포넌트 패턴 참조 가능하나, VORTEX 앱은 새로 작성(다른 도메인이라 복사가 오히려 비효율).

### 온보딩 (게이밍 콜아웃)
- 경기 진입 직후 첫 판 한정: 화면 요소에 원 + 리더 라인 + 설명 박스(FUI 문법: 팔각, steel 라인, red 액센트)로 순차 안내. arena(노트북 화면)의 온보딩은 arena가, 폰 조작 안내는 앱이 담당. 54321 카운트다운 후 시작, 중간중간 짧은 안내. reduced motion 대응, 두 번째 판부터 생략(메모리 플래그).

## 4. 리스크와 방어

- 사진 라이선스: 유파 카드 사진(VORTEX style-1~3)은 미확인 시안. 제출 전 자체 제작 교체 필수(PROGRESS 미해결에 기록, CREDITS 기재 금지).
- 로그인은 스텁: 버튼 존재, 누르면 "데모는 게스트로 진행" 안내. DB 없음, 진짜 인증 스코프 아웃.
- 키보드 폴백 사수: 앱/폰/서버 어느 것이 죽어도 arena 단독 키보드로 선택부터 경기까지 완주 가능.
- 서명: AI 유파 작업만 서명 갱신(1회), 앱/로비/네이밍/리스킨은 전부 서명 유지가 통과 조건.