// 책임: 선수 실루엣. 자세 스틸 이미지가 오기 전까지 단색 실루엣 도형으로 포즈를 구분한다.
// 포즈 5종(대기, 전진, 런지, 가드, 피격) x 2인. 이미지 도착 시 setPoses로 교체한다.
// 잔상은 오프스크린 누적(renderer/index.js)이 담당한다. 여기서는 현재 프레임만 그린다.

import { colors, motion } from '../../tokens.js';
import { swordTip, swordHilt } from './geometry.js';

export const POSE = { IDLE: 'IDLE', ADVANCE: 'ADVANCE', LUNGE: 'LUNGE', GUARD: 'GUARD', HIT: 'HIT' };

const CROSSFADE_MS = 120;

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

    // 실루엣 본체. 배경보다 밝은 무채색으로 두고 림 라이트로 크롬 느낌을 준다.
    ctx.fillStyle = 'rgba(21, 21, 26, 0.96)';
    ctx.strokeStyle = colors.steel.edge;
    bodyPath(ctx, fighter, scale, lean);
    ctx.fill();
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(21, 21, 26, 0.96)';
    legs(ctx, fighter, scale, spread);
    ctx.strokeStyle = colors.steel.edge;
    ctx.lineWidth = 1.5 * scale;
    legs(ctx, fighter, scale, spread);

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
      const mePose = view.meGuard
        ? POSE.GUARD
        : view.meLunge > 0.05
        ? POSE.LUNGE
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
