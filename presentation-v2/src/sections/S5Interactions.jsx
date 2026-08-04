// S5 인터랙션 4종. 4개 판을 방향키로 넘기는 풀스크린 WebGL 시연. 선 도표·CSS 슬라이더 금지.
// 판1 블레이드 트래킹: arena 리본(마우스=검끝). 판2 풋워크 판정: 거리 셰이더(유효 35~55 → 가장자리 레드).
// 판3 페인트 판독: gl-transitions directionalwarp로 가짜(실버)↔진짜(레드) 교차. 판4 시간 팽창: 리본+비네트+색수차, 느리게.
// 셸 위임: S5 안에서 방향키로 판1~4 넘기고, 판4에서 한 번 더면 S6로(S2 스크럽과 같은 서브 진행 구조).
// 팔레트 블랙·실버·레드. 내 검 실버-시안, 상대 레드.

import { useEffect, useRef, useState } from 'react';
import { colors } from '../tokens.js';
import { createRibbonPanel } from '../panels/ribbonPanel.js';
import { createShaderPanel } from '../panels/shaderPanel.js';

// 판2 풋워크: 마우스=검끝(실버-시안 글로우). 마우스 x → 거리 0~100. 유효 35~55에서 화면 가장자리가 레드로 차오른다.
const FOOTWORK_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
void main(){
  vec2 uv = gl_FragCoord.xy/u_res;
  float aspect = u_res.x/u_res.y;
  vec2 d = (uv - u_mouse) * vec2(aspect, 1.0);
  float tip = exp(-dot(d,d)*11.0);                 // 검끝 글로우
  float distance = u_mouse.x * 100.0;              // 거리
  float inRange = smoothstep(34.0,39.0,distance) * (1.0 - smoothstep(51.0,56.0,distance)); // 35~55
  vec2 c = (uv-0.5)*vec2(aspect,1.0);
  float edge = smoothstep(0.20, 0.62, length(c)); // 가장자리 비네트
  float pulse = 0.72 + 0.28*sin(u_time*3.0);
  vec3 silver = vec3(0.66,0.87,1.0);
  vec3 red = vec3(0.70,0.07,0.17);
  vec3 col = silver * tip * 0.9;
  col += red * edge * inRange * pulse * 1.5;        // 유효 범위면 가장자리 레드
  col += vec3(0.018,0.02,0.026) * (1.0 - edge*0.4); // 미세 바닥 필드
  float a = clamp(max(col.r,max(col.g,col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}`;

// 판3 페인트: directionalwarp(gl-transitions, MIT/pschroen)로 가짜↔진짜 교차. from=실버 예고, to=레드 공격.
const FEINT_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
vec4 getFromColor(vec2 uv){ // 가짜(예고): 은은한 실버 스트라이프
  float s = 0.5+0.5*sin(uv.y*9.0 + u_time*0.6);
  return vec4(vec3(0.5,0.66,0.82) * (0.10 + 0.55*pow(s,3.0)), 1.0);
}
vec4 getToColor(vec2 uv){ // 진짜(공격): 날카로운 레드 슬래시
  float s = 0.5+0.5*sin(uv.x*3.0 - uv.y*7.0 + u_time*2.2);
  return vec4(vec3(0.72,0.09,0.18) * (0.12 + 0.9*pow(s,6.0)), 1.0);
}
float progress;
const vec2 center = vec2(0.5,0.5);
vec4 transition(vec2 uv){
  float smoothness = 0.3;
  vec2 dir = vec2(-1.0, 0.35);
  vec2 v = normalize(dir); v /= abs(v.x)+abs(v.y);
  float d = v.x*center.x + v.y*center.y;
  float m = 1.0 - smoothstep(-smoothness, 0.0, v.x*uv.x + v.y*uv.y - (d - 0.5 + progress*(1.0+smoothness)));
  return mix(getFromColor((uv-0.5)*(1.0-m)+0.5), getToColor((uv-0.5)*m+0.5), m);
}
void main(){
  vec2 uv = gl_FragCoord.xy/u_res;
  progress = 0.5+0.5*sin(u_time*0.7);   // 가짜/진짜가 계속 교차
  gl_FragColor = vec4(transition(uv).rgb, 1.0);
}`;

const PANELS = [
  { key: 'blade', name: '블레이드 트래킹', kind: 'ribbon' },
  { key: 'footwork', name: '풋워크 판정', kind: 'shader', frag: FOOTWORK_FRAG },
  { key: 'feint', name: '페인트 판독', kind: 'shader', frag: FEINT_FRAG },
  { key: 'dilation', name: '시간 팽창', kind: 'dilation' },
];

export default function S5Interactions({ active, registerHandler, registerEnter }) {
  const canvasRefs = useRef([]);
  const [panel, setPanel] = useState(0);
  const panelRef = useRef(0);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const instances = new Array(PANELS.length).fill(null);
    const mouse = { nx: 0.5, ny: 0.5, moved: false };

    function initPanel(i) {
      const canvas = canvasRefs.current[i];
      if (!canvas) return null;
      const p = PANELS[i];
      let inst;
      if (p.kind === 'ribbon') inst = createRibbonPanel(canvas, {});
      else if (p.kind === 'dilation') inst = createRibbonPanel(canvas, { timeDilation: true });
      else inst = createShaderPanel(canvas, p.frag);
      inst?.resize();
      return inst;
    }

    const onMove = (e) => {
      mouse.nx = e.clientX / window.innerWidth;
      mouse.ny = 1 - e.clientY / window.innerHeight;
      mouse.moved = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    const onResize = () => instances.forEach((inst) => inst?.resize());
    window.addEventListener('resize', onResize);

    let raf = 0;
    let last = performance.now();
    const t0 = last;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      const i = panelRef.current;
      if (!instances[i]) instances[i] = initPanel(i);
      const inst = instances[i];
      if (!inst) return;
      const dt = (now - last) / 1000;
      last = now;
      if (PANELS[i].kind === 'shader') {
        inst.render((now - t0) / 1000, mouse.nx, mouse.ny);
      } else {
        if (mouse.moved) { inst.setMouse(mouse.nx * 2 - 1, mouse.ny * 2 - 1); mouse.moved = false; }
        inst.render(dt, reduced);
      }
    }
    raf = requestAnimationFrame(loop);

    // 셸 위임: 방향키로 판 이동, 경계(판0 위/판3 아래)에서만 섹션 이동.
    const handlePanel = (dir) => {
      const next = panelRef.current + dir;
      if (next < 0 || next >= PANELS.length) return false; // 경계 → 셸이 S4/S6로
      panelRef.current = next;
      setPanel(next);
      return true;
    };
    const handleEnter = (dir) => {
      panelRef.current = dir > 0 ? 0 : PANELS.length - 1;
      setPanel(panelRef.current);
    };
    registerHandler(handlePanel);
    registerEnter(handleEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      registerHandler(null);
      registerEnter(null);
      instances.forEach((inst) => inst?.dispose());
    };
  }, [active, registerHandler, registerEnter]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 4판 캔버스 스택. active 판만 렌더되고, 크로스페이드로 전환. */}
      {PANELS.map((p, i) => (
        <canvas
          key={p.key}
          ref={(el) => { canvasRefs.current[i] = el; }}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            opacity: panel === i ? 1 : 0,
            transition: 'opacity 420ms ease',
          }}
        />
      ))}

      {/* 명사 라벨(활성 판 하나) + 판 진행 표시 */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(20px, 5vw, 72px)',
          bottom: 'clamp(56px, 11vh, 130px)',
          zIndex: 3,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          textShadow: '0 2px 30px rgba(5,5,6,0.7)',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {PANELS.map((p, i) => (
            <span
              key={p.key}
              style={{
                width: 22,
                height: 2,
                background: i <= panel ? colors.red : `${colors.silver.shadow}66`,
                transition: 'background-color 300ms ease',
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
            fontSize: 'clamp(1.4rem, 3.6vw, 2.6rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: colors.text.primary,
          }}
        >
          {PANELS[panel].name}
        </span>
      </div>
    </div>
  );
}
