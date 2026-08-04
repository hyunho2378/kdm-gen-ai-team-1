// S5 유파(AI DUELIST). 서브 진행 3단계.
// 좌측 1/3에 인물 컷아웃(duelist/style-N.png)을 바닥 정렬로 세운다.
// 유파 전환 시 이전 인물이 opacity와 x(-30px)로 이탈하고 다음 인물이 진입한다.
// 우측: 라벨(red) + 헤드라인 + 유파 이름 배지 + 서술 2줄.
// 배경: 블랙 위 인물 뒤에 저알파 레드 radial 글로우(레드 남용 금지).
//
// 셸 위임 구조는 S2Background(프레임 스크럽)와 같다.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { DUELIST, DUELIST_STYLES } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { SectionLabel, Badge, StepDots } from '../components/Bits.jsx';

const SHIFT = 30; // 인물 이탈/진입 x 거리(px)

export default function S5Duelist({ registerHandler, registerEnter }) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const figureRefs = useRef([]);
  const textRefs = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const apply = (next, instant) => {
      const d = instant || reduced ? 0 : 0.55;
      figureRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === next;
        gsap.to(el, {
          opacity: on ? 1 : 0,
          x: on ? 0 : -SHIFT,
          duration: d,
          ease: motion.gsapOut,
          overwrite: 'auto',
        });
      });
      textRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === next;
        gsap.to(el, {
          opacity: on ? 1 : 0,
          y: on ? 0 : 16,
          duration: d,
          ease: motion.gsapOut,
          overwrite: 'auto',
        });
      });
    };

    const handleStep = (dir) => {
      const next = indexRef.current + dir;
      if (next < 0 || next >= DUELIST_STYLES.length) return false; // 경계 → 셸이 S4/S6로
      indexRef.current = next;
      setIndex(next);
      apply(next, false);
      return true;
    };

    const handleEnter = (dir) => {
      const next = dir > 0 ? 0 : DUELIST_STYLES.length - 1;
      indexRef.current = next;
      setIndex(next);
      apply(next, true);
    };

    apply(indexRef.current, true);
    registerHandler(handleStep);
    registerEnter(handleEnter);

    return () => {
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 인물 뒤 저알파 레드 글로우 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '17%',
          bottom: '-16%',
          width: 'min(78vh, 62vw)',
          height: 'min(78vh, 62vw)',
          transform: 'translateX(-50%)',
          background: `radial-gradient(circle at 50% 50%, rgba(230,13,21,0.15) 0%, rgba(230,13,21,0.05) 38%, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 좌측 1/3 인물 컷아웃. 바닥 정렬. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '34%',
          height: '84%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        {DUELIST_STYLES.map((s, i) => (
          <div
            key={s.key}
            ref={(el) => {
              figureRefs.current[i] = el;
            }}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              willChange: 'transform, opacity',
            }}
          >
            <AssetImage
              src={`/images/duelist/style-${i + 1}.png`}
              fit="contain"
              position="center bottom"
            />
          </div>
        ))}
      </div>

      {/* 우측 텍스트 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 'min(38%, 640px)',
          paddingRight: 'clamp(20px, 5vw, 88px)',
          pointerEvents: 'none',
          textShadow: '0 2px 30px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ width: '100%' }}>
          <SectionLabel label={DUELIST.label} />

          <div style={{ marginTop: 'clamp(12px, 2vh, 24px)' }}>
            {DUELIST.headline.map((line) => (
              <div
                key={line}
                style={{
                  fontFamily: typography.family,
                  fontSize: 'clamp(1.35rem, 3.2vw, 2.6rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.24,
                  color: colors.text.primary,
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {/* 유파별 배지와 서술. 활성 하나만 보인다. 높이는 가장 긴 것에 맞춰 grid로 겹친다. */}
          <div
            style={{
              marginTop: 'clamp(20px, 3.2vh, 40px)',
              display: 'grid',
              gridTemplateAreas: '"stack"',
            }}
          >
            {DUELIST_STYLES.map((s, i) => (
              <div
                key={s.key}
                ref={(el) => {
                  textRefs.current[i] = el;
                }}
                aria-hidden={i !== index}
                style={{
                  gridArea: 'stack',
                  opacity: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 'clamp(10px, 1.6vh, 18px)',
                  willChange: 'transform, opacity',
                }}
              >
                <Badge text={s.badge} filled />
                <div>
                  {s.desc.map((line) => (
                    <div
                      key={line}
                      style={{
                        fontFamily: typography.family,
                        fontSize: 'clamp(0.86rem, 1.5vw, 1.12rem)',
                        fontWeight: 400,
                        lineHeight: 1.75,
                        color: colors.text.secondary,
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StepDots count={DUELIST_STYLES.length} active={index} />
    </div>
  );
}
