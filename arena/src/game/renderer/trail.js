// 책임: 검끝 궤적 리본. 이 프로젝트의 모티프이자 화면의 주인공이다.
// 가산 블렌딩(lighter)으로 블랙 무대 위에서 빛으로 읽히게 한다.
// 세그먼트 상한은 tokens.motion.budget.trailMaxSegments. 초과분은 앞에서 버린다.

import { colors, motion } from '../../tokens.js';

const MAX = motion.budget.trailMaxSegments;
const LIFE_MS = 520;

function createRibbon(coreColor, glowColor) {
  /** { x, y, age, hit } 링 버퍼 대신 단순 배열 + shift. 상한이 240이라 비용이 무시할 수준이다. */
  const points = [];

  return {
    points,
    push(x, y) {
      points.push({ x, y, age: 0, hit: false });
      while (points.length > MAX) points.shift();
    },
    /** 명중 순간의 구간을 흰 코어로 고정한다. JUDGE 동안 유지된다. */
    markHit(count = 18) {
      for (let i = Math.max(0, points.length - count); i < points.length; i += 1) {
        points[i].hit = true;
      }
    },
    clear() {
      points.length = 0;
    },
    update(dtSec) {
      const dt = dtSec * 1000;
      for (const p of points) p.age += dt;
      while (points.length > 0 && points[0].age > LIFE_MS && !points[0].hit) points.shift();
    },
    draw(ctx, scale) {
      if (points.length < 2) return;
      const prevOp = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < points.length; i += 1) {
        const a = points[i - 1];
        const b = points[i];
        const life = 1 - Math.min(1, b.age / LIFE_MS);
        if (life <= 0 && !b.hit) continue;

        const t = i / points.length;         // 최근일수록 굵다
        const width = (1.2 + 7.4 * t * life) * scale;

        // 외곽 글로우
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = width * 3.2;
        ctx.globalAlpha = 0.5 * life;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // 코어. 명중 구간은 흰색으로 굵게 고정한다
        ctx.strokeStyle = b.hit ? colors.trail.hit : coreColor;
        ctx.lineWidth = b.hit ? width * 1.9 : width;
        ctx.globalAlpha = b.hit ? 1 : 0.42 + 0.58 * life;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = prevOp;
    },
  };
}

export function createTrails() {
  const me = createRibbon(colors.trail.self, colors.trail.selfGlow);
  const ai = createRibbon(colors.trail.ai, colors.trail.aiGlow);

  return {
    me,
    ai,
    feed(meTip, aiTip) {
      me.push(meTip.x, meTip.y);
      ai.push(aiTip.x, aiTip.y);
    },
    update(dtSec) {
      me.update(dtSec);
      ai.update(dtSec);
    },
    draw(ctx, scale) {
      ai.draw(ctx, scale);
      me.draw(ctx, scale);
    },
    clear() {
      me.clear();
      ai.clear();
    },
    /** 성능 가드가 상한을 낮출 때 쓴다. */
    segmentCount() {
      return me.points.length + ai.points.length;
    },
  };
}
