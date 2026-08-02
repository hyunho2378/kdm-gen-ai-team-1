// 책임: 후처리 파이프라인. ARENA_SCENE 10절 합성 순서를 따른다.
//
// V4b 범위는 RenderPass → EffectPass(Bloom)까지다.
// AfterimagePass는 V4e, ShockWave와 ChromaticAberration은 V4d에서 이 파이프라인에 끼운다.
//
// render는 반드시 delta를 받아 넘긴다. V4d의 ShockWave가 이 delta로 물결을 진행시키기 때문이다.
// delta 누락은 이 라이브러리에서 가장 흔한 버그다(조사 19절).

import { BloomEffect, EffectComposer, EffectPass, KernelSize, RenderPass } from 'postprocessing';

/**
 * Bloom 초기값. ARENA_SCENE 15절 미해결이던 값을 실측으로 확정했다.
 * 기준: 궤적과 검끝 emissive만 threshold를 넘고 배경 그라디언트는 넘지 않는다.
 * 배경은 bg.base에서 bg.deep 사이라 휘도가 0.05 미만이고,
 * 궤적 코어는 red.light 가산 블렌딩이라 1.0을 넘는다. 그 사이를 넉넉히 갈라 0.42로 둔다.
 * 실측: 하늘 영역 평균 휘도 6.4/255(bg.base의 11 미만)로 배경이 뜨지 않는 것을 확인했다.
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

export function createComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

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
    effectPass,
    setSize(w, h) {
      composer.setSize(w, h);
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
