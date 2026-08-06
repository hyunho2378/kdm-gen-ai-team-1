// 히어로 워드마크. 크롬 재질을 CSS 클립에서 셰이더로 올리는 시도다(DESIGN 3절 1항).
//
// **셰이더는 `@paper-design/shaders`(Apache-2.0)의 liquid-metal이다.** 실설치본에서 가져오고
// 여기서 GLSL을 다시 쓰지 않는다. 라이선스 근거와 상류 추적은 LIBRARIES 판정표에 있다.
//
// **글자 안에만 크롬이 흐르게 하는 길은 마스크뿐이다.** CSS로 캔버스를 텍스트에 클립할 수 없다.
// VORTEX를 canvas 2D로 굽고 셰이더가 요구하는 전처리(R = edge gradient, G = opacity)를
// 라이브러리의 `toProcessedLiquidMetal`로 통과시켜 `u_image`로 넘긴다.
//
// **폰트가 준비된 뒤에 굽는다.** 폰트 로드 전에 구우면 폴백 글꼴 모양이 마스크에 박혀
// 나중에 진짜 폰트가 떠도 크롬은 엉뚱한 글자 모양으로 흐른다.
//
// **이것 없이도 워드마크는 완성이다.** 셰이더가 못 서면(WebGL 실패, 컴파일 실패, reduced motion)
// 밑에 깔린 steelText 글자가 그대로 보인다. 레이아웃도 그 글자가 잡는다.

import { useEffect, useRef, useState } from 'react';
import { ShaderMount } from '@paper-design/shaders';
import { liquidMetalFragmentShader, toProcessedLiquidMetal, LiquidMetalShapes } from '@paper-design/shaders';
import { ShaderFitOptions } from '@paper-design/shaders';
import { colors, displayFamily, steelText, typography } from '../tokens.js';

/** HEX를 0~1 rgba 배열로. **색은 토큰에서만 온다.** */
function rgba(hex, a = 1) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const v = parseInt(n, 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255, a];
}

/** GLSL이 읽을 `vec3(r, g, b)` 리터럴. steel 스톱을 셰이더 상수 자리에 그대로 넣는다. */
function vec3(hex) {
  const [r, g, b] = rgba(hex);
  return `vec3(${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`;
}

// ---------------------------------------------------------------------------
// **Apache-2.0 §4(b) 변경 고지.** 아래 두 줄이 원문 셰이더에서 우리가 바꾼 전부다.
//
// 원문의 밝은 스톱은 `vec3(.98, .98, 1.)`, 어두운 스톱은 `vec3(.1, .1, .1 + ...)`이고
// **둘 다 유니폼이 아니라 셰이더 상수**라 밖에서 넘길 방법이 없다.
// 어두운 스톱 0.1은 우리 배경 `#101010`(0.063)과 거의 붙어서, 그대로 두면 글자 안의
// 어두운 띠가 배경에 잠겨 워드마크가 조각나 보인다(DESIGN 1절 1항 위반).
// 그래서 두 스톱을 DESIGN 2절 크롬 스톱으로 바꾼다. hi가 밝은 쪽, shadow가 어두운 쪽이다.
// 치환은 앵커가 유일할 때만 하고, 못 찾으면 셰이더를 그대로 두고 폴백으로 내려간다.
// ---------------------------------------------------------------------------
const SHADER_PATCHES = [
  ['vec3 color1 = vec3(.98, 0.98, 1.);', `vec3 color1 = ${vec3(colors.steel.hi)};`],
  [
    'vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));',
    `vec3 color2 = ${vec3(colors.steel.shadow)} * (0.85 + 0.15 * smoothstep(.7, 1.3, diagTLtoBR));`,
  ],
];

/** 원문 셰이더에 steel 스톱을 넣는다. 앵커가 유일하지 않으면 null(폴백으로 간다). */
function patchShader(source) {
  let out = source;
  for (const [from, to] of SHADER_PATCHES) {
    if (out.split(from).length !== 2) return null;
    out = out.replace(from, to);
  }
  return out;
}

const DPR_CAP = 2;
// 워드마크 하나짜리 소형 캔버스다. 상한을 걸어 두면 4K에서도 버퍼가 안 커진다
const MAX_PIXELS = 1600 * 400 * DPR_CAP * DPR_CAP;

/** 화면에는 안 보이고 스크린리더는 읽는다. 캔버스가 글자를 대신해도 텍스트는 남아야 한다. */
const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export default function HeroWordmark({ text }) {
  const hostRef = useRef(null);
  const textRef = useRef(null);
  // 셰이더가 실제로 선 뒤에만 밑글자를 숨긴다. 먼저 숨기면 실패했을 때 화면이 빈다
  const [live, setLive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const glyph = textRef.current;
    if (!host || !glyph) return undefined;

    // 모션을 줄여 달라고 했으면 GPU를 안 태운다. steelText가 그대로 선다
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const shader = patchShader(liquidMetalFragmentShader);
    if (!shader) {
      // 앵커가 안 맞는다. 라이브러리 버전이 바뀐 것이라 색 통제를 못 한다. 폴백으로 간다
      console.warn('[brand] liquid-metal 셰이더 앵커가 안 맞는다. steelText로 간다.');
      return undefined;
    }

    let mount = null;
    let cancelled = false;

    /** 워드마크 글자를 그대로 캔버스에 굽는다. 셰이더 마스크의 원본이다. */
    function rasterize() {
      const box = glyph.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) return null;
      const cs = getComputedStyle(glyph);
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      // **밑글자와 같은 폰트 지표로 굽는다.** 하나라도 어긋나면 마스크가 글자와 안 겹친다
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.letterSpacing = cs.letterSpacing;
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#FFFFFF';
      // baseline을 박스 안에서 잡는다. 글자 상단이 박스 상단이라 ascent만큼 내린다
      const m = ctx.measureText(text);
      const ascent = m.actualBoundingBoxAscent || parseFloat(cs.fontSize) * 0.75;
      const top = (box.height - (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)) / 2;
      ctx.fillText(text, 0, top + ascent);
      return canvas;
    }

    async function build() {
      // **폰트가 준비될 때까지 기다린다.** 이걸 빼면 폴백 글꼴 모양이 마스크에 박힌다
      try {
        await document.fonts.ready;
      } catch {
        // 폰트 API가 없어도 계속 간다. 최악이라도 폴백 글꼴로 구울 뿐이다
      }
      if (cancelled) return;

      const raster = rasterize();
      if (!raster || cancelled) return;

      // 셰이더가 요구하는 전처리. R에 edge gradient, G에 opacity를 넣어 준다
      let image;
      try {
        const { pngBlob } = await toProcessedLiquidMetal(raster.toDataURL());
        if (cancelled) return;
        image = await loadImage(URL.createObjectURL(pngBlob));
      } catch {
        console.warn('[brand] 워드마크 마스크 전처리에 실패했다. steelText로 간다.');
        return;
      }
      if (cancelled) return;

      try {
        mount = new ShaderMount(
          host,
          shader,
          {
            // **`defaultObjectSizing`을 펼치지 않는다.** 그쪽 키는 `fit`, `scale`처럼 접두사가 없어서
            // ShaderMount가 없는 유니폼을 찾다가 경고를 쏟는다(실측). 값만 그대로 옮겨 적는다
            u_fit: ShaderFitOptions.contain,
            u_scale: 1,
            u_rotation: 0,
            u_offsetX: 0,
            u_offsetY: 0,
            u_originX: 0.5,
            u_originY: 0.5,
            u_worldWidth: 0,
            u_worldHeight: 0,
            u_image: image,
            u_isImage: true,
            u_shape: LiquidMetalShapes.none,
            // 배경은 투명하게 두고 페이지 무대가 비치게 한다
            u_colorBack: [0, 0, 0, 0],
            // 틴트는 색 번짐(color burn)이라 유채가 끼어들 자리다. 흰색으로 두어 무효화한다
            u_colorTint: rgba(colors.steel.hi),
            u_repetition: 2.4,
            u_softness: 0.35,
            // **분산을 0으로 못 박는다.** R과 B를 어긋나게 밀면 그 자리가 무지개가 된다(DESIGN 1절 2항)
            u_shiftRed: 0,
            u_shiftBlue: 0,
            u_distortion: 0.1,
            u_contour: 0.5,
            u_angle: 0,
          },
          { alpha: true, antialias: true },
          0.6,            // 흐름 속도. 배경이 아니라 워드마크라 느리게
          0,
          1,              // minPixelRatio. 기본 2는 항상 2배로 그린다. 실제 DPR을 쓰게 내린다
          MAX_PIXELS
        );
        // ShaderMount가 만든 캔버스에는 aria가 없다. 호스트가 이미 숨기지만 캔버스에도 직접 단다
        host.querySelector('canvas')?.setAttribute('aria-hidden', 'true');
        setLive(true);
      } catch {
        console.warn('[brand] liquid-metal 마운트에 실패했다. steelText로 간다.');
        mount = null;
        // **생성자가 캔버스를 먼저 붙이고 나중에 던진다**(설치본 실확인).
        // 그냥 두면 WebGL이 막힌 브라우저에 빈 캔버스가 남는다
        host.querySelector('canvas')?.remove();
      }
    }

    build();

    // 폰트나 폭이 바뀌면 마스크를 다시 굽는다. 글자 모양이 바뀌었는데 마스크가 그대로면 어긋난다
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (cancelled || !mount) return;
        const raster = rasterize();
        if (!raster) return;
        toProcessedLiquidMetal(raster.toDataURL())
          .then(({ pngBlob }) => loadImage(URL.createObjectURL(pngBlob)))
          .then((img) => { if (!cancelled && mount) mount.setUniforms({ u_image: img }); })
          .catch(() => {});
      }, 180);
    });
    ro.observe(glyph);

    return () => {
      cancelled = true;
      ro.disconnect();
      clearTimeout(resizeTimer);
      if (mount) {
        // **컨텍스트를 직접 놓는다.** 라이브러리 `dispose`는 텍스처와 프로그램만 지우고
        // 컨텍스트를 반납하지 않는다(설치본 실확인, `loseContext` 0건).
        // 그대로 두면 라우트를 오갈 때마다 컨텍스트가 쌓인다
        const canvas = host.querySelector('canvas');
        const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
        mount.dispose();
        const lose = gl && gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      }
      setLive(false);
    };
  }, [text]);

  return (
    <h1
      data-enter="wordmark"
      style={{
        position: 'relative',
        margin: 0,
        width: 'fit-content',
        lineHeight: typography.display.leading,
      }}
    >
      {/* 스크린리더가 읽는 것. 캔버스가 글자를 대신해도 이 텍스트는 안 사라진다 */}
      <span style={srOnly}>{text}</span>

      {/* 보이는 글자이자 레이아웃의 기준. 셰이더가 서면 자리만 남기고 감춘다.
          **`display: none`이 아니라 `visibility: hidden`이다.** 박스가 사라지면 캔버스 자리도 없어진다 */}
      <span
        ref={textRef}
        aria-hidden="true"
        style={{
          display: 'block',
          fontFamily: displayFamily,
          fontSize: typography.display.size,
          fontWeight: typography.display.weight,
          letterSpacing: typography.display.tracking,
          lineHeight: typography.display.leading,
          whiteSpace: 'nowrap',
          visibility: live ? 'hidden' : 'visible',
          ...steelText,
        }}
      >
        {text}
      </span>

      {/* 셰이더 캔버스가 여기 들어온다(ShaderMount가 prepend한다) */}
      <span
        ref={hostRef}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'block' }}
      />
    </h1>
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
