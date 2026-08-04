// 책임: 심판기 램프 (R3-2). 명중 판정 순간 좌우 램프가 점등한다.
//
// 실제 심판기는 심판 기준 왼쪽 선수 빨강, 오른쪽 초록이다(1936년 이래 불변).
// **초록은 도입하지 않는다.** 좌우 식별이 본질이고 초록은 우리 무채색 + red/blue 규칙을 깬다
// (FENCING_RULES 채택 판정표 2행). 그래서 좌 red가 나, 우 blue가 상대다.
//
// 더블 투셰와 시뮬타네는 양쪽이 함께 켜진다. 그 둘의 구분은 점등이 아니라
// JudgeText의 문구가 진다(색 단독 구분 금지, DESIGN 13절).
//
// 상시 노출 요소라 배경 틀은 애니메이션하지 않고 램프 알만 opacity로 켰다 끈다.

import { colors, motion, typography } from '../../tokens.js';
import { LAMP } from '../../game/judge.js';

const R = 11;

function Lamp({ on, color, label, align }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align, gap: 3 }}>
      <div
        style={{
          width: R * 2,
          height: R * 2,
          borderRadius: '50%',
          border: `1px solid ${colors.line.strong}`,
          background: color,
          opacity: on ? 1 : 0.12,
          boxShadow: on ? `0 0 16px ${color}` : 'none',
          transition: `opacity 90ms ${motion.easeOut}`,
        }}
      />
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          letterSpacing: typography.hud.tracking,
          color: on ? colors.text.secondary : colors.text.dim,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** lamp는 판정 결과가 준다. null이면 둘 다 꺼진 대기 상태다. */
export default function LampPanel({ lamp, active, schoolName }) {
  const on = active ? lamp : null;
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <Lamp on={on === LAMP.ME || on === LAMP.BOTH} color={colors.red.light} label="나" align="center" />
      <Lamp on={on === LAMP.AI || on === LAMP.BOTH} color={colors.blue.light} label={schoolName} align="center" />
    </div>
  );
}
