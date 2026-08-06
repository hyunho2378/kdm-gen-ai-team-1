// 체험해보기 CTA. arena로 나가는 유일한 출구다(BRAND_SITE_GUIDE 0절).
//
// **주소는 import.meta.env.VITE_ARENA_URL에서만 읽는다. 하드코딩 폴백을 두지 않는다.**
// 값이 없으면 콘솔 경고 한 줄을 남기고 화면은 그대로 산다. 버튼은 비활성으로 두고
// 옆에 사유를 적는다. 눌러도 아무 일이 없는 버튼이 제일 나쁜 실패다.

import { colors, radius, spacing, typography, weight } from '../tokens.js';
import { ARENA_CTA } from '../copy.js';

export function arenaUrl() {
  const v = import.meta.env.VITE_ARENA_URL;
  return typeof v === 'string' ? v.trim() : '';
}

export default function ArenaCta({ label = ARENA_CTA.label }) {
  const url = arenaUrl();

  if (!url) {
    // 렌더마다 한 줄씩 쌓이지 않게 최초 1회만 경고한다
    warnOnce();
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.unit * 1.5, flexWrap: 'wrap' }}>
        <span style={disabledStyle} aria-disabled="true">
          {label}
        </span>
        <span
          style={{
            fontFamily: typography.family,
            fontSize: typography.caption.size,
            color: colors.text.dim,
          }}
        >
          {ARENA_CTA.unavailable}
        </span>
      </div>
    );
  }

  // 외부 앱이라 새 탭으로 연다. noopener는 새 탭이 이 페이지를 조작하지 못하게 막는다
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="vx-cta" style={linkStyle}>
      {label}
    </a>
  );
}

let warned = false;
function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn('[brand] VITE_ARENA_URL이 없다. 체험해보기 버튼이 비활성이다.');
}

const shared = {
  display: 'inline-flex',
  // 부모가 세로 flex면 기본 stretch라 버튼이 화면 폭만큼 늘어난다(실측). 글자만큼만 차지한다
  alignSelf: 'flex-start',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '12px 28px',
  borderRadius: radius.pill,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  fontWeight: weight.semibold,
  lineHeight: 1,
  textDecoration: 'none',
};

// **채움과 press는 `.vx-cta` 클래스가 쥔다.** 여기서 background를 인라인으로 걸면
// 인라인이 스타일시트를 이겨 `:active`의 press 색이 죽는다(arena에서 죽어 있던 함정).
const linkStyle = { ...shared };

const disabledStyle = {
  ...shared,
  color: colors.text.dim,
  background: 'transparent',
  border: `1px solid ${colors.line.default}`,
  cursor: 'not-allowed',
};
