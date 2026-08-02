// COMPONENTS.md 공통 스펙. arena와 동일 구현이다. 스펙 이탈 금지.
// press는 scale(0.97), hover는 배경 변화 대신 글로우와 보더(DESIGN 7절).

import { colors, radius, typography, motion } from '../../tokens.js';

const HOVER_PROPS = ['box-shadow', 'border-color'];
const transition = [
  `transform ${motion.duration.press}ms ${motion.easeOut}`,
  ...HOVER_PROPS.map((p) => `${p} ${motion.duration.press}ms ${motion.easeOut}`),
].join(', ');

const base = {
  fontFamily: typography.family,
  lineHeight: 1,
  borderRadius: radius.pill,
  minHeight: 44,
  minWidth: 44,
  cursor: 'pointer',
  wordBreak: 'keep-all',
  transition,
};

export function ButtonPrimary({ children, large = false, ...rest }) {
  return (
    <button
      type="button"
      className="ganhap-btn ganhap-btn-primary"
      style={{
        ...base,
        fontSize: large ? typography.heading.size : typography.body.size,
        fontWeight: 600,
        padding: large ? '20px 44px' : '12px 24px',
        color: colors.text.onFill,
        background: colors.red.fill,
        border: `1px solid ${colors.red.fill}`,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonGhost({ children, ...rest }) {
  return (
    <button
      type="button"
      className="ganhap-btn ganhap-btn-ghost"
      style={{
        ...base,
        fontSize: typography.body.size,
        fontWeight: 500,
        padding: '12px 24px',
        color: colors.text.primary,
        background: 'transparent',
        border: `1px solid ${colors.line.strong}`,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
