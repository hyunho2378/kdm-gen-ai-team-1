// COMPONENTS.md: 판정 문구 4종, judge 800ms 타이밍과 동기, hud 타이포.
// PATTERNS 6절 안무: ease-out 150ms 등장, 유지, 이탈. transform과 opacity만 애니메이션한다.
// 빠르게 반복 트리거되므로 keyframes 대신 transition을 쓴다(MOTION 6절).

import { useEffect, useState } from 'react';
import { colors, typography, motion } from '../../tokens.js';
import { OUTCOME, OWNER } from '../../game/judge.js';

const ENTER_MS = 150;

/** 문구는 4종 고정이다. 여기 없는 문구를 만들지 마라. */
function phrase(result) {
  if (!result) return null;
  switch (result.outcome) {
    case OUTCOME.HIT:
      return result.owner === OWNER.ME
        ? { text: '명중', tone: 'me', sub: '내 득점' }
        : { text: '명중', tone: 'ai', sub: '상대 득점' };
    case OUTCOME.MISS:
      return { text: '헛침', tone: 'dim', sub: result.reason };
    case OUTCOME.PARRY:
      return { text: '가드', tone: 'steel', sub: '리포스트 열림' };
    case OUTCOME.RIPOSTE:
      return { text: '리포스트', tone: 'me', sub: `내 득점 ${result.points}` };
    default:
      return null;
  }
}

const TONE = {
  me: colors.red.light,
  ai: colors.blue.light,
  steel: colors.steel.mid,
  dim: colors.text.dim,
};

export default function JudgeText({ result, active }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active || !result) {
      setShown(false);
      return undefined;
    }
    // 다음 프레임에 켜야 transition이 실제로 돈다
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [active, result]);

  const p = phrase(result);
  if (!p) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        opacity: shown ? 1 : 0,
        transform: shown ? 'scale(1)' : 'scale(0.96)',
        transition: `opacity ${ENTER_MS}ms ${motion.easeOut}, transform ${ENTER_MS}ms ${motion.easeOut}`,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.title.size,
          fontWeight: typography.title.weight,
          letterSpacing: typography.title.tracking,
          lineHeight: typography.title.leading,
          color: TONE[p.tone],
          wordBreak: 'keep-all',
        }}
      >
        {p.text}
      </span>
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          letterSpacing: typography.hud.tracking,
          color: colors.text.dim,
          wordBreak: 'keep-all',
        }}
      >
        {p.sub}
      </span>
    </div>
  );
}
