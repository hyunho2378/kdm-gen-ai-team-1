// 책임: 기존 C1 3인칭 canvas 2D 렌더러를 IRenderer에 맞추는 어댑터.
//
// 내부 동작은 승격 전과 같다. 레이어 모듈(canvas2d/)을 한 줄도 고치지 않았다.
// 바뀐 것은 호출 형태뿐이다. update(dt) + draw(view) 2단을 render(gameState, fx, dt) 하나로 합쳤다.
// 검끝 좌표 계산(canvas2d/geometry.js)은 이 렌더러 소유다. 판정은 d와 이벤트만 쓰므로 로직에 없다.
//
// 이것이 렌더의 비상 컷이다. three가 죽어도 경기는 여기서 산다.

import { OUTCOME, OWNER } from '../judge.js';
import { createRenderer as createLegacy2d } from './canvas2d/index.js';
import { layout } from './canvas2d/geometry.js';

export function createCanvas2dRenderer() {
  let canvas = null;
  let legacy = null;
  let showMeter = false;
  let lastTips = null;

  return {
    id: '2d',
    label: '호환 렌더',

    init(mount, { dev = false } = {}) {
      showMeter = dev;
      canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      Object.assign(canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'block',
      });
      mount.appendChild(canvas);
      legacy = createLegacy2d(canvas);
      legacy.resize();
    },

    resize() {
      legacy?.resize();
    },

    /** gameState는 engine.view다. 읽기만 한다. fx는 GameCanvas가 소비해 넘겨준다. */
    render(gameState, fx, dtRender) {
      if (!legacy) return;
      legacy.update(dtRender);
      lastTips = legacy.draw(gameState, { showMeter }) ?? lastTips;

      if (fx.length === 0 || !lastTips || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const { scale } = layout(rect.width, rect.height, gameState.d);
      for (const e of fx) {
        if (e.outcome === OUTCOME.PARRY) {
          legacy.onParry(lastTips.meTip, scale);
        } else if (e.outcome === OUTCOME.HIT || e.outcome === OUTCOME.RIPOSTE) {
          legacy.onHit(e.owner, e.owner === OWNER.ME ? lastTips.meTip : lastTips.aiTip, scale);
        }
      }
    },

    // 3인칭 2D에는 1인칭 검이 없다. 인터페이스만 맞춘다.
    setSwordPose() {},
    /** 2D 경로에는 FUI 투영이 없다. 링과 마커는 three 경로 전용이다. */
    setFxObserver() {},

    setPoses(images) {
      legacy?.setPoses(images);
    },
    setBackgroundImage(image) {
      legacy?.setBackgroundImage(image);
    },
    clear() {
      legacy?.clear();
    },
    getFps() {
      return legacy?.getFps() ?? 60;
    },
    isDegraded() {
      return legacy?.isDegraded() ?? false;
    },
    /** 2D에는 드로우콜 개념이 없다. 미터가 이 경로에서는 fps만 읽는다. */
    getInfo() {
      return null;
    },

    dispose() {
      canvas?.remove();
      canvas = null;
      legacy = null;
      lastTips = null;
    },
  };
}
