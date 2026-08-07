// 책임: tokens 값을 CSS 변수로 내보낸다.
// hover와 :active와 :focus-visible은 인라인 style로 표현할 수 없어 CSS가 필요한데,
// CSS에 HEX를 적으면 하드코딩 금지 규칙을 깬다. 그래서 값은 tokens에서만 나온다.

import { colors, glow, motion } from './tokens.js';

export function applyThemeVars(root = document.documentElement) {
  const vars = {
    // **UI 변수는 네이비와 실버다.** 소유 색(red, blue)은 CSS로 안 나간다.
    // 그것은 컴포넌트가 tokens에서 직접 읽어 "나"와 "상대"를 가리키는 자리에만 쓴다
    '--primary': colors.primary.fill,
    '--primary-press': colors.primary.press,
    '--accent': colors.accent.base,
    '--line-strong': colors.line.strong,
    '--glow-primary': glow.primary,
    '--ease-out': motion.easeOut,
    '--dur-press': `${motion.duration.press}ms`,
  };
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}
