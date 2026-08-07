// TabBar — 하단 3탭. 강릉페이 DESIGN.md 바텀탭 명세 이식.
//
// 원본 수치 그대로: 아이콘 24px, 레이블 11px(ig.caption2), 바 높이 49px + safe area,
// 활성/비활성을 색으로만 가르지 않고 굵기도 같이 올린다. 색만 VORTEX(활성 red.light,
// 비활성 text.dim). 강릉페이는 5개 고정이고 여기는 3개인데 개수만 다르고 규칙은 같다.
//
// Nielsen: #1 상태 가시성(활성 탭), #4 일관성. Shneiderman: #1 일관성.
// 아이콘은 lucide-react만 쓴다(이모지 금지). 터치 타깃은 44px 이상.

import { History, Swords, Bot } from 'lucide-react';
import { colors, ig, typography } from '../tokens.js';
import { MAIN } from '../copy.js';

// 강릉페이 layout.bottomNavHeight 83px = 49px 바 + safe area 34px.
// safe area는 env()가 기기별로 내므로 여기서는 바 높이만 고정한다
const BAR_HEIGHT = 49;
const ICON_SIZE = 24;

const ICON = { RECORDS: History, CONTROLLER: Swords, OPPONENT: Bot };

export default function TabBar({ active, onChange }) {
  return (
    <nav
      aria-label="주 메뉴"
      style={{
        display: 'flex',
        borderTop: `1px solid ${colors.line.default}`,
        background: colors.bg.base,
        paddingBottom: 'env(safe-area-inset-bottom)',
        flexShrink: 0,
      }}
    >
      {MAIN.tabs.map((tab) => {
        const Icon = ICON[tab.key];
        const on = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1,
              boxSizing: 'border-box',
              height: BAR_HEIGHT,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: typography.family,
              touchAction: 'manipulation',
            }}
          >
            {/* **액센트는 아이콘이 진다.** 레이블은 11px라 절대 대형 텍스트가 될 수 없는데
                red.light는 bg.base 위 4.02:1이라 본문 기준 4.5:1에 못 미친다. 아이콘은 텍스트가
                아니라 비텍스트 기준 3.0:1이 적용되어 같은 red가 통과한다(4.02) */}
            <Icon size={ICON_SIZE} color={on ? colors.accent.base : colors.text.dim} aria-hidden="true" />
            {/* 색 단독 구분 금지라 활성은 굵기로도 갈린다 */}
            <span
              style={{
                fontSize: ig.caption2.size,
                fontWeight: on ? 700 : 400,
                letterSpacing: '0.04em',
                color: on ? colors.text.primary : colors.text.dim,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
