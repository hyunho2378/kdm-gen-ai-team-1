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
import { colors, motion, grid, inkA } from '../tokens.js';
import { PROLOGUE } from '../copy.js';
import { SlideHeader } from '../components/Bits.jsx';

export default function SPrologue({ active }) {
  const headRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    if (!head) return undefined;

    if (reduced) {
      gsap.set(head, { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(head, { opacity: 0, y: 20 });
    // 셸의 섹션 이동이 1초다. 지연이 없으면 착지 전에 연출이 끝난다.
    const tl = gsap.timeline({ delay: 0.45 });
    tl.to(head, { opacity: 1, y: 0, duration: 0.85, ease: motion.gsapOut });

    return () => {
      tl.kill();
    };
  }, [active]);

  // 강조 조각만 밝고 굵게(위치는 copy.js). 2단 헤더의 우측 열 헤드라인으로 얹는다.
  const statement = PROLOGUE.body.map((segs, li) => (
    <span key={li} style={{ display: 'block', marginTop: li === 0 ? 0 : '0.5em' }}>
      {segs.map((sg, si) => (
        <span key={si} style={{ fontWeight: sg.b ? 700 : 400, color: sg.b ? colors.text.primary : inkA(0.55) }}>
          {sg.t}
        </span>
      ))}
    </span>
  ));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 공용 2단 헤더. 아이브로우 좌, 진술문을 우측 열 헤드라인으로. 전역 그리드 좌상단. */}
      <div
        ref={headRef}
        style={{
          position: 'absolute',
          left: grid.marginX,
          right: grid.marginX,
          top: grid.marginTop,
          zIndex: 3,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <SlideHeader eyebrow={{ en: PROLOGUE.label }} headline={statement} />
      </div>
    </div>
  );
}
