// 책임: 명중과 패리 스파크. 풀링으로 GC를 피한다(교전 중 프레임 드랍의 주범).
// 상한은 tokens.motion.budget.particleMax. 성능 가드가 먼저 깎는 대상이다.
// 여기의 Math.random은 시각 산포 전용이다. 판정에 쓰이지 않으므로 결정성을 깨지 않는다.
// 판정 쪽 난수는 전부 game/rng.js의 시드 난수를 쓴다.

import { colors, motion } from '../../tokens.js';

const HARD_MAX = motion.budget.particleMax;

export function createParticles() {
  // 풀은 최초 한 번만 만든다. 이후 alive 플래그만 뒤집는다.
  const pool = new Array(HARD_MAX);
  for (let i = 0; i < HARD_MAX; i += 1) {
    pool[i] = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, color: colors.trail.hit, alive: false };
  }
  let cursor = 0;
  let cap = HARD_MAX; // 성능 가드가 낮출 수 있다

  function spawn(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const p = pool[cursor];
      cursor = (cursor + 1) % cap;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const v = speed * (0.55 + Math.random() * 0.9);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * v;
      p.vy = Math.sin(angle) * v - v * 0.25;
      p.maxLife = 0.34 + Math.random() * 0.3;
      p.life = p.maxLife;
      p.color = color;
      p.alive = true;
    }
  }

  return {
    /** 명중은 레드 계열. DESIGN 2절에 따라 코어는 흰색이 최종 강조다. */
    burstHit(x, y, scale) {
      spawn(x, y, colors.trail.hit, Math.round(cap * 0.14), 260 * scale);
      spawn(x, y, colors.red.light, Math.round(cap * 0.16), 190 * scale);
    },
    /** 패리는 크롬 계열. 금속끼리 부딪힌 느낌. */
    burstParry(x, y, scale) {
      spawn(x, y, colors.steel.mid, Math.round(cap * 0.12), 210 * scale);
      spawn(x, y, colors.steel.hi, Math.round(cap * 0.08), 150 * scale);
    },

    update(dtSec) {
      for (let i = 0; i < cap; i += 1) {
        const p = pool[i];
        if (!p.alive) continue;
        p.life -= dtSec;
        if (p.life <= 0) {
          p.alive = false;
          continue;
        }
        p.x += p.vx * dtSec;
        p.y += p.vy * dtSec;
        p.vy += 520 * dtSec; // 중력
        p.vx *= 0.985;
      }
    },

    draw(ctx, scale) {
      const prevOp = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < cap; i += 1) {
        const p = pool[i];
        if (!p.alive) continue;
        const t = p.life / p.maxLife;
        ctx.globalAlpha = t;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (1 + 2.2 * t) * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = prevOp;
    },

    /** 성능 가드가 부르는 감축. 파티클이 먼저 깎인다. */
    setCap(next) {
      cap = Math.max(40, Math.min(HARD_MAX, Math.floor(next)));
      cursor = cursor % cap;
      for (let i = cap; i < HARD_MAX; i += 1) pool[i].alive = false;
    },
    getCap() {
      return cap;
    },
    aliveCount() {
      let n = 0;
      for (let i = 0; i < cap; i += 1) if (pool[i].alive) n += 1;
      return n;
    },
    clear() {
      for (let i = 0; i < HARD_MAX; i += 1) pool[i].alive = false;
    },
  };
}
