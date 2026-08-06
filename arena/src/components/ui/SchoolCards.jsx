// 유파 카드. IdleScreen에서 뽑아 MatchEndScreen과 공유한다.
//
// **한 곳에 두는 이유는 두 화면이 같은 것을 가리켜야 하기 때문이다.** 로비에서 고르는 유파와
// 다시 대전에서 고르는 유파는 같은 넷이고, 카드가 갈라지면 폰이 훑는 항목과 화면에 뜬 항목이
// 어긋난다. 카드 모양과 목록을 여기 하나에 둔다.
//
// 상태가 둘이다. **selected는 확정이고 focused는 폰이 지금 훑는 중이라는 표시다.**
// 확정은 red 테두리와 글로우로 못 박고, 훑는 중은 테두리만 강하게 든다(같은 세기로 그리면
// 확정과 미리보기가 구별되지 않는다). 색 단독 구분 금지라 aria로도 갈린다.

import { colors, radius, typography } from '../../tokens.js';
import { SCHOOL } from '../../../../shared/protocol.js';

// VORTEX 유파 3.11 카피와 표기 일치. 4번은 세 스타일을 갈아타는 통합 모드.
export const SCHOOL_OPTIONS = [
  { key: SCHOOL.SABRE, n: '1', name: '이탈리아 세이버', trait: '공격형' },
  { key: SCHOOL.EPEE, n: '2', name: '프랑스 에페', trait: '카운터형' },
  { key: SCHOOL.HUNGARIAN, n: '3', name: '헝가리안', trait: '심리전형' },
  { key: SCHOOL.MIXED, n: '4', name: '통합 MIXED', trait: '세 스타일 조합' },
];

export function SchoolCard({ opt, selected, focused, onSelect }) {
  // 확정 > 훑는 중 > 평소. 테두리는 확정과 훑는 중이 같고 글로우가 확정만 붙는다
  const lit = selected || focused;
  return (
    <button
      type="button"
      onClick={onSelect ? () => onSelect(opt.key) : undefined}
      aria-pressed={selected}
      aria-current={focused && !selected ? 'true' : undefined}
      // 폰이 훑는 것을 보여 주기만 하는 화면에서는 눌리지 않는다
      disabled={!onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        minWidth: 128,
        minHeight: 44,
        padding: '10px 14px',
        borderRadius: radius.md,
        border: `1px solid ${lit ? colors.red.light : colors.line.default}`,
        background: colors.bg.raised,
        boxShadow: selected ? `0 0 16px ${colors.red.glow}` : 'none',
        cursor: onSelect ? 'pointer' : 'default',
        fontFamily: typography.family,
        textAlign: 'left',
        // 훑는 중은 즉시 반응해야 한다. 폰에서 손가락이 움직이는 속도를 따라간다
        transition: 'border-color 120ms, box-shadow 120ms',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: typography.caption.size,
            fontWeight: 700,
            color: lit ? colors.red.light : colors.text.dim,
            border: `1px solid ${lit ? colors.red.light : colors.line.strong}`,
            borderRadius: radius.xs,
            width: 18,
            height: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {opt.n}
        </span>
        <span style={{ fontSize: typography.caption.size, color: colors.text.secondary, wordBreak: 'keep-all' }}>
          {opt.name}
        </span>
      </span>
      <span style={{ fontSize: typography.caption.size, color: colors.text.dim }}>{opt.trait}</span>
    </button>
  );
}
