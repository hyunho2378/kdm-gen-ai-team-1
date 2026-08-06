// IA.md MATCH_END: 승패 연출(크롬 타이포), 최종 스코어, [다시], [처음으로].
// 드물게 한 번 보는 화면이므로 연출이 정당하다(MOTION 0절).
//
// **폰이 붙어 있으면 다음 상대를 고르는 화면이기도 하다.** 폰에서 다시 대전을 누르면
// 유파 재선택으로 가는데, 그때 손가락이 훑는 카드가 여기 실시간으로 켜져야 관객이
// 무엇이 골라지는지 본다. 훑는 중(focusedSchool)은 표시뿐이고 확정은 폰의 select가 낸다.
// 폰이 안 붙었으면 카드가 아예 안 뜬다(키보드 경로는 IdleScreen이 진다).

import { colors, spacing, typography, zIndex } from '../tokens.js';
import { OWNER } from '../game/judge.js';
import ChromeText from '../components/ui/ChromeText.jsx';
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button.jsx';
import { SCHOOL_OPTIONS, SchoolCard } from '../components/ui/SchoolCards.jsx';

export default function MatchEndScreen({ winner, score, schoolName, focusedSchool, showSchools, onRematch, onReset }) {
  const won = winner === OWNER.ME;

  return (
    <section
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.modal,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.unit * 3,
        padding: spacing.gutter,
        background: colors.bg.overlay,
        textAlign: 'center',
      }}
    >
      <ChromeText as="h2" variant="display">
        {won ? '승리' : '패배'}
      </ChromeText>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          fontFamily: typography.family,
          fontSize: typography.title.size,
          fontWeight: typography.title.weight,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{ color: colors.red.light }}>나 {score.me}</span>
        <span style={{ color: colors.text.dim, fontSize: typography.caption.size }}>최종</span>
        <span style={{ color: colors.blue.light }}>
          {schoolName} {score.ai}
        </span>
      </div>

      {showSchools ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: typography.family,
              fontSize: typography.caption.size,
              letterSpacing: typography.hud.tracking,
              color: colors.text.dim,
            }}
          >
            {focusedSchool ? '폰에서 고르는 중' : '폰에서 다음 상대를 고른다'}
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {SCHOOL_OPTIONS.map((opt) => (
              // onSelect를 안 넘긴다. 고르는 주체는 폰이고 이 화면은 비추기만 한다
              <SchoolCard key={opt.key} opt={opt} focused={focusedSchool === opt.key} />
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ButtonPrimary onClick={onRematch}>다시</ButtonPrimary>
        <ButtonGhost onClick={onReset}>처음으로</ButtonGhost>
      </div>
    </section>
  );
}
