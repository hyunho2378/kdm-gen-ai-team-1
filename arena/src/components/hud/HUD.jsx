// COMPONENTS.md: DOM 오버레이 루트. zIndex.sticky~header.
// 판넬은 bg.raised 대신 overlay 알파 배경(캔버스를 가리지 않게, PATTERNS 5절).

import { spacing, zIndex } from '../../tokens.js';
import { PHASE } from '../../game/machine.js';
import StatusChip from '../ui/StatusChip.jsx';
import DistanceGauge from './DistanceGauge.jsx';
import ScoreBoard from './ScoreBoard.jsx';
import JudgeText from './JudgeText.jsx';
import PhaseBanner from './PhaseBanner.jsx';

export default function HUD({ snapshot, getD, fpsDegraded }) {
  const { phase, score, result, school } = snapshot;
  const live = phase === PHASE.EN_GARDE || phase === PHASE.EXCHANGE || phase === PHASE.JUDGE || phase === PHASE.SCORE;
  if (!live) return null;

  const missReason = result && result.reason ? result.reason : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.sticky,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: spacing.gutter,
      }}
    >
      {/* 상단: 점수와 국면, 우상단 상태 칩 3개 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
        <ScoreBoard score={score} schoolName={school.name} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <StatusChip label="서버" value="키보드 모드" degraded />
            <StatusChip label="컨트롤러" value="없음" degraded />
            <StatusChip label="캠" value="없음" degraded />
          </div>
          {fpsDegraded ? <StatusChip label="렌더" value="파티클 감축" degraded /> : null}
        </div>
      </div>

      {/* 중앙: 판정 문구 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <JudgeText result={result} active={snapshot.showJudge} />
      </div>

      {/* 하단: 간합 게이지와 국면 배너 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
        <DistanceGauge getD={getD} missReason={missReason} />
        <PhaseBanner phase={phase} />
      </div>
    </div>
  );
}
