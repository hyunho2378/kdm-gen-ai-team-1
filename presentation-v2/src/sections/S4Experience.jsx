// S4 인터랙션(EXPERIENCE). 서브 진행 4단계. 핵심 인터랙션 4종을 한 장에 하나씩.
// 중앙 큰 카드 하나가 활성이고 방향키로 1→4 전환한다. 전환은 현재 카드가 opacity와 x로 이탈하고
// 다음 카드가 반대편에서 진입한다(0.6s). 4번째에서 아래 → 섹션 이탈. 역방향 대칭.
//
// 셸 위임 구조는 S2Background(프레임 스크럽)와 같다.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Activity, Shield, Swords, Eye } from 'lucide-react';
import { colors, typography, motion } from '../tokens.js';
import { EXPERIENCE, INTERACTIONS } from '../copy.js';
import { SectionLabel, StepDots } from '../components/Bits.jsx';

// copy.js가 아이콘을 이름으로 지정한다. 이름 → 컴포넌트 매핑은 여기 한 곳.
const ICONS = { Activity, Shield, Swords, Eye };

const SHIFT = 64; // 카드 진입/이탈 x 거리(px)

export default function S4Experience({ registerHandler, registerEnter }) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const cardRefs = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 활성 카드만 보이고 나머지는 진행 방향 쪽으로 비켜 둔다. transform과 opacity만 만진다.
    const apply = (next, dir, instant) => {
      const d = instant || reduced ? 0 : 0.6;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        if (i === next) {
          gsap.fromTo(
            el,
            instant || reduced ? {} : { opacity: 0, x: dir >= 0 ? SHIFT : -SHIFT },
            { opacity: 1, x: 0, duration: d, ease: motion.gsapOut, overwrite: 'auto' }
          );
        } else {
          gsap.to(el, {
            opacity: 0,
            x: i < next ? -SHIFT : SHIFT,
            duration: d,
            ease: motion.gsapOut,
            overwrite: 'auto',
          });
        }
      });
    };

    const handleStep = (dir) => {
      const next = indexRef.current + dir;
      if (next < 0 || next >= INTERACTIONS.length) return false; // 경계 → 셸이 S3/S5로
      indexRef.current = next;
      setIndex(next);
      apply(next, dir, false);
      return true;
    };

    const handleEnter = (dir) => {
      const next = dir > 0 ? 0 : INTERACTIONS.length - 1;
      indexRef.current = next;
      setIndex(next);
      apply(next, dir, true);
    };

    apply(indexRef.current, 1, true);
    registerHandler(handleStep);
    registerEnter(handleEnter);

    return () => {
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 중앙 저알파 레드 글로우. 카드를 받치는 정도로만. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '52%',
          width: 'min(120vh, 110vw)',
          height: 'min(120vh, 110vw)',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 50% 50%, rgba(230,13,21,0.10) 0%, rgba(230,13,21,0.032) 40%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 상단 좌측 라벨 */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(20px, 5vw, 72px)',
          top: 'clamp(48px, 9vh, 110px)',
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        <SectionLabel label={EXPERIENCE.label} />
      </div>

      {/* 카드 스택. 활성 하나만 보인다. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
        }}
      >
        {INTERACTIONS.map((it, i) => {
          const Icon = ICONS[it.icon];
          return (
            <div
              key={it.key}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              aria-hidden={i !== index}
              style={{
                position: 'absolute',
                width: 'min(86vw, 720px)',
                opacity: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 'clamp(14px, 2.4vh, 28px)',
                padding: 'clamp(28px, 4.6vh, 56px) clamp(24px, 4vw, 56px)',
                background: colors.surface.glass,
                border: `1px solid ${colors.line.default}`,
                borderRadius: 20,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                willChange: 'transform, opacity',
              }}
            >
              {/* 상단 원형 아이콘. red 원 배경. */}
              <span
                aria-hidden="true"
                style={{
                  width: 'clamp(56px, 7vh, 76px)',
                  height: 'clamp(56px, 7vh, 76px)',
                  borderRadius: '50%',
                  background: colors.red,
                  boxShadow: `0 0 32px ${colors.redGlow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {Icon ? <Icon size={30} strokeWidth={1.7} color={colors.text.onFill} /> : null}
              </span>

              <div
                style={{
                  fontFamily: typography.family,
                  fontSize: 'clamp(1.5rem, 3.6vw, 2.7rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.14,
                  color: colors.text.primary,
                }}
              >
                {it.name}
              </div>

              <div>
                {it.desc.map((line) => (
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
          );
        })}
      </div>

      {/* 하단 진행 도트 4개. 활성만 red. */}
      <StepDots count={INTERACTIONS.length} active={index} />
    </div>
  );
}
