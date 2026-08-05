// 책임: 판정 시나리오 셀프테스트. 테스트 러너 의존성 없이 순수 함수만 돌린다.
// dev에서만 콘솔로 결과를 낸다. 프로덕션 번들에서는 import.meta.env.DEV 가드로 죽는다.

import {
  RULES,
  OUTCOME,
  OWNER,
  AI_MODE,
  ATTACK_KIND,
  LAMP,
  MISS_REASON,
  PISTE,
  SCORE_REASON,
  createJudgeState,
  moveOpponent,
  movePlayer,
  pisteWarning,
  resolvePisteOut,
  resolveThrust,
  resolveTelegraphEnd,
  inValidRange,
} from './judge.js';
import { createEngine } from './engine.js';
import { EV, PHASE } from './machine.js';
import { INPUT } from './input.js';
import { getSchool, lockoutOf, createSchoolScheduler } from './opponents.js';
import { createRng } from './rng.js';
import { SCHOOL } from '../../../shared/protocol.js';

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

/**
 * 시나리오 13종. 사양의 검증 항목과 1:1이다. D3에서 런지 2종, R3에서 피스트와 락아웃 2종,
 * AI-유파에서 헝가리안 계열/고FEINT, MIXED 전환 결정성, 유파 선택 진입점 3종이 붙었다.
 */
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

  results.push(
    scenario('런지 유효 범위 확장', () => {
      const s = createJudgeState({ d: 33 });
      s.ai.mode = AI_MODE.RECOVER;
      expect(!inValidRange(s.d), 'd 33은 보통 찌르기의 유효 범위 밖이어야 한다');
      expect(inValidRange(s.d, true), 'd 33은 런지의 유효 범위 안이어야 한다');
      const plain = resolveThrust(s, 5000);
      expect(plain.reason === MISS_REASON.OUT_OF_RANGE, '보통 찌르기는 거리 밖');
      const lunged = resolveThrust(s, 5000, { lunge: true });
      expect(lunged.outcome === OUTCOME.HIT, '런지는 회복 중인 상대에게 닿는다');
      // 가까운 쪽 상한은 넓히지 않는다
      const near = createJudgeState({ d: 58 });
      near.ai.mode = AI_MODE.RECOVER;
      expect(resolveThrust(near, 5000, { lunge: true }).reason === MISS_REASON.OUT_OF_RANGE, '런지도 상한은 그대로');
      return `${RULES.LUNGE_VALID_MIN}~${RULES.VALID_MAX} 대 ${RULES.VALID_MIN}~${RULES.VALID_MAX}`;
    })
  );

  results.push(
    scenario('런지 쿨다운', () => {
      const s = createJudgeState({ d: 45 });
      s.ai.mode = AI_MODE.RECOVER;
      s.lastThrustAt = 1000;
      s.thrustCooldownMs = RULES.LUNGE_COOLDOWN_MS;
      const tooSoon = resolveThrust(s, 1000 + RULES.THRUST_COOLDOWN_MS);
      expect(tooSoon.reason === MISS_REASON.COOLDOWN, '런지 뒤에는 보통 쿨다운으로 못 푼다');
      const ok = resolveThrust(s, 1000 + RULES.LUNGE_COOLDOWN_MS);
      expect(ok.outcome === OUTCOME.HIT, '런지 쿨다운 경과 후 정상 판정');
      expect(RULES.LUNGE_COOLDOWN_MS > RULES.THRUST_COOLDOWN_MS, '런지 쿨다운이 더 길어야 한다');
      return `${RULES.THRUST_COOLDOWN_MS}ms 대 ${RULES.LUNGE_COOLDOWN_MS}ms`;
    })
  );

  results.push(
    scenario('후방 경계 실점', () => {
      const step = -RULES.STEP_PER_SEC / 60;   // 매 프레임 후퇴 한 칸
      const s = createJudgeState();
      expect(resolvePisteOut(s) === null, '앙가르드 라인에서는 실점이 없다');
      expect(pisteWarning(s).me === false, '시작은 경고선 밖이다');

      // 계속 물러나면 뒤가 소진된다. 1.3 m/s로 5m라 3.85초다
      let warnAt = -1;
      for (let i = 0; i < 60 * 5; i += 1) {
        movePlayer(s, step);
        if (warnAt < 0 && pisteWarning(s).me) warnAt = i;
        if (resolvePisteOut(s)) break;
      }
      const out = resolvePisteOut(s);
      expect(out !== null, '후방 경계를 넘으면 판정이 선다');
      expect(out.owner === OWNER.AI, '내가 밀려나면 상대 득점');
      expect(out.reason === SCORE_REASON.PISTE_OUT, `사유는 피스트 밖인데 ${out.reason}`);
      expect(out.reason.length <= 6, '판정 사유는 6자 이내');
      expect(warnAt > 0, '경계 전에 경고선을 지난다');

      // 반대쪽도 성립한다. AI를 뒤로 몰면 내 득점이다
      const a = createJudgeState();
      for (let i = 0; i < 60 * 5 && !resolvePisteOut(a); i += 1) moveOpponent(a, step);
      const mine = resolvePisteOut(a);
      expect(mine && mine.owner === OWNER.ME, 'AI를 라인 밖으로 몰면 내 득점');
      return `${PISTE.ME_START}m 소진 ${(warnAt / 60).toFixed(2)}초에 경고선, 양방향 성립`;
    })
  );

  results.push(
    scenario('유파별 동시타 락아웃', () => {
      // 유파 파라미터는 호출자가 넘긴다. judge는 유파를 모른다
      const SABER = { lockoutMs: 170, doubleTouch: false };
      const EPEE = { lockoutMs: 40, doubleTouch: true };
      const attacked = (score) => {
        const s = createJudgeState({ d: 45 });
        s.ai.mode = AI_MODE.TELEGRAPH;
        s.ai.kind = ATTACK_KIND.REAL;
        s.guarding = false;
        s.counterAt = 1000;
        if (score) s.score = score;
        return s;
      };

      // 세이버는 우선권 종목이라 동시 개시가 무득점이다
      const sim = resolveTelegraphEnd(attacked(), 1000 + SABER.lockoutMs - 1, SABER);
      expect(sim.points === 0 && !sim.aiPoints, '시뮬타네는 아무도 못 가져간다');
      expect(sim.reason === SCORE_REASON.SIMULTANEOUS, `사유는 시뮬타네인데 ${sim.reason}`);
      expect(sim.lamp === LAMP.BOTH, '양쪽 램프가 켜진다');

      // 창을 벗어나면 평소대로 내가 맞는다
      const late = resolveTelegraphEnd(attacked(), 1000 + SABER.lockoutMs + 1, SABER);
      expect(late.owner === OWNER.AI && late.points === RULES.HIT_POINTS, '창 밖은 단일 실점');

      // 에페는 우선권이 없어 양쪽 다 가져간다
      const dbl = resolveTelegraphEnd(attacked(), 1000 + EPEE.lockoutMs - 1, EPEE);
      expect(dbl.outcome === OUTCOME.HIT, '더블도 명중이다');
      expect(dbl.points === RULES.HIT_POINTS && dbl.aiPoints === RULES.HIT_POINTS, '더블은 양쪽 1점');
      expect(dbl.reason === SCORE_REASON.DOUBLE, `사유는 더블 투셰인데 ${dbl.reason}`);

      // 창 길이가 유파 차이를 만든다. 세이버면 동시타였을 100ms가 에페에서는 단일 실점이다
      const single = resolveTelegraphEnd(attacked(), 1100, EPEE);
      expect(single.owner === OWNER.AI, '에페 창 40ms 밖은 단일 실점');

      // 동점 매치포인트의 더블은 무효다(실룰 null and void)
      const mp = RULES.MATCH_POINT - 1;
      const voided = resolveTelegraphEnd(attacked({ me: mp, ai: mp }), 1000 + EPEE.lockoutMs - 1, EPEE);
      expect(voided.points === 0 && !voided.aiPoints, '매치포인트 더블은 점수가 없다');
      expect(voided.reason === SCORE_REASON.DOUBLE_VOID, `사유는 더블 무효인데 ${voided.reason}`);
      return `세이버 ${SABER.lockoutMs}ms 시뮬타네 / 에페 ${EPEE.lockoutMs}ms 더블, ${mp}-${mp} 더블 무효`;
    })
  );

  results.push(
    scenario('헝가리안 유파 계열과 고FEINT', () => {
      const h = getSchool('hungarian');
      const saber = getSchool('italian-saber');
      const epee = getSchool('french-epee');
      expect(h.key === 'hungarian', '헝가리안 유파가 존재해야 한다');
      // 심리전형: FEINT 비율과 거리 흔들기가 3유파 중 최고
      expect(h.feintRatio > saber.feintRatio && h.feintRatio > epee.feintRatio, 'FEINT 비율은 3유파 중 최고');
      expect(h.stepFeintChance >= saber.stepFeintChance && h.stepFeintChance >= epee.stepFeintChance, '거리 흔들기 최고');
      // 템포 브레이크: 매 공격 구간 전환(shiftEvery 1)이 셋 중 가장 잦다
      expect(h.tempoShiftEvery <= saber.tempoShiftEvery && h.tempoShiftEvery <= epee.tempoShiftEvery, '템포 전환 최다');
      // 라다엘리 사브르 계승 → 세이버 계열 락아웃(170ms 시뮬타네)
      expect(h.family === 'sabre', '헝가리안은 사브르 계열');
      const lk = lockoutOf(h);
      expect(lk.lockoutMs === 170 && lk.doubleTouch === false, '사브르 계열은 170ms 시뮬타네');
      expect(lockoutOf(epee).lockoutMs === 40 && lockoutOf(epee).doubleTouch === true, '에페 계열은 40ms 더블');
      // 고FEINT 대응: 페인트를 읽어내면 명중(4분기 그대로)
      const s = createJudgeState({ d: 45 });
      s.ai = { mode: AI_MODE.TELEGRAPH, kind: ATTACK_KIND.FEINT, until: 0, nextAttackAt: 0 };
      expect(resolveThrust(s, 1000).outcome === OUTCOME.HIT, '페인트 판독은 명중');
      return `feint 세이버 ${saber.feintRatio} < 에페 ${epee.feintRatio} < 헝가리안 ${h.feintRatio}, 계열 sabre 170ms`;
    })
  );

  results.push(
    scenario('MIXED 전환 결정성', () => {
      const seq = (seed) => {
        const sc = createSchoolScheduler(SCHOOL.MIXED, createRng(seed));
        const out = [sc.school.styleName];
        for (let i = 0; i < 6; i += 1) {
          sc.advance();
          out.push(sc.school.styleName);
        }
        return out;
      };
      const a = seq(20260802);
      const b = seq(20260802);
      expect(JSON.stringify(a) === JSON.stringify(b), '같은 시드는 같은 전환 순서를 낸다');
      // 직전과 다른 유파 우선: 연속 동일 없음
      for (let i = 1; i < a.length; i += 1) expect(a[i] !== a[i - 1], '연속 동일 스타일이 없어야 한다');
      // 강화(+@): 통합 프로필이 원본보다 페인트를 더 내고 간격이 더 짧다. key는 스프레드로 보존된다
      const sc = createSchoolScheduler(SCHOOL.MIXED, createRng(20260802));
      const base = getSchool(sc.school.key);
      expect(sc.school.feintRatio >= base.feintRatio, '통합 모드는 페인트를 원본 이상으로 낸다');
      expect(sc.school.tempoBands[0].min < base.tempoBands[0].min, '통합 모드는 공격 간격이 더 짧다');
      expect(sc.school.name.startsWith('MIXED'), '통합 모드 이름은 MIXED로 시작한다');
      return `전환 ${a.join('>')}`;
    })
  );

  results.push(
    scenario('유파 선택 진입점', () => {
      const startSchool = (school) => {
        const e = createEngine({ seed: 20260802, school, onPublish: null });
        e.send(EV.START_KEYBOARD);
        return e.snapshot().school;
      };
      expect(startSchool(SCHOOL.SABRE).key === 'italian-saber', 'sabre 선택은 이탈리아 세이버');
      expect(startSchool(SCHOOL.EPEE).key === 'french-epee', 'epee 선택은 프랑스 에페');
      expect(startSchool(SCHOOL.HUNGARIAN).key === 'hungarian', 'hungarian 선택은 헝가리안');
      expect(startSchool(SCHOOL.MIXED).name.startsWith('MIXED'), 'mixed 선택은 통합 모드');
      // 미지정은 시드로 뽑는다(기본 경로 = 기준 서명 경로). 시드 20260802는 세이버를 뽑는다
      expect(startSchool(undefined).key === 'italian-saber', '미지정은 시드로 뽑는다(세이버)');
      return 'sabre/epee/hungarian/mixed/default 진입점 확인';
    })
  );

  return results;
}

/**
 * 기준 서명. 같은 시드와 같은 대본이 같은 경기를 내는지 보는 회귀 가드다.
 *
 * **D3, R3, AI-유파에서 갱신했다.** 의도적 게임플레이 변경이므로 서명이 바뀌는 것이 정상이다.
 * 절차: 변경 전 그린 확인 → 변경 → 같은 시드 2회 동일 확인 → 새 서명 채택.
 *
 * **AI-유파 변경분(이 트랙, 1회 갱신):** 헝가리안 유파 신설과 통합 모드 MIXED.
 * 직전 R3 서명은 길이 205 / 해시 ef4b27d5 / 꼬리 `JUDGE:6-1:51.833#6-1#ME`였다.
 * R3 서명은 기본 경로(시드가 뽑는 세이버) 한 판만 봤는데, 시드 20260802의 첫 난수가
 * 유파 2종에서도 3종에서도 세이버를 뽑아 헝가리안이 서명 밖에 통째로 있었다.
 * 그래서 이번에 **서명이 진입점의 네 모드(sabre/epee/hungarian/mixed)와 기본 경로를
 * 전부 대본에 태워 하나로 합치게** 바꿨다(runDeterminismCheck 참조). 새 유파가 바뀌면 이제 잡힌다.
 *
 * R3 이전(D3): 길이 244 / 해시 8c2f910. 대본 앞부분은 AI가 갈리기 전이라 접두만 보는 가드는
 * 회귀를 놓친다. 그래서 길이와 해시와 꼬리를 함께 박고, 이제 모드별 트레이스까지 접붙였다.
 */
export const BASELINE = {
  length: 1097,
  hash: 'c820d0f2',
  tail: 'GARDE:4-0:45.250#5-0#ME',
};

function signatureHash(sig) {
  let h = 0;
  for (let i = 0; i < sig.length; i += 1) h = (h * 31 + sig.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

/**
 * 결정성 확인. 같은 시드와 같은 입력 대본으로 두 번 돌려 서명이 같아야 한다.
 * 실시간 입력이 아니라 고정 스텝 대본이므로 재현이 성립한다.
 */
export function runDeterminismCheck(seed = 20260802) {
  function play(school) {
    const engine = createEngine({ seed, school, onPublish: null });
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

  // **네 유파 + 기본 경로를 한 서명에 접붙인다.** 유파 하나가 바뀌어도 서명이 잡는다.
  // D3의 교훈: 기본 경로만 보는 서명은 새 유파를 뽑지 못해(시드가 세이버를 뽑는다) 가드가
  // 그 유파를 통째로 놓친다. 그래서 진입점의 네 모드를 전부 대본에 태워 하나로 합친다.
  const MODES = [undefined, SCHOOL.SABRE, SCHOOL.EPEE, SCHOOL.HUNGARIAN, SCHOOL.MIXED];
  const whole = () => MODES.map((m) => `${m ?? 'default'}=${play(m)}`).join('||');

  const a = whole();
  const b = whole();
  const hash = signatureHash(a);
  return {
    pass: a === b,
    signatureLength: a.length,
    hash,
    sample: a.slice(0, 80),
    tail: a.slice(-BASELINE.tail.length),
    matchesBaseline: a.length === BASELINE.length && hash === BASELINE.hash && a.endsWith(BASELINE.tail),
  };
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
  console.log(`기준 서명  일치: ${det.matchesBaseline}  (길이 ${det.signatureLength}, 해시 ${det.hash}, 꼬리 ${det.tail})`);
  console.groupEnd();

  return { results, determinism: det };
}
