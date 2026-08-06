// S1 표지 커서 궤적. 가늘고 선명한 잉크 라인 하나(라이트 반전 전에는 레드였다).
//
// --- 출처 ---
// 코드 출발점은 추론이 아니라 실제 소스다. 두 곳을 읽고 가져왔다.
//  1) node_modules/ogl/src/extras/Polyline.js (ogl 1.0.11 설치본)
//     - 생성자 인자 { points, vertex, fragment, uniforms, attributes }
//     - points는 Vec3 배열이고 **점당 하나만 넘긴다**(정점 이중화는 클래스가 한다)
//     - 자동 유니폼 uResolution / uDPR / uThickness / uColor / uMiter
//     - updateGeometry()가 position/prev/next를 다시 채우고 needsUpdate를 세운다
//     - resize()가 uResolution을 gl.canvas.width/height로, uDPR을 renderer.dpr로 갱신
//  2) https://raw.githubusercontent.com/oframe/ogl/master/examples/polylines.html
//     - 커스텀 vertex 셰이더 전문(aspect 보정, prev/next 탄젠트, 법선 90도 회전,
//       uv.y 테이퍼, 점 겹침 시 smoothstep 축소, pixelWidthRatio 폭 환산)
//     - 스프링/프릭션 마우스 추적 루프(i=0은 스프링으로 마우스 추종, 나머지는 앞 점으로 lerp)
//     - 마우스 정규화 (x/width)*2-1, (y/height)*-2+1
//     - resize에서 renderer.setSize 후 polyline.resize() 호출
// 예제에서 바꾼 것: 라인 5개 → 1개, 색을 tokens.red로, 두께 20~50 → 얇게,
// 스프링 강하게 프릭션 낮게, 테이퍼를 양끝 → 꼬리 쪽으로, fragment 셰이더 신설(코어 하이라이트),
// idle 나선 추가, body 대신 전달받은 캔버스에 마운트, React 생명주기.
// ---

import { useEffect, useRef } from 'react';
import { Renderer, Transform, Vec3, Color, Polyline } from 'ogl';
import { colors, motion } from '../tokens.js';

// --- 튜닝 상수 ---
const POINT_COUNT = 40; // 폴리라인 점 개수(상한 50)
const THICKNESS = 4.2; // 선 두께(px 상당). 얇고 선명하게
const SPRING = 0.42; // 강하게. 커서에 즉각 붙는다
const FRICTION = 0.56; // 낮게. 관성으로 흐물거리지 않는다
// 뒤 점이 앞 점을 따라가는 비율. 높을수록 짧고 딱 붙고, 낮을수록 꼬리가 길어진다.
// **머리의 날카로움은 SPRING/FRICTION이 쥔다.** 이 값은 꼬리 길이만 정한다.
const TAIL_LERP = 0.78;

// idle 나선(VORTEX). 마우스가 없을 때 중앙을 향해 감겼다 풀린다.
const IDLE_RADIUS = 0.46; // 화면 정규 좌표(-1~1) 기준 최대 반경
const IDLE_SPEED = 1.75; // rad/s. 각속도. 느리면 꼬리가 안 자라 궤적이 안 읽힌다
const IDLE_BREATH = 0.62; // 반경이 감겼다 풀리는 폭. 이게 나선으로 읽히게 하는 값이다
const IDLE_BREATH_SPEED = 0.13; // 반경 변화 속도(감김 주기)
const IDLE_RESUME_MS = 1800; // 커서가 멈춘 뒤 나선으로 돌아가기까지
const IDLE_BLEND = 0.055; // 나선과 커서 사이 전환 속도

// 예제 polylines.html의 vertex 셰이더를 그대로 가져오고 테이퍼 한 줄만 바꿨다.
const vertex = /* glsl */ `
    precision highp float;

    attribute vec3 position;
    attribute vec3 next;
    attribute vec3 prev;
    attribute vec2 uv;
    attribute float side;

    uniform vec2 uResolution;
    uniform float uDPR;
    uniform float uThickness;

    varying vec2 vUv;

    vec4 getPosition() {
        vec4 current = vec4(position, 1);

        vec2 aspect = vec2(uResolution.x / uResolution.y, 1);
        vec2 nextScreen = next.xy * aspect;
        vec2 prevScreen = prev.xy * aspect;

        // Calculate the tangent direction
        vec2 tangent = normalize(nextScreen - prevScreen);

        // Rotate 90 degrees to get the normal
        vec2 normal = vec2(-tangent.y, tangent.x);
        normal /= aspect;

        // 예제는 양 끝을 다 좁혔다(abs(uv.y - 0.5)). 우리는 머리(커서 쪽)를 살리고
        // 꼬리로 갈수록 가늘어지게 바꿨다. 채찍처럼 읽혀야 한다.
        normal *= mix(1.0, 0.06, pow(uv.y, 1.35));

        // When the points are on top of each other, shrink the line to avoid artifacts.
        float dist = length(nextScreen - prevScreen);
        normal *= smoothstep(0.0, 0.02, dist);

        float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
        float pixelWidth = current.w * pixelWidthRatio;
        normal *= pixelWidth * uThickness;
        current.xy -= normal * side;

        return current;
    }

    void main() {
        vUv = uv;
        gl_Position = getPosition();
    }
`;

// fragment는 예제에 없다(예제는 Polyline 기본 fragment의 불투명 단색을 쓴다).
// 얇은 코어 + 중앙 하이라이트 + 안티에일리어싱 가장자리가 필요해 신설했다.
const fragment = /* glsl */ `
    precision highp float;

    uniform vec3 uColor;
    uniform vec3 uCore;

    varying vec2 vUv;

    void main() {
        // uv.x는 리본 폭을 가로지른다(Polyline.js가 side -1/+1에 uv.x 0/1을 붙인다).
        float across = abs(vUv.x - 0.5) * 2.0;

        // 가장자리 안티에일리어싱. 번지는 연기가 아니라 선명한 경계다.
        float edge = smoothstep(1.0, 0.55, across);

        // 중앙의 아주 얇은 밝은 코어.
        float core = smoothstep(0.34, 0.0, across);

        // 꼬리로 갈수록 사라진다.
        float life = 1.0 - smoothstep(0.0, 1.0, vUv.y);

        vec3 col = mix(uColor, uCore, core * 0.8);
        float a = edge * life;

        // 가산 블렌딩이라 색에 알파를 미리 곱한다.
        gl_FragColor = vec4(col * a, a);
    }
`;

export default function VortexLine({ active }) {
  const hostRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // **캔버스를 이 이펙트가 직접 만들고 직접 버린다.** JSX 캔버스를 재사용하면 두 가지가 깨진다.
    //  1) Renderer.setSize가 인라인 style.width/height를 px로 덮어써 CSS width:100%가 죽는다(실측 300x150 고착)
    //  2) StrictMode 이중 마운트에서 cleanup의 loseContext() 뒤 같은 캔버스에 다시 붙어
    //     컨텍스트를 잃은 채로 렌더한다(실측 gl.getError 0x9242 CONTEXT_LOST_WEBGL, 에러 483건)
    let renderer;
    try {
      renderer = new Renderer({
        alpha: true, // 투명 배경. 뒤의 표지 사진이 비친다
        dpr: Math.min(window.devicePixelRatio || 1, motion.budget.dprCap),
        // MSAA를 끈다. 프래그먼트가 vUv.x로 가장자리를 직접 스무딩하므로 중복이다.
        // (fps 개선은 없었다. 실측 20.1 → 18.3으로 오차 범위. 끄는 이유는 중복 제거 하나뿐이다)
        antialias: false,
        depth: false,
      });
    } catch {
      return undefined; // WebGL 실패는 조용히 포기한다. 표지의 사진과 텍스트는 그대로 산다
    }
    const gl = renderer.gl;
    if (!gl) return undefined;
    const canvas = gl.canvas;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.display = 'block';
    host.appendChild(canvas);
    gl.clearColor(0, 0, 0, 0);

    const scene = new Transform();

    // Vec3 배열. 점당 하나만 넘긴다(Polyline.js가 정점을 이중화한다).
    const points = [];
    for (let i = 0; i < POINT_COUNT; i += 1) points.push(new Vec3());

    const polyline = new Polyline(gl, {
      points,
      vertex,
      fragment,
      uniforms: {
        // 라이트 반전: 레드 발광 대신 잉크 단색 라인. 코어도 잉크(라이트 위에서는 하이라이트가 필요 없다).
        uColor: { value: new Color(colors.ink) },
        uCore: { value: new Color(colors.ink) },
        uThickness: { value: THICKNESS },
      },
    });

    // 프리멀티플라이드 알파의 일반 합성. 라이트 배경 위에 어두운 라인이 그대로 얹힌다.
    // (프래그먼트가 col*a로 이미 알파를 곱하므로 소스 계수는 ONE이다.)
    polyline.program.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    polyline.program.depthTest = false;
    polyline.program.depthWrite = false;

    polyline.mesh.setParent(scene);

    // 예제의 resize: setSize 후 polyline.resize()로 해상도 유니폼을 갱신한다.
    // **크기는 host에서 잰다.** setSize가 캔버스 인라인 스타일을 덮어쓰므로 캔버스를 재면 자기 값을 되읽어 고착된다.
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h);
      polyline.resize();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // --- 마우스 추적. 예제의 정규화식을 그대로 쓴다. ---
    const mouse = new Vec3();
    const target = new Vec3(); // 커서와 나선을 섞은 최종 목표점
    let lastMoveAt = -Infinity;
    let hasPointer = false;

    const updateMouse = (e) => {
      const r = host.getBoundingClientRect();
      // 예제는 pageX를 window 크기로 나눴다. 우리 캔버스는 섹션 안이라 rect 기준으로 바꿨다.
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * -2 + 1, 0);
      lastMoveAt = performance.now();
      hasPointer = true;
    };
    window.addEventListener('pointermove', updateMouse, { passive: true });

    // --- 루프. 예제의 스프링/프릭션 구조를 그대로 두고 목표점만 갈아끼웠다. ---
    const tmp = new Vec3();
    const mouseVelocity = new Vec3();
    const spiral = new Vec3();
    let idleMix = 1; // 1이면 완전 나선, 0이면 완전 커서
    let raf = 0;
    let last = performance.now();
    const t0 = last;

    // reduced motion: 나선을 돌리지 않고 정지 상태 한 번만 그린다.
    const step = (now) => {
      raf = requestAnimationFrame(step);
      if (!activeRef.current) return; // 섹션을 벗어나면 갱신을 멈춘다

      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const t = (now - t0) / 1000;

      // idle 나선. 각도는 일정하게 돌고 반경이 감겼다 풀린다 → 중앙으로 빨려들었다 퍼지는 소용돌이.
      // 클립 공간은 x도 y도 -1~1이라 화면이 가로로 길면 원이 타원으로 늘어난다. x를 종횡비로 나눠 보정한다.
      const aspect = (renderer.width || 1) / (renderer.height || 1);
      const breath = 1 - IDLE_BREATH * (0.5 - 0.5 * Math.cos(t * IDLE_BREATH_SPEED * Math.PI * 2));
      const ang = t * IDLE_SPEED;
      const r = IDLE_RADIUS * breath;
      spiral.set((Math.cos(ang) * r) / aspect, Math.sin(ang) * r, 0);

      // 커서가 한동안 없으면 나선으로 돌아간다. 커서가 들어오면 나선을 낚아챈다.
      const idleWanted = !hasPointer || now - lastMoveAt > IDLE_RESUME_MS ? 1 : 0;
      idleMix += (idleWanted - idleMix) * IDLE_BLEND;

      target.set(
        spiral.x * idleMix + mouse.x * (1 - idleMix),
        spiral.y * idleMix + mouse.y * (1 - idleMix),
        0
      );

      // ↓ 여기부터 예제 polylines.html update()의 점 갱신 로직 그대로.
      for (let i = points.length - 1; i >= 0; i -= 1) {
        if (!i) {
          tmp.copy(target).sub(points[i]).multiply(SPRING);
          mouseVelocity.add(tmp).multiply(FRICTION);
          points[i].add(mouseVelocity);
        } else {
          points[i].lerp(points[i - 1], TAIL_LERP);
        }
      }
      polyline.updateGeometry();

      renderer.render({ scene });
    };

    if (reduced) {
      // 정적 한 장. 나선 한 바퀴를 미리 감아 두고 한 번만 그린다.
      for (let i = points.length - 1; i >= 0; i -= 1) {
        const a = (i / points.length) * Math.PI * 2;
        points[i].set(Math.cos(a) * IDLE_RADIUS, Math.sin(a * 1.31) * IDLE_RADIUS * 0.62, 0);
      }
      polyline.updateGeometry();
      renderer.render({ scene });
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', updateMouse);
      // 실제 소스에 있는 정리 메서드만 부른다(Program.remove / Geometry.remove).
      polyline.program.remove();
      polyline.geometry.remove();
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      canvas.remove(); // 이 캔버스는 버린다. 다음 마운트는 새 캔버스와 새 컨텍스트를 만든다
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2, // 표지 사진 위, 워드마크 텍스트(zIndex 3) 아래
      }}
    />
  );
}
