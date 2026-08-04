// controller 루트. IA.md 5절 phase 순서를 그대로 화면으로 만든다.
// C2 범위는 **폰 단독 센서 동작**까지다. 소켓 연결은 C3이고 여기 action/pose 콜백이 그 접점이다.
//
// 절대 규칙: localStorage 금지(보정치는 메모리 변수), 100dvh, 터치 타깃 44px, 세로 고정.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPipeline, SUPPORT } from './pipeline.js';
import {
  PERM,
  motionPermissionNeeded,
  motionSupported,
  requestMotionPermission,
} from './sensors/permission.js';
import DebugPanel, { debugEnabled } from './components/DebugPanel.jsx';
import {
  CalibrationScreen,
  EndScreen,
  HapticFlash,
  JoinScreen,
  LandscapeGuard,
  PermissionScreen,
  PlayScreen,
} from './components/screens.jsx';

const PHASE = {
  JOIN: 'JOIN',
  PERMISSION: 'PERMISSION',
  CALIBRATION: 'CALIBRATION',
  PLAY: 'PLAY',
  END: 'END',
};

/** 가로 여부. resize와 orientationchange 양쪽을 듣는다(기기마다 하나만 오는 경우가 있다). */
function useLandscape() {
  const [land, setLand] = useState(false);
  useEffect(() => {
    const read = () => setLand(window.innerWidth > window.innerHeight);
    read();
    window.addEventListener('resize', read);
    window.addEventListener('orientationchange', read);
    return () => {
      window.removeEventListener('resize', read);
      window.removeEventListener('orientationchange', read);
    };
  }, []);
  return land;
}

export default function App() {
  const pipeline = useMemo(() => createPipeline(), []);
  const landscape = useLandscape();
  const showDebug = useMemo(() => debugEnabled(import.meta.env.DEV), []);

  // 방 코드는 메모리에만 둔다. localStorage 금지
  const roomFromUrl = useMemo(() => {
    const v = new URLSearchParams(window.location.search).get('room');
    return v ? v.toUpperCase().slice(0, 4) : '';
  }, []);

  const [phase, setPhase] = useState(PHASE.JOIN);
  const [code, setCode] = useState(roomFromUrl);
  const [denied, setDenied] = useState(false);
  const [tapMode, setTapMode] = useState(false);
  const [guarding, setGuarding] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [flash, setFlash] = useState(null);
  const [log, setLog] = useState([]);
  const logId = useRef(0);

  const push = useCallback((text) => {
    logId.current += 1;
    const entry = { id: logId.current, text };
    setLog((l) => [entry, ...l].slice(0, 12));
  }, []);

  // 이산 채널 소비처. **C3에서 이 자리가 socket.emit(MSG.ACTION)이 된다.**
  useEffect(() => {
    pipeline.on('action', (ev) => {
      if (ev.type === 'guard_on') setGuarding(true);
      if (ev.type === 'guard_off') setGuarding(false);
      if (ev.type === 'thrust') {
        setFlash('hit');
        setTimeout(() => setFlash(null), 10);
      }
      setLastAction(`${ev.type} ${ev.power.toFixed(2)}`);
      push(`${(ev.ts / 1000).toFixed(1)}s ${ev.type} power ${ev.power.toFixed(2)}`);
    });
    // 연속 채널 소비처. C3에서 socket.emit(MSG.MOTION)이 된다. 이미 30Hz로 조여져 있다
    pipeline.on('pose', () => {});
    return () => {
      pipeline.on('action', null);
      pipeline.on('pose', null);
    };
  }, [pipeline, push]);

  useEffect(() => () => pipeline.stop(), [pipeline]);

  /**
   * **권한 요청이 이 핸들러의 첫 줄이다.** 앞에 await를 하나라도 두면
   * iOS가 제스처 컨텍스트를 잃고 조용히 거부한다. 센서 기동과 화면 전환은 Promise가 풀린 뒤에 한다.
   */
  const onRequest = useCallback(() => {
    const p = requestMotionPermission();
    p.then((res) => {
      if (res === PERM.GRANTED) {
        pipeline.start();
        pipeline.beginCalibration();
        setPhase(PHASE.CALIBRATION);
        return;
      }
      setDenied(true);
      push(`권한 ${res}`);
    });
  }, [pipeline, push]);

  const onCalibrated = useCallback(() => {
    const r = pipeline.endCalibration();
    push(`캘리브레이션 노이즈 ${r.noisePeak.toFixed(1)} 임계 ${r.threshold.toFixed(1)}`);
    // 센서가 아예 안 붙는 기기는 여기서 탭 모드로 내려간다
    if (pipeline.getSupport() === SUPPORT.NONE) setTapMode(true);
    setPhase(PHASE.PLAY);
  }, [pipeline, push]);

  const startTapMode = useCallback(() => {
    setTapMode(true);
    pipeline.start();
    setPhase(PHASE.PLAY);
  }, [pipeline]);

  return (
    <>
      {phase === PHASE.JOIN ? (
        <JoinScreen
          initialCode={roomFromUrl}
          onDone={(c) => {
            setCode(c);
            // 센서가 없는 기기는 권한 화면에서 바로 탭 모드 안내로 간다
            if (!motionSupported()) setDenied(true);
            setPhase(PHASE.PERMISSION);
          }}
        />
      ) : null}

      {phase === PHASE.PERMISSION ? (
        <PermissionScreen
          needsPrompt={motionPermissionNeeded()}
          denied={denied}
          onRequest={onRequest}
          onTapMode={startTapMode}
        />
      ) : null}

      {phase === PHASE.CALIBRATION ? <CalibrationScreen onDone={onCalibrated} /> : null}

      {phase === PHASE.PLAY ? (
        <PlayScreen
          code={code}
          support={pipeline.getSupport()}
          tapMode={tapMode}
          guarding={guarding}
          lastAction={lastAction}
          onStep={(d) => pipeline.emitStep(d)}
          onStepEnd={(d) => pipeline.endStep(d)}
          onTapThrust={() => pipeline.tapThrust()}
          onTapGuard={(on) => pipeline.tapGuard(on)}
        />
      ) : null}

      {phase === PHASE.END ? <EndScreen onAgain={() => setPhase(PHASE.PLAY)} /> : null}

      <HapticFlash pattern={flash} />
      {/* 가로 안내는 덮기만 한다. 센서 스트림은 끊지 않는다 */}
      {landscape ? <LandscapeGuard /> : null}
      {showDebug ? <DebugPanel pipeline={pipeline} log={log} /> : null}
    </>
  );
}
