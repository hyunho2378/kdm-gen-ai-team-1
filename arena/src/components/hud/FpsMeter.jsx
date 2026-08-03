// 책임: 성능 미터. 발표 노트북에서 주소 뒤에 ?fps=1만 붙이면 뜬다.
//
// 헤드리스 소프트웨어 렌더링의 fps는 무효라 최종 성능 게이트가 사용자의 실기 확인이다.
// 그 확인을 dev 빌드 없이 할 수 있어야 게이트가 성립하므로 프로덕션 번들에도 들어간다.
// 상시 노출 요소라 애니메이션하지 않는다(MOTION 0절). 갱신은 초당 두 번이고 프레임 경로가 아니다.

import { useEffect, useState } from 'react';
import { colors, motion, radius, typography, zIndex } from '../../tokens.js';
import { frameInset, useViewport } from './frame.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const MIN_FPS = motion.budget.minFps;

export default function FpsMeter({ perf, rendererRef }) {
  const { w } = useViewport();
  const [v, setV] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setV({ ...perf.read(), info: rendererRef.current?.getInfo?.() ?? null });
    }, 500);
    return () => clearInterval(id);
  }, [perf, rendererRef]);

  if (!v) return null;

  const inset = frameInset(w);
  const low = v.fps < MIN_FPS;
  const cell = { color: colors.text.dim };
  const num = { color: low ? colors.red.light : colors.text.primary, fontVariantNumeric: 'tabular-nums' };

  return (
    <div
      style={{
        position: 'fixed',
        right: inset,
        bottom: inset,
        zIndex: zIndex.overlay,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2,
        padding: '6px 10px',
        borderRadius: radius.sm,
        background: colors.bg.overlay,
        border: `1px solid ${colors.line.default}`,
        fontFamily: MONO,
        fontSize: typography.caption.size,
        lineHeight: 1.35,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={cell}>
          현재 <span style={num}>{Math.round(v.fps)}</span>
        </span>
        <span style={cell}>
          60초 평균 <span style={num}>{Math.round(v.avg)}</span>
        </span>
        <span style={cell}>
          최저 <span style={num}>{Math.round(v.low)}</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, color: colors.text.dim }}>
        <span>cpu {v.cpuMs.toFixed(1)}ms</span>
        {v.info ? <span>draw {v.info.draws}</span> : null}
        {v.info ? <span>tex {v.info.textures}</span> : null}
        {v.info ? <span>seg {v.info.segments}</span> : null}
      </div>
    </div>
  );
}
