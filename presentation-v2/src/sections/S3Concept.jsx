// S3 컨셉. 원본 레이아웃은 `Slide 16_9 - 4.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼았고,
// 좌표와 그라디언트 스톱은 SVG에서 직접 뽑았다. 기억으로 지어낸 값이 아니다.
//
// 원본 실측(1920 기준):
//   사진        rect x 556.8  y 77  w 1510.2  h 1005.2  → 우측과 하단으로 흘러 나간다
//   사진 오버레이 rect x 724  w 1058  h 1080, 그라디언트 x1 1782 → x2 651.674(우 → 좌)
//                stop 0 알파 0.1 / offset 0.6875 알파 0.822596 / offset 1 알파 1
//                즉 **오른쪽은 거의 투명하고 왼쪽으로 갈수록 새까매진다.** 이게 이음매를 덮는 장치다
//   인용        x 102.4  y(baseline) 446.098  size 27
//   구분선      rect x 102.4  y 496.6  w 498.6  h 0  stroke 그라디언트
//                #B3122C 알파 1(좌) → #B3122C 알파 0.1(우). **오른쪽으로 사라지는 선**
//   글래스 박스  rect x 103.15  y 596.55  w 1039.79  h 175.7  **rx 87.85 = h/2 이므로 완전한 필**
//                fill 그라디언트(알파 1 → 0.2)에 fill-opacity 0.3, stroke 그라디언트(알파 1 → 0.1) 1.5px
//   본문        size 30, 2줄
// 원본 레드는 #B3122C지만 브랜드 확정색 tokens.red(#E60D15)로 바꿔 쓴다.
//
// 이전 판의 결함: 사진에 radial 마스크만 걸어 좌측에 하드한 사각 경계가 남았다(실측).
// 원본은 마스크가 아니라 **좌→우 블랙 오버레이**로 덮는다. 그 구조를 그대로 가져오고
// 사진 자체에도 좌측과 상하 페더링 마스크를 더해 두 겹으로 녹인다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { CONCEPT, CONCEPT_NAME } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow } from '../components/Bits.jsx';

// 사진 자체의 페더링. 좌측을 55%부터 흐리고(지시), 상하 가장자리도 함께 녹인다.
// 두 층을 intersect로 곱해 네 방향이 한 번에 정리된다.
const PHOTO_MASK =
  'linear-gradient(to left, #000 55%, transparent 100%), ' +
  'linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)';

// 사진 위 좌→우 블랙 오버레이. 원본 그라디언트 스톱을 1920 기준 퍼센트로 환산했다.
//   x 651.674 → 33.94%(알파 1) / x 1004.8 → 52.33%(알파 0.8226) / x 1782 → 92.81%(알파 0.1)
const PHOTO_SCRIM =
  'linear-gradient(to right,' +
  ' #101010 0%,' +
  ' #101010 33.94%,' +
  ' rgba(16,16,16,0.823) 52.33%,' +
  ' rgba(16,16,16,0.1) 92.81%,' +
  ' rgba(16,16,16,0.08) 100%)';

export default function S3Concept({ active }) {
  const photoRef = useRef(null);
  const leftRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const photo = photoRef.current;
    const left = leftRef.current;
    if (!photo || !left) return undefined;

    if (reduced) {
      gsap.set(photo, { opacity: 1, y: 0 });
      gsap.set(left, { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(photo, { opacity: 0, y: 34 });
    gsap.set(left, { opacity: 0, y: 24 });
    const tl = gsap.timeline();
    tl.to(photo, { opacity: 1, y: 0, duration: 1.4, ease: motion.gsapOut });
    tl.to(left, { opacity: 1, y: 0, duration: 0.9, ease: motion.gsapOut }, 0.2);

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 사진. 원본처럼 우측과 하단으로 흘려보낸다(x 556.8 → 29%, y 77 → 7.1%). */}
      <div
        ref={photoRef}
        style={{
          position: 'absolute',
          left: '29%',
          top: '7.1%',
          right: '-7.7%',
          bottom: '-0.2%',
          zIndex: 1,
          opacity: 0,
          maskImage: PHOTO_MASK,
          WebkitMaskImage: PHOTO_MASK,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
          willChange: 'transform, opacity',
        }}
      >
        <AssetImage src="/images/concept/duel.png" fit="cover" position="center right" />
      </div>

      {/* 사진 위 좌→우 블랙 오버레이. 좌측 텍스트 가독을 이 층이 책임진다. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: PHOTO_SCRIM,
          pointerEvents: 'none',
        }}
      />

      {/* 사진 뒤 저알파 레드 글로우. 레드 남용 금지라 알파를 낮게 유지한다. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '2%',
          bottom: '-10%',
          width: 'min(70vw, 900px)',
          height: 'min(70vh, 900px)',
          zIndex: 3,
          mixBlendMode: 'screen',
          background: `radial-gradient(circle at 50% 50%, rgba(230,13,21,0.12) 0%, rgba(230,13,21,0.04) 40%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 좌측 콘텐츠. 원본 좌측 여백 x 102.4 → 5.33vw.
          중앙 정렬은 flex가 잡는다. 안쪽 div의 transform은 GSAP 전용이다
          (인라인 transform과 겹치면 GSAP이 px로 분해해 덮어쓴다). */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 'clamp(20px, 5.33vw, 130px)',
          paddingRight: 'clamp(16px, 4vw, 90px)',
          pointerEvents: 'none',
        }}
      >
        <div
          ref={leftRef}
          style={{
            width: 'min(62vw, 1050px)',
            opacity: 0,
            willChange: 'transform, opacity',
            textShadow: '0 2px 26px rgba(16,16,16,0.9)',
          }}
        >
          {/* 1. CONCEPT */}
          <Eyebrow en={CONCEPT.label} />

          {/* 2. VORTEX 워드마크(메탈릭). 원본은 얇은 획이라 weight를 낮게 잡는다. */}
          <div
            style={{
              marginTop: 'clamp(10px, 1.8vh, 22px)',
              // 제목 폰트 미정. displayFamily 한 키만 바꾸면 S1 워드마크와 함께 교체된다.
              fontFamily: typography.displayFamily,
              fontSize: 'clamp(2.6rem, 7.3vw, 6.6rem)',
              fontWeight: 300,
              letterSpacing: '0.005em',
              lineHeight: 1,
              backgroundImage: colors.silver.gradient,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              filter:
                'drop-shadow(0 -1px 0.5px rgba(255,255,255,0.34)) drop-shadow(0 2px 1px rgba(16,16,16,0.9)) drop-shadow(0 10px 24px rgba(16,16,16,0.55))',
            }}
          >
            {CONCEPT_NAME}
          </div>

          {/* 3. 인용. 원본 size 27 → 1.41vw */}
          <div
            style={{
              marginTop: 'clamp(12px, 2.2vh, 28px)',
              fontFamily: typography.family,
              fontSize: 'clamp(0.82rem, 1.41vw, 1.55rem)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              lineHeight: 1.5,
              color: colors.text.secondary,
            }}
          >
            {CONCEPT.quote}
          </div>

          {/* 4. 가로 구분선. 원본 w 498.6 → 25.97vw, 오른쪽으로 사라진다.
              두께도 오른쪽으로 얇아지게 해 검끝 모티프를 살린다(원본은 알파만 뺀다). */}
          <div
            aria-hidden="true"
            style={{
              marginTop: 'clamp(14px, 2.6vh, 32px)',
              width: 'min(25.97vw, 640px)',
              height: 2,
              background: `linear-gradient(to right, ${colors.red} 0%, rgba(230,13,21,0.1) 100%)`,
              // 오른쪽 끝으로 갈수록 두께가 0에 수렴한다. 검끝처럼 뾰족해진다.
              clipPath: 'polygon(0 0, 100% 45%, 100% 55%, 0 100%)',
            }}
          />

          {/* 5. 반투명 레드 글래스 박스. 원본은 rx = h/2 인 완전한 필이다.
              **보더 그라디언트에 두 겹 background-clip 트릭을 쓰면 안 된다.** 채움이 반투명이라
              아래 깔린 솔리드 레드가 박스 전체로 비친다(실측: 좌측이 208,13,20으로 원본 54,11,18보다 뜨거웠다).
              링은 별도 레이어에 마스크로 그린다. */}
          <div
            style={{
              position: 'relative',
              marginTop: 'clamp(16px, 3vh, 36px)',
              width: 'min(54.15vw, 1080px)',
              padding: 'clamp(16px, 3.2vh, 34px) clamp(24px, 3.6vw, 62px)',
              borderRadius: 999,
              // 원본: fill 그라디언트(알파 1 → 0.2)에 fill-opacity 0.3 → 유효 0.30 → 0.06
              background: 'linear-gradient(to right, rgba(230,13,21,0.30) 0%, rgba(230,13,21,0.06) 100%)',
              backdropFilter: 'blur(16px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
              boxShadow: '0 0 44px rgba(230,13,21,0.10)',
            }}
          >
            {/* 링 전용 레이어. 원본 stroke 1.5px, 알파 1 → 0.1. 마스크로 테두리만 남긴다. */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                padding: 1.5,
                background: `linear-gradient(to right, ${colors.red} 0%, rgba(230,13,21,0.1) 100%)`,
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                maskComposite: 'exclude',
                pointerEvents: 'none',
              }}
            />
            {CONCEPT.body.map((line) => (
              <div
                key={line}
                style={{
                  fontFamily: typography.family,
                  fontSize: 'clamp(0.78rem, 1.56vw, 1.7rem)',
                  fontWeight: 500,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.75,
                  color: colors.text.primary,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
