// 책임: tokens 값을 CSS 변수로 내보낸다. arena/src/theme.js와 같은 규약이다.
//
// hover와 :active와 :focus-visible은 인라인 style로 표현할 수 없어 CSS가 필요한데,
// CSS에 HEX를 적으면 하드코딩 금지 규칙을 깬다. 그래서 값은 tokens에서만 나온다.
//
// **그리고 채움을 인라인으로 걸면 안 된다.** 인라인 style은 스타일시트를 이겨서
// `:active`의 press 색이 통째로 죽는다(arena에서 실제로 죽어 있던 함정이다).
// 그래서 CTA 배경은 클래스가 쥔다.

import { colors, glow, motion } from './tokens.js';

export function applyThemeVars(root = document.documentElement) {
  const vars = {
    '--red-light': colors.red.light,
    '--red-fill': colors.red.fill,
    '--red-press': colors.red.press,
    '--text-on-fill': colors.text.onFill,
    '--line-default': colors.line.default,
    '--line-strong': colors.line.strong,
    '--glow-red': glow.red,
    '--ease-out': motion.easeOut,
    '--dur-press': `${motion.duration.press}ms`,
  };
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}
