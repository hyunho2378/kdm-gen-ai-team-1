// 섹션 공용 조각 셋. S2~S5가 같이 쓴다.
// SectionLabel: 라벨의 영문과 한글을 가운데점 없이 red 점과 얇은 선으로 가른다(DESIGN 카피 규칙).
// Badge: 필 배지. filled면 red 채움.
// StepDots: 서브 진행 표시. 활성만 red.

import { colors, typography, motion } from '../tokens.js';

export function SectionLabel({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          background: colors.red,
          boxShadow: `0 0 10px ${colors.redGlow}`,
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: typography.family,
          fontSize: 'clamp(0.68rem, 1vw, 0.84rem)',
          fontWeight: 700,
          letterSpacing: '0.24em',
          color: colors.red,
          whiteSpace: 'nowrap',
        }}
      >
        {label.en}
      </span>
      {label.ko ? (
        <>
          <span
            aria-hidden="true"
            style={{ width: 18, height: 1, background: 'rgba(242,246,255,0.24)', flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: typography.family,
              fontSize: 'clamp(0.68rem, 1vw, 0.84rem)',
              fontWeight: 500,
              letterSpacing: '0.16em',
              color: colors.text.dim,
              whiteSpace: 'nowrap',
            }}
          >
            {label.ko}
          </span>
        </>
      ) : null}
    </div>
  );
}

export function Badge({ text, filled }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: 999,
        fontFamily: typography.family,
        fontSize: 'clamp(0.66rem, 1vw, 0.8rem)',
        fontWeight: 700,
        letterSpacing: '0.2em',
        color: filled ? '#FFFFFF' : colors.text.secondary,
        background: filled ? colors.red : 'rgba(242,246,255,0.06)',
        boxShadow: filled ? `0 0 22px ${colors.redGlow}` : 'inset 0 0 0 1px rgba(242,246,255,0.22)',
      }}
    >
      {text}
    </span>
  );
}

export function StepDots({ count, active }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 'clamp(22px, 3.6vh, 44px)',
        zIndex: 6,
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            width: i === active ? 22 : 8,
            height: 3,
            borderRadius: 999,
            background: i === active ? colors.red : 'rgba(242,246,255,0.22)',
            boxShadow: i === active ? `0 0 10px ${colors.redGlow}` : 'none',
            transition: `width 300ms ${motion.easeOut}, background-color 300ms ease`,
          }}
        />
      ))}
    </div>
  );
}
