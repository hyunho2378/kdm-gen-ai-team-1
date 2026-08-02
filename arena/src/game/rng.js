// 책임: 시드 가능한 난수. 판정 결정성의 토대다.
// Math.random을 게임 로직에서 직접 부르지 마라. 리플레이 디버깅이 불가능해진다.

/** mulberry32. 32비트 시드 하나로 재현 가능한 수열을 만든다. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 게임 로직이 쓰는 난수 핸들. 범위 헬퍼를 함께 준다. */
export function createRng(seed) {
  const next = mulberry32(seed);
  return {
    seed,
    next,
    /** [min, max) 실수 */
    range(min, max) {
      return min + next() * (max - min);
    },
    /** 확률 p로 true */
    chance(p) {
      return next() < p;
    },
  };
}
