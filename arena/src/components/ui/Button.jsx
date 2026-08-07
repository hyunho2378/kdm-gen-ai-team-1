// COMPONENTS.md 공통 스펙. 스펙 이탈 금지.
// press는 scale(0.97), hover는 배경 변화 대신 글로우와 보더(블랙 배경에서 배경 변화는 안 보인다).

import { colors, radius, typography, glow, motion } from '../../tokens.js';

// hover는 보더와 글로우로 표현한다(DESIGN 7절). 블랙 배경에서 배경 변화는 보이지 않는다.
// box-shadow와 border-color는 paint를 유발하지만 프로젝트 지침이 정한 hover 표현이라
// MOTION 11절의 transform opacity 한정보다 우선한다.
const HOVER_PROPS = ['box-shadow', 'border-color'];
const transition = [
  `transform ${motion.duration.press}ms ${motion.easeOut}`,
  ...HOVER_PROPS.map((p) => `${p} ${motion.duration.press}ms ${motion.easeOut}`),
].join(', ');

const base = {
  fontFamily: typography.family,
  fontSize: typography.body.size,
  lineHeight: 1,
  borderRadius: radius.pill,
  padding: '12px 24px',
  minHeight: 44,
  minWidth: 44,
  cursor: 'pointer',
  transition,
};

export function ButtonPrimary({ children, onPointerDown, onClick, ...rest }) {
  return (
    <button
      type="button"
      className="ganhap-btn ganhap-btn-primary"
      style={{
        ...base,
        fontWeight: 600,
        color: colors.text.onFill,
        background: colors.primary.fill,
        border: `1px solid ${colors.primary.fill}`,
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonGhost({ children, onPointerDown, onClick, ...rest }) {
  return (
    <button
      type="button"
      className="ganhap-btn ganhap-btn-ghost"
      style={{
        ...base,
        fontWeight: 500,
        color: colors.text.primary,
        background: 'transparent',
        border: `1px solid ${colors.line.strong}`,
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export const BUTTON_GLOW = glow.primary;
