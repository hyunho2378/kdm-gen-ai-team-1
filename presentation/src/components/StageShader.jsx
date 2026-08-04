// P5 배경 셰이더. 콘텐츠 뒤 fixed 풀스크린 캔버스에 snoise 기반 은은한 일렁임.
// three.js 없이 raw WebGL(풀스크린 삼각형 1개 + 프래그먼트 하나). R3F 배제 판정과 일관, 의존성 0.
// 위계 경고 준수: displacement/alpha 극히 낮게. 텍스트·카드 가독성을 해치면 안 된다.
// 콘텐츠 뒤 레이어(zIndex -1, StageBackground 그라디언트 위에 옅게 합성), pointer-events none.
// 저하: WebGL 실패 / 모바일(pointer coarse) / reduced-motion에서 미로드 → 정적 그라디언트가 그대로 폴백.
// requestIdleCallback 이후 로드해 LCP를 막지 않는다. 핵심 UI를 이 효과에 인질 잡히지 않는다.
//
// snoise는 Ashima Arts / Stefan Gustavson webgl-noise(MIT)의 3D simplex를 그대로 이식했다. CREDITS 기록.

import { useEffect, useRef } from 'react';
import { isReduced } from '../lib/motionMode.js';

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;   // 0..1, y up
uniform float u_active; // 0..1 커서 활성(정지 시 감쇠)

// ---- Simplex 3D noise — Ashima Arts / Stefan Gustavson (MIT), webgl-noise ----
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 pp = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = pp - 49.0 * floor(pp * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
// ---- end webgl-noise ----

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 auv = vec2(uv.x * aspect, uv.y);
  vec2 am = vec2(u_mouse.x * aspect, u_mouse.y);

  // 느린 흐름. 강도는 극히 낮게 둔다(은은).
  float n = snoise(vec3(auv * 2.2, u_time * 0.05));
  float n2 = snoise(vec3(auv * 4.5 + 11.0, u_time * 0.08));
  float flow = 0.5 + 0.5 * n;

  // 커서 주변만 아주 약하게 밝아진다. 정지 시 u_active가 감쇠하며 가라앉는다.
  float d = distance(auv, am);
  float m = smoothstep(0.42, 0.0, d) * u_active;

  // 스틸 톤. 어두운 무대 위 미묘한 흐름 수준(그라디언트 위 합성).
  vec3 col = mix(vec3(0.10, 0.12, 0.16), vec3(0.78, 0.84, 0.92), flow);
  float base = 0.020;                 // 상시 극미세
  float a = base + 0.055 * m;         // 커서 근처 최대 ~0.075
  a *= (0.55 + 0.45 * n2 * n2);       // 얼룩덜룩하지 않게 부드럽게
  gl_FragColor = vec4(col * a, a);    // premultiplied 느낌으로 어둡게 합성
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
  return s;
}

export default function StageShader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isReduced()) return undefined;                                   // reduced motion 비활성
    if (window.matchMedia('(pointer: coarse)').matches) return undefined; // 모바일 미로드
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let gl = null;
    let raf = 0;
    let disposed = false;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0 };
    const DPR_CAP = 1.5; // 배경 효과라 해상도를 낮춰 GPU를 아낀다

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        if (gl) gl.viewport(0, 0, w, h);
      }
    }

    function init() {
      if (disposed) return;
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
      if (!gl) return; // 실패 → 정적 그라디언트 폴백(StageBackground)

      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return;
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      // 풀스크린 삼각형 하나
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(prog, 'u_res');
      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uMouse = gl.getUniformLocation(prog, 'u_mouse');
      const uActive = gl.getUniformLocation(prog, 'u_active');

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied alpha
      resize();

      const t0 = performance.now();
      const loop = (now) => {
        if (disposed) return;
        // 커서 지연 추종 + 정지 시 활성 감쇠(relax)
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;
        mouse.active *= 0.96;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (now - t0) / 1000);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uActive, mouse.active);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
      mouse.active = 1;
    };
    const onResize = () => resize();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);

    // LCP를 막지 않도록 idle 이후 초기화
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    const idleId = ric(init);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (window.cancelIdleCallback && typeof idleId === 'number') window.cancelIdleCallback(idleId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      const lose = gl && gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}
    />
  );
}
