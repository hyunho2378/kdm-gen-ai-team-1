// S1 표지. 포스터 문법 + OGL Polyline 커서 궤적. **라이트 반전: 배경 #F6F6F6.**
// 사진(정사각, 인물 중앙)이 화면 하단에 앉고 그 위에 커서 궤적, 위에 시그니처와 서브카피.
//
// **시그니처는 logo_main.svg를 잉크(#101010)로 평평하게 찍는다(질감/섀도우 0).**
// SVG 도형이 흰 채움이라 CSS mask로 알파만 취해 잉크 박스를 그 모양으로 오려낸다.
// 그래서 원본 에셋을 안 건드리고도 정확히 #101010 단색 로고가 된다(기존 VORTEX 텍스트 자리에).
//
// 사진은 인물-온-블랙(정사각)이라 라이트 위에서는 의도된 다크 패널로 읽힌다(contain이라 좌우는 라이트가 통과).
// 시그니처가 그 검은 패널에 겹치면 잉크 로고가 안 보이므로, 패널을 낮춰 상단 라이트 밴드에 로고를 앉힌다.
// (레드 글로우와 screen 합성은 걷었다.)

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { TITLE, COVER } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import VortexLine from '../components/VortexLine.jsx';

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

const CORNER = {
  position: 'absolute',
  top: 'clamp(20px, 3.4vh, 44px)',
  zIndex: 3,
  fontFamily: typography.family,
  fontSize: 'clamp(0.66rem, 0.9vw, 0.82rem)',
  fontWeight: 500,
  letterSpacing: '0.16em',
  lineHeight: 1.6,
  color: colors.text.dim,
  pointerEvents: 'none',
};

export default function S1Cover({ active }) {
  const photoRef = useRef(null);
  const markRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const photo = photoRef.current;
    const mark = markRef.current;
    if (!photo || !mark) return undefined;

    if (reduced) {
      gsap.set([photo, mark], { opacity: 1, y: 0 });
      return undefined;
    }

    // 사진은 페이드만(위치 이동 없음), 워드마크 묶음은 0.3s 지연 페이드업. transform과 opacity만 만진다.
    gsap.set(photo, { opacity: 0 });
    gsap.set(mark, { opacity: 0, yPercent: 8 });
    const tl = gsap.timeline();
    tl.to(photo, { opacity: 1, duration: 1.2, ease: motion.gsapOut });
    tl.to(mark, { opacity: 1, yPercent: 0, duration: 0.9, ease: motion.gsapOut }, 0.3);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 사진. 하단 정렬 contain이라 인물이 잘리지 않고 정사각 비율이 유지된다.
          multiply 합성이라 사진의 검정 배경은 라이트 배경을 통과시키고 어두운 인물만 남는다. */}
      <div
        ref={photoRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '68%',
          zIndex: 1,
        }}
      >
        <AssetImage src="/images/cover/fencer.png" fit="contain" position="center bottom" />
      </div>

      {/* OGL Polyline 커서 궤적. 사진 위, 워드마크 아래(zIndex 3). 선이 텍스트를 가리지 않는다. */}
      <VortexLine active={active} />

      {/* 포스터 좌상단: 팀과 이름. 가운데점 대신 얇은 세로선으로 두 필드를 가른다. */}
      <div style={{ ...CORNER, left: 'clamp(20px, 3.4vw, 56px)', display: 'flex', gap: 10 }}>
        <span style={{ color: colors.text.secondary }}>{COVER.team}</span>
        <span aria-hidden="true" style={{ width: 1, background: colors.line.strong }} />
        <span>{COVER.members}</span>
      </div>

      {/* 포스터 우상단: 행사명 */}
      <div style={{ ...CORNER, right: 'clamp(20px, 3.4vw, 56px)', textAlign: 'right' }}>
        {COVER.event}
      </div>

      {/* 중앙 상단: 메탈릭 워드마크 + 서브카피 한 줄 */}
      <div
        ref={markRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 'clamp(44px, 7vh, 96px)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(10px, 1.8vh, 22px)',
          padding: '0 24px',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        {/* 시그니처. logo_main.svg를 잉크로 평평하게 찍는다(질감/드롭섀도우/그라디언트 0).
            기존 VORTEX 텍스트 자리와 크기에 맞춘 폭. 로고 자체가 워드마크라 aria-label로 텍스트를 준다. */}
        <div
          role="img"
          aria-label={TITLE}
          style={{
            ...LOGO_MASK,
            width: 'clamp(148px, 20vw, 272px)',
            aspectRatio: '250 / 180',
          }}
        />
        <div
          style={{
            position: 'relative',
            fontFamily: typography.family,
            fontSize: 'clamp(0.78rem, 1.5vw, 1.06rem)',
            fontWeight: 500,
            letterSpacing: '0.1em',
            color: colors.text.secondary,
          }}
        >
          {COVER.sub}
        </div>
      </div>
    </div>
  );
}
