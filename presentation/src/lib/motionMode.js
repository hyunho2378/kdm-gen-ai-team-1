// 책임: 모션 강도 전역 분기. 이 트랙의 모든 스크롤 연출은 반드시 이 파일을 거친다.
// MOTION 13절: reduced motion은 피드백을 없애는 것이 아니라 전정기관을 자극하지 않는
// 등가물로 바꾸는 것이다. 그래서 연출을 지우지 않고 짧은 opacity 크로스페이드로 대체한다.

const QUERY = '(prefers-reduced-motion: reduce)';

/** reduced 모드에서 y 이동과 스프링을 버리고 이 길이의 페이드만 남긴다. */
export const REDUCED_FADE_MS = 200;

let mql = null;
function query() {
  if (mql === null) mql = window.matchMedia(QUERY);
  return mql;
}

export function isReduced() {
  return query().matches;
}

/** 사용자가 OS 설정을 바꾸면 알린다. 해제 함수를 돌려준다. */
export function subscribe(cb) {
  const m = query();
  const handler = (e) => cb(e.matches);
  m.addEventListener('change', handler);
  return () => m.removeEventListener('change', handler);
}

/**
 * 연출 스펙 분기. full은 평상시, reduced는 축약형이다.
 * 값이든 함수든 받는다. 호출부가 if (isReduced())를 반복하지 않게 한다.
 */
export function pick(full, reduced) {
  const chosen = isReduced() ? reduced : full;
  return typeof chosen === 'function' ? chosen() : chosen;
}

/**
 * 등장 연출의 표준 스펙. y 24px + opacity, ease-out.
 * reduced에서는 y를 버리고 짧은 페이드만 남긴다.
 * @param stagger 자식 스태거 초. reduced에서는 0으로 눌린다
 */
export function revealSpec({ y = 24, durationMs = 520, stagger = 0.12 } = {}) {
  if (isReduced()) {
    return { from: { opacity: 0 }, to: { opacity: 1, duration: REDUCED_FADE_MS / 1000, stagger: 0, ease: 'none' } };
  }
  return {
    from: { opacity: 0, y },
    to: { opacity: 1, y: 0, duration: durationMs / 1000, stagger, ease: 'power3.out' },
  };
}
