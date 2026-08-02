// 책임: 배경 레이어. 도장 이미지가 오기 전까지의 임시 무대다.
// bg.base에서 bg.deep으로 떨어지는 수직 그라디언트 + 방사 비네트 + 낮은 알파 안개 두 겹.
// 이미지가 도착하면 setImage로 갈아끼운다. 나머지 레이어는 건드리지 않는다.

import { colors } from '../../../tokens.js';

export function createBackground() {
  let image = null;
  let fogPhase = 0;

  return {
    /** 생성형 도장 이미지 도착 시 교체. HTMLImageElement를 받는다. */
    setImage(img) {
      image = img;
    },

    update(dtSec) {
      // 안개는 아주 느리게 흐른다. 0.2Hz 부근 깜빡임을 피해 위상만 민다.
      fogPhase += dtSec * 0.06;
    },

    draw(ctx, w, h) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, colors.bg.base);
      grad.addColorStop(1, colors.bg.deep);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (image) {
        ctx.globalAlpha = 0.9;
        ctx.drawImage(image, 0, 0, w, h);
        ctx.globalAlpha = 1;
      }

      // 안개 두 겹. 요소보다 항상 어둡게 유지한다(DESIGN 1절 규칙 1)
      const groundY = h * 0.72;
      for (let i = 0; i < 2; i += 1) {
        const drift = Math.sin(fogPhase + i * 2.1) * w * 0.04;
        const fog = ctx.createRadialGradient(
          w * 0.5 + drift, groundY, 0,
          w * 0.5 + drift, groundY, w * (0.42 + i * 0.16)
        );
        fog.addColorStop(0, `rgba(216, 226, 240, ${0.05 - i * 0.02})`);
        fog.addColorStop(1, 'rgba(216, 226, 240, 0)');
        ctx.fillStyle = fog;
        ctx.fillRect(0, 0, w, h);
      }

      // 바닥 헤어라인. 선수가 서 있는 면을 읽히게 한다
      ctx.strokeStyle = colors.line.default;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.06, groundY);
      ctx.lineTo(w * 0.94, groundY);
      ctx.stroke();

      // 방사 비네트
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.24, w * 0.5, h * 0.5, h * 0.86);
      vig.addColorStop(0, 'rgba(5, 5, 6, 0)');
      vig.addColorStop(1, 'rgba(5, 5, 6, 0.82)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    },
  };
}
