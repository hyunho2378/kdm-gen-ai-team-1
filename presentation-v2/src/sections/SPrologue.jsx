// 배경 PROLOGUE. 원본 레이아웃은 `Slide 16_9 - 2.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼았고
// 이 SVG는 텍스트가 살아 있어 좌표와 강조 구간을 직접 뽑았다.
//
// 원본 실측(1920 기준):
//   배경 black, 이미지 없음
//   라벨 PROLOGUE  fill #E60D15  size 24  weight 600  x 60  y 229.9 → 3.13% / 21.29%
//   본문 2줄  size 38  y 535 / 615 → 49.5% / 56.9%
//     **가운데 정렬이다.** 1줄 x 263.6~1650, 2줄 x 372.1~1520으로 둘 다 중심이 960
//     강조 구간은 흰색 weight 500, 나머지는 #FDFDFD 알파 0.7
//     1줄: 펜싱은 빠른 공격보다 [상대와의 거리, 타이밍, 움직임]을 읽는 감각이 중요한 [1:1 대결 스포츠]다.
//     2줄: 하지만 높은 진입장벽으로 많은 사람들에게는 ['관람하는 스포츠']에 머물러 있다.
//
// 진입은 줄 단위 페이드업. transform과 opacity만 만진다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, whiteA } from '../tokens.js';
import { PROLOGUE } from '../copy.js';
import { Eyebrow } from '../components/Bits.jsx';

export default function SPrologue({ active }) {
  const labelRef = useRef(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label = labelRef.current;
    const lines = lineRefs.current.filter(Boolean);
    if (!label) return undefined;

    if (reduced) {
      gsap.set([label, ...lines], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(label, { opacity: 0, y: 14 });
    gsap.set(lines, { opacity: 0, y: 26 });
    // 셸의 섹션 이동이 1초다. 지연이 없으면 착지 전에 연출이 끝난다.
    const tl = gsap.timeline({ delay: 0.45 });
    tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: motion.gsapOut });
    tl.to(lines, { opacity: 1, y: 0, duration: 0.85, ease: motion.gsapOut, stagger: 0.16 }, 0.15);

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 아주 옅은 레드 radial 하나. 이미지가 없는 화면이라 바닥이 완전히 비지 않게만. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '53%',
          width: 'min(140vh, 120vw)',
          height: 'min(140vh, 120vw)',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 50% 50%, rgba(230,13,21,0.09) 0%, rgba(230,13,21,0.03) 38%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 좌상단 라벨. 원본 x 60 → 3.13%, y 229.9 → 21.3% */}
      <div
        ref={labelRef}
        style={{
          position: 'absolute',
          left: 'clamp(20px, 3.13vw, 76px)',
          top: 'clamp(44px, 21.3vh, 236px)',
          zIndex: 3,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <Eyebrow en={PROLOGUE.label} />
      </div>

      {/* 본문 2줄. 원본대로 가운데 정렬. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '52%',
          transform: 'translateY(-50%)',
          zIndex: 3,
          padding: '0 clamp(20px, 6vw, 150px)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        {PROLOGUE.body.map((segs, li) => (
          <p
            key={li}
            ref={(el) => {
              lineRefs.current[li] = el;
            }}
            style={{
              margin: li === 0 ? 0 : 'clamp(10px, 2.2vh, 28px) 0 0',
              opacity: 0,
              fontFamily: typography.family,
              fontSize: 'clamp(0.86rem, 1.98vw, 2.18rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.55,
              willChange: 'transform, opacity',
            }}
          >
            {/* 강조 조각만 밝고 굵게. 위치는 copy.js가 쥔다. */}
            {segs.map((sg, si) => (
              <span
                key={si}
                style={{
                  fontWeight: sg.b ? 700 : 400,
                  color: sg.b ? colors.text.primary : whiteA(0.7),
                }}
              >
                {sg.t}
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}
