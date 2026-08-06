// 상단 고정 헤더. 전 페이지에 상주한다.
//
// 배경은 최상단에서 투명이고 스크롤하면 딤과 blur가 켜진다. 히어로 궤적이 주인공인 화면에서
// 헤더가 처음부터 판을 깔면 그 위에 띠가 하나 더 생긴다.
//
// **배치를 인라인 style로 걸지 않는다.** 인라인은 스타일시트를 이겨서 media query와 `:active`가
// 통째로 죽는다. 320에서 nav가 안 접히던 원인이 `<nav style={{display:'flex'}}>`였고,
// arena press와 brand CTA에 이은 세 번째 사례다(PITFALLS). `display`는 index.css가 쥔다.
//
// 층 구조. `<header>`가 고정 컨테이너이고 그 안에 스크림, 시트, 바가 있다.
// **시트는 페이지 오버레이가 아니라 헤더에서 내려오는 드롭다운이라 바 아래 층에 둔다**(DESIGN 8절 드롭다운 30).
// 오버레이 90에 두면 헤더 50을 덮어 햄버거 재클릭이 막힌다. z는 헤더가 만든 쌓임 맥락 안에서만 다툰다.
//
// 현재 라우트 표시는 red 점과 weight 둘로 한다. 색 하나로만 구분하지 않는다(DESIGN 13절).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { colors, displayFamily, radius, spacing, steelText, typography, weight, withAlpha, zIndex } from '../tokens.js';
import { HEADER } from '../copy.js';

// 이 높이를 넘어가면 헤더가 판을 깐다. 히어로 첫 화면에서는 투명하게 둔다
const SHEET_ID = 'vx-nav-sheet';
// index.css의 헤더 분기와 같은 값. 여기서는 넓어질 때 시트를 닫는 데만 쓴다
const MD = '(min-width: 768px)';

export default function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const burgerRef = useRef(null);
  const headerRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);

  // 라우트가 바뀌면 반드시 닫는다. 열린 채로 페이지가 넘어가면 새 화면이 시트에 가린다
  useEffect(() => { setOpen(false); }, [pathname]);

  // **md 이상으로 넓어지면 닫는다.** 시트는 CSS가 `display: none`으로 지워 버리는데
  // 상태가 열린 채로 남으면 아래 inert가 안 풀려 본문이 통째로 죽는다
  useEffect(() => {
    const mq = window.matchMedia(MD);
    const onChange = (e) => { if (e.matches) setOpen(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // 열리면 시트 첫 항목으로 포커스를 옮기고, 닫히면 햄버거로 되돌린다.
  // 정리 함수가 되돌리기를 맡아서 어느 경로로 닫혀도(ESC, 바깥 탭, 재클릭, 라우트 이동) 같게 동작한다
  useEffect(() => {
    if (!open) return undefined;
    const first = document.getElementById(SHEET_ID)?.querySelector('a, button');
    first?.focus();
    return () => burgerRef.current?.focus();
  }, [open]);

  // 열린 동안 본문을 죽인다. inert가 포커스와 포인터와 접근성 트리를 한 번에 막고,
  // inert를 모르는 브라우저를 위해 aria-hidden을 함께 건다
  useEffect(() => {
    if (!open) return undefined;
    const mains = [...document.querySelectorAll('main')];
    mains.forEach((m) => { m.inert = true; m.setAttribute('aria-hidden', 'true'); });
    return () => mains.forEach((m) => { m.inert = false; m.removeAttribute('aria-hidden'); });
  }, [open]);

  // ESC로 닫고 Tab을 헤더 안에 가둔다. **문서에 걸어야 포커스가 어디 있든 잡힌다.**
  // 고리에 햄버거가 들어 있어서 키보드로도 재클릭에 닿는다
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const host = headerRef.current;
      if (!host) return;
      // 보이는 것만 고리에 넣는다. display none과 visibility hidden은 사각형이 없다
      const ring = [...host.querySelectorAll('a[href], button')].filter((el) => el.getClientRects().length > 0);
      if (ring.length === 0) return;
      const i = ring.indexOf(document.activeElement);
      const next = e.shiftKey
        ? (i <= 0 ? ring.length - 1 : i - 1)
        : (i === -1 || i === ring.length - 1 ? 0 : i + 1);
      e.preventDefault();
      ring[next].focus();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  // 시트가 열려 있으면 바에 판을 깐다. 투명한 바 아래로 시트가 비쳐 글자가 겹친다
  // **판을 늘 깐다(레드 제거 세션).** 예전에는 맨 위에서 투명이라 히어로가 헤더를 뚫고
  // 올라왔는데, 제품 사이트의 서브내비가 헤더 바로 아래에 판을 깔면서 위아래가 어긋나 보였다.
  // Apple 글로벌 내비도 늘 불투명하다. 스크롤에 따라 채우던 상태와 그 리스너는 함께 걷었다
  const filled = true;

  return (
    <header ref={headerRef} data-nav-open={open ? 'true' : 'false'} style={headerStyle}>
      {/* 바. **DOM에서 먼저 두고 z로 올린다.** 그래야 탭 순서가 워드마크, 햄버거, 시트 항목 순으로
          사람이 누른 차례를 따라간다. 칠하는 차례는 z가 정하므로 시트 위에 그대로 남는다 */}
      {/* 배경과 블러는 전폭으로 깔고 안쪽 줄만 페이지 골격을 쓴다(index.css의 .vx-bar).
          그래야 워드마크가 페이지 제목과 같은 세로선에서 시작한다.
          **헤어라인은 없다.** 장식 선 전량 제거(REBOOT_PLAN 2.1). 판이 깔리는 것만으로 층이 읽힌다 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: filled ? withAlpha(colors.bg.base, 0.85) : 'transparent',
          backdropFilter: filled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: filled ? 'blur(12px)' : 'none',
          transition: 'background-color 200ms',
        }}
      />
      <div
        className="vx-bar"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.unit * 2,
        }}
      >
        <Link to="/" aria-label={HEADER.wordmark} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
          <span
            style={{
              fontFamily: displayFamily,
              fontSize: typography.heading.size,
              fontWeight: typography.display.weight,
              letterSpacing: typography.display.tracking,
              lineHeight: 1,
              ...steelText,
            }}
          >
            {HEADER.wordmark}
          </span>
        </Link>

        {/* md 미만에서 index.css가 이 둘을 접는다. 배치는 클래스가 쥔다 */}
        <nav className="vx-nav" aria-label={HEADER.menuLabel}>
          {HEADER.nav.map((item) => (
            <NavItem key={item.to} item={item} active={pathname === item.to} />
          ))}
        </nav>

        <Link to="/experience" className="vx-cta vx-cta-bar" style={ctaStyle}>
          {HEADER.cta}
        </Link>

        {/* md 이상에서 사라진다. 아이콘 단독이라 aria-label이 라벨의 전부다 */}
        <button
          ref={burgerRef}
          type="button"
          className="vx-burger"
          aria-label={open ? HEADER.menuClose : HEADER.menuOpen}
          aria-expanded={open}
          aria-controls={SHEET_ID}
          onClick={() => setOpen((v) => !v)}
          style={burgerStyle}
        >
          {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* 바깥 탭으로 닫는 층. 바보다 아래라 햄버거는 계속 눌린다 */}
      <div className="vx-scrim" aria-hidden="true" onClick={close} style={scrimStyle} />

      {/* 시트. header가 fixed라 `top: 100%`가 바 바로 아래에 붙는다.
          **바 높이를 상수로 적지 않는다.** 그 숫자는 이미 두 페이지에 흩어져 있다 */}
      <div id={SHEET_ID} className="vx-sheet" style={sheetStyle}>
        <nav aria-label={HEADER.menuLabel} style={{ display: 'flex', flexDirection: 'column' }}>
          {HEADER.nav.map((item) => (
            <NavItem key={item.to} item={item} active={pathname === item.to} block />
          ))}
        </nav>
        <Link to="/experience" className="vx-cta vx-cta-sheet" style={ctaStyle}>
          {HEADER.cta}
        </Link>
      </div>
    </header>
  );
}

/**
 * 메뉴 한 줄. 바와 시트가 같은 것을 쓴다. `block`이면 시트용으로 폭을 채운다.
 *
 * **불릿을 걷었다(BV2-1).** 현재 항목을 red 점으로 찍던 자리인데 v2는 불릿 전면 금지다.
 * 그래도 색 하나로 구분하지는 않는다. 현재 항목은 **굵기 700 대 500**과 **잉크 대 dim**이
 * 함께 움직여서 두 신호가 남는다(DESIGN 13절 색 단독 구분 금지). 굵기 차이는 200이라
 * 흑백으로 봐도 갈린다.
 */
function NavItem({ item, active, block }) {
  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 44,
        padding: block ? '10px 4px' : '0 4px',
        fontFamily: typography.family,
        fontSize: block ? typography.body.size : typography.hud.size,
        fontWeight: active ? weight.bold : weight.medium,
        letterSpacing: typography.hud.tracking,
        color: active ? colors.text.primary : colors.text.dim,
        textDecoration: 'none',
      }}
    >
      {item.label}
    </Link>
  );
}

const headerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: zIndex.header,
};

const scrimStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  background: 'var(--scrim-bg)',
};

// 시트는 md 미만에서만 뜨고 그 폭에서는 최대폭 제한이 걸리지 않으므로 거터만 쓴다.
// **하단 헤어라인은 없다.** 장식 선 전량 제거(REBOOT_PLAN 2.1). 판과 블러가 층을 낸다
const sheetStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 1,
  flexDirection: 'column',
  gap: spacing.unit * 2,
  padding: `${spacing.unit * 2}px var(--page-gutter) ${spacing.unit * 3}px`,
  background: 'var(--sheet-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

// **채움과 press는 `.vx-cta`가, 배치는 `.vx-cta-bar`와 `.vx-cta-sheet`가 쥔다.**
// 여기서 background를 걸면 press가 죽고, display를 걸면 md 미만에서 바 CTA가 안 접힌다
const ctaStyle = {
  minHeight: 44,
  padding: '10px 20px',
  borderRadius: radius.pill,
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  fontWeight: weight.semibold,
  lineHeight: 1,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const burgerStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  padding: 0,
  borderRadius: radius.md,
  border: '1px solid transparent',
  background: 'transparent',
  color: colors.text.primary,
  cursor: 'pointer',
};
