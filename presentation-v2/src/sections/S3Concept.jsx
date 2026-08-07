// S3 컨셉 (재구성). 참조 `frames/ref/Slide 16_9 - 103.svg`(1920x1080)를 브라우저에 렌더해
// getBBox로 전 요소 좌표를 직접 실측했다. 기억으로 지어낸 값이 아니다(DESIGN 15절 출처 계약).
//
// 실측 좌표(1920x1080):
//   외곽 글래스 원   cx 949.867 cy 540    r 367.968  stroke white 1.596  fill black 0.01
//   내부 글래스 디스크 cx 948.219 cy 543.797 r 190.657  fill white 0.3  + ring stroke white 0.7
//   가로 축선        x1 478.617 → x2 1436.17  y 539.521  stroke white 0.958
//   조합 로고(logo_main, 흰색)  bbox center (948,548)  162x116  ← 원 안(내부 디스크 중앙)
//   워드마크(black_wm 흰색)     bbox center (950,991)  520x62   ← 하단
//   텍스트 좌 "소용돌이처럼 몰아치는" x60 / 우 "경기의 긴장감" x1728  baseline y548.736  SUIT 24
//
// 배경 concept.png는 1920x1080 전체 배경(네이비 좌 + 마스크 + 우측 프로스트 밴드, 원만 없음)이라
// 풀블리드로 깐다. 그 위에 위 요소를 좌표대로 얹는다.
//
// 좌표 매핑: 섹션 중앙 앵커(50%/50%) + 높이 스케일(vh) 오프셋. k = 100/1080 vh/ref-px.
//   left = calc(50% + (x-960)*k vh), top = calc(50% + (y-540)*k vh), translate(-50%,-50%).
//   50%는 섹션(콘텐츠) 중앙이라 세로 스크롤바 폭에 영향받지 않는다(50vw는 스크롤바를 포함해 우측으로 밀렸다).
//   16:9에서 참조와 픽셀 일치, 타 비율에선 중앙을 유지하며 높이에 비례.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { CONCEPT_SCENE } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';

// **1 ref-px를 contain-fit 단위로.** min(가로배율, 세로배율)이라 전체화면 종횡비가 16:9가 아니어도
// 1920x1080 구도가 통째로 들어와 안 잘린다(16:9에선 세로 기준과 동일). 좁은 비율에선 폭에 맞춰 축소.
// (이전 vh 고정은 16:10 등에서 좌우 텍스트 "소용돌이처럼 몰아치는/경기의 긴장감"이 마진 밖으로 잘렸다.)
const REF = 'min(100vw / 1920, 100vh / 1080)';
const vh = (refPx) => `calc(${refPx} * ${REF})`;
// 참조 좌표(x,y)를 뷰포트 중앙 앵커 left/top으로. 요소는 translate(-50%,-50%)로 자기 중심 정렬.
const at = (x, y) => ({
  position: 'absolute',
  left: `calc(50% + ${(x - 960).toFixed(3)} * ${REF})`,
  top: `calc(50% + ${(y - 540).toFixed(3)} * ${REF})`,
  transform: 'translate(-50%, -50%)',
});

// 워드마크 흰색: black_wm.svg(잉크)를 흰색 CSS 마스크로 찍는다(SLogoGuide 조합형 워드마크와 같은 기법).
const WM_MASK = {
  background: colors.white,
  WebkitMaskImage: 'url(/images/assets/black_wm.svg)',
  maskImage: 'url(/images/assets/black_wm.svg)',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
};

export default function S3Concept({ active }) {
  const bgRef = useRef(null);
  const ringGroupRef = useRef(null); // 회전 그룹(외곽 원 + 축선 + 내부 디스크)
  const logoRef = useRef(null);
  const wmRef = useRef(null);
  const textLRef = useRef(null);
  const textRRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bg = bgRef.current;
    const ring = ringGroupRef.current;
    const logo = logoRef.current;
    const wm = wmRef.current;
    const tL = textLRef.current;
    const tR = textRRef.current;
    if (!bg || !ring || !logo || !wm || !tL || !tR) return undefined;

    if (reduced) {
      gsap.set([bg, logo, wm, tL, tR], { opacity: 1, y: 0 });
      gsap.set(ring, { opacity: 1, rotation: 0, scale: 1 });
      return undefined;
    }

    // 초기 상태
    gsap.set(bg, { opacity: 0 });
    gsap.set(ring, { opacity: 0, rotation: -260, scale: 0.9, transformOrigin: '50% 50%' });
    gsap.set([logo, wm], { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' });
    gsap.set([tL, tR], { opacity: 0, y: 12 });

    const tl = gsap.timeline();
    // ① 배경
    tl.to(bg, { opacity: 1, duration: 0.7, ease: motion.gsapOut });
    // ②③ 글래스 원 + 축선 회전 등장 → 수평 안착(소용돌이). 축이 자연스럽게 돌며 멈춘다.
    tl.to(ring, { opacity: 1, rotation: 0, scale: 1, duration: 1.5, ease: 'power3.out' }, 0.15);
    // ④ 로고 시그니처 + 워드마크(회전 마무리에 맞춰)
    tl.to(logo, { opacity: 1, scale: 1, duration: 0.7, ease: motion.gsapOut }, 1.15);
    tl.to(wm, { opacity: 1, scale: 1, duration: 0.7, ease: motion.gsapOut }, 1.32);
    // ⑤ 텍스트 마지막
    tl.to([tL, tR], { opacity: 1, y: 0, duration: 0.6, ease: motion.gsapOut, stagger: 0.12 }, 1.7);

    return () => tl.kill();
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.ink }}>
      {/* ① 배경 concept.png(원 없는 마스크 질감, 1920x1080 전체). 풀블리드. */}
      <div ref={bgRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0, willChange: 'opacity' }}>
        <AssetImage src="/images/concept/concept.png" fit="cover" />
      </div>

      {/* ②③ 회전 그룹: 외곽 글래스 원 + 축선 + 내부 디스크. 뷰포트 중앙을 축으로 회전. */}
      <div ref={ringGroupRef} style={{ position: 'absolute', inset: 0, zIndex: 2, willChange: 'transform, opacity', pointerEvents: 'none' }}>
        {/* 외곽 글래스 원. backdrop-filter로 굴절/서리 근사 + 흰 림 테두리(stroke 두께) + inset 하이라이트. */}
        <div
          style={{
            ...at(949.867, 540),
            width: vh(735.936),
            height: vh(735.936),
            boxSizing: 'border-box',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.01)',
            border: '1.5px solid rgba(255,255,255,0.55)',
            backdropFilter: 'blur(4px) saturate(1.1) brightness(1.03)',
            WebkitBackdropFilter: 'blur(4px) saturate(1.1) brightness(1.03)',
            boxShadow: 'inset 0 1.5px 1px rgba(255,255,255,0.28), inset 0 0 60px rgba(255,255,255,0.05), 0 0 40px rgba(0,0,0,0.15)',
          }}
        />
        {/* 가로 축선. 그룹 회전으로 소용돌이처럼 돈다. */}
        <div
          style={{
            ...at(957.39, 539.521),
            width: vh(957.55),
            height: '1px',
            background: 'rgba(255,255,255,0.85)',
          }}
        />
        {/* 내부 글래스 디스크 + 링. 로고 시그니처의 받침. */}
        <div
          style={{
            ...at(948.219, 543.797),
            width: vh(381.314),
            height: vh(381.314),
            boxSizing: 'border-box',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.7)',
            backdropFilter: 'blur(3px) brightness(1.05)',
            WebkitBackdropFilter: 'blur(3px) brightness(1.05)',
          }}
        />
      </div>

      {/* ④ 조합 로고(logo_main, 흰색). 내부 디스크 중앙. */}
      <img
        ref={logoRef}
        src="/images/assets/logo_main.svg"
        alt="VORTEX"
        draggable="false"
        style={{ ...at(948, 548), width: vh(162), height: 'auto', zIndex: 3, opacity: 0, userSelect: 'none', willChange: 'transform, opacity' }}
      />

      {/* ④ 워드마크(black_wm 흰색 마스크). 하단. */}
      <div
        ref={wmRef}
        aria-hidden="true"
        style={{ ...at(950, 991), width: vh(520), height: vh(62), zIndex: 3, opacity: 0, willChange: 'transform, opacity', ...WM_MASK }}
      />

      {/* ⑤ 텍스트: 좌 x60 / 우 x1728, 세로 중앙(y549). 좌측 정렬(자기 시작점 앵커). */}
      <div
        ref={textLRef}
        style={{
          position: 'absolute',
          left: `calc(50% + ${(60 - 960).toFixed(3)} * ${REF})`,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 4,
          opacity: 0,
          fontFamily: typography.family,
          fontSize: vh(24),
          fontWeight: 500,
          letterSpacing: '0em',
          color: colors.white,
          whiteSpace: 'nowrap',
          willChange: 'transform, opacity',
        }}
      >
        {CONCEPT_SCENE.textLeft}
      </div>
      <div
        ref={textRRef}
        style={{
          position: 'absolute',
          left: `calc(50% + ${(1728 - 960).toFixed(3)} * ${REF})`,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 4,
          opacity: 0,
          fontFamily: typography.family,
          fontSize: vh(24),
          fontWeight: 500,
          letterSpacing: '0em',
          color: colors.white,
          whiteSpace: 'nowrap',
          willChange: 'transform, opacity',
        }}
      >
        {CONCEPT_SCENE.textRight}
      </div>
    </div>
  );
}
