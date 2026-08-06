// 책임: 센서 셋을 하나로 묶는 오케스트레이터 (C2).
//
// 화면은 phase만 알고 센서 세부는 모른다. 여기가 이산 채널과 연속 채널을 갈라 들고 있다가
// C3에서 소켓 어댑터에 그대로 물린다(ARENA_INPUT 2절과 3절 스키마 그대로).
//
//   이산: { type, power, ts, source:'controller' }  → MSG.ACTION      (스로틀 없음)
//   연속: [x, y, z, w] 30Hz                          → MSG.MOTION      (스로틀 있음)
//
// **지금은 소켓에 안 보낸다.** C2 범위는 폰 단독 동작까지이고, 여기 콜백이 C3의 연결점이다.

import { INPUT_EVENT, SOURCE } from '../../shared/protocol.js';
import { createMotion, SUPPORT } from './sensors/motion.js';
import { createOrientation } from './sensors/orientation.js';
import { createWakeLock } from './sensors/wakelock.js';

/** 캘리브레이션 정지 시간. arena CALIBRATION 링과 같은 3초다. */
export const CALIB_MS = 3000;

/** 스와이프 방향. 화면과 파이프라인이 같은 이름을 쓴다. */
export const STEP = { ADVANCE: 'advance', RETREAT: 'retreat' };

export function createPipeline() {
  const orientation = createOrientation();
  // **가드는 자세가 낸다.** 자이로가 아는 값을 가속 쪽에 물려 준다(motion.js의 readTilt).
  // orientation을 먼저 세워야 하는 이유가 이 한 줄이다.
  const motion = createMotion({ readTilt: () => orientation.tilt() });
  const wake = createWakeLock();

  // 캘리브레이션 중 관측한 정지 노이즈. 개인 임계의 근거다
  let noisePeak = 0;
  let sampling = false;

  const listeners = { action: null, pose: null, sample: null };

  motion.on('thrust', (power, peak) => {
    if (sampling) {
      noisePeak = Math.max(noisePeak, peak);
      return;
    }
    // ARENA_INPUT 2절 스키마 그대로. ts는 소스 시계다(판정은 engine 시계를 쓴다)
    listeners.action?.({ type: INPUT_EVENT.THRUST, power, ts: performance.now(), source: SOURCE.CONTROLLER });
  });

  motion.on('guard', (on) => {
    listeners.action?.({
      type: on ? INPUT_EVENT.GUARD_ON : INPUT_EVENT.GUARD_OFF,
      power: on ? 1 : 0,
      ts: performance.now(),
      source: SOURCE.CONTROLLER,
    });
  });

  motion.on('sample', (s) => {
    if (sampling) noisePeak = Math.max(noisePeak, s.horiz);
    listeners.sample?.(s);
  });

  orientation.on('pose', (q) => listeners.pose?.(q));

  return {
    /** 권한을 받은 뒤 부른다. 센서 구독과 화면 잠금 방지를 함께 켠다. */
    start() {
      motion.attach();
      orientation.attach();
      wake.start();
    },
    stop() {
      motion.detach();
      orientation.detach();
      wake.stop();
    },

    /**
     * 캘리브레이션 시작. 이 구간의 찌르기는 이벤트로 내보내지 않고
     * 정지 상태의 노이즈 최대값만 모은다.
     */
    beginCalibration() {
      sampling = true;
      noisePeak = 0;
    },

    /**
     * 캘리브레이션 종료. 기준 자세를 박고 개인 임계를 정한다.
     * 임계는 관측 노이즈의 2.4배로 잡되 기본값 아래로는 안 내린다.
     * 손이 떨리는 사람은 임계가 올라가고, 아주 조용한 사람은 기본값을 쓴다.
     */
    endCalibration() {
      sampling = false;
      // 기준 자세는 한 곳에서만 잡는다. 가드가 자세로 옮겨 가면서 가속 쪽 기준은 필요 없어졌다
      orientation.setBaseline();
      const suggested = Math.max(motion.getConfig().thrust, noisePeak * 2.4);
      motion.setThreshold(suggested);
      return { noisePeak, threshold: motion.getConfig().thrust };
    },

    on(name, fn) {
      if (name in listeners) listeners[name] = typeof fn === 'function' ? fn : null;
    },

    /** 스와이프는 화면 입력이다. 센서가 아니라 터치가 낸다. */
    emitStep(dir) {
      listeners.action?.({
        type: dir === STEP.ADVANCE ? INPUT_EVENT.ADVANCE : INPUT_EVENT.RETREAT,
        power: 1,
        ts: performance.now(),
        source: SOURCE.CONTROLLER,
      });
    },
    endStep(dir) {
      listeners.action?.({
        type: dir === STEP.ADVANCE ? INPUT_EVENT.ADVANCE : INPUT_EVENT.RETREAT,
        power: 0,
        ts: performance.now(),
        source: SOURCE.CONTROLLER,
      });
    },

    /** 탭 버튼 모드에서 쓰는 수동 경로. 센서 없이도 경기가 성립한다. */
    tapThrust() {
      listeners.action?.({ type: INPUT_EVENT.THRUST, power: 1, ts: performance.now(), source: SOURCE.CONTROLLER });
    },
    tapGuard(on) {
      listeners.action?.({
        type: on ? INPUT_EVENT.GUARD_ON : INPUT_EVENT.GUARD_OFF,
        power: on ? 1 : 0,
        ts: performance.now(),
        source: SOURCE.CONTROLLER,
      });
    },

    getSupport() {
      return motion.getSupport();
    },
    getConfig() {
      return motion.getConfig();
    },
    /** 캘리브레이션 기준 자세. MSG.CALIB이 싣는 값이다. */
    getBaseline() {
      return orientation.getBaseline();
    },
    getHz() {
      return orientation.getHz();
    },
    wakeHeld() {
      return wake.held();
    },
    isGuarding() {
      return motion.isGuarding();
    },
  };
}

export { SUPPORT };
