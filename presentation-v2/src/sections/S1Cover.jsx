// S1 표지. 포스터 문법. **라이트 반전: 배경 #F6F6F6.**
// fencer 다크 사진 패널을 제거했고, 그 사진 위에 얹던 OGL 커서 궤적(VortexLine)도 함께 걷었다
// (로고가 화면 중앙으로 오면서 궤적의 idle 나선이 로고를 관통해 아티팩트로 보였다).
// 시그니처 로고를 화면 정중앙(가로/세로)에 두고, 서브카피는 그 바로 아래, 팀/행사 표기는
// 상단 두 모서리에 둔다(중앙 로고를 프레임하는 균형).
//
// **시그니처는 logo_main.svg를 잉크(#101010)로 평평하게 찍는다(질감/섀도우 0).**
// SVG 도형이 흰 채움이라 CSS mask로 알파만 취해 잉크 박스를 그 모양으로 오려낸다.
// 그래서 원본 에셋을 안 건드리고도 정확히 #101010 단색 로고가 된다. 크기는 PV2 display 스케일(대형).

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { TITLE, COVER } from '../copy.js';

// 시그니처 로고를 잉크로 찍는 mask 세트. 원본 SVG(흰 도형/투명 배경)의 알파를 마스크로 쓴다.
const LOGO_MASK = {
  background: colors.ink,
  WebkitMaskImage: 'url(/images/assets/logo_main.svg)',
  maskImage: 'url(/images/assets/logo_main.svg)',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
};

export default function S1Cover() {
  const markRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mark = markRef.current;
    if (!mark) return undefined;

    if (reduced) {
      gsap.set(mark, { opacity: 1, y: 0 });
      return undefined;
    }

    // 중앙 시그니처 묶음 페이드업. transform과 opacity만 만진다.
    gsap.set(mark, { opacity: 0, yPercent: 6 });
    const tl = gsap.timeline();
    tl.to(mark, { opacity: 1, yPercent: 0, duration: 1, ease: motion.gsapOut }, 0.2);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* **상단 표기(팀/행사)는 전 슬라이드 제거 규칙에 따라 표지에서도 걷었다.** 로고 + 서브카피만 남긴다. */}

      {/* 정중앙: 시그니처 로고 + 서브카피.
          **로고를 정확히 화면 중앙에 둔다.** 서브카피는 out-of-flow(absolute)라 로고 위치를 밀지 않고
          로고 바로 아래에 걸린다. 그래서 로고 자체가 가로/세로 정중앙에 온다. */}
      <div
        ref={markRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* 시그니처. logo_main.svg를 잉크로 평평하게(질감/드롭섀도우/그라디언트 0).
              PV2 display 스케일에 준하는 대형 — 다른 슬라이드 VORTEX 워드마크와 같은 존재감. */}
          <div
            role="img"
            aria-label={TITLE}
            style={{
              ...LOGO_MASK,
              width: 'clamp(240px, 34vw, 520px)',
              aspectRatio: '250 / 180',
            }}
          />
          {/* 서브카피. 로고 바로 아래 중앙. absolute라 로고를 중앙에서 밀지 않는다. */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: 'clamp(12px, 2.2vh, 28px)',
              // 명시 폭. 자연폭(약 321px)보다 넉넉해 넓은 화면에선 한 줄, 좁은 화면(320)에선 90vw로 줄바꿈.
              width: 'min(90vw, 380px)',
              wordBreak: 'keep-all', // 한글이 단어 중간에서 끊기지 않게(몰입형이 몰입/형으로 갈리던 문제)
              fontFamily: typography.family,
              fontSize: typography.body.size,
              fontWeight: 500,
              letterSpacing: '0.1em',
              lineHeight: 1.6,
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            {COVER.sub}
          </div>
        </div>
      </div>
    </div>
  );
}
