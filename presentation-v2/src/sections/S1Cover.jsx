// S1 표지. 3겹 레이아웃.
// 레이어1: 블랙 바닥(브랜드 블랙, 네이비 금지). 레이어2: Tubes Cursor(주인공). 레이어3: 중앙 워드마크.
// 워드마크는 간합 / 間合 / IMMERSIVE FENCING XR 세 라벨뿐. 다른 문구 금지, 화면의 15% 이하.
// 등장은 SplitType(ISC) word 단위(한글 char 분해 금지). CJK 두 줄은 arena 표지의 메탈릭 그라디언트 재사용.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import TubesBackground from '../components/TubesBackground.jsx';

// 메탈릭 실버 그라디언트. 위는 밝은 실버, 아래로 어두워졌다가 바닥에서 살짝 반사광 → 깎인 금속 볼륨.
const METAL = 'linear-gradient(180deg, #FFFFFF 0%, #EAF1F9 20%, #C3CDDA 44%, #8A96A8 63%, #6E7B92 80%, #AAB6C6 100%)';

// 입체감: 위 얇은 림 하이라이트 + 아래 어두운 엣지 + 소프트 드롭섀도우. 블랙 배경에서 글자가 떠오른다.
const METAL_FILTER =
  'drop-shadow(0 -1px 0.5px rgba(255,255,255,0.42)) drop-shadow(0 2px 1px rgba(0,0,0,0.9)) drop-shadow(0 12px 26px rgba(0,0,0,0.55))';
const METAL_FILTER_SUB =
  'drop-shadow(0 -1px 0.5px rgba(255,255,255,0.3)) drop-shadow(0 1px 1px rgba(0,0,0,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.5))';

function applyMetal(el) {
  el.querySelectorAll('.word').forEach((w) => {
    w.style.backgroundImage = METAL;
    w.style.webkitBackgroundClip = 'text';
    w.style.backgroundClip = 'text';
    w.style.color = 'transparent';
    w.style.webkitTextFillColor = 'transparent';
  });
}

export default function S1Cover() {
  const l1 = useRef(null);
  const l2 = useRef(null);
  const l3 = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lines = [l1.current, l2.current, l3.current].filter(Boolean);
    // word 단위 분해. 한글/CJK는 공백이 없어 한 단어로 유지된다(자소·글자 분해 없음).
    const splits = lines.map((el) => new SplitType(el, { types: 'words' }));
    applyMetal(l1.current); // 간합
    applyMetal(l2.current); // 間合

    const words = splits.flatMap((s) => s.words);
    let tween = null;
    if (reduced) {
      gsap.set(words, { opacity: 1, y: 0 });
    } else {
      gsap.set(words, { opacity: 0, yPercent: 60 });
      tween = gsap.to(words, {
        opacity: 1,
        yPercent: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.15,
      });
    }

    return () => {
      tween?.kill();
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        // 레이어1: 블랙 바닥(네이비 금지). 중앙만 아주 살짝 들어올려 워드마크를 받친다.
        background: 'radial-gradient(ellipse at 50% 42%, #1b1b1f 0%, #101012 55%, #050506 100%)',
      }}
    >
      {/* 레이어2: 주인공 */}
      <TubesBackground />

      {/* 레이어3: 워드마크. 튜브 위에 겹쳐 읽힌다. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(8px, 1.4vh, 18px)',
          pointerEvents: 'none', // 튜브가 마우스를 받도록 텍스트는 이벤트를 통과시킨다
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        {/* 글자 뒤 미세한 레드 글로우(브랜드 포인트). 아주 옅게. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 'min(72vw, 760px)',
            height: 'min(42vh, 380px)',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(179,18,44,0.12) 0%, rgba(179,18,44,0.035) 42%, transparent 66%)',
            filter: 'blur(28px)',
            pointerEvents: 'none',
          }}
        />
        <h1
          ref={l1}
          style={{
            margin: 0,
            position: 'relative',
            fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
            fontSize: 'clamp(3.5rem, 11vw, 9rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            filter: METAL_FILTER, // 림 하이라이트 + 어두운 엣지 + 드롭섀도우
          }}
        >
          간합
        </h1>
        <div
          ref={l2}
          style={{
            position: 'relative',
            fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
            fontSize: 'clamp(1.5rem, 4.5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            filter: METAL_FILTER_SUB,
          }}
        >
          間合
        </div>
        <div
          ref={l3}
          style={{
            marginTop: 'clamp(6px, 1vh, 14px)',
            fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
            fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
            fontWeight: 500,
            letterSpacing: '0.34em',
            textShadow: '0 2px 24px rgba(5,5,6,0.75)',
            color: 'rgba(242,246,255,0.62)',
          }}
        >
          IMMERSIVE FENCING XR
        </div>
      </div>
    </div>
  );
}
