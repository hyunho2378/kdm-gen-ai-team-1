// 브랜드 네이밍. 원본 레이아웃은 `Slide 16_9 - 30.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼았다.
//
// 원본 실측(1920 기준, SVG에서 직접 뽑은 값):
//   좌상단 라벨 2줄  x 60  y 78('Brand Naming') / y 123('브랜드 네이밍')
//   우측 헤드라인 x 400 y 126, 서브 y 173
//   중앙 대형 워드마크 VORTEX. **원본은 굵지 않다.** 얇은 획의 대문자다
//   하단 사진 2컷  각 960x492, y 588부터 화면 바닥까지 풀블리드(좌우 절반)
// 사진은 원본에 base64로 박혀 있으나 **라이선스 미확인 시안이라 임베드하지 않는다.**
// 실제 파일이 없으면 AssetImage가 다크 플레이스홀더로 내려앉는다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { NAMING, TITLE } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow } from '../components/Bits.jsx';

// S1 표지와 같은 메탈릭 실버 그라디언트. 워드마크의 재질을 한 곳으로 맞춘다.
const METAL =
  'linear-gradient(180deg, #FFFFFF 0%, #EAF1F9 20%, #C3CDDA 44%, #8A96A8 63%, #6E7B92 80%, #AAB6C6 100%)';
const METAL_FILTER =
  'drop-shadow(0 -1px 0.5px rgba(255,255,255,0.38)) drop-shadow(0 2px 1px rgba(16,16,16,0.9)) drop-shadow(0 10px 24px rgba(16,16,16,0.55))';

export default function S5Naming({ active }) {
  const headRef = useRef(null);
  const markRef = useRef(null);
  const shotsRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    const mark = markRef.current;
    const shots = shotsRef.current;
    if (!head || !mark || !shots) return undefined;

    if (reduced) {
      gsap.set([head, mark, shots], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(head, { opacity: 0, y: 16 });
    gsap.set(mark, { opacity: 0, y: 30 });
    gsap.set(shots, { opacity: 0, y: 26 });
    const tl = gsap.timeline();
    tl.to(head, { opacity: 1, y: 0, duration: 0.75, ease: motion.gsapOut });
    tl.to(mark, { opacity: 1, y: 0, duration: 1.1, ease: motion.gsapOut }, 0.22);
    tl.to(shots, { opacity: 1, y: 0, duration: 0.9, ease: motion.gsapOut }, 0.42);

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 워드마크 뒤 저알파 레드 글로우 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '37%',
          width: 'min(120vh, 96vw)',
          height: 'min(120vh, 96vw)',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 50% 50%, rgba(230,13,21,0.12) 0%, rgba(230,13,21,0.04) 36%, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 상단: 좌측 라벨 2줄 + 우측 헤드라인과 서브 */}
      <div
        ref={headRef}
        style={{
          position: 'absolute',
          left: 'clamp(16px, 3.13vw, 76px)',
          right: 'clamp(16px, 3.13vw, 76px)',
          top: 'clamp(28px, 7.2vh, 78px)',
          zIndex: 4,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'clamp(16px, 4vw, 96px)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ flex: '0 0 auto' }}>
          <Eyebrow en={NAMING.label.en} ko={NAMING.label.ko} />
        </div>

        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: 'clamp(0.92rem, 1.35vw, 1.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.5,
              color: colors.text.primary,
            }}
          >
            {NAMING.headline}
          </h2>
          <p
            style={{
              margin: 'clamp(6px, 1vh, 12px) 0 0',
              fontFamily: typography.family,
              fontSize: 'clamp(0.72rem, 1.04vw, 1.16rem)',
              fontWeight: 400,
              lineHeight: 1.65,
              color: colors.text.secondary,
            }}
          >
            {NAMING.sub}
          </p>
        </div>
      </div>

      {/* 중앙 대형 워드마크. 원본은 얇은 획이라 weight를 낮게 잡는다. */}
      <div
        ref={markRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '37%',
          transform: 'translateY(-50%)',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 clamp(16px, 4vw, 80px)',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
      >
        <div
          style={{
            // 제목 폰트 미정. tokens.typography.displayFamily 한 키만 바꾸면 S1과 함께 교체된다.
            fontFamily: typography.displayFamily,
            fontSize: 'clamp(2.6rem, 9.5vw, 8.6rem)',
            fontWeight: 300,
            letterSpacing: '0.01em',
            lineHeight: 1,
            backgroundImage: METAL,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            filter: METAL_FILTER,
          }}
        >
          {TITLE}
        </div>
      </div>

      {/* 하단 사진 2컷. 원본은 y 588부터 바닥까지 풀블리드 좌우 절반(45.6vh). */}
      <div
        ref={shotsRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '45.6%',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          willChange: 'transform, opacity',
        }}
      >
        {NAMING.shots.map((src) => (
          <div key={src} style={{ position: 'relative', overflow: 'hidden', background: colors.deep }}>
            <AssetImage src={src} fit="cover" />
            {/* 위쪽 블랙 영역과 사진 사이 경계를 죽인다. 상단만 얕게 페이드. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, ${colors.black} 0%, rgba(16,16,16,0.55) 5%, transparent 16%)`,
                pointerEvents: 'none',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
