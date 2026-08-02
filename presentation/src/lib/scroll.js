// 책임: 스크롤 엔진. Lenis 스무스 스크롤과 gsap ticker를 한 시계로 묶는다.
// reduced motion이면 Lenis를 아예 켜지 않고 네이티브 스크롤에 맡긴다(관성 자체가 전정기관 자극이다).
//
// @bsmnt/scrollytelling 대신 ScrollTrigger를 직접 쓴다. 근거:
// 마지막 배포가 2024-02로 2년 넘게 멈춰 있고, Radix portal과 slot 의존을 끌고 온다.
// PITFALLS 서드파티 절대로 핵심 UI를 라이브러리에 인질 잡히지 않는다. 발표 중 죽으면 복구가 없다.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { isReduced } from './motionMode.js';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
let tickerFn = null;

/** 앱 마운트 시 한 번 부른다. 해제 함수를 돌려준다. */
export function initScroll() {
  if (isReduced()) {
    // 네이티브 스크롤. ScrollTrigger는 그대로 쓰되 관성만 뺀다.
    ScrollTrigger.refresh();
    return () => {};
  }

  lenis = new Lenis({
    duration: 1.05,
    // 발표자가 PgDn과 방향키로 넘기므로 휠과 키보드 양쪽을 자연스럽게 둔다
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  tickerFn = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  // lag smoothing이 켜져 있으면 프레임 급락 시 스크롤이 튄다
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.refresh();

  return () => {
    if (tickerFn) gsap.ticker.remove(tickerFn);
    lenis?.destroy();
    lenis = null;
    tickerFn = null;
  };
}

/**
 * 섹션 이동. 레일 클릭과 해시 진입이 쓴다.
 * MOTION 0절: 키보드로 시작된 동작은 애니메이션하지 않는다.
 * 그래서 키보드 경로는 즉시 점프한다.
 */
export function scrollToId(id, { immediate = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  if (isReduced() || immediate || !lenis) {
    el.scrollIntoView({ behavior: immediate || isReduced() ? 'auto' : 'smooth', block: 'start' });
    return;
  }
  lenis.scrollTo(el, { offset: 0 });
}

/** 레이아웃이 바뀌면(폰트 로드, 이미지 도착) 트리거 위치를 다시 잰다. */
export function refreshScroll() {
  ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger };
