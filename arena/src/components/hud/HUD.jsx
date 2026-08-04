// COMPONENTS.md: DOM 오버레이 루트. zIndex.sticky~header.
// 판넬은 bg.raised 대신 overlay 알파 배경(캔버스를 가리지 않게, PATTERNS 5절).
//
// V4c부터 배치 기준이 팔각형 프레임이다. 다섯 요소 전부 frameInset 하나만 본다.
// 그 값이 컷 크기 + 12px이라 어느 요소도 코너 삼각형에 걸리지 않는다.
// 중앙 시야는 비운다. 유일한 예외가 JudgeText이고, 800ms만 떴다 지는 판정 피드백이라
// 상주 정보가 아니다.

import { zIndex } from '../../tokens.js';
import { PHASE } from '../../game/machine.js';
import StatusChip from '../ui/StatusChip.jsx';
import DistanceGauge from './DistanceGauge.jsx';
import ScoreBoard from './ScoreBoard.jsx';
import JudgeText from './JudgeText.jsx';
import LampPanel from './LampPanel.jsx';
import PhaseBanner from './PhaseBanner.jsx';
import PisteStrip from './PisteStrip.jsx';
import { frameInset, useViewport } from './frame.js';

// 하단 디버그 패널(우하단 fps 미터, 좌하단 캠 디버그)이 켜지면 하단 행 전체가 그 위로 비켜선다.
// 배너만 올렸더니 1024에서 간합 게이지의 오른쪽 끝(헛침 사유와 숫자)이 미터에 깔렸다(실측).
// 둘은 좌우 반대편이라 서로는 안 겹치고, 게이지만 둘 다를 피하면 된다.
const DEBUG_CLEARANCE = 62;

export default function HUD({ snapshot, getD, getPiste, camValue = '없음', camOk = false, fpsDegraded, rendererFallback, bottomDebug = false }) {
  const { w } = useViewport();
  const { phase, score, result, school } = snapshot;
  const live = phase === PHASE.EN_GARDE || phase === PHASE.EXCHANGE || phase === PHASE.JUDGE || phase === PHASE.SCORE;
  if (!live) return null;

  const missReason = result && result.reason ? result.reason : null;
  const inset = frameInset(w);

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
        padding: inset,
      }}
    >
      {/* 상단: 좌 점수, 우 상태 칩. 둘 다 상단 컷 변 아래 안쪽이다 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <ScoreBoard score={score} schoolName={school.name} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <StatusChip label="서버" value="키보드 모드" degraded />
              <StatusChip label="컨트롤러" value="없음" degraded />
              <StatusChip label="캠" value={camValue} degraded={!camOk} />
            </div>
            {rendererFallback ? <StatusChip label="렌더" value="호환 렌더" degraded /> : null}
            {fpsDegraded ? <StatusChip label="성능" value="자동 감축" degraded /> : null}
          </div>
        </div>

        {/* 심판기 램프와 피스트 스트립 (R3). 실제 심판기처럼 좌우 램프가 위치 축을 감싼다.
            둘 다 상단 밴드라 중앙 시야를 안 가린다(16절 규칙 유지) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <LampPanel lamp={snapshot.lamp} active={snapshot.showJudge} schoolName={school.name} />
          {getPiste ? <PisteStrip getPiste={getPiste} /> : null}
        </div>
      </div>

      {/* 중앙: 판정 문구. 유일하게 중앙에 남는 것이고 상주하지 않는다 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <JudgeText result={result} active={snapshot.showJudge} />
      </div>

      {/* 하단: 간합 게이지가 변 중앙, 국면 배너가 우측 컷 안쪽 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'flex-end',
          gap: 24,
          paddingBottom: bottomDebug ? DEBUG_CLEARANCE : 0,
        }}
      >
        <span />
        <DistanceGauge getD={getD} missReason={missReason} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PhaseBanner phase={phase} />
        </div>
      </div>
    </div>
  );
}
