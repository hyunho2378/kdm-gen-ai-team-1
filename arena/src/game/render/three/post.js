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

import { HalfFloatType, Vector2, Vector3 } from 'three';
import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  KernelSize,
  RenderPass,
  SavePass,
  ShockWaveEffect,
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
  // **문턱 0.42는 그대로다(올리지 않는다).** 궤적과 검끝만 넘기고 배경은 안 넘긴다.
  threshold: 0.42,
  smoothing: 0.28,
  // 시연 안정화(DEMO_STABILIZE): 글로우 번짐을 줄이려 세기와 반경을 한 단계 낮췄다
  // (intensity 1.15 → 1.0, radius 0.62 → 0.55). 발광은 남되 덜 퍼진다. 문턱은 손대지 않는다.
  intensity: 1.0,
  radius: 0.55,
  // 블룸을 절반 해상도로 굽는다. 발광은 원래 번지는 것이라 눈에 띄는 손실이 없고
  // 컴포저 비용이 크게 준다. V4f 감축 사다리의 마지막 칸(Bloom 해상도 하향)을 기본값으로 당겨 둔다.
  resolutionScale: 0.5,
};

/** 성능 가드가 부르는 하향. 감축 순서의 마지막 칸이다. */
export const BLOOM_LOW = { resolutionScale: 0.25, intensity: 0.9 };

/**
 * 잔상 damp. 남는 비율이라 값이 클수록 오래 끈다. **화면 전체 고스트라 검 잔상의 주된 출처다.**
 * 60fps에서 n프레임 뒤 잔량은 damp^n이다. 한 호흡(0.3초 = 18프레임) 안에
 * 1/255 아래로 내려가려면 damp < 0.735여야 한다. 0.82는 0.47초를 끌어 과했다.
 * 시연 안정화(DEMO_STABILIZE): 검·글로우 잔상을 줄이려 한 단계 낮췄다(평시 0.70 → 0.58,
 * 팽창 0.92 → 0.86). 0.58은 18프레임 뒤 0.00008로 더 빨리 사라져 급회전 번짐이 준다.
 * 밋밋하면 0.70/0.92 쪽으로 한 단계 되돌린다.
 */
export const AFTERIMAGE = { damp: 0.58, dampDilated: 0.86 };

/**
 * 명중 연출 상수(D5). ARENA_SCENE 11절 타임라인을 이 값들이 진다.
 * 색수차는 화면 전체를 흔드는 효과라 피크가 작아야 한다. 0.0022는 1440폭에서 3px 남짓이다.
 */
export const IMPACT = {
  hitstopMs: 70,
  chromaticPeak: 0.0022,
  chromaticMs: 250,
  shockSpeed: 2.4,
  shockMaxRadius: 0.9,
  shockWaveSize: 0.16,
  shockAmplitude: 0.042,
};

export function createComposer(renderer, scene, camera) {
  // **프레임 버퍼는 반드시 HalfFloat다.** 기본값 8비트로 두면 잔상 되먹임이 양자화에 걸린다.
  //   out = current x 0.3 + prev x 0.7
  // 에서 prev가 1/255일 때 0.7 x 1 = 0.7이 반올림으로 다시 1이 되어 **영원히 안 죽는다.**
  // 검을 한 번 휘두르면 그 자리에 유령이 박히는 것을 실측으로 확인했다(25초 뒤에도 동일 밝기).
  // HalfFloat이면 0으로 수렴하고, 덤으로 가산 궤적이 1.0을 넘겨 블룸도 제대로 먹는다.
  const composer = new EffectComposer(renderer, { frameBufferType: HalfFloatType });
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

  // 명중 연출(D5). 평시에는 둘 다 0이라 화면에 아무 일도 없다.
  const chromatic = new ChromaticAberrationEffect({ offset: new Vector2(0, 0), radialModulation: false });
  const shock = new ShockWaveEffect(camera, new Vector3(), {
    speed: IMPACT.shockSpeed,
    maxRadius: IMPACT.shockMaxRadius,
    waveSize: IMPACT.shockWaveSize,
    amplitude: IMPACT.shockAmplitude,
  });

  // **셋을 한 패스에 묶을 수 없다.** 실측으로 확인했다.
  //   "Effects that transform UVs are incompatible with convolution effects (ShockWaveEffect)"
  // Bloom은 컨볼루션이고 ShockWave와 ChromaticAberration은 UV를 옮긴다.
  // EffectPass 병합은 이 라이브러리의 요령이지만 이 조합에서는 성립하지 않는다.
  // 10절 합성 순서는 그대로 두고 패스만 셋으로 가른다.
  const effectPass = new EffectPass(camera, bloom);
  composer.addPass(effectPass);
  composer.addPass(new EffectPass(camera, chromatic));
  composer.addPass(new EffectPass(camera, shock));

  let chromaticT = 0;

  return {
    composer,
    bloom,
    ghost,
    chromatic,
    shock,
    effectPass,
    setSize(w, h) {
      composer.setSize(w, h);
    },
    /** 시간 팽창이 이 값을 올린다(V4e). 평시는 AFTERIMAGE.damp다. */
    setDamp(v) {
      ghost.blendMode.opacity.value = v;
    },

    /**
     * 명중 충격. epicenter는 월드 좌표다.
     * reduced motion에서는 물결과 색수차를 끄고 hitstop과 흰 코어만 남긴다(11절).
     */
    impact(worldPos, { reduced = false } = {}) {
      if (reduced) return;
      shock.position.copy(worldPos);
      shock.explode();
      chromaticT = 1;
    },

    /** delta를 반드시 넘긴다. ShockWave가 이 값으로 물결을 진행시킨다. */
    render(deltaSec) {
      if (chromaticT > 0) {
        chromaticT = Math.max(0, chromaticT - (deltaSec * 1000) / IMPACT.chromaticMs);
        // 0에서 솟았다 0으로. sin 반주기라 시작과 끝이 모두 0이다
        const k = Math.sin(Math.PI * (1 - chromaticT)) * IMPACT.chromaticPeak;
        chromatic.offset.set(k, k * 0.6);
      }
      composer.render(deltaSec);
    },
    dispose() {
      composer.dispose();
    },
  };
}
