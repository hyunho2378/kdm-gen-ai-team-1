// arena 루트. phase에 따라 화면을 갈아끼우고 HUD를 얹는다.
// ROUTES.md: phase는 URL에 싣지 않는다. 상태머신이 소유한다.
// C1은 키보드 모드만 있다. PAIRING과 CALIBRATION은 C3에서 붙는다.

import { useEffect, useMemo, useRef, useState } from 'react';
import { createEngine } from './game/engine.js';
import { attachKeyboard } from './game/input.js';
import { EV, PHASE } from './game/machine.js';
import GameCanvas from './game/GameCanvas.jsx';
import HUD from './components/hud/HUD.jsx';
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
  const showMeter = import.meta.env.DEV;

  return (
    <ViewportGuard>
      <main style={{ minHeight: '100dvh' }}>
        <GameCanvas
          engine={engine}
          showMeter={showMeter}
          onRendererReady={(r) => {
            rendererRef.current = r;
          }}
        />

        <HUD snapshot={snapshot} getD={() => engine.getD()} fpsDegraded={degraded} />
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
