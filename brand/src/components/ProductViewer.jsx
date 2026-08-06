// 제품 360 뷰어. 상세 중앙에서 제품이 떠서 돈다.
//
// **실제 제품 3D 모델이 아직 없다.** 지금 도는 것은 크롬 재질 플레이스홀더 프리미티브이고
// 이 자리가 그대로 GLB로 교체된다. 교체 지점은 아래 `MODEL_URL`과 `createPlaceholder` 둘이다.
// **로더를 미리 import하지 않는다.** 부르지도 않을 `GLTFLoader`가 번들에 실리면 예산만 축낸다
// (설치본 `three/examples/jsm/loaders/GLTFLoader.js`에 있고, 모델이 확정되면 그때 건다).
//
// 회전은 설치본 애드온 OrbitControls다. `three/examples/jsm/controls/OrbitControls.js`에서
// `export { OrbitControls }`를 확인하고 썼다(three 0.185.1, package.json exports가 이 경로를 연다).
// **줌과 팬은 끈다.** 뷰어 안에서 배율과 중심이 흔들리면 제품 크기의 기준이 사라진다.
//
// 생명주기는 히어로 궤적(HeroTrail)과 같은 규약이다. 화면 밖이면 루프를 세우고,
// 언마운트에서 geometry, material, texture, renderer를 놓고 컨텍스트를 명시적으로 반납한다.
// **이 뷰어는 상세 라우트마다 새로 마운트된다.** 반납이 빠지면 상세 3종을 오갈 때마다
// 컨텍스트가 쌓여 브라우저 한도(보통 16)에 닿는다.

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { colors, spacing, typography } from '../tokens.js';
import { PRODUCT_DETAIL } from '../copy.js';
import { flipSettleMs } from '../lib/flip.js';

// 모델 자리. 값이 들어오면 여기서 GLTFLoader 분기가 시작된다.
// **지금은 셋 다 없다.** 없는 동안은 플레이스홀더가 뜬다
const MODEL_URL = { mask: null, controller: null };

const DPR_CAP = 2;
// OrbitControls 단위. 기본 2.0은 제품이 팽이처럼 돌아 형태가 안 읽힌다.
// 0.6이면 한 바퀴에 100초라 훑어보는 속도다
const AUTO_ROTATE_SPEED = 0.6;
// 크기가 멈춘 뒤에 그리기 버퍼를 다시 잡는다. **Flip 전환 중에 매 프레임 재할당하지 않기 위한 값이다**
const RESIZE_SETTLE_MS = 120;

/**
 * 크롬 환경. **반사할 것이 없으면 금속은 검게 나온다.**
 * DESIGN 3절의 크롬 그라디언트 스톱(hi, mid, shadow)을 그대로 세로 그라디언트로 굽고
 * 그것을 반사 환경으로 쓴다. 위가 밝고 아래가 어두워 무대와 같은 방향이다.
 */
function createChromeEnv(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, colors.steel.hi);
  grad.addColorStop(0.45, colors.steel.mid);
  grad.addColorStop(0.78, colors.steel.shadow);
  grad.addColorStop(1, colors.bg.deep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromEquirectangular(tex);
  // 굽고 나면 원본과 발전기는 필요 없다. 결과 렌더타깃만 들고 간다
  tex.dispose();
  pmrem.dispose();
  return target;
}

/**
 * 플레이스홀더 프리미티브. **제품인 척하지 않는 각진 다면체다.**
 * 한 축을 세워 방향을 주면 검과 같은 세로 축이 생겨 회전이 읽힌다.
 * 모델이 확정되면 이 함수가 통째로 GLB 로딩으로 바뀐다.
 */
function createPlaceholder(envMap) {
  const geometry = new THREE.OctahedronGeometry(0.62, 0);
  geometry.scale(0.72, 1.35, 0.72);

  const material = new THREE.MeshStandardMaterial({
    color: colors.steel.mid,
    metalness: 1,
    roughness: 0.22,
    envMap,
    envMapIntensity: 1.15,
    // 면이 각져야 크롬이 면마다 다른 밝기를 문다. 매끈하면 덩어리 하나로 보인다
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // 베벨 림. DESIGN 3절 "림 라이트를 steel.edge로 잡는다"를 선으로 세운다.
  // steel.edge는 rgba 문자열이라 THREE.Color에 그대로 못 넣는다. 값이 같은 hi + 알파로 만든다
  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(colors.steel.hi),
    transparent: true,
    opacity: 0.9,
  });
  mesh.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

  return { mesh, geometry, material, edgeGeometry, edgeMaterial };
}

/**
 * 씬을 세우고 정리 함수를 돌려준다. WebGL을 못 얻으면 폴백을 켜고 null을 돌려준다.
 * **여기서 만든 것은 전부 정리 함수가 되돌린다.** 라우트마다 새로 마운트되기 때문이다.
 */
function init(host, setFailed) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    // 컨텍스트를 못 얻으면 three가 던진다(설치본 실확인). 여기 하나만 막으면 된다
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    console.warn('[brand] WebGL을 못 얻었다. 제품 뷰어를 정적 폴백으로 낸다.');
    setFailed(true);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 20);
  camera.position.set(0, 0.42, 3.1);

  const env = createChromeEnv(renderer);
  const placeholder = createPlaceholder(env.texture);
  scene.add(placeholder.mesh);

  // 방향광 둘. 환경 반사 위에 또렷한 하이라이트를 하나 얹어 모서리를 세운다
  const key = new THREE.DirectionalLight(new THREE.Color(colors.steel.hi), 2.2);
  key.position.set(2, 3, 2);
  const fill = new THREE.DirectionalLight(new THREE.Color(colors.steel.mid), 0.8);
  fill.position.set(-2, -1, -1.5);
  scene.add(key, fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;   // 배율이 바뀌면 제품 크기의 기준이 흔들린다
  controls.enablePan = false;    // 중심이 흔들리면 회전이 궤도가 아니라 표류가 된다
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.75;
  controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
  // reduced motion이면 스스로 돌지 않는다. 드래그는 그대로 살려 둔다
  controls.autoRotate = !reduced;
  // **터치 세로 스크롤을 브라우저에 돌려준다.** connect가 touchAction을 none으로 덮어
  // 뷰어 위에서 손가락으로 페이지를 못 내리게 된다(설치본 실확인). brand는 스크롤 사이트다
  renderer.domElement.style.touchAction = 'pan-y';

  // 입력이 들어오면 자동 회전을 멈춘다. 사람이 잡은 각도를 기계가 뺏지 않는다
  const onStart = () => { controls.autoRotate = false; };
  controls.addEventListener('start', onStart);

  let needsRender = true;

  function applySize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  applySize();

  // 크기가 멈춘 다음에 한 번만 다시 잡는다. 창 크기 드래그가 매 프레임 버퍼를 재할당하지 않게
  let resizeTimer = 0;
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applySize, RESIZE_SETTLE_MS);
  });
  ro.observe(host);

  let raf = 0;
  let last = 0;
  let running = false;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    // **바뀐 게 없으면 그리지 않는다.** update가 카메라 변화를 알려 준다(설치본 반환값 확인).
    // 자동 회전이 꺼진 정지 상태에서 GPU를 계속 태우지 않는다
    if (controls.update(dt) || needsRender) {
      needsRender = false;
      renderer.render(scene, camera);
    }
  }

  function start() {
    if (running) return;
    running = true;
    last = 0; // 멈춰 있던 시간이 dt로 들어오지 않게 시계를 끊는다
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  // 뷰어가 화면 밖이면 그리지 않는다. 스펙을 읽는 동안 GPU를 놀린다
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0 }
  );
  io.observe(host);

  // 컨텍스트를 잃으면 정적 폴백으로 내려앉는다. 언마운트가 부르는 손실은 아래에서 먼저 끊는다
  const onLost = (e) => {
    e.preventDefault();
    stop();
    setFailed(true);
  };
  renderer.domElement.addEventListener('webglcontextlost', onLost);

  return () => {
    // **손실 리스너를 먼저 뗀다.** 아래 forceContextLoss가 이 핸들러를 동기로 부른다
    renderer.domElement.removeEventListener('webglcontextlost', onLost);
    io.disconnect();
    ro.disconnect();
    clearTimeout(resizeTimer);
    stop();
    controls.removeEventListener('start', onStart);
    controls.dispose();
    scene.remove(placeholder.mesh);
    placeholder.geometry.dispose();
    placeholder.material.dispose();
    placeholder.edgeGeometry.dispose();
    placeholder.edgeMaterial.dispose();
    env.dispose();
    // dispose만으로는 GPU 컨텍스트가 GC까지 남는다. 라우트마다 새로 마운트되므로 명시로 반납한다
    renderer.forceContextLoss();
    renderer.dispose();
    renderer.domElement.remove();
  };
}

export default function ProductViewer({ slug }) {
  const hostRef = useRef(null);
  // WebGL을 못 얻거나 컨텍스트를 잃으면 정적 폴백으로 내려앉는다. **페이지는 계속 산다**
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    // **전환이 끝난 뒤에 세운다.** 첫 셰이더 컴파일이 메인 스레드를 수백 ms 잡는데
    // 그 자리가 카드 상세 Flip 구간과 겹치면 rAF가 굶어 전환이 두 프레임으로 끊긴다(실측).
    // 전환이 없으면(주소 직접 진입) 0이라 다음 태스크에서 바로 선다
    let teardown = null;
    const boot = setTimeout(() => { teardown = init(host, setFailed); }, flipSettleMs());

    return () => {
      clearTimeout(boot);
      if (teardown) teardown();
    };
  }, [slug]);

  const viewer = PRODUCT_DETAIL.viewer;

  if (failed) return <Fallback text={viewer.unavailable} />;

  return (
    <>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
      {/* 캔버스 위 글자. **포인터를 막지 않는다.** 막으면 드래그 회전이 죽는다 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: spacing.unit * 1.5,
          pointerEvents: 'none',
        }}
      >
        <span style={captionStyle}>{MODEL_URL[slug] ? '' : viewer.placeholder}</span>
        <span style={captionStyle}>{viewer.hint}</span>
      </div>
    </>
  );
}

function Fallback({ text }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bg.deep,
      }}
    >
      <span style={captionStyle}>{text}</span>
    </div>
  );
}

const captionStyle = {
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  color: colors.text.dim,
};
