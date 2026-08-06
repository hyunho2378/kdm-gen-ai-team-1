// 책임: tokens 값을 CSS 변수로 내보낸다. arena/src/theme.js와 같은 규약이다.
//
// hover와 :active와 :focus-visible은 인라인 style로 표현할 수 없어 CSS가 필요한데,
// CSS에 HEX를 적으면 하드코딩 금지 규칙을 깬다. 그래서 값은 tokens에서만 나온다.
//
// **그리고 채움을 인라인으로 걸면 안 된다.** 인라인 style은 스타일시트를 이겨서
// `:active`의 press 색이 통째로 죽는다(arena에서 실제로 죽어 있던 함정이다).
// 그래서 CTA 배경은 클래스가 쥔다.

import { colors, glow, motion, withAlpha } from './tokens.js';

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
    // 모바일 메뉴 시트. 시트와 드로어는 DESIGN 7절이 ease-drawer를 지정한다.
    // 지속은 dropdown(200ms)을 쓴다. 헤더에서 내려오는 메뉴이고 DOM UI라 300ms 미만이어야 한다
    '--ease-drawer': motion.easeDrawer,
    '--dur-sheet': `${motion.duration.dropdown}ms`,
    // 시트 판과 스크림. 배경은 bg.base 계열이고 뒤가 비치되 글자가 읽히는 알파다
    '--sheet-bg': withAlpha(colors.bg.base, 0.96),
    '--scrim-bg': colors.bg.overlay,
  };
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}
