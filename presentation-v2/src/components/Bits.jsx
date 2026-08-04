// 섹션 공용 조각 셋. S2~S5가 같이 쓴다.
// SectionLabel: 라벨의 영문과 한글을 가운데점 없이 red 점과 얇은 선으로 가른다(DESIGN 카피 규칙).
// Badge: 필 배지. filled면 red 채움.
// StepDots: 서브 진행 표시. 활성만 red.

import { colors, typography, motion, whiteA } from '../tokens.js';

// 유리 림 라이트. 위쪽이 밝고 아래로 어두워지는 그라디언트를 mask로 뚫어 링만 남긴다.
// **border-image나 두 겹 background-clip 트릭이 아니다.** 링이 반투명이라
// 그 트릭을 쓰면 아래 레이어가 원 전체로 비친다(컨셉 섹션에서 실측으로 확인한 함정).
// 채움은 호출부가 정한다. TARGET은 투명, 디자인 키워드는 뒤가 사진이라 blur를 살짝 건다.
export const GLASS_RING = {
  background: `linear-gradient(160deg, ${whiteA(0.5)}, ${whiteA(0.06)} 55%, ${whiteA(0.18)})`,
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
  pointerEvents: 'none',
};

/** 원 위에 얹는 유리 림 한 겹. inset 0으로 부모를 덮는다. */
export function GlassRim({ width = 1.2 }) {
  return (
    <span
      aria-hidden="true"
      style={{ ...GLASS_RING, position: 'absolute', inset: 0, borderRadius: '50%', padding: width }}
    />
  );
}

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
            style={{ width: 18, height: 1, background: colors.line.strong, flexShrink: 0 }}
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
        color: filled ? colors.text.onFill : colors.text.secondary,
        background: filled ? colors.red : colors.surface.pill,
        boxShadow: filled ? `0 0 22px ${colors.redGlow}` : `inset 0 0 0 1px ${colors.line.strong}`,
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
            background: i === active ? colors.red : colors.line.strong,
            boxShadow: i === active ? `0 0 10px ${colors.redGlow}` : 'none',
            transition: `width 300ms ${motion.easeOut}, background-color 300ms ease`,
          }}
        />
      ))}
    </div>
  );
}
