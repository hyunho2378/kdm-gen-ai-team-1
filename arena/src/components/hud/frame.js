// 책임: XR 글라스 팔각형 프레임의 치수 계산. 프레임과 HUD가 같은 수를 본다.
//
// 프레임을 viewBox 고정 스케일로 늘리지 않는다. preserveAspectRatio로 늘리면
// 코너 컷의 각도가 종횡비를 따라 찌그러진다. SVG를 뷰포트 실픽셀로 두고
// 리사이즈 때마다 여덟 점을 다시 계산한다. 계산은 리사이즈에서만 한다.

import { useEffect, useState } from 'react';

const CUT_MIN = 48;
const CUT_MAX = 120;
const CUT_VW = 0.06;      // clamp(48px, 6vw, 120px)
const INSET_PAD = 12;

/** 네 코너의 컷 크기. 대칭이다. */
export function cutSize(w) {
  return Math.round(Math.max(CUT_MIN, Math.min(CUT_MAX, w * CUT_VW)));
}

/**
 * HUD 인셋. 모든 HUD 요소가 이 하나를 쓴다.
 * 컷 크기 + 12px이면 코너 삼각형(x + y < cut)에서 넉넉히 벗어난다.
 */
export function frameInset(w) {
  return cutSize(w) + INSET_PAD;
}

/** 팔각형 여덟 점. 좌상단부터 시계 방향이다. */
export function octagonPoints(w, h) {
  const c = cutSize(w);
  return [
    [c, 0],
    [w - c, 0],
    [w, c],
    [w, h - c],
    [w - c, h],
    [c, h],
    [0, h - c],
    [0, c],
  ];
}

/** 뷰포트 실픽셀. ResizeObserver가 리사이즈에서만 갱신한다. */
export function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  useEffect(() => {
    const el = document.documentElement;
    const read = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    read();
    return () => ro.disconnect();
  }, []);

  return size;
}
