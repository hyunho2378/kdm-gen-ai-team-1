// 책임: 레이어 합성과 캔버스 관리. 아래에서 위로 배경, 선수, 궤적, 파티클.
// 잔상은 오프스크린 캔버스에 낮은 알파로 누적한다(afterimageMax 상한).
// devicePixelRatio는 2로 상한. 4K에서 픽셀 수가 4배가 되면 예산이 즉시 무너진다.
// 캔버스는 transform opacity 규칙의 예외 영역이다(DESIGN 9절).

import { colors, motion } from '../../tokens.js';
import { layout } from './geometry.js';
import { createBackground } from './background.js';
import { createFighters } from './fighters.js';
import { createTrails } from './trail.js';
import { createParticles } from './particles.js';

const DPR_CAP = 2;
const BUDGET = motion.budget;
// 잔상 누적 알파. afterimageMax 프레임 뒤에 사실상 사라지도록 역산한다.
const AFTERIMAGE_ALPHA = 1 / BUDGET.afterimageMax;

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const layer = document.createElement('canvas');
  const lctx = layer.getContext('2d');

  const background = createBackground();
  const fighters = createFighters();
  const trails = createTrails();
  const particles = createParticles();

  let w = 0;
  let h = 0;
  let dpr = 1;

  // fps 계측과 자동 감축 가드
  let fps = 60;
  let lowSince = 0;
  let degraded = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    for (const c of [canvas, layer]) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** 1분 연속 교전에서 minFps 아래로 오래 머물면 파티클부터 깎는다. */
  function guard(dtSec) {
    if (dtSec <= 0) return;
    const instant = 1 / dtSec;
    fps += (instant - fps) * 0.08;

    if (fps < BUDGET.minFps) {
      lowSince += dtSec;
      if (lowSince > 1.5 && !degraded) {
        particles.setCap(Math.floor(particles.getCap() * 0.5));
        degraded = true;
        lowSince = 0;
      }
    } else {
      lowSince = 0;
      if (degraded && fps > BUDGET.targetFps * 0.92) {
        particles.setCap(Math.floor(particles.getCap() * 1.5));
        if (particles.getCap() >= BUDGET.particleMax) degraded = false;
      }
    }
  }

  function drawFpsMeter() {
    ctx.save();
    ctx.font = '600 12px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = fps < BUDGET.minFps ? colors.red.light : colors.text.dim;
    ctx.fillText(
      `${Math.round(fps)} fps  seg ${trails.segmentCount()}  par ${particles.aliveCount()}/${particles.getCap()}`,
      w - 16,
      h - 14
    );
    ctx.restore();
  }

  return {
    resize,

    /** 로직 스텝과 무관한 시각 갱신. 실시간 dt를 받는다. */
    update(dtSec) {
      background.update(dtSec);
      fighters.update(dtSec);
      trails.update(dtSec);
      particles.update(dtSec);
      guard(dtSec);
    },

    draw(view, { showMeter = false } = {}) {
      if (w === 0 || h === 0) return;
      const pos = layout(w, h, view.d);
      const scale = pos.scale;

      // 1) 배경
      background.draw(ctx, w, h);

      // 2) 선수. 오프스크린에 그려 잔상을 누적한 뒤 본 캔버스에 얹는다
      lctx.globalCompositeOperation = 'destination-out';
      lctx.fillStyle = `rgba(0, 0, 0, ${AFTERIMAGE_ALPHA})`;
      lctx.fillRect(0, 0, w, h);
      lctx.globalCompositeOperation = 'source-over';
      const tips = fighters.draw(lctx, view, pos, scale);
      ctx.drawImage(layer, 0, 0, w, h);

      // 3) 궤적. 검끝 좌표를 먹고 가산 블렌딩으로 그린다
      trails.feed(tips.meTip, tips.aiTip);
      trails.draw(ctx, scale);

      // 4) 파티클
      particles.draw(ctx, scale);

      if (showMeter) drawFpsMeter();
      return tips;
    },

    /** 명중과 패리 순간 연출. engine이 판정 결과로 부른다. */
    onHit(owner, tip, scale) {
      const ribbon = owner === 'ME' ? trails.me : trails.ai;
      ribbon.markHit();
      particles.burstHit(tip.x, tip.y, scale);
    },
    onParry(tip, scale) {
      particles.burstParry(tip.x, tip.y, scale);
    },

    clear() {
      trails.clear();
      particles.clear();
      lctx.clearRect(0, 0, w, h);
    },

    getFps() {
      return fps;
    },
    isDegraded() {
      return degraded;
    },
    /** 도장 이미지와 자세 스틸이 도착하면 여기로 꽂는다. */
    setBackgroundImage(img) {
      background.setImage(img);
    },
    setPoses(p) {
      fighters.setPoses(p);
    },
  };
}
