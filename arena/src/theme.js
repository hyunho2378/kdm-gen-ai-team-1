// 책임: tokens 값을 CSS 변수로 내보낸다.
// hover와 :active와 :focus-visible은 인라인 style로 표현할 수 없어 CSS가 필요한데,
// CSS에 HEX를 적으면 하드코딩 금지 규칙을 깬다. 그래서 값은 tokens에서만 나온다.

import { colors, glow, motion } from './tokens.js';

export function applyThemeVars(root = document.documentElement) {
  const vars = {
    '--red-light': colors.red.light,
    '--red-fill': colors.red.fill,
    '--red-press': colors.red.press,
    '--line-strong': colors.line.strong,
    '--glow-red': glow.red,
    '--ease-out': motion.easeOut,
    '--dur-press': `${motion.duration.press}ms`,
  };
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}
