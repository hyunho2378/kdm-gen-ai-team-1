// COMPONENTS.md: 내 점수 좌 red.light, AI 우 blue.light, 소유자 텍스트 라벨 병기.
// 숫자는 트윈 없이 즉시 반영(PATTERNS 5절). 색 단독 구분 금지라 라벨을 항상 함께 낸다.
//
// 통합 모드(MIXED)는 라운드마다 상대 라벨이 "MIXED 세이버 스타일"처럼 바뀐다.
// 전환 순간 라벨에 짧은 블루 글로우를 얹는다(FUI 문법). 라벨이 안 바뀌는 단일 유파에서는
// 글로우가 절대 뜨지 않는다. 글로우는 모션이라 reduced에서는 끈다(이름은 즉시 바뀐다).

import { useEffect, useRef, useState } from 'react';
import { colors, motion, typography } from '../../tokens.js';
import { RULES } from '../../game/judge.js';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Side({ label, value, color, align, flash = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align, gap: 2 }}>
      <span
        style={{
          color: flash ? colors.blue.light : colors.text.dim,
          fontSize: typography.caption.size,
          letterSpacing: typography.hud.tracking,
          wordBreak: 'keep-all',
          textShadow: flash ? `0 0 10px ${colors.blue.light}` : 'none',
          transition: `color 320ms ${motion.easeOut}, text-shadow 320ms ${motion.easeOut}`,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color,
          fontSize: typography.title.size,
          fontWeight: typography.title.weight,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ScoreBoard({ score, schoolName }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(schoolName);
  const reduced = useRef(prefersReducedMotion()).current;
  useEffect(() => {
    if (prev.current === schoolName) return;
    prev.current = schoolName;
    if (reduced) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 520);
    return () => clearTimeout(t);
  }, [schoolName, reduced]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        fontFamily: typography.family,
      }}
    >
      <Side label="나" value={score.me} color={colors.red.light} align="flex-end" />
      <span style={{ color: colors.text.dim, fontSize: typography.caption.size }}>{RULES.MATCH_POINT}점 선취</span>
      <Side label={schoolName} value={score.ai} color={colors.blue.light} align="flex-start" flash={flash} />
    </div>
  );
}
