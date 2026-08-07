// common/CoachMarkOverlay.jsx — 강릉페이 CoachMarkOverlay 이식(S7 코치마크). 색만 VORTEX 다크.
//
// Strategy: S7 첫 사용자 단계별 맥락 안내.
// Nielsen: #10 도움말. Shneiderman: #4 dialog closure, #8 단기기억 부담 감소.
//
// 원본과 다른 점: react-router/isLargeText 컨텍스트 제거. 색은 tokens 경유. 팔각 대신 radius 카드
// (폰은 arena FUI 문법이 아니라 HIG 카드가 맞다). targetRef 없으면 중앙 툴팁(제스처 안내용).

import { useState, useLayoutEffect, useEffect } from 'react';
import { colors, ig, radius, typography } from '../../tokens.js';

export default function CoachMarkOverlay({ targetRef, message, step, totalSteps, onNext, onSkip, placement = 'top' }) {
  const [containerRect, setContainerRect] = useState(null);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useLayoutEffect(() => {
    const update = () => {
      const container = document.getElementById('screen-container');
      if (container) setContainerRect(container.getBoundingClientRect());
      if (targetRef?.current) setTargetRect(targetRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [targetRef]);

  if (!containerRect) return null;

  const hasTarget = targetRect != null && targetRect.width > 0;
  const rel = hasTarget
    ? {
        top: targetRect.top - containerRect.top,
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
        height: targetRect.height,
        bottom: targetRect.bottom - containerRect.top,
      }
    : null;

  const containerHeight = containerRect.height;
  const TOOLTIP_H = 180;
  let tip = {};
  let arrow = null;
  if (rel) {
    if (placement === 'bottom') {
      tip = { top: `${rel.bottom + 12}px` };
      arrow = 'top';
    } else if (rel.top >= TOOLTIP_H + 24) {
      tip = { bottom: `${containerHeight - rel.top + 12}px` };
      arrow = 'bottom';
    } else {
      tip = { top: '50%', transform: 'translateY(-50%)' };
    }
  } else {
    tip = { top: '50%', transform: 'translateY(-50%)' };
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: containerRect.top,
        left: containerRect.left,
        width: containerRect.width,
        height: containerRect.height,
        zIndex: 9999,
        fontFamily: typography.family,
        pointerEvents: 'auto',
      }}
    >
      {rel ? (
        <div
          style={{
            position: 'absolute',
            top: rel.top - 6,
            left: rel.left - 6,
            width: rel.width + 12,
            height: rel.height + 12,
            borderRadius: radius.card,
            boxShadow: `0 0 0 9999px ${colors.bg.overlay}`,
            border: `2px solid ${colors.accent.base}`,
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: colors.bg.overlay, pointerEvents: 'none' }} />
      )}

      <div style={{ position: 'absolute', left: 16, right: 16, pointerEvents: 'auto', ...tip }}>
        {arrow === 'top' ? (
          <div style={{ paddingLeft: 24, marginBottom: -1 }}>
            <div style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: `10px solid ${colors.bg.raised}` }} />
          </div>
        ) : null}

        <div style={{ background: colors.bg.raised, border: `1px solid ${colors.line.default}`, borderTop: `2px solid ${colors.accent.base}`, borderRadius: radius.card, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i + 1 === step ? colors.accent.base : colors.line.strong }} />
            ))}
            <span style={{ marginLeft: 'auto', fontSize: ig.caption1.size, color: colors.text.dim }}>
              {step} / {totalSteps}
            </span>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: ig.body.size, color: colors.text.primary, lineHeight: 1.6, wordBreak: 'keep-all' }}>
            {message}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: ig.subhead.size, color: colors.text.dim, padding: '8px 0', fontFamily: typography.family, minHeight: 44 }}>
              건너뛰기
            </button>
            <button type="button" onClick={onNext} style={{ background: colors.primary.fill, border: 'none', borderRadius: radius.pill, color: colors.text.onFill, fontSize: ig.subhead.size, fontWeight: 600, padding: '10px 22px', cursor: 'pointer', minHeight: 44, fontFamily: typography.family }}>
              {step === totalSteps ? '시작' : '다음'}
            </button>
          </div>
        </div>

        {arrow === 'bottom' ? (
          <div style={{ paddingLeft: 24, marginTop: -1 }}>
            <div style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `10px solid ${colors.bg.raised}` }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
