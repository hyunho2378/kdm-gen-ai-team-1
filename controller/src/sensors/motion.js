// 책임: DeviceMotion 권한 요청과 가속도 자이로 샘플링.
// iOS는 사용자 제스처 안에서 DeviceMotionEvent.requestPermission을 호출해야 한다.
// 보안 컨텍스트(https)에서만 동작하므로 실기기 테스트는 배포 URL로만 한다.
// 샘플은 shared/protocol.js의 MSG.MOTION으로 전송한다.
// SETUP 단계에서는 구현하지 않는다.
