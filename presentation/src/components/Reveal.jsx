// 책임: 등장 연출의 유일한 통로. 모든 섹션 콘텐츠는 이 컴포넌트를 거친다.
// MOTION 0절과 16절: 뷰포트 진입 1회만. 재진입 재실행은 화면 깜빡임으로 읽힌다.
// reduced motion이면 motionMode.revealSpec이 y를 버리고 짧은 페이드만 남긴다.

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll.js';
import { revealSpec } from '../lib/motionMode.js';

export default function Reveal({
  children,
  as: Tag = 'div',
  stagger = 0.12,
  y = 24,
  start = 'top 82%',
  style,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    // 직계 자식을 스태거 대상으로 삼는다. 자식이 하나면 스태거는 무의미해도 해롭지 않다.
    const targets = root.children.length > 0 ? Array.from(root.children) : [root];
    const spec = revealSpec({ y, stagger });

    gsap.set(targets, spec.from);
    const trigger = ScrollTrigger.create({
      trigger: root,
      start,
      // once가 재진입 재실행을 막는다. 이 한 줄이 검증 항목이다.
      once: true,
      onEnter: () => gsap.to(targets, spec.to),
    });

    return () => trigger.kill();
  }, [stagger, y, start]);

  return (
    <Tag ref={ref} style={style} {...rest}>
      {children}
    </Tag>
  );
}
