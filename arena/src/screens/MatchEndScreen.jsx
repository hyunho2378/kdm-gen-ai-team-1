// IA.md MATCH_END: 승패 연출(크롬 타이포), 최종 스코어, [다시], [처음으로].
// 드물게 한 번 보는 화면이므로 연출이 정당하다(MOTION 0절).

import { colors, spacing, typography, zIndex } from '../tokens.js';
import { OWNER } from '../game/judge.js';
import ChromeText from '../components/ui/ChromeText.jsx';
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button.jsx';

export default function MatchEndScreen({ winner, score, schoolName, onRematch, onReset }) {
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

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ButtonPrimary onClick={onRematch}>다시</ButtonPrimary>
        <ButtonGhost onClick={onReset}>처음으로</ButtonGhost>
      </div>
    </section>
  );
}
