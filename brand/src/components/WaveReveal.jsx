// 파도 웨이브(요소 등장). 자식들이 **파도처럼 순차로 물결치며** 등장한다(stagger + transform).
//
// **용도 판단(보고).** 배경 앰비언트 물결 왜곡(WebGL 셰이더)은 상시 렌더라 저사양에서 프레임을 먹는다.
// 라이트 팔레트에 은은해야 해 존재감도 약하다. 그래서 **요소 등장 웨이브**를 채택했다(MEDIA_PLAN).
// transform/opacity만, reduced-motion에서 비활성(정적). ScrollTrigger once라 되감아도 안 사라진다.
//
// 직속 자식이 웨이브 단위다. 각 자식이 y+opacity에서 **stagger로 물결친다**(sine 이징이 출렁임을 낸다).
// ProductLayout의 data-beat 리빌과 겹치지 않게 자식엔 data-beat를 달지 않는다(여기가 자기 자식을 맡는다).

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, isReduced } from '../lib/motion.js';

export default function WaveReveal({ children, stagger = 0.12, y = 28, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || isReduced()) return undefined;
    const kids = [...root.children];
    if (!kids.length) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(kids, {
        opacity: 0,
        y,
        duration: 0.7,
        // sine.out 스태거가 물결처럼 앞은 촘촘 뒤는 성글게 퍼진다.
        ease: 'power3.out',
        stagger: { each: stagger, ease: 'sine.inOut' },
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      ScrollTrigger.refresh();
    }, root);
    return () => ctx.revert();
  }, [stagger, y]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
