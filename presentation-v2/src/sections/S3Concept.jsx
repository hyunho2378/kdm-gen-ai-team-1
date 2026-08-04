// S3 컨셉(CONCEPT).
// 배경: duel.png가 우측 하단 앵커로 은은하게 부상한다(진입 opacity 0→0.9, y 40→0, 1.4s).
//   가장자리는 radial 그라디언트 마스크로 블랙에 녹인다(사각 사진 경계를 지운다).
// 좌측: 라벨 CONCEPT(red) + 대형 워드마크(tokens.typography.displayFamily) + 반투명 레드 글래스 박스.
//
// **기존 S4Concept의 리퀴드글래스 라이브러리를 여기서 쓰지 않는다**(진입 블랙아웃 이슈 미해결).
// CSS 글래스로 간다. 이건 정보 박스이므로 "흉내 금지" 원칙 적용 대상이 아니다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { CONCEPT, CONCEPT_NAME } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { SectionLabel } from '../components/Bits.jsx';

// 사각 사진 경계를 지우는 마스크. 중앙은 불투명, 가장자리로 갈수록 투명 → 블랙에 녹는다.
const EDGE_MASK =
  'radial-gradient(ellipse at 62% 62%, #000 0%, #000 36%, rgba(0,0,0,0.72) 58%, rgba(0,0,0,0.24) 78%, transparent 92%)';

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
      gsap.set(photo, { opacity: 0.9, y: 0 });
      gsap.set(left, { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(photo, { opacity: 0, y: 40 });
    gsap.set(left, { opacity: 0, y: 24 });
    const tl = gsap.timeline();
    tl.to(photo, { opacity: 0.9, y: 0, duration: 1.4, ease: motion.gsapOut });
    tl.to(left, { opacity: 1, y: 0, duration: 0.9, ease: motion.gsapOut }, 0.2);

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 배경 사진. 우측 하단 앵커. */}
      <div
        ref={photoRef}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 'min(74vw, 1180px)',
          height: 'min(92vh, 1000px)',
          zIndex: 1,
          opacity: 0,
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
          willChange: 'transform, opacity',
        }}
      >
        <AssetImage src="/images/concept/duel.png" fit="cover" position="center right" />
      </div>

      {/* 사진 뒤 저알파 레드 글로우. 레드 남용 금지라 알파를 낮게 유지한다. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '2%',
          bottom: '-10%',
          width: 'min(70vw, 900px)',
          height: 'min(70vh, 900px)',
          background: `radial-gradient(circle at 50% 50%, rgba(230,13,21,0.14) 0%, rgba(230,13,21,0.045) 40%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 좌측 콘텐츠. 중앙 정렬은 flex가 잡는다.
          안쪽 div의 transform은 GSAP 전용이다(인라인 transform과 겹치면 GSAP이 덮어쓴다). */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 'clamp(20px, 5vw, 88px)',
          pointerEvents: 'none',
        }}
      >
      <div
        ref={leftRef}
        style={{
          width: 'min(58vw, 680px)',
          opacity: 0,
          willChange: 'transform, opacity',
          textShadow: '0 2px 30px rgba(0,0,0,0.85)',
        }}
      >
        <SectionLabel label={{ en: CONCEPT.label }} />

        <div
          style={{
            marginTop: 'clamp(14px, 2.2vh, 26px)',
            // 제목 폰트 미정. displayFamily 한 키만 바꾸면 S1 워드마크와 함께 교체된다.
            fontFamily: typography.displayFamily,
            fontSize: 'clamp(3rem, 8.5vw, 7.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.94,
            color: colors.text.primary,
            backgroundImage: colors.silver.gradient,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.9)) drop-shadow(0 10px 24px rgba(0,0,0,0.55))',
          }}
        >
          {CONCEPT_NAME}
        </div>

        {/* 반투명 레드 글래스 박스. 좌측만 큰 라운드의 비대칭 형태. */}
        <div
          style={{
            marginTop: 'clamp(20px, 3vh, 38px)',
            padding: 'clamp(18px, 2.6vh, 30px) clamp(22px, 3vw, 38px)',
            background: 'rgba(230, 13, 21, 0.10)',
            backdropFilter: 'blur(18px) saturate(1.25)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
            border: `1px solid rgba(230, 13, 21, 0.42)`,
            // 좌측만 크게 굴린 비대칭. 우측은 각을 살린다.
            borderRadius: '48px 8px 8px 48px',
            boxShadow: `0 0 40px rgba(230,13,21,0.14), inset 0 1px 0 rgba(255,255,255,0.10)`,
          }}
        >
          {CONCEPT.desc.map((line) => (
            <div
              key={line}
              style={{
                fontFamily: typography.family,
                fontSize: 'clamp(0.92rem, 1.6vw, 1.24rem)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                lineHeight: 1.72,
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
