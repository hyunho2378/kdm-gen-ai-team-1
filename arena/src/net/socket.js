// 책임: Socket.io 연결과 메시지 송수신. arena 역할로 접속한다.
// 서버 주소는 import.meta.env.VITE_SERVER_URL에서만 읽는다.
// 메시지 타입은 shared/protocol.js의 MSG 상수만 쓴다. 문자열 리터럴 금지.
// 방 코드는 서버 회신값과 URL 파라미터로만 유지한다. localStorage 금지.
// SETUP 단계에서는 구현하지 않는다.
