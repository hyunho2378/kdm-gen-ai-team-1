// 국면 문구. hud 타이포, 대문자 라벨.
// phase 전환은 가끔 일어나므로 표준 애니메이션이 정당하다(MOTION 0절).

import { useEffect, useState } from 'react';
import { colors, typography, motion } from '../../tokens.js';
import { PHASE } from '../../game/machine.js';

const LABEL = {
  [PHASE.EN_GARDE]: 'EN GARDE',
  [PHASE.EXCHANGE]: 'ALLEZ',
  [PHASE.JUDGE]: 'HALTE',
  [PHASE.SCORE]: 'TOUCHE',
};

export default function PhaseBanner({ phase }) {
  const label = LABEL[phase] ?? null;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!label) {
      setShown(false);
      return undefined;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(raf);
      setShown(false);
    };
  }, [label]);

  if (!label) return null;

  return (
    <span
      style={{
        fontFamily: typography.family,
        fontSize: typography.hud.size,
        fontWeight: typography.hud.weight,
        letterSpacing: typography.hud.tracking,
        lineHeight: typography.hud.leading,
        color: colors.text.dim,
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(-4px)',
        transition: `opacity ${motion.duration.page}ms ${motion.easeOut}, transform ${motion.duration.page}ms ${motion.easeOut}`,
      }}
    >
      {label}
    </span>
  );
}
