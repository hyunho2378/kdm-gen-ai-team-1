// 책임: 상태머신과 판정과 입력을 하나로 묶는 게임 본체. 렌더와 DOM은 모른다.
// 시계는 팽창된 로직 시계 하나만 쓴다(쿨다운과 윈도우가 팽창의 영향을 같이 받아야 한다).
// 여기서 Math.random을 부르지 마라. 전부 주입된 rng를 쓴다.

import { motion } from '../tokens.js';
import { createRng } from './rng.js';
import { createMachine, EV, PHASE } from './machine.js';
import { createInputQueue, INPUT } from './input.js';
import { pickSchool, stepOpponent } from './opponents.js';
import {
  RULES,
  OUTCOME,
  OWNER,
  AI_MODE,
  ATTACK_KIND,
  MISS_REASON,
  createJudgeState,
  clampD,
  resolveThrust,
  resolveTelegraphEnd,
  isSuccess,
  shouldDilate,
  matchWinner,
} from './judge.js';

const JUDGE_MS = motion.duration.judge;
const SCORE_MS = 420;

/**
 * @param seed 정수. 같은 시드와 같은 입력 순서는 같은 경기를 만든다
 * @param onPublish 이산 상태 변화 알림(phase, score, judge 등). 프레임마다 부르지 않는다
 * @param reducedMotion true면 시간 팽창을 끈다
 */
export function createEngine({ seed = 20260802, onPublish, reducedMotion = false } = {}) {
  const rng = createRng(seed);
  const input = createInputQueue();
  let school = pickSchool(rng);
  let state = createJudgeState();

  // 팽창된 로직 시계. update가 받은 dt를 누적한다. performance.now를 쓰지 않는다.
  let clockMs = 0;
  let phaseTimer = 0;
  let lastResult = null;
  let winner = null;
  let dilationTrigger = null;
  let judgeUntil = 0;   // 판정 문구 표시 종료 시각(로직 시계)
  let judgeShown = false;
  const fxQueue = [];

  // 렌더러가 읽는 시각 상태. 판정에 영향을 주지 않는다.
  const view = {
    d: state.d,
    phase: PHASE.IDLE,
    aiMode: AI_MODE.IDLE,
    aiKind: null,
    meLunge: 0,      // 0~1 찌르기 진행
    meLungeDeep: false, // 이번 찌르기가 런지인가(더 깊은 뻗기 프리셋)
    aiLunge: 0,
    meGuard: false,
    hitFlash: 0,     // 0~1 명중 섬광 감쇠
    hitOwner: null,
    dilation: 0,     // 0~1 팽창 강도
    school,
  };

  const machine = createMachine({
    initial: PHASE.IDLE,
    hooks: {
      [PHASE.EN_GARDE]: {
        enter() {
          phaseTimer = 0;
          lastResult = null;
        },
      },
      [PHASE.JUDGE]: {
        enter() {
          phaseTimer = 0;
        },
      },
      [PHASE.SCORE]: {
        enter() {
          phaseTimer = 0;
        },
      },
    },
    onChange: () => publish(),
  });

  function publish() {
    view.phase = machine.phase;
    onPublish?.(snapshot());
  }

  function snapshot() {
    return {
      phase: machine.phase,
      score: { ...state.score },
      result: lastResult,
      winner,
      school,
      seed,
      showJudge: clockMs < judgeUntil,
      dilating: clockMs < state.dilation.activeUntil,
      keyboardMode: true,
    };
  }

  /** C4에서 웹캠 지표를 꽂는 자리. null이면 성공률 근사로 판단한다. */
  function setDilationTrigger(fn) {
    dilationTrigger = fn;
  }

  function beginExchange() {
    if (machine.phase === PHASE.EN_GARDE) machine.send(EV.ENGAGE);
  }

  function applyResult(result) {
    lastResult = result;
    // 렌더 연출 큐. 판정과 그리기를 분리해 둔다(engine은 캔버스를 모른다)
    fxQueue.push({ outcome: result.outcome, owner: result.owner });
    if (result.points > 0) {
      if (result.owner === OWNER.ME) state.score.me += result.points;
      else state.score.ai += result.points;
    }
    if (result.counted) state.form.push(isSuccess(result));
    if (result.opensRiposte) state.riposteUntil = clockMs + RULES.RIPOSTE_WINDOW_MS;
    else state.riposteUntil = 0;

    if (result.outcome === OUTCOME.HIT || result.outcome === OUTCOME.RIPOSTE) {
      view.hitFlash = 1;
      view.hitOwner = result.owner;
    }

    judgeUntil = clockMs + JUDGE_MS;

    // 패리는 경기를 멈추지 않는다. JUDGE와 SCORE를 거치면 1200ms가 흘러
    // 600ms 리포스트 윈도우가 열리자마자 죽는다. 판정 문구만 띄우고 계속 싸운다.
    if (result.outcome === OUTCOME.PARRY) {
      publish();
      return;
    }

    beginExchange();
    machine.send(EV.RESOLVED);
  }

  function maybeDilate() {
    if (reducedMotion) return;
    const extra = dilationTrigger ? dilationTrigger() : null;
    if (!shouldDilate(state, clockMs, extra)) return;
    state.dilation.activeUntil = clockMs + motion.timeDilation.maxMs;
    state.dilation.cooldownUntil = clockMs + motion.timeDilation.cooldownMs;
  }

  function update(dtSec) {
    const phase = machine.phase;
    const live = phase === PHASE.EN_GARDE || phase === PHASE.EXCHANGE;

    clockMs += dtSec * 1000;
    phaseTimer += dtSec * 1000;

    // 판정 문구 표시가 꺼지는 순간에만 알린다. 프레임마다 publish하지 않는다.
    const judgeNow = clockMs < judgeUntil;
    if (judgeNow !== judgeShown) {
      judgeShown = judgeNow;
      publish();
    }

    // 팽창 종료
    if (view.dilation > 0 && clockMs >= state.dilation.activeUntil) {
      view.dilation = Math.max(0, view.dilation - dtSec * 4);
    }

    if (phase === PHASE.JUDGE && phaseTimer >= JUDGE_MS) {
      machine.send(EV.JUDGE_DONE);
      return;
    }
    if (phase === PHASE.SCORE && phaseTimer >= SCORE_MS) {
      winner = matchWinner(state.score);
      if (winner) machine.send(EV.MATCH_OVER);
      else machine.send(EV.SCORE_DONE);
      return;
    }

    // 명중 섬광 감쇠는 어느 phase에서나 돈다
    if (view.hitFlash > 0) view.hitFlash = Math.max(0, view.hitFlash - dtSec * 1.6);
    if (view.meLunge > 0) {
      view.meLunge = Math.max(0, view.meLunge - dtSec * 3.2);
      if (view.meLunge === 0) view.meLungeDeep = false;
    }
    if (view.aiLunge > 0) view.aiLunge = Math.max(0, view.aiLunge - dtSec * 3.2);

    if (!live) {
      input.drain();
      return;
    }

    // 홀드 입력이 간합을 움직인다. 전진 +, 후퇴 -
    let move = 0;
    if (input.isHeld(INPUT.ADVANCE)) move += 1;
    if (input.isHeld(INPUT.RETREAT)) move -= 1;
    state.guarding = input.isHeld(INPUT.GUARD);
    view.meGuard = state.guarding;
    state.d += move * RULES.STEP_PER_SEC * dtSec;

    const telegraphEnded = stepOpponent(state, school, clockMs, dtSec, rng);
    state.d = clampD(state.d);
    view.d = state.d;
    view.aiMode = state.ai.mode;
    view.aiKind = state.ai.kind;

    // 이산 입력 처리
    for (const ev of input.drain()) {
      if (ev.kind !== INPUT.THRUST) continue;
      // 전진을 홀드한 채 찌르면 런지다. 새 키를 만들지 않는다(ARENA_INPUT 이산 채널 유지).
      const lunge = input.isHeld(INPUT.ADVANCE);
      const result = resolveThrust(state, clockMs, { lunge });
      if (result.reason === MISS_REASON.COOLDOWN) continue; // 쿨다운은 판정 연출 없이 무시한다
      state.lastThrustAt = clockMs;
      state.thrustCooldownMs = lunge ? RULES.LUNGE_COOLDOWN_MS : RULES.THRUST_COOLDOWN_MS;
      view.meLunge = 1;
      view.meLungeDeep = lunge;
      applyResult(result);
      return;
    }

    if (telegraphEnded) {
      const kind = state.ai.kind;
      const result = resolveTelegraphEnd(state);
      if (kind === ATTACK_KIND.REAL) {
        view.aiLunge = 1;
        maybeDilate();
        if (clockMs < state.dilation.activeUntil) view.dilation = 1;
      }
      if (result) {
        applyResult(result);
        return;
      }
      // FEINT는 무페널티 통과. 판정 연출도 점수도 없다.
    }
  }

  function getTimeScale() {
    return clockMs < state.dilation.activeUntil ? motion.timeDilation.scale : 1;
  }

  function reset({ keepScore = false } = {}) {
    const keptScore = keepScore ? { ...state.score } : null;
    state = createJudgeState();
    if (keptScore) state.score = keptScore;
    clockMs = 0;
    phaseTimer = 0;
    judgeUntil = 0;
    judgeShown = false;
    lastResult = null;
    winner = null;
    view.hitFlash = 0;
    view.meLunge = 0;
    view.meLungeDeep = false;
    view.aiLunge = 0;
    view.dilation = 0;
    view.d = state.d;
    fxQueue.length = 0;
    input.clear();
  }

  return {
    input,
    view,
    update,
    getTimeScale,
    snapshot,
    setDilationTrigger,
    /** 렌더 연출 큐를 비우며 돌려준다. GameCanvas가 프레임마다 부른다. */
    drainFx() {
      if (fxQueue.length === 0) return [];
      return fxQueue.splice(0, fxQueue.length);
    },
    send(event) {
      if (event === EV.REMATCH || event === EV.RESET) {
        reset();
        school = pickSchool(rng);
        view.school = school;
      }
      machine.send(event);
    },
    /** F9. 어느 phase에서든 키보드 경기로 꽂는다. */
    forceKeyboard() {
      if (machine.phase === PHASE.EN_GARDE || machine.phase === PHASE.EXCHANGE) return;
      reset();
      machine.force(PHASE.EN_GARDE);
    },
    get phase() {
      return machine.phase;
    },
    getD() {
      return state.d;
    },
  };
}
