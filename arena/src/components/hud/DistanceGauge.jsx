// COMPONENTS.md: d 0~100 바, 유효 범위 밴드 red.light 표시, 헛침 사유 슬롯.
// d는 프레임마다 변하므로 React state로 올리지 않는다. rAF로 DOM을 직접 갱신한다.
// 마커는 transform만 움직인다(MOTION 11절). 트윈 없이 즉시 반영(PATTERNS 5절).

import { useEffect, useRef } from 'react';
import { colors, radius, typography } from '../../tokens.js';
import { RULES } from '../../game/judge.js';

const BAND_LEFT = (RULES.VALID_MIN / RULES.D_MAX) * 100;
const BAND_WIDTH = ((RULES.VALID_MAX - RULES.VALID_MIN) / RULES.D_MAX) * 100;

export default function DistanceGauge({ getD, missReason }) {
  const markerRef = useRef(null);
  const valueRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let lastShown = -1;

    function tick() {
      raf = requestAnimationFrame(tick);
      const d = getD();
      if (markerRef.current) {
        markerRef.current.style.transform = `translateX(${(d / RULES.D_MAX) * 100}cqw)`;
      }
      const rounded = Math.round(d);
      if (valueRef.current && rounded !== lastShown) {
        lastShown = rounded;
        valueRef.current.textContent = String(rounded);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getD]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 'min(560px, 46vw)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontFamily: typography.family,
          fontSize: typography.hud.size,
          fontWeight: typography.hud.weight,
          letterSpacing: typography.hud.tracking,
          lineHeight: typography.hud.leading,
        }}
      >
        <span style={{ color: colors.text.dim }}>간합</span>
        <span style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
          {missReason ? (
            <span style={{ color: colors.red.light, fontSize: typography.caption.size }}>{missReason}</span>
          ) : null}
          <span ref={valueRef} style={{ color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
            45
          </span>
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          height: 10,
          borderRadius: radius.pill,
          background: colors.bg.overlay,
          border: `1px solid ${colors.line.default}`,
          containerType: 'inline-size',
          overflow: 'hidden',
        }}
      >
        {/* 유효 범위 밴드 */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${BAND_LEFT}%`,
            width: `${BAND_WIDTH}%`,
            background: colors.red.glow,
            borderLeft: `1px solid ${colors.red.light}`,
            borderRight: `1px solid ${colors.red.light}`,
          }}
        />
        {/* 현재 d 마커. transform만 움직인다 */}
        <div
          ref={markerRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -3,
            left: -1.5,
            width: 3,
            height: 16,
            background: colors.text.primary,
            borderRadius: 2,
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  );
}
