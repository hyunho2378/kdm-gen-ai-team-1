// arena 루트. phase에 따라 화면을 갈아끼우고 HUD를 얹는다.
// ROUTES.md: phase는 URL에 싣지 않는다. 상태머신이 소유한다.
// C1은 키보드 모드만 있다. PAIRING과 CALIBRATION은 C3에서 붙는다.

import { useEffect, useMemo, useRef, useState } from 'react';
import { createEngine } from './game/engine.js';
import { createPoseChannel } from './game/pose.js';
import { createPerfStats, meterEnabled } from './game/perf.js';
import { attachKeyboard } from './game/input.js';
import { EV, PHASE } from './game/machine.js';
import GameCanvas from './game/GameCanvas.jsx';
import HUD from './components/hud/HUD.jsx';
import FpsMeter from './components/hud/FpsMeter.jsx';
import FuiLayer from './components/hud/FuiLayer.jsx';
import GlassFrame from './components/hud/GlassFrame.jsx';
import VignetteOverlay from './components/VignetteOverlay.jsx';
import IdleScreen from './screens/IdleScreen.jsx';
import MatchEndScreen from './screens/MatchEndScreen.jsx';
import ViewportGuard from './screens/ViewportGuard.jsx';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function App() {
  const reduced = useMemo(prefersReducedMotion, []);
  const rendererRef = useRef(null);
  const [snapshot, setSnapshot] = useState(null);
  const [degraded, setDegraded] = useState(false);
  const [rendererFallback, setRendererFallback] = useState(false);
  // 렌더러가 투영해 준 마지막 연출 좌표. FUI 층이 이것 하나만 본다
  const [fxShot, setFxShot] = useState(null);
  const fxId = useRef(0);
  // 연속 채널. engine과 분리되어 있고 렌더러만 소비한다(ARENA_INPUT 3절).
  const poseChannel = useMemo(() => createPoseChannel(), []);
  const perf = useMemo(() => createPerfStats(), []);
  // dev이거나 주소에 ?fps=1이 있으면 미터를 띄운다. 실기 확인이 최종 성능 게이트다
  const showMeter = useMemo(() => meterEnabled(import.meta.env.DEV), []);

  const engine = useMemo(
    () =>
      createEngine({
        seed: 20260802,
        reducedMotion: reduced,
        onPublish: (s) => setSnapshot(s),
      }),
    [reduced]
  );

  useEffect(() => {
    setSnapshot(engine.snapshot());
  }, [engine]);

  // F9는 어느 phase에서든 동작해야 한다. 비상 컷의 생명이다.
  useEffect(
    () =>
      attachKeyboard(engine.input, {
        onToggleKeyboardMode: () => engine.forceKeyboard(),
        onStart: () => {
          if (engine.phase === PHASE.IDLE) engine.send(EV.START_KEYBOARD);
        },
      }),
    [engine]
  );

  // 성능 가드 상태를 칩에 반영한다. 프레임마다 state를 올리지 않는다.
  useEffect(() => {
    const id = setInterval(() => {
      const r = rendererRef.current;
      if (r) setDegraded(r.isDegraded());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // dev 전용 셀프테스트. 프로덕션 번들에서는 통째로 빠진다.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    import('./game/judge.selftest.js').then((m) => m.reportSelftest());
  }, []);

  if (!snapshot) return null;

  const { phase } = snapshot;

  return (
    <ViewportGuard>
      <main style={{ minHeight: '100dvh' }}>
        <GameCanvas
          engine={engine}
          poseChannel={poseChannel}
          perf={perf}
          onRendererReady={(r) => {
            rendererRef.current = r;
            setRendererFallback(r.isFallback);
          }}
          onFallback={() => setRendererFallback(true)}
          onFx={(e) => {
            fxId.current += 1;
            setFxShot({ ...e, id: fxId.current });
          }}
        />

        {/* 프레임은 HUD보다 먼저 그린다. 같은 층에서 HUD가 위로 온다 */}
        <GlassFrame reduced={reduced} />

        <HUD
          snapshot={snapshot}
          getD={() => engine.getD()}
          fpsDegraded={degraded}
          rendererFallback={rendererFallback}
          meterOn={showMeter}
        />
        <FuiLayer shot={fxShot} reduced={reduced} />
        {showMeter ? <FpsMeter perf={perf} rendererRef={rendererRef} /> : null}
        <VignetteOverlay active={snapshot.dilating} />

        {phase === PHASE.IDLE ? (
          <IdleScreen
            onStart={() => engine.send(EV.START_KEYBOARD)}
            onKeyboard={() => engine.forceKeyboard()}
          />
        ) : null}

        {phase === PHASE.MATCH_END ? (
          <MatchEndScreen
            winner={snapshot.winner}
            score={snapshot.score}
            schoolName={snapshot.school.name}
            onRematch={() => {
              rendererRef.current?.clear();
              engine.send(EV.REMATCH);
            }}
            onReset={() => {
              rendererRef.current?.clear();
              engine.send(EV.RESET);
            }}
          />
        ) : null}
      </main>
    </ViewportGuard>
  );
}
