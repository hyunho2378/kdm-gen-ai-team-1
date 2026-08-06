// SplashScreen — 앱 첫 진입 스플래시. 워드마크 하나가 떠올랐다 사라지고 게이트로 넘긴다.
//
// **강릉페이에 스플래시 원본이 없다.** 코드도 명세도 없어서 형태는 이 앱이 이미 쓰는
// HomeScreen 워드마크 처리(steelText 크롬 + radial 배경)를 그대로 재사용한다. 값은 전부
// tokens 경유이고 새로 정한 디자인은 없다.
//
// MOTION 0절: 세션당 한 번뿐인 화면이라 연출이 정당한 구간이다. 그래도 짧게 끊는다.
// MOTION 2절: 진입은 ease-out. reduced motion이면 페이드를 걷고 대기만 짧게 남긴다.

import { useEffect, useState } from 'react';
import { colors, motion, steelText, typography } from '../tokens.js';
import { BRAND } from '../copy.js';

// 워드마크가 다 뜨고 사람이 읽는 데 걸리는 시간. 이보다 길면 앱이 느린 것으로 읽힌다
const HOLD_MS = 1100;
const REDUCED_HOLD_MS = 400;
const FADE_MS = 420;

/** 사용자가 모션 축소를 켰나. 켜져 있으면 페이드 없이 짧게 지나간다. */
function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export default function SplashScreen({ onDone }) {
  const [reduced] = useState(prefersReduced);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // 다음 프레임에 켜야 전환이 실제로 돈다. 마운트와 같은 프레임에 바꾸면 브라우저가 합친다
    const raf = requestAnimationFrame(() => setShown(true));
    const t = setTimeout(onDone, reduced ? REDUCED_HOLD_MS : HOLD_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [onDone, reduced]);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: colors.bg.base,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 80% at 50% 50%, ${colors.bg.raised} 0%, ${colors.bg.base} 55%, ${colors.bg.deep} 100%)`,
        }}
      />
      <h1
        style={{
          position: 'relative',
          margin: 0,
          fontFamily: typography.family,
          fontSize: 'clamp(44px, 16vw, 64px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.02,
          ...steelText,
          opacity: reduced || shown ? 1 : 0,
          transition: reduced ? 'none' : `opacity ${FADE_MS}ms ${motion.easeOut}`,
        }}
      >
        {BRAND}
      </h1>
    </div>
  );
}
