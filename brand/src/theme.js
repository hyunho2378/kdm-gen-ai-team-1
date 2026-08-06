// 책임: tokens 값을 CSS 변수로 내보낸다. arena/src/theme.js와 같은 규약이다.
//
// hover와 :active와 :focus-visible은 인라인 style로 표현할 수 없어 CSS가 필요한데,
// CSS에 HEX를 적으면 하드코딩 금지 규칙을 깬다. 그래서 값은 tokens에서만 나온다.
//
// **그리고 채움을 인라인으로 걸면 안 된다.** 인라인 style은 스타일시트를 이겨서
// `:active`의 press 색이 통째로 죽는다(arena에서 실제로 죽어 있던 함정이다).
// 그래서 CTA 배경은 클래스가 쥔다.

import { colors, displayFamily, glow, motion, spacing, withAlpha, zIndex } from './tokens.js';

/**
 * 헤더가 상주하는 높이. 하위 페이지 상단 여백이 이 값을 더해야 제목이 안 가린다.
 * 예전에는 페이지마다 `68px`을 손으로 적었다.
 */
export const HEADER_H = 68;

export function applyThemeVars(root = document.documentElement) {
  const vars = {
    // ── 페이지 골격 (REBOOT_PLAN 2.3) ────────────────────────────────────
    // **좌우 여백은 이 둘이 함께 정한다.** 거터만 같고 최대폭이 다르면
    // 넓은 화면에서 페이지마다 좌측 시작선이 어긋난다(실측으로 200px 차이가 났다).
    // 그래서 변수를 나눠 두지 않고 한 세트로 묶어 전 페이지가 같은 쌍을 쓴다.
    '--page-gutter': spacing.gutter,
    '--page-max': spacing.maxWide,
    // 세로 리듬. 섹션 간격도 한 곳에서 나온다
    '--section-gap': spacing.section,
    '--header-h': `${HEADER_H}px`,
    // 하위 페이지 상단. 섹션 간격에 헤더 높이를 더한 값이라 계산을 페이지가 하지 않는다
    '--page-top': `calc(${spacing.section} + ${HEADER_H}px)`,

    // 커서는 토스트보다도 위다. 화면의 어떤 것도 커서를 가리면 안 된다
    '--z-cursor': String(zIndex.toast + 10),
    // 프리로더는 로드 중 화면 전체를 덮으므로 커서보다도 위다
    '--z-preloader': String(zIndex.toast + 20),
    '--text-primary': colors.text.primary,
    '--bg-base': colors.bg.base,
    '--font-display': displayFamily,

    '--red-light': colors.red.light,
    '--red-fill': colors.red.fill,
    '--red-press': colors.red.press,
    '--text-on-fill': colors.text.onFill,
    '--line-default': colors.line.default,
    '--line-strong': colors.line.strong,
    '--glow-red': glow.red,
    '--ease-out': motion.easeOut,
    '--dur-press': `${motion.duration.press}ms`,
    // 호버 반응. DOM UI라 300ms 미만이어야 하고(DESIGN 7절) 커서를 스쳐도 거슬리지 않는 길이가 tooltip이다
    '--dur-hover': `${motion.duration.tooltip}ms`,
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
