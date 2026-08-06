// 책임: tokens 값을 CSS 변수로 내보낸다. arena/src/theme.js와 같은 규약이다.
//
// hover와 :active와 :focus-visible은 인라인 style로 표현할 수 없어 CSS가 필요한데,
// CSS에 HEX를 적으면 하드코딩 금지 규칙을 깬다. 그래서 값은 tokens에서만 나온다.
//
// **그리고 채움을 인라인으로 걸면 안 된다.** 인라인 style은 스타일시트를 이겨서
// `:active`의 press 색이 통째로 죽는다(arena에서 실제로 죽어 있던 함정이다).
// 그래서 CTA 배경은 클래스가 쥔다.

import { colors, displayFamily, motion, pageGradient, radius, spacing, withAlpha, zIndex } from './tokens.js';

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
    // 하위 페이지(NotFound) 콘텐츠 상단. **전역 헤더가 사라져 그 높이를 안 더한다.**
    // 8pt 격자의 완만한 gap만 남는다. 제품 페이지는 자기 서브내비를 스스로 이고 있어
    // 이 값을 쓰지 않는다
    '--page-top': 'clamp(1.5rem, 1rem + 2vw, 3rem)',

    // ── 카드 판 (제품 인덱스, 관문) ──────────────────────────────────────
    // **선이 아니라 아주 낮은 대비의 배경 차이로 경계를 만든다**(R1 선 금지 유지, 판독 개선).
    // v2는 라이트라 방향이 뒤집힌다. 밝은 페이지 위에 **잉크를 옅게 얹어** 한 단계 눌린 판이
    // 되고, 호버에 한 단계 더 눌린다(다크에서는 밝아지던 자리다)
    '--card-bg': withAlpha(colors.text.primary, 0.035),
    '--card-bg-hover': withAlpha(colors.text.primary, 0.07),
    '--card-radius': `${radius.lg}px`,

    // **서브내비가 곧 헤더다.** 전역 헤더를 걷어내 이 바가 헤더 층을 그대로 물려받는다
    '--z-pnav': String(zIndex.header),
    // 커서는 토스트보다도 위다. 화면의 어떤 것도 커서를 가리면 안 된다
    // 서브내비 판. 페이지 그라디언트 위에 얹히므로 밝은 끝을 옅게 깔아 글자가 뚫리지 않게 한다
    '--pnav-bg': withAlpha(colors.bg.base, 0.82),
    '--z-cursor': String(zIndex.toast + 10),
    '--text-primary': colors.text.primary,
    '--text-dim': colors.text.dim,
    '--bg-base': colors.bg.base,
    // 페이지 배경. body와 프리로더가 같은 그라디언트를 쓴다(로드 중과 로드 후가 안 갈린다)
    '--page-bg': pageGradient,
    '--font-display': displayFamily,

    // **강조는 네이비가 진다.** 아이브로우와 현재 탭과 포커스 링이 이 하나를 본다
    '--accent': colors.accent.base,
    '--accent-press': colors.accent.press,
    '--fill': colors.fill.base,
    '--fill-press': colors.fill.press,
    '--text-on-fill': colors.fill.on,
    '--line-default': colors.line.default,
    '--line-strong': colors.line.strong,
    '--ease-out': motion.easeOut,
    '--dur-press': `${motion.duration.press}ms`,
    // 호버 반응. DOM UI라 300ms 미만이어야 하고(DESIGN 7절) 커서를 스쳐도 거슬리지 않는 길이가 tooltip이다
    '--dur-hover': `${motion.duration.tooltip}ms`,
    // **모바일 메뉴 시트 변수 넷을 걷었다.** 전역 헤더가 사라지면서 시트와 스크림이 함께
    // 사라졌고, 남은 서브내비는 좁은 화면에서 접히지 않고 두 줄로 눕는다
  };
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}
