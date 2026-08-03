// 책임: 렌더러 선택과 폴백. ThreeRenderer가 기본, Canvas2dRenderer가 비상 컷이다.
//
// 전환 3경로(ARENA_SCENE 3절):
//   1) WebGL 컨텍스트 생성 실패  2) 런타임 webglcontextlost  3) URL ?renderer=2d
// 어느 경로든 경기는 멈추지 않는다. StatusChip에 "호환 렌더"를 띄운다(PATTERNS 8절).

import { createThreeRenderer } from './ThreeRenderer.js';
import { createCanvas2dRenderer } from './Canvas2dRenderer.js';

export function forced2dFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get('renderer') === '2d';
  } catch {
    return false;
  }
}

/**
 * 마운트에 렌더러를 붙이고 핸들을 돌려준다.
 * onFallback은 2D로 내려앉을 때 한 번 불린다(StatusChip 갱신용).
 */
export function createRenderer(mount, { dev = false, reduced = false, onFallback } = {}) {
  let active = null;
  let fellBack = false;

  function mount2d(reason) {
    fellBack = true;
    active = createCanvas2dRenderer();
    active.init(mount, { dev, reduced });
    onFallback?.(reason);
  }

  function swapTo2d(reason) {
    if (fellBack) return;
    try {
      active?.dispose();
    } catch {
      // 이미 죽은 컨텍스트를 정리하다 던져도 폴백을 막지 않는다
    }
    mount2d(reason);
  }

  if (forced2dFromUrl()) {
    mount2d('url');
  } else {
    try {
      const three = createThreeRenderer();
      three.init(mount, { dev, reduced, onContextLost: () => swapTo2d('context-lost') });
      active = three;
    } catch (err) {
      // WebGL 생성 실패. 조용히 죽이지 않고 2D로 살린다.
      console.warn('[arena] WebGL 초기화 실패. 2D 폴백으로 전환한다.', err);
      mount2d('init-failed');
    }
  }

  return {
    get id() {
      return active.id;
    },
    get isFallback() {
      return fellBack;
    },
    resize: () => active.resize(),
    render: (gameState, fx, dt) => active.render(gameState, fx, dt),
    setSwordPose: (pose) => active.setSwordPose(pose),
    setPoses: (i) => active.setPoses(i),
    setBackgroundImage: (i) => active.setBackgroundImage(i),
    clear: () => active.clear(),
    getFps: () => active.getFps(),
    isDegraded: () => active.isDegraded(),
    getInfo: () => active.getInfo?.() ?? null,
    setFxObserver: (fn) => active.setFxObserver?.(fn),
    dispose: () => active?.dispose(),
  };
}
