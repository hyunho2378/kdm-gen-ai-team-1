// arena 루트. phase에 따라 화면을 갈아끼우고 HUD를 얹는다.
// ROUTES.md: phase는 URL에 싣지 않는다. 상태머신이 소유한다.
// C1은 키보드 모드만 있다. PAIRING과 CALIBRATION은 C3에서 붙는다.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createEngine } from './game/engine.js';
import { createPoseChannel } from './game/pose.js';
import { createPerfStats, meterEnabled } from './game/perf.js';
import { CAM, CAM_LABEL, camDebugEnabled, createFaceTracker } from './game/faceTracker.js';
import { LINK, LINK_LABEL, attachSocket, controllerUrl, createLink } from './net/socket.js';
import { HAPTIC } from '../../shared/protocol.js';
import { OUTCOME, OWNER } from './game/judge.js';
import { attachKeyboard } from './game/input.js';
import { EV, PHASE } from './game/machine.js';
import GameCanvas from './game/GameCanvas.jsx';
import HUD from './components/hud/HUD.jsx';
import CamDebug from './components/hud/CamDebug.jsx';
import FpsMeter from './components/hud/FpsMeter.jsx';
import FuiLayer from './components/hud/FuiLayer.jsx';
import GlassFrame from './components/hud/GlassFrame.jsx';
import VignetteOverlay from './components/VignetteOverlay.jsx';
import IdleScreen from './screens/IdleScreen.jsx';
import MatchEndScreen from './screens/MatchEndScreen.jsx';
import PairingScreen from './screens/PairingScreen.jsx';
import ViewportGuard from './screens/ViewportGuard.jsx';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 폰 select 값(protocol SCHOOL) → 로비에 띄울 유파 라벨. 표시 전용이라 여기 둔다.
const SCHOOL_LABEL = {
  sabre: '이탈리아 세이버',
  epee: '프랑스 에페',
  hungarian: '헝가리안',
  mixed: '통합 MIXED',
};

export default function App() {
  const reduced = useMemo(prefersReducedMotion, []);
  const rendererRef = useRef(null);
  const [snapshot, setSnapshot] = useState(null);
  const [degraded, setDegraded] = useState(false);
  const [rendererFallback, setRendererFallback] = useState(false);
  // 렌더러가 투영해 준 마지막 연출 좌표. FUI 층이 이것 하나만 본다
  const [fxShot, setFxShot] = useState(null);
  const fxId = useRef(0);
  // 웹캠 상태. 어느 경로로 실패해도 게임은 안 멈춘다(R5)
  const [camStatus, setCamStatus] = useState(CAM.OFF);
  const [linkStatus, setLinkStatus] = useState(LINK.IDLE);
  const [roomCode, setRoomCode] = useState('');
  // 폰이 고른 유파 라벨. 로비가 "OO 유파 선택됨"으로 반영한다(경기 밖 표시, 판정 무관)
  const [selectedSchool, setSelectedSchool] = useState(null);
  // 유파 선택값(protocol SCHOOL). undefined면 시드로 뽑는다(기존 기본 경로).
  // 로컬 키보드 1/2/3/4와 유파 카드가 이 값을 세우고, 그러면 엔진이 그 유파로 다시 선다.
  const [schoolSel, setSchoolSel] = useState(undefined);
  const [pendingStart, setPendingStart] = useState(false);
  // 연속 채널. engine과 분리되어 있고 렌더러만 소비한다(ARENA_INPUT 3절).
  const poseChannel = useMemo(() => createPoseChannel(), []);
  const perf = useMemo(() => createPerfStats(), []);
  // 웹캠 추적기. engine과 렌더러 양쪽에 지표를 넘기지만 **판정 경로에는 불리언 하나만 간다**
  const face = useMemo(() => createFaceTracker(), []);
  // 소켓 링크. **경기를 인질로 잡지 않는다.** 서버가 없으면 키보드로 그대로 완주한다
  const link = useMemo(() => createLink(), []);
  // dev이거나 주소에 ?fps=1이 있으면 미터를 띄운다. 실기 확인이 최종 성능 게이트다
  const showMeter = useMemo(() => meterEnabled(import.meta.env.DEV), []);
  // ?cam=1이면 캠 디버그. 캠이 약한 것과 안 붙은 것을 사용자가 눈으로 가른다(V2)
  const showCam = useMemo(camDebugEnabled, []);

  const engine = useMemo(
    () =>
      createEngine({
        seed: 20260802,
        reducedMotion: reduced,
        school: schoolSel,
        onPublish: (s) => setSnapshot(s),
      }),
    [reduced, schoolSel]
  );

  useEffect(() => {
    setSnapshot(engine.snapshot());
  }, [engine]);

  // 유파 선택은 IDLE에서만. 선택값을 세우면 엔진이 그 유파로 다시 서고(useMemo), 새 엔진이
  // 뜨면 아래 효과가 키보드 경기를 시작한다. 엔진 재생성이 비동기라 시작을 플래그로 미룬다.
  const selectSchool = useCallback(
    (sel) => {
      if (engine.phase !== PHASE.IDLE) return;
      setSchoolSel(sel);
      setPendingStart(true);
    },
    [engine]
  );

  useEffect(() => {
    if (pendingStart && engine.phase === PHASE.IDLE) {
      engine.send(EV.START_KEYBOARD);
      setPendingStart(false);
    }
  }, [pendingStart, engine]);

  // 피스트 스트립이 매 프레임 폴링하는 창구. 참조를 고정해야 스트립의 rAF 루프가 재시작되지 않는다
  const getPiste = useMemo(() => () => engine.getPiste(), [engine]);

  // F9는 어느 phase에서든 동작해야 한다. 비상 컷의 생명이다.
  useEffect(
    () =>
      attachKeyboard(engine.input, {
        onToggleKeyboardMode: () => {
          engine.forceKeyboard();
          // 연속 채널도 내린다. engine은 pose.js를 모르므로 여기서 한다(ARENA_INPUT 5절)
          poseChannel.fallbackToPreset();
        },
        onStart: () => {
          if (engine.phase === PHASE.IDLE) engine.send(EV.START_KEYBOARD);
        },
        onSelectSchool: selectSchool,
      }),
    [engine, poseChannel, selectSchool]
  );

  // 소켓 배선 (C3). 이산은 키보드와 같은 큐로, 연속은 렌더러 전용 채널로 간다.
  // 두 경로가 여기서 갈린 뒤 다시 만나지 않는 것이 결정성의 생명선이다(ARENA_INPUT 3절).
  useEffect(() => {
    link.on('status', (st, code) => {
      setLinkStatus(st);
      setRoomCode(code ?? '');
      if (st === LINK.PAIRED) engine.send(EV.PAIRED);
    });
    const detach = attachSocket(link, engine.input, poseChannel, {
      // 폰이 준비를 마쳤다. 캘리브레이션 자체는 폰이 이미 적용했고 여기서는 phase만 넘긴다
      onCalibrated: () => engine.send(EV.CALIBRATED),
      // 폰이 유파를 골랐다. A3의 진입점(setSchool)으로 세우고 로비에 반영한다. 경기 시작 전이라 안전하다
      onSelect: (school) => {
        engine.setSchool(school);
        setSelectedSchool(SCHOOL_LABEL[school] ?? school);
      },
    });
    return () => {
      detach();
      link.on('status', null);
      link.close();
    };
  }, [engine, link, poseChannel]);

  // 명중과 패리를 폰으로 되돌린다. 렌더러가 아니라 판정이 낸 사건이라 2D 폴백에서도 나간다
  const onGameFx = useCallback(
    (e) => {
      if (e.outcome === OUTCOME.PARRY) link.sendHaptic(HAPTIC.PARRY);
      else if (e.outcome === OUTCOME.HIT || e.outcome === OUTCOME.RIPOSTE) {
        link.sendHaptic(e.owner === OWNER.ME ? HAPTIC.HIT : HAPTIC.LOSE);
      }
    },
    [link]
  );

  // 웹캠 배선 (R5). 팽창 트리거는 불리언만, 패럴랙스는 렌더러 전용 연속 채널이다.
  // 캠이 안 서면 트리거가 null을 돌려 engine이 기존 성공률 근사로 판단한다(우선순위 캠 > 근사).
  useEffect(() => {
    face.onStatusChange(setCamStatus);
    engine.setDilationTrigger(() => face.dilationTrigger());
    // 권한은 사용자 제스처에서만 얻을 수 있다. 첫 키 입력에 붙인다
    const kick = () => face.start();
    window.addEventListener('keydown', kick, { once: true });
    window.addEventListener('pointerdown', kick, { once: true });
    return () => {
      window.removeEventListener('keydown', kick);
      window.removeEventListener('pointerdown', kick);
      engine.setDilationTrigger(null);
      face.dispose();
    };
  }, [engine, face]);

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
          reduced={reduced}
          onRendererReady={(r) => {
            rendererRef.current = r;
            setRendererFallback(r.isFallback);
            // 패럴랙스 지표 주입. reduced면 렌더러가 목표를 0으로 두어 카메라가 안 움직인다
            r.setHeadSource?.(() => face.read());
          }}
          onFallback={() => setRendererFallback(true)}
          onFx={(e) => {
            fxId.current += 1;
            setFxShot({ ...e, id: fxId.current });
          }}
          onGameFx={onGameFx}
        />

        {/* 프레임은 HUD보다 먼저 그린다. 같은 층에서 HUD가 위로 온다 */}
        <GlassFrame reduced={reduced} />

        <HUD
          snapshot={snapshot}
          getD={() => engine.getD()}
          getPiste={getPiste}
          camValue={CAM_LABEL[camStatus]}
          camOk={camStatus === CAM.READY}
          linkValue={LINK_LABEL[linkStatus]}
          linkOk={linkStatus === LINK.PAIRED}
          fpsDegraded={degraded}
          rendererFallback={rendererFallback}
          bottomDebug={showMeter || showCam}
        />
        <FuiLayer shot={fxShot} reduced={reduced} />
        {showMeter ? <FpsMeter perf={perf} rendererRef={rendererRef} /> : null}
        {showCam ? <CamDebug face={face} rendererRef={rendererRef} reduced={reduced} /> : null}
        <VignetteOverlay active={snapshot.dilating} />

        {phase === PHASE.IDLE ? (
          <IdleScreen
            onStart={() => {
              // 서버 주소가 없으면 페어링 화면에 세우지 않고 곧장 키보드 경기로 간다
              if (link.connect()) engine.send(EV.START);
              else engine.send(EV.START_KEYBOARD);
            }}
            onKeyboard={() => engine.send(EV.START_KEYBOARD)}
            onSelectSchool={selectSchool}
            selectedSchool={schoolSel}
          />
        ) : null}

        {phase === PHASE.PAIRING || phase === PHASE.CALIBRATION ? (
          <PairingScreen
            status={linkStatus}
            code={roomCode}
            controllerUrl={controllerUrl()}
            calibrating={phase === PHASE.CALIBRATION}
            selected={selectedSchool}
            onKeyboard={() => {
              setSelectedSchool(null);
              engine.send(EV.RESET);
            }}
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
