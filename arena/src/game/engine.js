// 책임: 상태머신과 판정과 입력을 하나로 묶는 게임 본체. 렌더와 DOM은 모른다.
// 시계는 팽창된 로직 시계 하나만 쓴다(쿨다운과 윈도우가 팽창의 영향을 같이 받아야 한다).
// 여기서 Math.random을 부르지 마라. 전부 주입된 rng를 쓴다.

import { motion } from '../tokens.js';
import { createRng } from './rng.js';
import { createMachine, EV, PHASE } from './machine.js';
import { createInputQueue, INPUT } from './input.js';
import { stepOpponent, lockoutOf, createSchoolScheduler } from './opponents.js';
import {
  RULES,
  OUTCOME,
  OWNER,
  AI_MODE,
  ATTACK_KIND,
  MISS_REASON,
  createJudgeState,
  resolveThrust,
  resolveTelegraphEnd,
  resolvePisteOut,
  resetPositions,
  movePlayer,
  pisteWarning,
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
 * @param school 유파 선택값(protocol SCHOOL). 미지정이면 시드로 뽑는다(기준 서명 경로).
 *   'mixed'면 득점마다 유파를 갈아타는 통합 모드다. 이 인자가 경기 진입의 단일 창구다.
 */
export function createEngine({ seed = 20260802, onPublish, reducedMotion = false, school: schoolSel } = {}) {
  const rng = createRng(seed);
  const input = createInputQueue();
  // 유파 결정은 스케줄러 하나로 모은다. mixed면 라운드마다 갈아타고, 아니면 고정이다.
  const scheduler = createSchoolScheduler(schoolSel, rng);
  let school = scheduler.school;
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
      // 램프는 판정 결과가 쥔다. 좌 red가 나, 우 blue가 상대다(R3-2)
      lamp: lastResult?.lamp ?? null,
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
    // 더블 투셰. 양쪽이 함께 가져간다(R3-2). 에페에만 성립한다
    if (result.aiPoints > 0) state.score.ai += result.aiPoints;

    // 통합 모드는 라운드(득점)마다 유파를 갈아탄다. 고정/기본 모드에서는 no-op(rng 무소비)이라
    // 기준 서명이 이 갈래에 영향받지 않는다. 다음 교환부터 새 유파의 케이던스와 계열을 쓴다.
    if (result.points > 0 || result.aiPoints > 0) {
      if (scheduler.advance()) {
        school = scheduler.school;
        view.school = school;
      }
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
    //
    // **맞불(상대 공격)도 같은 이유로 멈추지 않는다(R3-2).** 상대 공격이 아직 날아오는 중인데
    // 여기서 phase를 세우면 그 공격이 JUDGE 800ms + SCORE 420ms 뒤로 밀린다.
    // 그러면 락아웃 창(세이버 170ms, 에페 40ms)이 **구조적으로 닫혀** 동시타가 영원히 안 난다.
    // 실측으로 확인했다. 판정 4분기의 의미(맞불은 헛침)는 그대로고 진행만 이어진다.
    if (result.outcome === OUTCOME.PARRY || result.reason === MISS_REASON.INTO_ATTACK) {
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
    // **d를 직접 더하지 않는다.** 같은 변화량을 내 위치에 실어 d가 두 위치의 간격에서 유도되게 한다(R3-1).
    // 경계에 닿지 않는 한 이 경로는 `state.d += move * STEP_PER_SEC * dtSec`와 같은 값을 낸다.
    movePlayer(state, move * RULES.STEP_PER_SEC * dtSec);

    const telegraphEnded = stepOpponent(state, school, clockMs, dtSec, rng);
    view.d = state.d;
    view.aiMode = state.ai.mode;
    view.aiKind = state.ai.kind;

    // 후방 경계 실점. 위치가 경계에 물려 있으므로 판정 직후 앙가르드로 되돌린다
    const out = resolvePisteOut(state);
    if (out) {
      resetPositions(state);
      view.d = state.d;
      applyResult(out);
      return;
    }

    // 이산 입력 처리
    for (const ev of input.drain()) {
      if (ev.kind !== INPUT.THRUST) continue;
      // 전진을 홀드한 채 찌르면 런지다. 새 키를 만들지 않는다(ARENA_INPUT 이산 채널 유지).
      const lunge = input.isHeld(INPUT.ADVANCE);
      const result = resolveThrust(state, clockMs, { lunge });
      if (result.reason === MISS_REASON.COOLDOWN) continue; // 쿨다운은 판정 연출 없이 무시한다
      // 진짜 공격에 맞불을 놓은 시각을 남긴다. 상대 공격이 닿을 때 동시타 창으로 다시 본다(R3-2)
      if (result.reason === MISS_REASON.INTO_ATTACK) state.counterAt = clockMs;
      state.lastThrustAt = clockMs;
      state.thrustCooldownMs = lunge ? RULES.LUNGE_COOLDOWN_MS : RULES.THRUST_COOLDOWN_MS;
      view.meLunge = 1;
      view.meLungeDeep = lunge;
      applyResult(result);
      return;
    }

    if (telegraphEnded) {
      const kind = state.ai.kind;
      // 유파 계열의 락아웃 창을 넘긴다. judge는 유파도 계열도 모르고 창 길이와 더블 인정 여부만 본다
      const result = resolveTelegraphEnd(state, clockMs, lockoutOf(school));
      // 이번 공격에 대한 맞불 기록은 여기서 소진한다. 다음 공격으로 넘기지 않는다
      state.counterAt = -Infinity;
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
        scheduler.reset();
        school = scheduler.school;
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
    /**
     * 피스트 위치와 경고선 진입 여부. **HUD 전용 폴링 창구다.**
     * 렌더러가 읽는 view에는 넣지 않는다. 읽기 필드 11개를 그대로 유지하기 위해서다
     * (ARENA_SCENE 1절). DistanceGauge의 getD와 같은 방식이다.
     */
    getPiste() {
      const warn = pisteWarning(state);
      return { me: state.mePos, ai: state.aiPos, warnMe: warn.me, warnAi: warn.ai };
    },
  };
}
