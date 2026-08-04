// 책임: three.js 1인칭 렌더러. ARENA_SCENE.md 사양을 구현한다.
//
// 규율. 게임 상태는 읽기만 한다(허용 필드 9개). 루프는 loop.js가 쥔다.
// react-three-fiber를 쓰지 않는다. 색은 tokens에서만 온다.
// V4a 범위는 씬 골격, V4b는 리본과 블룸, V4c는 상대 빌보드다. 명중 연출은 V4d에서 붙는다.

import * as THREE from 'three';
import { colors, motion } from '../../tokens.js';
import { AI_MODE, ATTACK_KIND, OUTCOME, OWNER } from '../judge.js';
import { thrustEase } from './canvas2d/geometry.js';
import { createComposer } from './three/post.js';
import { PARRY_LINE, POSE, TARGET, createOpponent } from './three/opponent.js';
import { attachSwordModel } from './three/swordModel.js';
import { createShake } from './three/shake.js';
import { createSparks } from './three/sparks.js';
import { createTrailRibbon } from './three/trail.js';
import {
  SWORD_POSES,
  createBackground,
  createCamera,
  createEnvironment,
  createLights,
  createSword,
  distFromD,
} from './three/scene.js';

// ARENA_SCENE 4절 사양값. 후처리는 전체 화면 렌더 타깃을 여러 장 잡으므로
// 실기 60fps가 안 나오면 감축 사다리에서 가장 먼저 내릴 후보이기도 하다.
const DPR_CAP = 2;
const BUDGET = motion.budget;

// 전진 포즈 진입과 이탈 문턱(초당 d 변화량). 히스테리시스가 없으면 포즈가 떤다.
const ADVANCE_IN = 12;
const ADVANCE_OUT = 6;

// 득점 플레어 감쇠 시간. JUDGE 800ms 안에서 다 죽는다.
// 레드는 사건의 색이라 평시 칼날에 상시로 얹지 않는다(DESIGN v2 색 규칙).
const FLARE_DECAY_SEC = motion.duration.judge / 1000;

/**
 * 명중 부위. 월드 높이로 근사한다.
 * 상대 키가 1.9m이므로 투구는 어깨 위, 몸통은 골반에서 어깨, 그 아래가 팔다리다.
 */
function bodyPart(y) {
  if (y > 1.55) return '투구';
  if (y > 0.95) return '몸통';
  return '팔다리';
}

/** 렌더 전용 난수. 판정은 이 값을 절대 보지 않는다(sparks.js와 같은 규율). */
function rand(ref) {
  ref.v = (ref.v * 1664525 + 1013904223) >>> 0;
  return ref.v / 4294967296;
}

/**
 * 키보드 한정 조준 변주 (E4). 찌르기마다 프리셋 호의 칼끝을 조금씩 다른 곳으로 민다.
 * 키보드는 프리셋 트윈이라 이것이 없으면 찌르기 호가 매번 완전히 같고 착탄도 한 점에 박힌다.
 *
 * 중앙값이 0이 아니라 +x인 것은 찌르기 프리셋의 칼끝이 그립보다 왼쪽에 있어
 * 그대로 상대 평면에 투영하면 착탄이 늘 몸 왼쪽에 몰리기 때문이다
 * (실측 -0.26m. 몸 반폭이 0.50m라 절반이 한쪽 끝에서 잘린다).
 * y를 아래로 치우친 것은 투구(1.55m) 문턱을 실제로 넘나들게 하기 위해서다.
 *
 * **C3에서 폰 쿼터니언이 검 자세를 쥐면 이 변주만 지우면 된다.**
 * 아래 착탄 투영식(그립에서 칼끝으로 뻗은 직선을 상대 평면까지 늘린다)은 그대로 남아
 * 그 순간부터 진짜 조준이 된다. 임시인 것은 이 변주 하나뿐이고 투영식은 미래 코드다.
 */
const AIM_JITTER_X = [-0.05, 0.21];
const AIM_JITTER_Y = [-0.22, 0.10];

/**
 * 상대 표적 성향 (E4). 유파마다 노리는 곳이 다르다. 세이버는 상단, 에페는 몸통이다.
 * **시각 스타일 전용이다.** `aiKind`와 같은 등급이고 타이밍이나 판정에 쓰지 않는다.
 * 가중 주머니라 뽑기 한 번이면 성향이 나온다.
 */
const TARGET_BIAS = {
  'italian-saber': [TARGET.HEAD, TARGET.HEAD, TARGET.CHEST, TARGET.FLANK],
  'french-epee': [TARGET.CHEST, TARGET.CHEST, TARGET.FLANK, TARGET.HEAD],
};
const TARGET_FALLBACK = [TARGET.HEAD, TARGET.CHEST, TARGET.FLANK];

/** 두 좌표를 섞는다. 프리셋 트윈의 최소 단위다. */
function lerp3(out, a, b, t) {
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
  return out;
}

export function createThreeRenderer() {
  let renderer = null;
  let scene = null;
  let camera = null;
  let sword = null;
  // 궤적이 읽는 검끝. 레이피어가 뜨기 전에는 박스 검의 마커다
  let swordTip = null;
  let rapier = null;
  let disposed = false;
  let background = null;
  let opponent = null;
  let canvas = null;
  let onLost = null;
  let post = null;
  let meTrail = null;
  let aiTrail = null;
  let sparks = null;
  let shake = null;
  let reducedMotion = false;
  // 화면 좌표가 필요한 연출은 DOM이 그린다. 렌더러는 좌표만 알려 준다(D4 리포스트 링, D5 FUI)
  let onFx = null;

  const camWorld = new THREE.Vector3();
  const gripWorld = new THREE.Vector3();
  const aimRay = new THREE.Vector3();
  const tipWorld = new THREE.Vector3();
  const aiTipWorld = new THREE.Vector3();
  const crossWorld = new THREE.Vector3();
  const hitWorld = new THREE.Vector3();
  const tmpProj = new THREE.Vector3();

  let w = 0;
  let h = 0;
  let fps = 60;

  // 득점 플레어 진행도. fx가 올리고 렌더가 깎는다
  let flare = 0;

  // 상대 상태 추적. 전부 렌더 전용이고 판정으로 돌아가지 않는다.
  let lastD = null;
  let dDot = 0;
  let advancing = false;
  let aiSampling = false;
  // E4 시각 시드. 착탄 변주, 상대 표적, 패리 받는 선을 여기서 뽑는다.
  // **engine의 rng를 쓰지 않는다.** 그 수열을 한 번이라도 당겨 쓰면 판정 결과가 통째로 달라진다.
  const seed = { v: 20260805 };
  let prevAiMode = null;
  let prevMeLunge = 0;
  // 이번 찌르기의 칼끝 변주(카메라 로컬). 찌르기 시작 순간 한 번 뽑는다
  let jitterX = 0;
  let jitterY = 0;

  // 연속 채널의 최신값. 판정에 쓰이지 않는다.
  let pose = { kind: 'preset', value: 'rest' };

  const tmpGrip = new THREE.Vector3();
  const tmpTip = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();
  // 검신이 뻗는 로컬 축. scene.js의 지오메트리 배치와 일치해야 한다.
  const BLADE_AXIS = new THREE.Vector3(0, 0, -1);

  /** 프리셋 사이 블렌드. 자세 선택은 pose, 진행도는 게임 상태가 준다. */
  function poseSword(gameState) {
    const guard = gameState.meGuard === true;
    const lunge = Math.min(1, Math.max(0, gameState.meLunge ?? 0));

    let a = SWORD_POSES.rest;
    let b = SWORD_POSES.rest;
    let t = 0;
    // 조준 변주가 실리는 정도. 뻗는 구간에서만 자라고 휴식과 가드에서는 0이다
    let reach = 0;

    if (guard) {
      b = SWORD_POSES.guard;
      t = 1;
    } else if (lunge > 0) {
      // 앞 30퍼센트는 와인드업으로 당겼다가 나머지에서 뻗는다. 비대칭이 찌르기의 인상을 만든다.
      const e = thrustEase(lunge);
      if (e < 0.3) {
        a = SWORD_POSES.rest;
        b = SWORD_POSES.windup;
        t = e / 0.3;
      } else {
        a = SWORD_POSES.windup;
        // 런지는 더 깊이 들어간다. meLungeDeep은 렌더 전용 표식이다
        b = gameState.meLungeDeep ? SWORD_POSES.lungeDeep : SWORD_POSES.thrust;
        t = (e - 0.3) / 0.7;
        reach = t;
      }
    }

    lerp3(tmpGrip, a.grip, b.grip, t);
    lerp3(tmpTip, a.tip, b.tip, t);
    // 찌르기마다 칼끝이 조금씩 다른 곳으로 간다. 그립은 그대로라 검이 겨냥을 바꾼 것으로 읽힌다.
    // 궤적 리본이 이 칼끝을 따라가므로 호 자체가 매번 달라진다(키보드 한정. 위 상수 주석 참조)
    tmpTip.x += jitterX * reach;
    tmpTip.y += jitterY * reach;

    sword.group.position.copy(tmpGrip);
    // lookAt을 쓰지 않는다. 비카메라 객체의 lookAt은 +z를 타깃으로 향하는데 검신은 -z로 뻗어 있고,
    // 인자를 월드 좌표로 해석해 카메라 자식인 이 그룹과 좌표계가 어긋난다(실측으로 검이 뒤집혔다).
    // 그룹이 카메라의 자식이라 로컬 공간이 곧 카메라 공간이므로 방향을 직접 계산한다.
    tmpDir.copy(tmpTip).sub(tmpGrip).normalize();
    sword.group.quaternion.setFromUnitVectors(BLADE_AXIS, tmpDir);

    // 컨트롤러가 붙으면(C3) 프리셋 회전을 쿼터니언으로 대체한다. 위치는 그립 그대로 둔다.
    if (pose.kind === 'quaternion') {
      const [x, y, z, wq] = pose.value;
      tmpQuat.set(x, y, z, wq);
      sword.group.quaternion.copy(tmpQuat);
    }
  }

  /**
   * 상대 포즈 선택. 읽기 허용 필드만 본다.
   * hitOwner가 ME면 내가 넣은 것이므로 맞은 쪽은 상대다(judge.js의 owner는 득점자다).
   */
  function pickPose(g) {
    if (g.hitFlash > 0 && g.hitOwner === OWNER.ME) return POSE.HIT;
    if ((g.aiLunge ?? 0) > 0.02) return POSE.LUNGE;
    if (g.aiMode === AI_MODE.TELEGRAPH) return POSE.TELEGRAPH;
    if (advancing) return POSE.ADVANCE;
    return POSE.IDLE;
  }

  return {
    id: 'three',
    label: '3D',

    init(mount, { dev = false, reduced = false, onContextLost } = {}) {
      onLost = onContextLost;
      reducedMotion = reduced;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      Object.assign(canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'block',
      });
      renderer.setClearColor(new THREE.Color(colors.bg.base), 1);
      // 기본값은 renderer.render마다 초기화라 컴포저를 거치면 마지막 패스 수치만 남는다.
      // 프레임 머리에서 직접 비우고 프레임 전체를 합산해야 드로우콜이 대리 지표가 된다.
      renderer.info.autoReset = false;
      mount.appendChild(canvas);

      // 컨텍스트 손실은 폴백 신호다. 삼켜서는 안 된다(PITFALLS 브라우저별 검증).
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        onLost?.();
      });

      scene = new THREE.Scene();
      camera = createCamera(1);
      // 카메라의 자식(내 검)이 렌더되려면 카메라 자체가 씬에 들어가야 한다.
      scene.add(camera);
      createLights(scene);
      // 환경맵이 먼저 서야 크롬 재질이 발색한다.
      createEnvironment(renderer, scene);
      background = createBackground(scene);
      sword = createSword(camera);
      swordTip = sword.tipMarker;
      opponent = createOpponent(scene, { tipDistance: sword.tipDistance });
      // 포즈 텍스처를 미리 올린다. 첫 표시 프레임의 업로드 히치를 개막 전으로 옮긴다
      opponent.prewarm(renderer);

      // 레이피어는 비동기다. 뜰 때까지 박스 검이 자리를 지키고, 실패해도 박스 검이 남는다.
      // 자세와 트윈은 sword.group 소관이라 교체 도중이어도 안전하다.
      // 내 검은 크롬 마감이다. 상대 검은 D2에서 같은 로더에 finish 'antique'로 붙는다.
      attachSwordModel(sword.group, {
        finish: 'chrome',
        flareColor: colors.trail.self,
        tipDistance: sword.tipDistance,
      })
        .then((r) => {
          // dispose 이후 늦게 도착한 응답이 죽은 씬을 건드리지 않게 막는다
          if (disposed || !sword) {
            r.dispose();
            return;
          }
          rapier = r;
          swordTip = r.tipAnchor;
          sword.box.visible = false;
          // 새 재질의 셰이더를 지금 컴파일한다. 안 하면 검이 처음 그려지는 프레임에 통째로 걸린다
          renderer.compile(scene, camera);
        })
        .catch((err) => {
          console.warn('[arena] 검 모델 로드 실패. 박스 검을 유지한다.', err);
        });

      // 궤적 리본 2개. 소유 색은 v2 확정 매핑이다(내 검 red, AI blue).
      meTrail = createTrailRibbon({ core: colors.trail.self, glow: colors.trail.selfGlow });
      aiTrail = createTrailRibbon({ core: colors.trail.ai, glow: colors.trail.aiGlow });
      // 빌보드(1)보다 뒤. 궤적이 상대 위로 지나간다
      meTrail.mesh.renderOrder = 2;
      aiTrail.mesh.renderOrder = 2;
      scene.add(meTrail.mesh, aiTrail.mesh);

      sparks = createSparks(scene);
      shake = createShake(camera);

      post = createComposer(renderer, scene, camera);

      // 씬 전체 셰이더를 개막 전에 컴파일한다. 첫 등장 프레임마다 컴파일이 끼면 그게 곧 히치다
      renderer.compile(scene, camera);

      void dev;
      this.resize();
    },

    resize() {
      if (!renderer || !canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = Math.max(1, Math.round(rect?.width ?? window.innerWidth));
      h = Math.max(1, Math.round(rect?.height ?? window.innerHeight));
      renderer.setPixelRatio(Math.min(DPR_CAP, window.devicePixelRatio || 1));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      post?.setSize(w, h);
    },

    render(gameState, fx, dtRender) {
      if (!renderer) return;
      if (dtRender > 0) fps += (1 / dtRender - fps) * 0.08;
      renderer.info.reset();

      // 상대 거리. d는 근접도라 값이 클수록 가깝다.
      opponent.setDistance(distFromD(gameState.d));

      // 다가오는지 물러나는지. 커지는 d가 곧 다가오는 상대다
      if (lastD !== null && dtRender > 0) {
        dDot += ((gameState.d - lastD) / dtRender - dDot) * 0.25;
        advancing = advancing ? dDot > ADVANCE_OUT : dDot > ADVANCE_IN;
      }
      lastD = gameState.d;

      const real = gameState.aiKind === ATTACK_KIND.REAL;

      // 이번 찌르기의 조준을 시작 순간 한 번 뽑는다. 매 프레임 뽑으면 칼끝이 떨린다
      const meLunge = gameState.meLunge ?? 0;
      if (meLunge > prevMeLunge && prevMeLunge <= 0.02) {
        jitterX = AIM_JITTER_X[0] + rand(seed) * (AIM_JITTER_X[1] - AIM_JITTER_X[0]);
        jitterY = AIM_JITTER_Y[0] + rand(seed) * (AIM_JITTER_Y[1] - AIM_JITTER_Y[0]);
      }
      prevMeLunge = meLunge;

      // 상대 표적은 예고에 들어가는 순간 정해진다. 예고 자세가 이미 그쪽을 겨누므로
      // 어디로 오는지가 형태로 미리 읽힌다. 유파 성향은 시각 스타일 규칙 안이다
      if (gameState.aiMode === AI_MODE.TELEGRAPH && prevAiMode !== AI_MODE.TELEGRAPH) {
        const bag = TARGET_BIAS[gameState.school?.key] ?? TARGET_FALLBACK;
        opponent.setTarget(bag[Math.floor(rand(seed) * bag.length) % bag.length]);
      }
      prevAiMode = gameState.aiMode;

      opponent.setPose(pickPose(gameState));
      // 명중 순간 틴트. hitFlash는 초당 1.6으로 줄어 0.192폭이 정확히 120ms다(요구 구간 상단).
      // owner는 득점자라 ME면 맞은 쪽이 상대다. 그래서 상대 빌보드가 붉어진다.
      const tintHit =
        gameState.hitOwner === OWNER.ME
          ? Math.min(1, Math.max(0, ((gameState.hitFlash ?? 0) - 0.808) / 0.192))
          : 0;
      opponent.update(dtRender, camera, { lunge: gameState.aiLunge ?? 0, tintHit, real });

      poseSword(gameState);

      // 검끝 월드 좌표를 리본에 먹인다. 검이 카메라의 자식이라 월드 변환이 필요하다.
      // swordTip은 레이피어가 뜨면 그쪽 앵커로 바뀐다. 거리는 같게 정규화했으므로 궤적이 튀지 않는다.
      camera.updateMatrixWorld();
      swordTip.getWorldPosition(tipWorld);
      meTrail.push(tipWorld, dtRender);

      // AI 리본은 공격 구간에서만 샘플링한다. 대기 중에 계속 먹이면
      // 움직이지 않는 검끝에 파란 얼룩이 상주한다. 멈추면 리본은 감쇠로 사라진다.
      const aiActive = gameState.aiMode !== AI_MODE.IDLE || (gameState.aiLunge ?? 0) > 0.02;
      if (aiActive) {
        // 끊겼다 이어지면 옛 점과 새 점이 화면을 가로지르는 직선으로 이어진다. 끊긴 자리에서 새로 시작한다
        if (!aiSampling) aiTrail.clear();
        opponent.group.updateMatrixWorld(true);
        opponent.getTip().getWorldPosition(aiTipWorld);
        aiTrail.push(aiTipWorld, dtRender);
      }
      aiSampling = aiActive;

      meTrail.update(dtRender);
      aiTrail.update(dtRender);

      camera.getWorldPosition(camWorld);
      meTrail.build(camWorld);
      aiTrail.build(camWorld);

      // 두 검이 맞부딪는 지점. 패리 스파크와 리포스트 링이 여기 선다.
      // 스파크는 월드에 서므로 검끝 월드 좌표를 그대로 쓴다.
      crossWorld.copy(tipWorld);

      for (const e of fx) {
        const scored = e.outcome === OUTCOME.HIT || e.outcome === OUTCOME.RIPOSTE;

        // 패리는 받는 선을 먼저 정한다. 스파크와 리포스트 링이 같은 지점에 서야 한다.
        // 늘 같은 점에서 튀면 막기가 매번 같은 한 장면으로 굳는다(E4)
        let parryLine = null;
        if (e.outcome === OUTCOME.PARRY) {
          parryLine = rand(seed) < 0.5 ? PARRY_LINE.HIGH : PARRY_LINE.LOW;
          crossWorld.copy(tipWorld);
          crossWorld.y += parryLine === PARRY_LINE.HIGH ? 0.10 : -0.12;
          crossWorld.x += (rand(seed) - 0.5) * 0.16;
        }

        // 연출이 서는 월드 지점. 내가 넣었으면 상대 몸 위, 내가 맞았으면 상대 검끝이다
        if (scored && e.owner === OWNER.ME) {
          // **그립에서 칼끝으로 뻗은 직선을 상대 평면까지 늘린 곳이 착탄점이다.**
          // 전에는 상대 중심 x에 고정이라 어디를 찔러도 명중이 정중앙에 박혔다.
          // 이 식은 임시가 아니다. C3에서 폰 쿼터니언이 검을 돌리면 그 방향이 그대로 여기로 들어와
          // 코드 교체 없이 진짜 조준이 된다(임시인 것은 위 AIM_JITTER 상수뿐이다).
          sword.group.getWorldPosition(gripWorld);
          aimRay.copy(tipWorld).sub(gripWorld);
          const planeZ = opponent.group.position.z;
          const cx = opponent.group.position.x;
          let hx = cx;
          // 칼끝이 상대 쪽(-z)으로 향할 때만 평면과 만난다. 옆이나 뒤를 향하면 중심으로 떨어뜨린다
          if (aimRay.z < -1e-4) {
            hx = gripWorld.x + aimRay.x * ((planeZ - gripWorld.z) / aimRay.z);
          }
          // 실루엣 밖으로 나가면 몸이 아니라 허공에 마커가 선다. 몸 반폭 안으로 죈다
          const hw = opponent.bodyHalfWidth * 0.9;
          hitWorld.set(
            Math.min(cx + hw, Math.max(cx - hw, hx)),
            Math.min(1.8, Math.max(0.35, tipWorld.y)),
            planeZ + 0.06
          );
        } else {
          hitWorld.copy(scored ? aiTipWorld : crossWorld);
        }

        if (scored) {
          // 명중 순간 해당 리본의 최근 구간을 흰 코어로 굳힌다
          (e.owner === OWNER.ME ? meTrail : aiTrail).markHit();
          // 내가 넣었을 때만 칼날이 붉게 터진다. 레드는 사건의 색이다
          if (e.owner === OWNER.ME) flare = 1;
          // 11절 타임라인. hitstop은 GameCanvas가 로직 시계에 건다
          post.impact(hitWorld, { reduced: reducedMotion });
          if (!reducedMotion) shake.kick(e.owner === OWNER.ME ? 0.55 : 0.75);
        }
        if (e.outcome === OUTCOME.PARRY) {
          // 스파크는 흰색에서 steel로 식는다. red를 쓰지 않는다(레드는 득점 전용)
          sparks.burst(crossWorld);
          // 상단이면 검이 위로, 하단이면 아래로 튕겨난다. 받는 자세가 2종이 된다
          opponent.knockBack(parryLine);
        }
        // 화면 좌표와 부위를 얹어 DOM 층으로 넘긴다. 캔버스 밖 연출은 HUD가 그린다
        if (onFx) {
          const p = this.projectToScreen(hitWorld);
          onFx({
            outcome: e.outcome,
            owner: e.owner,
            x: p.x,
            y: p.y,
            visible: p.visible,
            part: bodyPart(hitWorld.y),
            points: e.outcome === OUTCOME.RIPOSTE ? 2 : 1,
          });
        }
      }

      sparks.update(dtRender);
      if (!reducedMotion) shake.update(dtRender);

      if (flare > 0) {
        flare = Math.max(0, flare - dtRender / FLARE_DECAY_SEC);
        rapier?.setFlare(flare);
      }

      // delta를 반드시 넘긴다. V4d ShockWave가 이 값으로 물결을 진행시킨다.
      post.render(dtRender);
    },

    /**
     * 월드 좌표를 CSS 픽셀로 투영한다. 상대 빌보드 위 명중 지점처럼
     * 카메라 로컬로 풀 수 없는 지점은 이 경로를 쓴다(D5).
     */
    projectToScreen(v) {
      tmpProj.copy(v).project(camera);
      return {
        x: (tmpProj.x * 0.5 + 0.5) * w,
        y: (-tmpProj.y * 0.5 + 0.5) * h,
        visible: tmpProj.z < 1 && Math.abs(tmpProj.x) <= 1.1 && Math.abs(tmpProj.y) <= 1.1,
      };
    },


    /** 화면 좌표가 필요한 연출을 DOM으로 넘기는 통로. 렌더러는 그리지 않는다. */
    setFxObserver(fn) {
      onFx = typeof fn === 'function' ? fn : null;
    },

    /** 연속 채널 주입. 판별 유니온만 받는다(ARENA_SCENE 3절). */
    setSwordPose(next) {
      if (next && (next.kind === 'preset' || next.kind === 'quaternion')) pose = next;
    },

    setPoses(images) {
      opponent?.setPoses(images);
    },
    setBackgroundImage(image) {
      background?.setImage(image);
    },
    clear() {
      meTrail?.clear();
      aiTrail?.clear();
      sparks?.clear();
      shake?.reset();
      flare = 0;
      rapier?.setFlare(0);
      lastD = null;
      dDot = 0;
      advancing = false;
      aiSampling = false;
      prevAiMode = null;
      prevMeLunge = 0;
      jitterX = 0;
      jitterY = 0;
    },
    segmentCount() {
      return (meTrail?.segmentCount() ?? 0) + (aiTrail?.segmentCount() ?? 0);
    },
    getFps() {
      return fps;
    },
    isDegraded() {
      return fps < BUDGET.minFps;
    },
    /** 대리 지표. 헤드리스 fps가 무효라 미터가 이 숫자들을 대신 읽는다. */
    getInfo() {
      if (!renderer) return null;
      const info = renderer.info;
      return {
        draws: info.render.calls,
        triangles: info.render.triangles,
        textures: info.memory.textures,
        geometries: info.memory.geometries,
        programs: info.programs?.length ?? 0,
        segments: this.segmentCount(),
        sword: rapier ? 'rapier' : 'box',
      };
    },

    dispose() {
      disposed = true;
      post?.dispose();
      sparks?.dispose();
      shake?.reset();
      rapier?.dispose();
      opponent?.dispose();
      meTrail?.dispose();
      aiTrail?.dispose();
      scene?.traverse((o) => {
        o.geometry?.dispose?.();
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
        else o.material?.dispose?.();
      });
      renderer?.dispose();
      canvas?.remove();
      renderer = null;
      scene = null;
      camera = null;
      sword = null;
      swordTip = null;
      rapier = null;
      background = null;
      opponent = null;
      canvas = null;
      post = null;
      meTrail = null;
      aiTrail = null;
      sparks = null;
      shake = null;
      onFx = null;
    },
  };
}
