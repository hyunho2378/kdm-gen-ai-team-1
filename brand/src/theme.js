// 책임: tokens 값을 CSS 변수로 내보낸다. arena/src/theme.js와 같은 규약이다.
//
// hover와 :active와 :focus-visible은 인라인 style로 표현할 수 없어 CSS가 필요한데,
// CSS에 HEX를 적으면 하드코딩 금지 규칙을 깬다. 그래서 값은 tokens에서만 나온다.
//
// **그리고 채움을 인라인으로 걸면 안 된다.** 인라인 style은 스타일시트를 이겨서
// `:active`의 press 색이 통째로 죽는다(arena에서 실제로 죽어 있던 함정이다).
// 그래서 CTA 배경은 클래스가 쥔다.

import { colors, displayFamily, motion, pageGradient, radius, spacing, withAlpha, zIndex } from './tokens.js';

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
    /**
     * 읽기 한도(measure). 여러 파일이 `maxWidth: 720`을 손으로 적고 있었다.
     * 값이 흩어져 있으면 우측에 자리가 남는데 줄이 꺾이는 자리를 한 곳에서 못 고친다.
     *
     * **폭을 리드 한 문장이 한 줄에 들어가는 값으로 잡았다**(PLAN 1절 마진 그리드).
     * 1440에서 실측한 값이다.
     *
     *   리드가 한 줄에 필요한 폭   1352px
     *   shell 안쪽 가용폭          1425px
     *
     * **대가가 있다.** 1352px 한 줄은 한글 약 80자다. 편한 읽기 폭(45~75자)을 넘고,
     * 레퍼런스도 본문 단은 이보다 좁다(Apple 1440에서 약 700px). 리드가 한 문장이라
     * 통째로 한 줄에 놓는 편집이 성립하지만, 문단이 길어지면 이 값을 다시 좁혀야 한다.
     * **되돌릴 때 고칠 곳은 이 한 줄이다**(예: 68ch).
     * 좁은 화면에서는 100%가 먼저 걸려 자연스럽게 꺾인다.
     */
    '--measure': 'min(100%, 88rem)',
    // 세로 리듬. 섹션 간격도 한 곳에서 나온다
    '--section-gap': spacing.section,
    '--header-h': `${HEADER_H}px`,
    // 하위 페이지 콘텐츠 상단. **헤더 바로 아래 완만한 거리**에서 시작한다.
    // 예전에는 `섹션 간격 + 헤더`(최대 228px)라 헤더와 제목 사이가 통째로 비었다(화면 위 3분의 1).
    // 이제 헤더 높이에 8pt 격자의 완만한 gap(clamp 24~48px)만 더해 콘텐츠가 위로 붙는다.
    '--page-top': `calc(${HEADER_H}px + clamp(1.5rem, 1rem + 2vw, 3rem))`,

    // ── 카드 판 (제품 인덱스, 관문) ──────────────────────────────────────
    // **선이 아니라 아주 낮은 대비의 배경 차이로 경계를 만든다**(R1 선 금지 유지, 판독 개선).
    // v2는 라이트라 방향이 뒤집힌다. 밝은 페이지 위에 **잉크를 옅게 얹어** 한 단계 눌린 판이
    // 되고, 호버에 한 단계 더 눌린다(다크에서는 밝아지던 자리다)
    '--card-bg': withAlpha(colors.text.primary, 0.035),
    '--card-bg-hover': withAlpha(colors.text.primary, 0.07),
    '--card-radius': `${radius.lg}px`,

    // 커서는 토스트보다도 위다. 화면의 어떤 것도 커서를 가리면 안 된다
    // 서브내비는 헤더 바로 아래 층이다. 헤더보다 낮고 콘텐츠보다 높다
    '--z-pnav': String(zIndex.header - 1),
    // 서브내비 판. 페이지 그라디언트 위에 얹히므로 밝은 끝을 옅게 깔아 글자가 뚫리지 않게 한다
    '--pnav-bg': withAlpha(colors.bg.base, 0.82),
    '--z-cursor': String(zIndex.toast + 10),
    '--text-primary': colors.text.primary,
    '--text-dim': colors.text.dim,
    '--bg-base': colors.bg.base,
    // 페이지 배경. body와 프리로더가 같은 그라디언트를 쓴다(로드 중과 로드 후가 안 갈린다)
    '--page-bg': pageGradient,
    '--font-display': displayFamily,

    // 강조는 잉크가 진다. 레드는 브랜드에서 걷었다
    '--accent': colors.text.primary,
    '--fill': colors.fill.base,
    '--fill-press': colors.fill.press,
    '--text-on-fill': colors.fill.on,
    '--line-default': colors.line.default,
    '--line-strong': colors.line.strong,
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
