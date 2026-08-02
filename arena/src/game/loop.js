// 책임: 프레임 루프. 로직은 고정 타임스텝, 렌더는 가변.
// 로직 시계에만 timeScale을 곱한다. 렌더는 실시간으로 돈다(시간 팽창 중에도 화면은 60fps).
// 탭 비활성 시 정지한다. rAF가 백그라운드에서 멈추면 누적기가 폭발하기 때문이다.

const STEP_MS = 1000 / 60;
// 한 프레임에 소화할 로직 스텝 상한. 탭 복귀나 긴 GC 후 따라잡기 폭주를 막는다.
const MAX_STEPS_PER_FRAME = 5;

/**
 * @param update (stepSec) => void  고정 스텝 로직. 팽창된 시계를 받는다
 * @param render (alpha, realDtSec) => void  가변 렌더
 */
export function createLoop({ update, render }) {
  let rafId = null;
  let running = false;
  let lastMs = 0;
  let accMs = 0;
  let timeScale = 1;

  function frame(nowMs) {
    rafId = requestAnimationFrame(frame);
    const realDtMs = Math.min(nowMs - lastMs, 250);
    lastMs = nowMs;

    accMs += realDtMs * timeScale;
    let steps = 0;
    while (accMs >= STEP_MS && steps < MAX_STEPS_PER_FRAME) {
      update(STEP_MS / 1000);
      accMs -= STEP_MS;
      steps += 1;
    }
    if (steps === MAX_STEPS_PER_FRAME) accMs = 0;

    render(accMs / STEP_MS, realDtMs / 1000);
  }

  function start() {
    if (running) return;
    running = true;
    lastMs = performance.now();
    accMs = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }
  document.addEventListener('visibilitychange', onVisibility);

  return {
    start,
    stop,
    /** 시간 팽창. 1.0이 기본, tokens.motion.timeDilation.scale이 팽창값 */
    setTimeScale(v) {
      timeScale = v;
    },
    getTimeScale() {
      return timeScale;
    },
    dispose() {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
