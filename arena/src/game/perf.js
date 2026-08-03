// 책임: 프레임 성능 계측과 미터 노출 판단.
//
// 왜 프로덕션에서도 뜨는가. 헤드리스 소프트웨어 렌더링의 fps는 무효라
// 최종 성능 게이트가 사용자의 실기 확인이다. 발표 노트북에서 주소 뒤에 ?fps=1만 붙이면
// 바로 확인할 수 있어야 그 게이트가 성립한다. dev 빌드에서는 파라미터 없이도 뜬다.
//
// 최저를 순간 프레임으로 잡지 않는다. 프레임 하나의 역수는 GC 한 번에도 튀어서 읽을 수 없다.
// 1초 버킷의 최소 프레임 수를 최저로 본다. 눈에 보이는 끊김과 단위가 같다.

const WINDOW_SEC = 60;

/** dev 빌드이거나 URL에 ?fps=1이 있으면 미터를 띄운다. */
export function meterEnabled(dev = false) {
  if (dev) return true;
  try {
    return new URLSearchParams(window.location.search).get('fps') === '1';
  } catch {
    return false;
  }
}

export function createPerfStats() {
  // 1초 링 버킷 60개. 배열 할당은 생성 시 한 번뿐이고 sample은 산술만 한다.
  const buckets = [];
  for (let i = 0; i < WINDOW_SEC; i += 1) buckets.push({ frames: 0, sec: 0 });
  let cursor = 0;
  let fps = 60;
  let cpuMs = 0;

  return {
    /** 렌더 콜백마다 한 번. dtSec는 실시간, cpuSampleMs는 render() 벽시계다. */
    sample(dtSec, cpuSampleMs) {
      if (!(dtSec > 0)) return;
      fps += (1 / dtSec - fps) * 0.08;
      cpuMs += (cpuSampleMs - cpuMs) * 0.08;

      const b = buckets[cursor];
      b.frames += 1;
      b.sec += dtSec;
      if (b.sec >= 1) {
        cursor = (cursor + 1) % WINDOW_SEC;
        buckets[cursor].frames = 0;
        buckets[cursor].sec = 0;
      }
    },

    /** 미터가 초당 몇 번만 부른다. 프레임 경로가 아니다. */
    read() {
      let frames = 0;
      let sec = 0;
      let low = Infinity;
      for (let i = 0; i < WINDOW_SEC; i += 1) {
        const b = buckets[i];
        if (b.sec <= 0) continue;
        frames += b.frames;
        sec += b.sec;
        // 채워지는 중인 버킷은 최저 후보에서 뺀다. 0.4초짜리 조각이 최저로 잡히면 거짓말이 된다
        if (i !== cursor && b.sec >= 0.5) low = Math.min(low, b.frames / b.sec);
      }
      return {
        fps,
        cpuMs,
        avg: sec > 0 ? frames / sec : 0,
        low: Number.isFinite(low) ? low : 0,
        windowSec: Math.min(WINDOW_SEC, sec),
      };
    },

    reset() {
      for (const b of buckets) {
        b.frames = 0;
        b.sec = 0;
      }
      cursor = 0;
    },
  };
}
