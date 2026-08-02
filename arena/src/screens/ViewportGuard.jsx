// DESIGN 5절: arena는 최소 1024, 미만은 안내로 차단한다.
// 100vh 금지, 100dvh만(PITFALLS 브라우저별 검증).

import { useEffect, useState } from 'react';
import { colors, spacing, typography, zIndex } from '../tokens.js';

const MIN_WIDTH = 1024;

export default function ViewportGuard({ children }) {
  const [tooNarrow, setTooNarrow] = useState(() => window.innerWidth < MIN_WIDTH);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MIN_WIDTH - 1}px)`);
    const onChange = (e) => setTooNarrow(e.matches);
    setTooNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!tooNarrow) return children;

  return (
    <section
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.toast,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.unit * 2,
        padding: spacing.gutter,
        background: colors.bg.base,
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: typography.family,
          fontSize: typography.heading.size,
          fontWeight: typography.heading.weight,
          letterSpacing: typography.heading.tracking,
          color: colors.text.primary,
          wordBreak: 'keep-all',
        }}
      >
        화면이 좁다
      </h1>
      <p
        style={{
          fontFamily: typography.family,
          fontSize: typography.body.size,
          lineHeight: typography.body.leading,
          color: colors.text.secondary,
          maxWidth: 420,
          wordBreak: 'keep-all',
        }}
      >
        아레나는 가로 {MIN_WIDTH}px 이상에서 동작한다. 노트북 전체 화면으로 열어라.
      </p>
    </section>
  );
}
