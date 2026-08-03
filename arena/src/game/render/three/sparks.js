// 책임: 금속 스파크 파티클. 패리 성공 순간 두 검이 맞부딪는 지점에서 튄다.
//
// 색은 흰색에서 steel로 간다. **red를 쓰지 않는다.** 레드는 득점 전용이다(DESIGN 2절).
//
// 풀링한다. burst마다 지오메트리를 새로 만들면 교전 중 프레임이 튄다(2D 파티클과 같은 이유).
// 상한은 tokens의 particleMax를 그대로 따른다.
//
// 알파 대신 색을 어둡게 해서 사라지게 한다. 가산 블렌딩에서는 검정이 곧 투명이라
// 커스텀 셰이더 없이 정점 색만으로 감쇠가 성립한다.

import * as THREE from 'three';
import { colors, motion } from '../../../tokens.js';

const MAX = motion.budget.particleMax;
const LIFE_SEC = 0.42;
const GRAVITY = -3.2;
const DRAG = 2.6;

/** 렌더 전용 난수. 판정은 이 값을 절대 보지 않으므로 시드가 필요 없다. */
function rand(seedRef) {
  seedRef.v = (seedRef.v * 1664525 + 1013904223) >>> 0;
  return seedRef.v / 4294967296;
}

export function createSparks(scene) {
  const positions = new Float32Array(MAX * 3);
  const vcolors = new Float32Array(MAX * 3);
  const vel = new Float32Array(MAX * 3);
  const life = new Float32Array(MAX);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(vcolors, 3));
  geometry.setDrawRange(0, 0);

  const material = new THREE.PointsMaterial({
    size: 0.028,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 2;
  scene.add(points);

  const hot = new THREE.Color(colors.steel.hi);
  const cool = new THREE.Color(colors.steel.shadow);
  const tmp = new THREE.Color();
  const seed = { v: 20260804 };
  let alive = 0;

  return {
    points,

    /** 두 검이 맞부딪는 지점에서 튄다. count는 상한 안에서 잘린다. */
    burst(worldPos, count = 26) {
      const n = Math.min(count, MAX - alive);
      for (let i = 0; i < n; i += 1) {
        const k = alive + i;
        positions[k * 3] = worldPos.x;
        positions[k * 3 + 1] = worldPos.y;
        positions[k * 3 + 2] = worldPos.z;
        // 구면 방향에 위쪽 성분을 얹는다. 부딪힌 쇠가 위로 튀는 인상이다
        const a = rand(seed) * Math.PI * 2;
        const b = Math.acos(2 * rand(seed) - 1);
        const sp = 0.9 + rand(seed) * 2.1;
        vel[k * 3] = Math.sin(b) * Math.cos(a) * sp;
        vel[k * 3 + 1] = Math.cos(b) * sp * 0.6 + 1.1;
        vel[k * 3 + 2] = Math.sin(b) * Math.sin(a) * sp;
        life[k] = LIFE_SEC * (0.6 + rand(seed) * 0.4);
      }
      alive += n;
    },

    update(dtSec) {
      if (alive === 0) {
        geometry.setDrawRange(0, 0);
        return;
      }
      const drag = Math.max(0, 1 - DRAG * dtSec);
      let w = 0;
      for (let k = 0; k < alive; k += 1) {
        const t = life[k] - dtSec;
        if (t <= 0) continue;
        const s = k * 3;
        const d = w * 3;
        vel[s + 1] += GRAVITY * dtSec;
        const vx = vel[s] * drag;
        const vy = vel[s + 1] * drag;
        const vz = vel[s + 2] * drag;
        // 살아남은 것만 앞으로 당겨 담는다. 배열에 구멍을 내지 않아 drawRange가 그대로 쓰인다
        positions[d] = positions[s] + vx * dtSec;
        positions[d + 1] = positions[s + 1] + vy * dtSec;
        positions[d + 2] = positions[s + 2] + vz * dtSec;
        vel[d] = vx;
        vel[d + 1] = vy;
        vel[d + 2] = vz;
        life[w] = t;

        // 흰 불꽃이 steel로 식는다. 검정에 가까워지면 가산 블렌딩에서 사라진다
        const f = t / LIFE_SEC;
        tmp.copy(cool).lerp(hot, Math.min(1, f * 1.4)).multiplyScalar(Math.min(1, f * 1.8));
        vcolors[d] = tmp.r;
        vcolors[d + 1] = tmp.g;
        vcolors[d + 2] = tmp.b;
        w += 1;
      }
      alive = w;
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.setDrawRange(0, alive);
    },

    clear() {
      alive = 0;
      geometry.setDrawRange(0, 0);
    },
    count() {
      return alive;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    },
  };
}
