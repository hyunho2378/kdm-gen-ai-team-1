// controller 루트. IA.md 5절 phase 순서를 그대로 화면으로 만든다.
// C3에서 소켓이 붙었다. 이산은 즉시, 쿼터니언은 30Hz(orientation.js 스로틀)로 나간다.
//
// **센서와 연결은 서로를 막지 않는다.** 서버가 안 붙어도 센서 준비는 진행되고,
// 센서가 없어도 탭 모드로 연결은 산다. 둘 중 하나가 죽었을 때 다른 하나까지 세우면
// 발표장에서 복구할 길이 없다(PATTERNS 8절 우아한 저하).
//
// 절대 규칙: localStorage 금지(보정치는 메모리 변수), 100dvh, 터치 타깃 44px, 세로 고정.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HAPTIC, INPUT_EVENT } from '../../shared/protocol.js';
import { createPipeline, SUPPORT } from './pipeline.js';
import { LINK, LINK_LABEL, createLink } from './net/socket.js';
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
  LinkErrorScreen,
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
  const link = useMemo(() => createLink(), []);
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
  const [linkStatus, setLinkStatus] = useState(LINK.IDLE);
  const [linkError, setLinkError] = useState(null);
  const [log, setLog] = useState([]);
  const logId = useRef(0);

  const push = useCallback((text) => {
    logId.current += 1;
    const entry = { id: logId.current, text };
    setLog((l) => [entry, ...l].slice(0, 12));
  }, []);

  // 이산 채널 소비처. 여기가 판정으로 가는 유일한 출구다. 스로틀하지 않는다.
  useEffect(() => {
    pipeline.on('action', (ev) => {
      if (ev.type === INPUT_EVENT.GUARD_ON) setGuarding(true);
      if (ev.type === INPUT_EVENT.GUARD_OFF) setGuarding(false);
      if (ev.type === INPUT_EVENT.THRUST) {
        setFlash(HAPTIC.HIT);
        setTimeout(() => setFlash(null), 10);
      }
      setLastAction(`${ev.type} ${ev.power.toFixed(2)}`);
      push(`${(ev.ts / 1000).toFixed(1)}s ${ev.type} power ${ev.power.toFixed(2)}`);
      link.sendAction(ev);
    });
    // 연속 채널 소비처. 렌더 전용이라 판정에 닿지 않는다. 30Hz는 orientation.js가 이미 조였다
    pipeline.on('pose', (q) => link.sendMotion(q));
    return () => {
      pipeline.on('action', null);
      pipeline.on('pose', null);
    };
  }, [pipeline, link, push]);

  // 연결 상태와 햅틱. 햅틱은 arena가 명중과 패리에서 쏜다
  useEffect(() => {
    link.on('status', (st, err) => {
      setLinkStatus(st);
      setLinkError(err);
      push(`연결 ${LINK_LABEL[st]}${err ? ` (${err})` : ''}`);
    });
    link.on('haptic', (pattern) => {
      setFlash(pattern);
      setTimeout(() => setFlash(null), 10);
    });
    return () => {
      link.on('status', null);
      link.on('haptic', null);
    };
  }, [link, push]);

  useEffect(
    () => () => {
      pipeline.stop();
      link.close();
    },
    [pipeline, link]
  );

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
    // arena가 이 통지를 받고 CALIBRATION을 벗어난다. 보정 자체는 폰이 이미 적용했다
    link.sendCalib(pipeline.getBaseline());
    // 센서가 아예 안 붙는 기기는 여기서 탭 모드로 내려간다
    if (pipeline.getSupport() === SUPPORT.NONE) setTapMode(true);
    setPhase(PHASE.PLAY);
  }, [pipeline, link, push]);

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
            link.connect(c);
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
          linkLabel={LINK_LABEL[linkStatus]}
          linkOk={linkStatus === LINK.PAIRED}
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

      {/* 연결 실패는 화면을 덮는다. 센서는 계속 돌고 있으므로 재시도가 즉시 붙는다 */}
      {linkStatus === LINK.ERROR ? (
        <LinkErrorScreen
          reason={linkError}
          onRetry={() => link.connect(code)}
          onBack={() => {
            link.close();
            setPhase(PHASE.JOIN);
          }}
        />
      ) : null}

      <HapticFlash pattern={flash} />
      {/* 가로 안내는 덮기만 한다. 센서 스트림은 끊지 않는다 */}
      {landscape ? <LandscapeGuard /> : null}
      {showDebug ? <DebugPanel pipeline={pipeline} log={log} /> : null}
    </>
  );
}
