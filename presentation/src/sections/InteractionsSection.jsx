// IA 2절 5번: 인터랙션 4종을 pin 스크롤 스텝으로.
// 좌 텍스트 고정, 우 비주얼이 스텝마다 크로스페이드 전환(ease-in-out, 화면 내 전환).
// reduced motion에서는 pin을 걸지 않고 세로로 나열한다(전정기관 자극 회피).

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll.js';
import { isReduced } from '../lib/motionMode.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { colors, spacing, typography, breakpoints, motion } from '../tokens.js';
import { INTERACTIONS } from '../content/sections.js';
import Reveal from '../components/Reveal.jsx';
import {
  BladeTrackingDiagram,
  DistanceGaugeDiagram,
  FeintBranchDiagram,
  TimeDilationDiagram,
} from '../components/diagrams/Diagrams.jsx';

const VISUALS = {
  blade: BladeTrackingDiagram,
  footwork: DistanceGaugeDiagram,
  feint: FeintBranchDiagram,
  dilation: TimeDilationDiagram,
};

function StepText({ item, index, active, stacked }) {
  return (
    <div
      style={{
        opacity: stacked ? 1 : active ? 1 : 0.32,
        transition: stacked ? 'none' : `opacity ${motion.duration.dropdown}ms ${motion.easeInOut}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit,
      }}
    >
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.hud.size,
          fontWeight: typography.hud.weight,
          letterSpacing: typography.hud.tracking,
          color: active || stacked ? colors.red.light : colors.text.dim,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <h3
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.heading.size,
          fontWeight: typography.heading.weight,
          letterSpacing: typography.heading.tracking,
          lineHeight: typography.heading.leading,
          color: colors.text.primary,
          wordBreak: 'keep-all',
        }}
      >
        {item.name}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.body.size,
          lineHeight: typography.body.leading,
          color: colors.text.secondary,
          maxWidth: '46ch',
          wordBreak: 'keep-all',
        }}
      >
        {item.body}
      </p>
    </div>
  );
}

export default function InteractionsSection() {
  const wrapRef = useRef(null);
  const [step, setStep] = useState(0);
  const wide = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  // pin은 넓은 화면과 평상시 모션에서만. 좁은 화면은 어차피 세로 나열이 읽기 좋다.
  const pinned = wide && !isReduced();

  useEffect(() => {
    if (!pinned) {
      setStep(0);
      return undefined;
    }
    const el = wrapRef.current;
    if (!el) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${window.innerHeight * INTERACTIONS.length}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const i = Math.min(
          INTERACTIONS.length - 1,
          Math.floor(self.progress * INTERACTIONS.length)
        );
        setStep(i);
      },
    });
    return () => trigger.kill();
  }, [pinned]);

  if (!pinned) {
    // 폴백: 일반 세로 나열. 스텝마다 등장만 붙인다.
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.section, marginTop: spacing.unit * 5 }}>
        {INTERACTIONS.map((item, i) => {
          const Visual = VISUALS[item.key];
          return (
            <Reveal key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 3 }}>
              <StepText item={item} index={i} active stacked />
              <div style={{ maxWidth: 520 }}>
                <Visual />
              </div>
            </Reveal>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      style={{
        marginTop: spacing.unit * 5,
        minHeight: '70dvh',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)',
        gap: spacing.gutter,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 4 }}>
        {INTERACTIONS.map((item, i) => (
          <StepText key={item.key} item={item} index={i} active={i === step} stacked={false} />
        ))}
      </div>

      {/* 우 비주얼. 스텝 전환은 크로스페이드다. key 교체로 리마운트하지 않는다 */}
      <div style={{ position: 'relative', minHeight: 300 }}>
        {INTERACTIONS.map((item, i) => {
          const V = VISUALS[item.key];
          return (
            <div
              key={item.key}
              aria-hidden={i !== step}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                opacity: i === step ? 1 : 0,
                transition: `opacity ${motion.duration.dropdown}ms ${motion.easeInOut}`,
                pointerEvents: i === step ? 'auto' : 'none',
              }}
            >
              <V />
            </div>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {INTERACTIONS[step].name}
      </span>
    </div>
  );
}
