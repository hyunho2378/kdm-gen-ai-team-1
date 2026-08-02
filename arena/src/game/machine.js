// 책임: 경기 상태머신. shared/protocol.js의 PHASE 전이만 관리한다.
// IDLE > PAIRING > CALIBRATION > EN_GARDE > EXCHANGE > JUDGE > SCORE > MATCH_END
// 전이 조건과 타이머만 여기에 둔다. 판정 계산은 judge.js, 그리기는 renderer.js가 맡는다.
// SETUP 단계에서는 구현하지 않는다.
