// P6 섹션 간 리듬: clip-path inset 리빌. 스크롤 진행에 맞춰 한쪽에서 열리는 와이프.
// tutsplus의 clip-path 리빌 개념 포팅(코드 복사 아님). gl-transitions는 LICENSE 확인 불가라 미도입, clip-path로 충분.
// 절제 적용: 인접 1~2곳에만(현재 insight 미디어 하나). 남용하면 리듬이 아니라 소음이 된다.
// reduced-motion에서는 와이프 없이 완전히 드러낸 정적 상태.

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll.js';
import { isReduced } from '../lib/motionMode.js';

export default function ClipReveal({ children, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (isReduced()) {
      el.style.clipPath = 'inset(0 0 0 0)';
      return undefined;
    }
    gsap.set(el, { clipPath: 'inset(0 100% 0 0)' }); // 왼쪽만 보이는 닫힌 상태
    const trig = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      end: 'top 42%',
      scrub: true, // 스크롤과 1:1로 열린다
      onUpdate: (self) => {
        el.style.clipPath = `inset(0 ${(1 - self.progress) * 100}% 0 0)`;
      },
    });
    return () => trig.kill();
  }, []);

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}
