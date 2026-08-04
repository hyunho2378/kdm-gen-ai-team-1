// S1 레이어2(주인공): Tubes Cursor 풀스크린. 마우스를 따라 빛 튜브가 흐른다.
// threejs-components(CC BY-NC-SA)를 CDN ESM으로 import한다(three 번들됨, 별도 설치 없음). CREDITS 기재.
// CSS/SVG 흉내가 아니라 실제 라이브러리를 심는다.
//
// size:"parent"라 캔버스는 부모 크기를 따른다 → 부모가 100dvh 섹션이어야 한다.
// 저하: CDN 로드 실패 시 캔버스는 빈 채로 두고 뒤 블랙 바닥과 워드마크는 그대로 보인다(핵심 UI 인질 금지).
// reduced-motion: 전체 화면을 훑는 추종 모션은 전정기관 자극이라 로드하지 않는다(정적 블랙 히어로로 저하).

import { useEffect, useRef } from 'react';

const CDN = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';

export default function TubesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let app = null;
    let disposed = false;

    import(/* @vite-ignore */ CDN)
      .then((mod) => {
        if (disposed) return;
        const TubesCursor = mod.default;
        // 브랜드 팔레트: 실버 + 실버-시안 + 레드(악센트). 네이비/블루 금지.
        app = TubesCursor(canvas, {
          tubes: {
            colors: ['#d8e2f0', '#a9dfff', '#b3122c'],
            lights: {
              intensity: 220,
              colors: ['#d8e2f0', '#a9dfff', '#6e7b92', '#b3122c'],
            },
          },
        });
      })
      .catch(() => {
        // CDN 실패. 정적 블랙 + 워드마크로 저하. 발표가 죽지 않는다.
      });

    return () => {
      disposed = true;
      try {
        app?.dispose();
      } catch {
        // dispose 실패가 언마운트를 막지 않게 한다
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
