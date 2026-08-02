// 책임: 판정 시나리오 셀프테스트. 테스트 러너 의존성 없이 순수 함수만 돌린다.
// dev에서만 콘솔로 결과를 낸다. 프로덕션 번들에서는 import.meta.env.DEV 가드로 죽는다.

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
  inValidRange,
} from './judge.js';
import { createEngine } from './engine.js';
import { EV, PHASE } from './machine.js';
import { INPUT } from './input.js';

function scenario(name, fn) {
  try {
    const detail = fn();
    return { name, pass: true, detail: detail ?? '' };
  } catch (err) {
    return { name, pass: false, detail: err.message };
  }
}

function expect(cond, message) {
  if (!cond) throw new Error(message);
}

/** 시나리오 6종. 사양의 검증 항목과 1:1이다. */
export function runJudgeSelftest() {
  const results = [];

  results.push(
    scenario('유효 거리 명중', () => {
      const s = createJudgeState({ d: 45 });
      expect(inValidRange(s.d), 'd 45는 유효 범위여야 한다');
      // 상대가 공격을 내지른 직후(RECOVER)가 정석 득점 창이다
      s.ai = { mode: AI_MODE.RECOVER, kind: null, until: 0, nextAttackAt: 0 };
      const r = resolveThrust(s, 1000);
      expect(r.outcome === OUTCOME.HIT, `명중이어야 하는데 ${r.outcome}`);
      expect(r.points === RULES.HIT_POINTS, '명중은 1점');

      // 대치 중에는 같은 거리라도 막힌다
      const idle = createJudgeState({ d: 45 });
      const blocked = resolveThrust(idle, 1000);
      expect(blocked.outcome === OUTCOME.MISS && blocked.reason === MISS_REASON.BLOCKED, '대치 중 찌르기는 막힘');
      expect(blocked.reason.length <= 6, '헛침 사유는 6자 이내');
      return `RECOVER → ${r.outcome} ${r.points}점, IDLE → ${blocked.reason}`;
    })
  );

  results.push(
    scenario('거리 밖 헛침', () => {
      const open = { mode: AI_MODE.RECOVER, kind: null, until: 0, nextAttackAt: 0 };
      const near = createJudgeState({ d: 20 });
      const far = createJudgeState({ d: 80 });
      near.ai = { ...open };
      far.ai = { ...open };
      const r1 = resolveThrust(near, 1000);
      const r2 = resolveThrust(far, 1000);
      expect(r1.outcome === OUTCOME.MISS && r1.reason === MISS_REASON.OUT_OF_RANGE, '가까워도 범위 밖이면 헛침');
      expect(r2.outcome === OUTCOME.MISS && r2.reason === MISS_REASON.OUT_OF_RANGE, '멀어도 범위 밖이면 헛침');
      expect(r1.reason.length <= 6, '헛침 사유는 6자 이내');
      return `d=20, d=80 → ${r1.reason}`;
    })
  );

  results.push(
    scenario('FEINT 무반응 통과', () => {
      const s = createJudgeState({ d: 45 });
      s.ai = { mode: AI_MODE.TELEGRAPH, kind: ATTACK_KIND.FEINT, until: 0, nextAttackAt: 0 };
      s.guarding = true; // 낚여서 헛가드한 상황
      const r = resolveTelegraphEnd(s);
      expect(r === null, 'FEINT는 판정 없이 통과해야 한다');
      expect(s.score.me === 0 && s.score.ai === 0, '페널티 없음');
      return '헛가드해도 무페널티';
    })
  );

  results.push(
    scenario('REAL 가드 패리', () => {
      const s = createJudgeState({ d: 45 });
      s.ai = { mode: AI_MODE.TELEGRAPH, kind: ATTACK_KIND.REAL, until: 0, nextAttackAt: 0 };
      s.guarding = true;
      const parry = resolveTelegraphEnd(s);
      expect(parry.outcome === OUTCOME.PARRY, `패리여야 하는데 ${parry.outcome}`);
      expect(parry.opensRiposte === true, '패리는 리포스트 윈도우를 연다');

      s.guarding = false;
      const hit = resolveTelegraphEnd(s);
      expect(hit.outcome === OUTCOME.HIT && hit.owner === OWNER.AI, '가드 없으면 실점');
      return `가드 → ${parry.outcome}, 무가드 → ${hit.owner} ${hit.outcome}`;
    })
  );

  results.push(
    scenario('리포스트 보너스', () => {
      const s = createJudgeState({ d: 90 }); // 거리 밖이어도 리포스트는 성립한다
      s.riposteUntil = 1000 + RULES.RIPOSTE_WINDOW_MS;
      const inWindow = resolveThrust(s, 1200);
      expect(inWindow.outcome === OUTCOME.RIPOSTE, `리포스트여야 하는데 ${inWindow.outcome}`);
      expect(inWindow.points === RULES.RIPOSTE_POINTS, '리포스트는 2점');

      const late = resolveThrust(s, 1000 + RULES.RIPOSTE_WINDOW_MS + 1);
      expect(late.outcome === OUTCOME.MISS, '윈도우 밖은 리포스트가 아니다');
      return `${RULES.RIPOSTE_WINDOW_MS}ms 안 ${inWindow.points}점, 밖 ${late.outcome}`;
    })
  );

  results.push(
    scenario('쿨다운 무시 확인', () => {
      const s = createJudgeState({ d: 45 });
      s.ai = { mode: AI_MODE.RECOVER, kind: null, until: 0, nextAttackAt: 0 };
      s.lastThrustAt = 1000;
      const tooSoon = resolveThrust(s, 1000 + RULES.THRUST_COOLDOWN_MS - 1);
      expect(tooSoon.outcome === OUTCOME.MISS && tooSoon.reason === MISS_REASON.COOLDOWN, '쿨다운 중이면 무효');
      expect(tooSoon.counted === false, '쿨다운은 교환 표본에 넣지 않는다');
      const ok = resolveThrust(s, 1000 + RULES.THRUST_COOLDOWN_MS);
      expect(ok.outcome === OUTCOME.HIT, '쿨다운 이후는 정상 판정');
      return `${RULES.THRUST_COOLDOWN_MS}ms 경계 동작`;
    })
  );

  return results;
}

/**
 * 결정성 확인. 같은 시드와 같은 입력 대본으로 두 번 돌려 서명이 같아야 한다.
 * 실시간 입력이 아니라 고정 스텝 대본이므로 재현이 성립한다.
 */
export function runDeterminismCheck(seed = 20260802) {
  function play() {
    const engine = createEngine({ seed, onPublish: null });
    engine.send(EV.START_KEYBOARD);
    const trace = [];
    // 6000 스텝 = 100초. 매 스텝 대본대로 입력을 넣는다.
    for (let i = 0; i < 6000; i += 1) {
      engine.input.setHeld(INPUT.ADVANCE, i % 120 < 40);
      engine.input.setHeld(INPUT.RETREAT, i % 120 >= 90);
      engine.input.setHeld(INPUT.GUARD, i % 47 < 12);
      if (i % 31 === 0) engine.input.push(INPUT.THRUST);
      engine.update(1 / 60);
      if (i % 100 === 0) {
        const s = engine.snapshot();
        trace.push(`${s.phase}:${s.score.me}-${s.score.ai}:${engine.getD().toFixed(3)}`);
      }
      if (engine.phase === PHASE.MATCH_END) break;
    }
    const s = engine.snapshot();
    return `${trace.join('|')}#${s.score.me}-${s.score.ai}#${s.winner ?? 'none'}`;
  }

  const a = play();
  const b = play();
  return { pass: a === b, signatureLength: a.length, sample: a.slice(0, 80) };
}

/** dev 콘솔 출력. App 마운트 시 한 번 부른다. */
export function reportSelftest() {
  const results = runJudgeSelftest();
  const passed = results.filter((r) => r.pass).length;
  const det = runDeterminismCheck();

  console.groupCollapsed(`[judge.selftest] 시나리오 ${passed}/${results.length} 통과, 결정성 ${det.pass ? '통과' : '실패'}`);
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`결정성  같은 시드 2회 서명 일치: ${det.pass}  (표본 ${det.sample})`);
  console.groupEnd();

  return { results, determinism: det };
}
