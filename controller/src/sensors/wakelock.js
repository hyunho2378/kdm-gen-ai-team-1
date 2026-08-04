// 책임: Screen Wake Lock 획득과 해제. 경기 중 폰 화면이 꺼지지 않게 한다.
// 미지원 브라우저에서는 조용히 실패하고 앱을 막지 않는다.
// visibilitychange로 탭 복귀 시 재획득한다.
//
// **실패는 치명이 아니다.** iOS 구버전과 일부 브라우저에 wakeLock이 아예 없다.
// 여기서 던지면 센서 파이프라인 전체가 멈추므로 전부 삼키고 지원 여부만 남긴다.

export function createWakeLock() {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  let sentinel = null;
  let want = false;

  async function acquire() {
    if (!supported || !want || sentinel) return;
    try {
      sentinel = await navigator.wakeLock.request('screen');
      // 시스템이 임의로 놓을 수 있다. 그때도 조용히 두고 복귀 때 다시 잡는다
      sentinel.addEventListener('release', () => {
        sentinel = null;
      });
    } catch {
      sentinel = null;
    }
  }

  function onVisible() {
    if (document.visibilityState === 'visible') acquire();
  }

  return {
    supported,
    start() {
      want = true;
      document.addEventListener('visibilitychange', onVisible);
      acquire();
    },
    stop() {
      want = false;
      document.removeEventListener('visibilitychange', onVisible);
      try {
        sentinel?.release();
      } catch {
        // 이미 해제된 경우다. 무시한다
      }
      sentinel = null;
    },
    held() {
      return sentinel !== null;
    },
  };
}
