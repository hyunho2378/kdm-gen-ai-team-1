// 모션 공통. GSAP 등록과 reduced motion 판정을 한 곳에서 한다.
//
// **GSAP은 이 프로젝트가 이미 채택한 라이브러리다**(CREDITS 등재, presentation에서 사용 중).
// brand 워크스페이스에 같은 버전 3.15.0으로 설치했다. dedupe를 위해 버전을 맞춘다.
//
// ScrollTrigger는 Lenis와 한 시계로 묶는다. Lenis가 스크롤 위치를 쥐고 있어
// 스크롤 이벤트만으로는 ScrollTrigger가 중간 프레임을 놓친다.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** 사용자가 모션을 줄여 달라고 했는가. 연출마다 이 하나만 본다. */
export function isReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
