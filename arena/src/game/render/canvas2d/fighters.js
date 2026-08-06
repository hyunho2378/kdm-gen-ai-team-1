// 책임: 선수 실루엣. 자세 스틸 이미지가 오기 전까지 단색 실루엣 도형으로 포즈를 구분한다.
// 포즈 5종(대기, 전진, 런지, 가드, 피격) x 2인. 이미지 도착 시 setPoses로 교체한다.
// 잔상은 오프스크린 누적(renderer/index.js)이 담당한다. 여기서는 현재 프레임만 그린다.

import { colors, darken, motion, withAlpha } from '../../../tokens.js';
import { swordTip, swordHilt } from './geometry.js';

export const POSE = { IDLE: 'IDLE', ADVANCE: 'ADVANCE', LUNGE: 'LUNGE', GUARD: 'GUARD', HIT: 'HIT' };

const CROSSFADE_MS = 120;

/**
 * 실루엣 몸통 톤. three 경로의 유니폼과 같은 계산이다(steel.mid를 30퍼센트 누른다).
 * **밝기가 형태를 세운다.** 테두리를 걷어냈으므로 채움이 그 몫까지 진다.
 */
const BODY_TONE = darken(colors.steel.mid, 0.3);

export function createFighters() {
  // 이미지 슬롯. { [owner]: { [pose]: HTMLImageElement } }
  let poses = null;
  const fade = {
    me: { from: POSE.IDLE, to: POSE.IDLE, t: 1 },
    ai: { from: POSE.IDLE, to: POSE.IDLE, t: 1 },
  };

  function setPose(who, pose) {
    const f = fade[who];
    if (f.to === pose) return;
    f.from = f.to;
    f.to = pose;
    f.t = 0;
  }

  function bodyPath(ctx, fighter, scale, lean) {
    // 캡슐 몸통. lean이 전진과 런지의 기울기를 만든다.
    const hipY = fighter.y;
    const headY = fighter.y - 160 * scale;
    const leanX = fighter.dir * lean * 34 * scale;
    ctx.beginPath();
    ctx.moveTo(fighter.x - 26 * scale, hipY);
    ctx.quadraticCurveTo(fighter.x - 20 * scale + leanX, (hipY + headY) / 2, fighter.x - 14 * scale + leanX, headY + 22 * scale);
    ctx.arc(fighter.x + leanX, headY + 6 * scale, 20 * scale, Math.PI, 0);
    ctx.quadraticCurveTo(fighter.x + 22 * scale + leanX, (hipY + headY) / 2, fighter.x + 26 * scale, hipY);
    ctx.closePath();
  }

  function legs(ctx, fighter, scale, spread) {
    ctx.lineWidth = 13 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fighter.x, fighter.y - 16 * scale);
    ctx.lineTo(fighter.x + fighter.dir * (34 + spread * 56) * scale, fighter.y);
    ctx.moveTo(fighter.x, fighter.y - 16 * scale);
    ctx.lineTo(fighter.x - fighter.dir * 32 * scale, fighter.y);
    ctx.stroke();
  }

  function drawOne(ctx, fighter, scale, opts) {
    const { pose, lungeT, guard, ownColor, glowColor, telegraph } = opts;
    const lean = pose === POSE.LUNGE ? 0.9 * lungeT + 0.2 : pose === POSE.ADVANCE ? 0.4 : 0;
    const spread = pose === POSE.LUNGE ? lungeT : pose === POSE.ADVANCE ? 0.35 : 0.1;

    ctx.save();

    // 텔레그래프는 어깨가 들린다. 예고를 시각으로 읽히게 하는 유일한 단서다.
    if (telegraph > 0) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 26 * telegraph;
      ctx.translate(0, -6 * scale * telegraph);
    }

    // 실루엣 본체. **윤곽선을 걷어내고 발광으로 흡수한다(비주얼 C).**
    // three 경로와 같은 방향이다. 예전에는 steel.edge 선으로 몸과 다리를 각각 둘러
    // 조각난 종이 인형으로 읽혔다. 여기서는 그림자 블러가 페더링을 대신한다.
    // **2D는 매 프레임 그리므로 블러 대신 shadowBlur를 쓴다.** 캔버스 필터보다 훨씬 싸다
    ctx.save();
    ctx.shadowColor = withAlpha(colors.steel.hi, 0.30);
    ctx.shadowBlur = 12 * scale;
    // **몸을 밝게 채운다.** 예전에는 bg.raised(거의 검정)를 깔고 밝은 테두리로 형태를 세웠다.
    // 테두리를 걷어내니 몸이 배경에 잠겨 안 보였다(실측 스크린샷). three 경로와 같은 해법으로
    // steel.mid를 눌러 채우면 선 없이도 실루엣이 선다. 블룸 문턱과 같은 계산이라 값도 같다
    ctx.fillStyle = BODY_TONE;
    ctx.strokeStyle = BODY_TONE;
    // 다리를 먼저 깔고 몸통으로 덮는다. 둘 다 같은 톤이라 관절에 선이 안 생긴다
    legs(ctx, fighter, scale, spread);
    bodyPath(ctx, fighter, scale, lean);
    ctx.fill();
    ctx.restore();

    // 검신. 크롬 그라디언트로 채운다(DESIGN 3절 크롬 오브젝트)
    const hilt = swordHilt(fighter, scale, lungeT);
    const tip = swordTip(fighter, scale, lungeT, guard);
    const blade = ctx.createLinearGradient(hilt.x, hilt.y, tip.x, tip.y);
    blade.addColorStop(0, colors.steel.shadow);
    blade.addColorStop(0.45, colors.steel.mid);
    blade.addColorStop(1, colors.steel.hi);
    ctx.strokeStyle = blade;
    ctx.lineWidth = 4.5 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hilt.x, hilt.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    // 검끝 소유 색 점. 궤적과 같은 색이라 누구 검인지 즉시 읽힌다
    ctx.fillStyle = ownColor;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 3.2 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return tip;
  }

  return {
    setPoses(next) {
      poses = next;
    },
    hasPoses() {
      return poses !== null;
    },

    update(dtSec) {
      for (const k of ['me', 'ai']) {
        const f = fade[k];
        if (f.t < 1) f.t = Math.min(1, f.t + (dtSec * 1000) / CROSSFADE_MS);
      }
    },

    /** 두 선수를 그리고 검끝 좌표를 돌려준다. 궤적 레이어가 이 좌표를 먹는다. */
    draw(ctx, view, pos, scale) {
      // 우선순위 thrust > guard(홀드 중) > 디폴트. three 경로(R1)와 같은 순서다.
      // 가드를 먼저 보면 홀드 중 되찌르기가 가드 포즈에 묻혀 화면에서 안 읽힌다.
      const mePose = view.meLunge > 0.05
        ? POSE.LUNGE
        : view.meGuard
        ? POSE.GUARD
        : view.hitOwner === 'AI' && view.hitFlash > 0.4
        ? POSE.HIT
        : POSE.IDLE;
      const aiPose = view.aiLunge > 0.05
        ? POSE.LUNGE
        : view.hitOwner === 'ME' && view.hitFlash > 0.4
        ? POSE.HIT
        : POSE.IDLE;
      setPose('me', mePose);
      setPose('ai', aiPose);

      const meTip = drawOne(ctx, pos.me, scale, {
        pose: mePose,
        lungeT: view.meLunge,
        guard: view.meGuard,
        ownColor: colors.trail.self,
        glowColor: colors.red.glow,
        telegraph: 0,
      });
      const aiTip = drawOne(ctx, pos.ai, scale, {
        pose: aiPose,
        lungeT: view.aiLunge,
        guard: false,
        ownColor: colors.trail.ai,
        glowColor: colors.blue.glow,
        telegraph: view.aiMode === 'TELEGRAPH' ? 1 : 0,
      });

      return { meTip, aiTip };
    },

    budget: motion.budget,
  };
}
