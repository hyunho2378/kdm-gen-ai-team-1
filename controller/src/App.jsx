// controller 루트 = VORTEX 폰 앱. 화면 상태 머신 HOME → CONNECT → SELECT → PERMISSION →
// CALIBRATION → PLAY → RESULT. 강릉페이 시스템 이식(ScreenContainer 프레임 + HIG).
//
// **센서(C2)와 소켓(C3) 로직은 무변경이다.** 아래 pipeline/link 배선과 핸들러는 그대로 옮겨 왔고,
// 화면 계층(phase 순서, HOME/SELECT/RESULT 신설, ScreenContainer 래핑)만 확장했다.
//
// **센서와 연결은 서로를 막지 않는다.** 서버가 안 붙어도 센서 준비는 진행되고, 센서가 없어도
// 탭 모드로 연결은 산다(PATTERNS 8절 우아한 저하).
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
import ScreenContainer from './layout/ScreenContainer.jsx';
import CoachMarkOverlay from './components/common/CoachMarkOverlay.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import SelectScreen from './components/SelectScreen.jsx';
import { PLAY_COACH } from './copy.js';
import {
  CalibrationScreen,
  ConnectScreen,
  HapticFlash,
  LandscapeGuard,
  LinkErrorScreen,
  PermissionScreen,
  PlayScreen,
  ResultScreen,
} from './components/screens.jsx';

// 화면 순서. HANDOVER 3절 앱 화면 흐름 그대로다.
const PHASE = {
  HOME: 'HOME',
  CONNECT: 'CONNECT',
  SELECT: 'SELECT',
  PERMISSION: 'PERMISSION',
  CALIBRATION: 'CALIBRATION',
  PLAY: 'PLAY',
  RESULT: 'RESULT',
};

// 뒤로가기(N3 사용자 제어) 대상. PLAY는 경기 중이라 뒤로가기가 없다.
const BACK_OF = {
  [PHASE.CONNECT]: PHASE.HOME,
  [PHASE.SELECT]: PHASE.CONNECT,
  [PHASE.PERMISSION]: PHASE.SELECT,
  [PHASE.CALIBRATION]: PHASE.PERMISSION,
  [PHASE.RESULT]: PHASE.HOME,
};

/**
 * 가로 안내가 필요한가. **터치 기기가 가로일 때만 true.**
 * 데스크톱은 모니터가 늘 가로라 예전엔 프레임 미리보기가 통째로 가려졌다. 실기 폰이 옆으로
 * 누웠을 때만 안내해야 한다. resize와 orientationchange 양쪽을 듣는다(기기마다 하나만 오기도 한다).
 */
function useLandscape() {
  const [land, setLand] = useState(false);
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const read = () => setLand(isTouch && window.innerWidth > window.innerHeight);
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

  const [phase, setPhase] = useState(PHASE.HOME);
  const [code, setCode] = useState(roomFromUrl);
  const [connecting, setConnecting] = useState(false);
  const [denied, setDenied] = useState(false);
  // PLAY 첫 진입 코치마크. 0=꺼짐, 1~2=단계. ref로 세션 내 1회만(둘째 판부터 생략).
  const [playCoach, setPlayCoach] = useState(0);
  const playCoachShownRef = useRef(false);
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
    // 탭 모드는 캘리브레이션을 건너뛴다. 그래도 준비됐다는 통지는 보내야
    // arena가 CALIBRATION에서 폰을 기다리다 멈추지 않는다. 기준 자세는 없으므로 null이다
    link.sendCalib(null);
    setPhase(PHASE.PLAY);
  }, [pipeline, link]);

  // CONNECT에서 코드 확정 → 접속. **화면은 CONNECT에 머물며 접속 중 상태를 보인다.**
  // paired가 되면 아래 효과가 SELECT로 넘긴다(무한 스피너 금지, 상태 가시성 N1/N9).
  const onConnect = useCallback(
    (c) => {
      setCode(c);
      setConnecting(true);
      link.connect(c);
    },
    [link]
  );

  // HOME에서 게스트 시작 → CONNECT. ?room= 자동 주입이면 코드 입력을 건너뛰고 바로 접속한다.
  const onGuest = useCallback(() => {
    setPhase(PHASE.CONNECT);
    if (roomFromUrl.length === 4) onConnect(roomFromUrl);
  }, [roomFromUrl, onConnect]);

  // paired 수신 → SELECT. CONNECT에 있을 때만 넘긴다(경기 중 재연결이 화면을 튀게 하지 않도록).
  useEffect(() => {
    if (linkStatus === LINK.PAIRED && phase === PHASE.CONNECT) {
      setConnecting(false);
      setPhase(PHASE.SELECT);
    }
  }, [linkStatus, phase]);

  // PLAY 첫 진입에 코치마크 2종을 한 번만 띄운다(둘째 판부터 생략).
  useEffect(() => {
    if (phase === PHASE.PLAY && !playCoachShownRef.current) {
      playCoachShownRef.current = true;
      setPlayCoach(1);
    }
  }, [phase]);

  const onConnectCancel = useCallback(() => {
    link.close();
    setConnecting(false);
  }, [link]);

  // SELECT에서 유파 확정 → arena로 선택 전송(A3 진입점에 꽂힌다) → 권한 단계로.
  const onSelect = useCallback(
    (school) => {
      link.sendSelect(school);
      if (!motionSupported()) setDenied(true);
      setPhase(PHASE.PERMISSION);
    },
    [link]
  );

  const back = useCallback(() => {
    setPhase((p) => BACK_OF[p] ?? p);
  }, []);

  return (
    <>
      {/* statusBarBg 미지정 → colors.bg.base 기본. 다크 배경이라 light 스테이터스바. */}
      <ScreenContainer statusBarLight>
        {phase === PHASE.HOME ? <HomeScreen onGuest={onGuest} /> : null}

        {phase === PHASE.CONNECT ? (
          <ConnectScreen
            initialCode={roomFromUrl}
            onDone={onConnect}
            onBack={back}
            connecting={connecting}
            linkStatus={linkStatus}
            linkError={linkError}
            onRetry={() => {
              setConnecting(true);
              link.connect(code);
            }}
            onCancel={onConnectCancel}
          />
        ) : null}

        {phase === PHASE.SELECT ? <SelectScreen onConfirm={onSelect} onBack={back} /> : null}

        {phase === PHASE.PERMISSION ? (
          <PermissionScreen
            needsPrompt={motionPermissionNeeded()}
            denied={denied}
            onRequest={onRequest}
            onTapMode={startTapMode}
            onBack={back}
          />
        ) : null}

        {phase === PHASE.CALIBRATION ? <CalibrationScreen onDone={onCalibrated} onBack={back} /> : null}

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

        {phase === PHASE.RESULT ? (
          <ResultScreen onAgain={() => setPhase(PHASE.SELECT)} onHome={() => setPhase(PHASE.HOME)} />
        ) : null}

        {/* PLAY 첫 진입 코치마크(강릉페이 S7). 제스처 안내라 중앙 툴팁. 둘째 판부터 생략 */}
        {phase === PHASE.PLAY && playCoach > 0 ? (
          <CoachMarkOverlay
            message={PLAY_COACH[playCoach - 1]}
            step={playCoach}
            totalSteps={PLAY_COACH.length}
            onNext={() => setPlayCoach((s) => (s >= PLAY_COACH.length ? 0 : s + 1))}
            onSkip={() => setPlayCoach(0)}
          />
        ) : null}
      </ScreenContainer>

      {/* 경기 중(PLAY) 끊김만 전체 덮개로 알린다. CONNECT 단계의 실패는 ConnectScreen이 인라인으로 다룬다.
          센서는 계속 돌고 있으므로 재시도가 즉시 붙는다 */}
      {linkStatus === LINK.ERROR && phase === PHASE.PLAY ? (
        <LinkErrorScreen
          reason={linkError}
          onRetry={() => link.connect(code)}
          onBack={() => {
            link.close();
            setConnecting(false);
            setPhase(PHASE.CONNECT);
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
