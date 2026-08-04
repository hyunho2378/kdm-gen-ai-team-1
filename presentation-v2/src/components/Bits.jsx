// 섹션 공용 조각. 전 섹션이 같이 쓴다.
// Eyebrow: 전 섹션 공용 아이브로우. 레드 원 + 영문/국문 스택. 개별 하드코딩 금지.
// Badge: 필 배지. filled면 red 채움.
// StepDots: 서브 진행 표시. 활성만 red.
// GlassRim: 유리 림 보더.

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

/**
 * 전 섹션 공용 아이브로우. **개별 하드코딩 아이브로우를 두지 않는다.**
 *
 * 구조: 왼쪽에 작은 레드 원 하나 + 라벨 스택(영문 위 작게, 국문 아래).
 * 국문이 없으면 단일 라벨로 뜬다. weight는 전부 600으로 통일한다.
 *
 * 예전에는 영문과 국문을 얇은 가로선으로 갈라 한 줄에 늘어놨다.
 * 그 구분선을 없애고 스택으로 바꾼 것이 이번 통일이다(가운데점을 안 쓰기 위한 장치였는데
 * 스택이면 구분자 자체가 필요 없다).
 *
 * @param {string} en 영문 라벨(필수)
 * @param {string} [ko] 국문 라벨. 없으면 단일 라벨
 * @param {string} [tone] 영문 라벨 색. 기본 red
 */
export function Eyebrow({ en, ko, tone = colors.red }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      {/* 원은 영문 라인의 baseline에 맞춘다. em 기준이라 폰트가 커져도 따라간다. */}
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          marginTop: '0.44em',
          background: colors.red,
          boxShadow: `0 0 10px ${colors.redGlow}`,
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3px, 0.5vh, 7px)' }}>
        <span
          style={{
            fontFamily: typography.family,
            fontSize: 'clamp(0.66rem, 0.94vw, 0.9rem)',
            fontWeight: 600,
            letterSpacing: '0.18em',
            lineHeight: 1.1,
            color: tone,
            whiteSpace: 'nowrap',
          }}
        >
          {en}
        </span>
        {ko ? (
          <span
            style={{
              fontFamily: typography.family,
              fontSize: 'clamp(0.8rem, 1.25vw, 1.38rem)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              color: colors.text.primary,
              whiteSpace: 'nowrap',
            }}
          >
            {ko}
          </span>
        ) : null}
      </span>
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
