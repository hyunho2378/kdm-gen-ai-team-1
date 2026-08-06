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
 * 전 섹션 공용 아이브로우 v2 (DESIGN 4절, BRAND_REBOOT_PLAN 2.2). **개별 하드코딩 아이브로우를 두지 않는다.**
 *
 * **불릿 원(레드 점)을 없앴다.** 원이 지던 존재감을 크기가 대신 진다.
 * 영문 위 국문 아래 스택은 유지한다. 국문이 없으면 단일 라벨로 뜬다.
 *
 * **크기와 굵기는 tokens.eyebrow가 쥔다(21px 700 고정, brand와 정합).**
 * 700인 것은 취향이 아니라 대비 요건이다. red 아이브로우가 4.02:1이라 21px가 대형(굵기 700)으로
 * 인정돼야 기준 3.0으로 통과한다. 굵기를 낮추거나 크기를 줄이면 그 순간 미달로 돌아간다.
 *
 * 색은 pres-v2 기존을 유지한다. 영문 tone(기본 red), 국문 primary. 둘 다 같은 크기와 굵기다.
 *
 * @param {string} en 영문 라벨(필수)
 * @param {string} [ko] 국문 라벨. 없으면 단일 라벨
 * @param {string} [tone] 영문 라벨 색. 기본 red
 */
export function Eyebrow({ en, ko, tone = colors.red }) {
  const base = {
    fontFamily: typography.family,
    fontSize: typography.eyebrow.size,
    fontWeight: typography.eyebrow.weight,
    letterSpacing: typography.eyebrow.tracking,
    lineHeight: typography.eyebrow.leading,
    whiteSpace: 'nowrap',
  };
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ ...base, color: tone }}>{en}</span>
      {ko ? <span style={{ ...base, color: colors.text.primary }}>{ko}</span> : null}
    </span>
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
