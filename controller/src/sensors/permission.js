// 책임: DeviceMotion 권한 (C2-1).
//
// **iOS 13+는 사용자 제스처 안에서만 requestPermission을 허용한다.**
// 버튼 핸들러의 동기 흐름에서 곧바로 불러야 하고, await를 앞에 하나라도 두면
// 제스처 컨텍스트가 끊겨 조용히 거부된다. 그래서 이 함수는 **await 없이 시작해
// Promise를 그대로 돌려준다.** 호출부도 핸들러 첫 줄에서 이걸 불러야 한다.
//
// 안드로이드에는 requestPermission 자체가 없다. 존재 검사로 분기하고 바로 통과시킨다.

export const PERM = {
  UNKNOWN: 'unknown',
  GRANTED: 'granted',
  DENIED: 'denied',
  UNSUPPORTED: 'unsupported',   // DeviceMotionEvent가 없다. 탭 버튼 모드로 간다
};

export function motionPermissionNeeded() {
  return (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  );
}

export function motionSupported() {
  return typeof DeviceMotionEvent !== 'undefined';
}

/**
 * 제스처 핸들러 첫 줄에서 호출한다. **앞에 await를 두지 마라.**
 * 돌려주는 것은 Promise이고 결과는 PERM 값이다.
 */
export function requestMotionPermission() {
  if (!motionSupported()) return Promise.resolve(PERM.UNSUPPORTED);
  if (!motionPermissionNeeded()) return Promise.resolve(PERM.GRANTED);
  try {
    // 동기 호출이다. 여기서 Promise를 받아 그대로 넘긴다
    return DeviceMotionEvent.requestPermission()
      .then((r) => (r === 'granted' ? PERM.GRANTED : PERM.DENIED))
      .catch(() => PERM.DENIED);
  } catch {
    return Promise.resolve(PERM.DENIED);
  }
}
