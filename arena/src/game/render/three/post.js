// 책임: 후처리 파이프라인. ARENA_SCENE 10절 합성 순서를 따른다.
//
// 현재 범위는 RenderPass → 잔상 → Bloom이다.
// ShockWave와 ChromaticAberration은 V4d에서 이 파이프라인에 끼운다.
//
// render는 반드시 delta를 받아 넘긴다. V4d의 ShockWave가 이 delta로 물결을 진행시키기 때문이다.
// delta 누락은 이 라이브러리에서 가장 흔한 버그다(조사 19절).
//
// 잔상에 관하여. postprocessing에는 AfterimagePass가 없다(v6.39 전수 확인).
// three의 examples/jsm에 있는 것은 다른 EffectComposer의 Pass라 이 컴포저에 꽂히지 않는다.
// 그래서 같은 식을 이 라이브러리의 기본기로 세운다.
//   SavePass가 직전 합성 결과를 들고 있고, TextureEffect가 그것을 NORMAL 블렌드로 덮는다.
//   opacity가 damp이므로 out = current x (1 - damp) + prev x damp. AfterimagePass와 같은 식이다.

import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  KernelSize,
  RenderPass,
  SavePass,
  TextureEffect,
} from 'postprocessing';

/**
 * Bloom 초기값. ARENA_SCENE 15절 미해결이던 값을 실측으로 확정했다.
 * 기준: 궤적과 검끝 emissive만 threshold를 넘고 배경 그라디언트는 넘지 않는다.
 * 배경은 bg.base에서 bg.deep 사이라 휘도가 0.05 미만이고,
 * 궤적 코어는 red.light 가산 블렌딩이라 1.0을 넘는다. 그 사이를 넉넉히 갈라 0.42로 둔다.
 * 실측: 하늘 영역 평균 휘도 6.4/255(bg.base의 11 미만)로 배경이 뜨지 않는 것을 확인했다.
 * 상대 빌보드의 림도 이 선 아래로 묶는다(opponent.js RIM_ALPHA).
 */
export const BLOOM = {
  threshold: 0.42,
  smoothing: 0.28,
  intensity: 1.15,
  radius: 0.62,
  // 블룸을 절반 해상도로 굽는다. 발광은 원래 번지는 것이라 눈에 띄는 손실이 없고
  // 컴포저 비용이 크게 준다. V4f 감축 사다리의 마지막 칸(Bloom 해상도 하향)을 기본값으로 당겨 둔다.
  resolutionScale: 0.5,
};

/** 성능 가드가 부르는 하향. 감축 순서의 마지막 칸이다. */
export const BLOOM_LOW = { resolutionScale: 0.25, intensity: 0.9 };

/**
 * 잔상 damp. 남는 비율이라 값이 클수록 오래 끈다.
 * 60fps에서 n프레임 뒤 잔량은 damp^n이다. 한 호흡(0.3초 = 18프레임) 안에
 * 1/255 아래로 내려가려면 damp < 0.735여야 한다. 0.82는 0.47초를 끌어 과했다.
 * 0.70은 18프레임 뒤 0.0016(0.4/255)으로 사라지고 10퍼센트까지는 108ms를 남긴다.
 */
export const AFTERIMAGE = { damp: 0.70, dampDilated: 0.92 };

export function createComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // 잔상. 직전 합성 결과를 damp만큼 남긴다
  const savePass = new SavePass();
  const ghost = new TextureEffect({ texture: savePass.texture, blendFunction: BlendFunction.NORMAL });
  ghost.blendMode.opacity.value = AFTERIMAGE.damp;
  composer.addPass(new EffectPass(camera, ghost));
  composer.addPass(savePass);

  const bloom = new BloomEffect({
    luminanceThreshold: BLOOM.threshold,
    luminanceSmoothing: BLOOM.smoothing,
    intensity: BLOOM.intensity,
    radius: BLOOM.radius,
    mipmapBlur: true,
    kernelSize: KernelSize.MEDIUM,
    resolutionScale: BLOOM.resolutionScale,
  });

  // EffectPass는 넘긴 이펙트를 한 셰이더로 병합한다. 패스 수를 줄이는 것이 이 라이브러리의 요령이다.
  const effectPass = new EffectPass(camera, bloom);
  composer.addPass(effectPass);

  return {
    composer,
    bloom,
    ghost,
    effectPass,
    setSize(w, h) {
      composer.setSize(w, h);
    },
    /** 시간 팽창이 이 값을 올린다(V4e). 평시는 AFTERIMAGE.damp다. */
    setDamp(v) {
      ghost.blendMode.opacity.value = v;
    },
    /** delta를 반드시 넘긴다. V4d ShockWave가 이 값에 의존한다. */
    render(deltaSec) {
      composer.render(deltaSec);
    },
    dispose() {
      composer.dispose();
    },
  };
}
