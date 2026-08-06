// 상단 고정 헤더. 전 페이지에 상주한다.
//
// 배경은 최상단에서 투명이고 스크롤하면 딤과 blur가 켜진다. 히어로 궤적이 주인공인 화면에서
// 헤더가 처음부터 판을 깔면 그 위에 띠가 하나 더 생긴다.
//
// **CTA 배경을 인라인 style로 걸지 않는다.** 인라인은 스타일시트를 이겨서 `:active`의 press가
// 통째로 죽는다(arena에서 실제로 죽어 있던 함정). 채움은 index.css의 `.vx-cta`가 쥔다.
//
// 현재 라우트 표시는 red 점과 weight 둘로 한다. 색 하나로만 구분하지 않는다(DESIGN 13절).

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { colors, displayFamily, radius, spacing, steelText, typography, withAlpha, zIndex } from '../tokens.js';
import { BRAND, DEMO, NAV } from '../copy.js';

// 이 높이를 넘어가면 헤더가 판을 깐다. 히어로 첫 화면에서는 투명하게 둔다
const SOLID_AT = 60;

export default function Header() {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > SOLID_AT);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: zIndex.header,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.unit * 2,
        padding: `12px ${spacing.gutter}`,
        background: solid ? withAlpha(colors.bg.base, 0.85) : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: solid ? 'blur(12px)' : 'none',
        // 헤어라인은 판이 깔린 뒤에만. 투명 상태에서 선만 뜨면 그 선이 떠 보인다
        borderBottom: `1px solid ${solid ? colors.line.default : 'transparent'}`,
        transition: 'background-color 200ms, border-color 200ms',
      }}
    >
      <Link to="/" aria-label={BRAND} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
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
          {BRAND}
        </span>
      </Link>

      {/* md 미만에서는 index.css가 이 묶음을 접는다. 햄버거는 B8 이후다 */}
      <nav className="vx-nav" style={{ display: 'flex', alignItems: 'center', gap: spacing.unit * 3 }}>
        {NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                minHeight: 44,
                padding: '0 4px',
                fontFamily: typography.family,
                fontSize: typography.caption.size,
                // 색 단독 구분 금지라 현재 항목은 굵기도 함께 올린다
                fontWeight: active ? 700 : 500,
                letterSpacing: typography.hud.tracking,
                color: active ? colors.text.primary : colors.text.dim,
                textDecoration: 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: active ? colors.red.light : 'transparent',
                  flex: 'none',
                }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/experience"
        className="vx-cta"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
          padding: '10px 20px',
          borderRadius: radius.pill,
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          fontWeight: 600,
          lineHeight: 1,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {DEMO.cta}
      </Link>
    </header>
  );
}
