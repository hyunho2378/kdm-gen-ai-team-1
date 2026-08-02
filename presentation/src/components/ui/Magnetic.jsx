// 자석 인력 래퍼. @toon.rombaut/magnetic-elements(MIT)를 감싼다.
//
// 왜 래퍼인가. 라이브러리는 대상 요소에 인라인 transform: translate를 쓴다.
// 버튼에 직접 걸면 :active의 transform: scale(0.97)이 인라인 스타일에 밀려 죽는다.
// 래퍼가 이동을, 버튼이 눌림을 각자 맡으면 둘이 공존한다.
//
// PITFALLS 서드파티 절: 실패해도 평범한 버튼으로 동작해야 한다. 초기화를 try로 감싸고
// 실패하면 무효과로 넘어간다. 자석은 장식이고 CTA는 발표의 목적지다.
//
// MOTION 0절: 고빈도 요소에는 쓰지 않는다. 적용은 demo 섹션 CTA 한 곳뿐이다.

import { useEffect, useRef } from 'react';
import { isReduced } from '../../lib/motionMode.js';

export default function Magnetic({ children, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    // reduced motion에서 커서를 따라오는 인력은 그대로 전정기관 자극이다. 켜지 않는다.
    if (!el || isReduced()) return undefined;

    let controller = null;
    let cancelled = false;

    import('@toon.rombaut/magnetic-elements')
      .then(({ MagneticElementsController }) => {
        if (cancelled) return;
        try {
          controller = new MagneticElementsController({
            // 절제한다. 기본 200은 화면 절반이 끌려오는 느낌이라 과하다.
            triggerArea: 120,
            interpolationFactor: 0.12,
            magneticForce: 0.22,
          });
        } catch {
          controller = null; // 무효과. 버튼은 평범하게 동작한다.
        }
      })
      .catch(() => {
        controller = null;
      });

    return () => {
      cancelled = true;
      try {
        controller?.destroy();
      } catch {
        // 정리 실패가 언마운트를 막지 않게 한다
      }
    };
  }, []);

  return (
    <span
      ref={ref}
      magnetic-element=""
      style={{ display: 'inline-block', willChange: 'transform', ...style }}
    >
      {children}
    </span>
  );
}
