// 책임: 검끝 궤적 리본. 이 프로젝트의 모티프이자 화면의 주인공이다.
//
// ribbon-geometry를 쓰지 않는다. 그 라이브러리는 생성자 전용이라 in-place 갱신이 없고
// 폭이 단일 상수여서 나이별 폭 감쇠를 못 한다. 매 프레임 BufferGeometry를 새로 만들면
// 240 세그먼트 x 60fps 만큼 가비지가 쌓인다(파티클을 풀링한 것과 같은 이유로 피한다).
// 그래서 버퍼를 미리 잡아 두고 제자리에서 갱신한다. 할당은 생성 시 한 번뿐이다.
//
// 색은 tokens에서만 온다. 셰이더 유니폼에도 HEX를 적지 않는다.
// 정점 색 attribute를 itemSize 4로 두면 three가 알파까지 읽는다(USE_COLOR_ALPHA). 커스텀 셰이더가 필요 없다.

import * as THREE from 'three';
import { colors, motion } from '../../../tokens.js';

const MAX = motion.budget.trailMaxSegments;
// 시연 안정화(DEMO_STABILIZE): 잔상을 줄이려 수명을 한 단계 낮췄다(520 → 420).
// 60fps에서 프레임당 한 점을 밀므로 보이는 길이는 이 수명이 정한다(MAX 240은 여유분이라 안 묶인다).
// 급회전(패리 스냅)에서 길게 번지던 꼬리가 짧아진다. 밋밋하면 520 쪽으로 한 단계 되돌린다.
const LIFE_MS = 420;
// 명중 순간 흰 코어로 굳히는 최근 구간 길이.
// 흰 코어는 가산 블렌딩에서 포화되고 그 위에 블룸이 얹혀 실제 폭보다 훨씬 굵게 보인다.
// 18구간에 폭 1.9배로 두었더니 상대 앞에 흰 판자가 섰다(실측). 코어는 좁고 짧아야 코어로 읽힌다.
const HIT_SEGMENTS = 12;
const HIT_WIDTH_SCALE = 1.3;
// 순간이동 판별. 검끝이 이 속도보다 빠르게 움직였다면 그것은 궤적이 아니라 자리 이동이다.
// 상대가 포즈를 바꾸며 겨냥을 크게 돌릴 때 두 점 사이가 벌어져
// 화면을 가로지르는 거대한 띠가 그려지는 것을 실측했다. 끊긴 자리에서 새로 시작한다.
//
// 고정 거리로 두면 안 된다. 프레임이 길어지는 저성능 환경에서는 정상적인 큰 걸음까지 잘려
// 리본이 통째로 사라진다(실측). 프레임 시간에 비례시키고 최소값만 둔다.
const TELEPORT_MPS = 12;
const TELEPORT_MIN_M = 0.35;
// 굳은 구간이 버티는 시간. JUDGE 동안만이고 그 뒤에는 보통 구간처럼 사라진다.
// 해제 조건이 없으면 흰 코어가 화면에 영구히 박힌다(V4c 실측).
const HIT_HOLD_MS = motion.duration.judge;

// 시연 안정화(DEMO_STABILIZE): 리본 폭을 한 단계 줄였다(0.045 → 0.040). 얇을수록 잔상이 덜 번진다.
export function createTrailRibbon({ core, glow, width = 0.04 }) {
  const coreColor = new THREE.Color(core);
  const glowColor = new THREE.Color(glow);
  const hitColor = new THREE.Color(colors.trail.hit);

  // 링 버퍼. points[i]는 { pos, age, hit }
  const points = [];
  for (let i = 0; i < MAX; i += 1) {
    points.push({ pos: new THREE.Vector3(), age: 0, hit: false, live: false });
  }
  let head = 0; // 다음에 쓸 자리
  let count = 0;

  const positions = new Float32Array(MAX * 2 * 3);
  const vcolors = new Float32Array(MAX * 2 * 4);
  const indices = new Uint16Array((MAX - 1) * 6);
  for (let i = 0; i < MAX - 1; i += 1) {
    const a = i * 2;
    indices.set([a, a + 1, a + 2, a + 2, a + 1, a + 3], i * 6);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(vcolors, 4));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setDrawRange(0, 0);

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false, // 가산 발광이 톤매핑에 눌리지 않게 한다
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; // 리본은 카메라 앞을 스치므로 컬링에 잘못 걸린다

  const tangent = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  const side = new THREE.Vector3();
  const tmpColor = new THREE.Color();

  /** 오래된 것부터 순서대로 훑는다. 링 버퍼를 시간순 배열처럼 읽는 헬퍼다. */
  function at(k) {
    return points[(head - count + k + MAX * 2) % MAX];
  }

  return {
    mesh,

    push(v, dtSec = 1 / 60) {
      // 직전 점에서 너무 멀면 이력을 버린다. 이어 붙이면 없던 궤적을 그리게 된다
      if (count > 0) {
        const limit = Math.max(TELEPORT_MIN_M, TELEPORT_MPS * dtSec);
        const prev = points[(head - 1 + MAX) % MAX];
        if (prev.pos.distanceToSquared(v) > limit * limit) {
          count = 0;
          head = 0;
          for (const q of points) {
            q.live = false;
            q.hit = false;
            q.age = 0;
          }
        }
      }
      const p = points[head];
      p.pos.copy(v);
      p.age = 0;
      p.hit = false;
      p.live = true;
      head = (head + 1) % MAX;
      count = Math.min(count + 1, MAX);
    },

    /** 명중 순간의 최근 구간을 흰 코어로 굳힌다. JUDGE 동안 유지된다. */
    markHit() {
      for (let k = Math.max(0, count - HIT_SEGMENTS); k < count; k += 1) at(k).hit = true;
    },

    update(dtSec) {
      const dt = dtSec * 1000;
      for (let k = 0; k < count; k += 1) at(k).age += dt;
      // 수명이 다한 앞쪽을 버린다. 굳은 구간은 JUDGE 길이만큼 더 버틴다.
      while (count > 1) {
        const oldest = at(0);
        if (oldest.age <= (oldest.hit ? HIT_HOLD_MS : LIFE_MS)) break;
        oldest.live = false;
        oldest.hit = false;
        count -= 1;
      }
    },

    /** 카메라를 향하도록 리본 폭 방향을 잡고 버퍼를 제자리에서 갱신한다. */
    build(cameraPos) {
      if (count < 2) {
        geometry.setDrawRange(0, 0);
        return;
      }

      for (let k = 0; k < count; k += 1) {
        const p = at(k);
        const prev = at(Math.max(0, k - 1));
        const next = at(Math.min(count - 1, k + 1));

        tangent.copy(next.pos).sub(prev.pos);
        if (tangent.lengthSq() < 1e-10) tangent.set(0, 0, -1);
        tangent.normalize();

        toCam.copy(cameraPos).sub(p.pos).normalize();
        side.crossVectors(tangent, toCam);
        if (side.lengthSq() < 1e-10) side.set(1, 0, 0);
        side.normalize();

        const life = Math.max(0, 1 - p.age / LIFE_MS);
        const recency = count > 1 ? k / (count - 1) : 1; // 최근일수록 1
        // 나이와 최신도로 폭이 감쇠한다. 명중 구간은 굵게 고정한다.
        const w = p.hit ? width * HIT_WIDTH_SCALE : width * (0.18 + 0.82 * recency * life);
        // 시연 안정화(DEMO_STABILIZE): 잔광 알파를 한 단계 낮췄다(0.35+0.65 → 0.30+0.58).
        // 꼬리가 덜 빛나 번짐이 준다. 명중 흰 코어는 그대로(1). 밋밋하면 한 단계 되돌린다.
        const a = p.hit ? 1 : (0.3 + 0.58 * life) * recency;

        const o = k * 6;
        positions[o] = p.pos.x + side.x * w;
        positions[o + 1] = p.pos.y + side.y * w;
        positions[o + 2] = p.pos.z + side.z * w;
        positions[o + 3] = p.pos.x - side.x * w;
        positions[o + 4] = p.pos.y - side.y * w;
        positions[o + 5] = p.pos.z - side.z * w;

        // 코어는 소유 색, 가장자리는 잔광 색. 명중 구간만 흰색으로 덮는다.
        tmpColor.copy(p.hit ? hitColor : coreColor).lerp(glowColor, p.hit ? 0 : 0.35);
        const c = k * 8;
        vcolors[c] = tmpColor.r;
        vcolors[c + 1] = tmpColor.g;
        vcolors[c + 2] = tmpColor.b;
        vcolors[c + 3] = a;
        vcolors[c + 4] = tmpColor.r;
        vcolors[c + 5] = tmpColor.g;
        vcolors[c + 6] = tmpColor.b;
        vcolors[c + 7] = a;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.setDrawRange(0, (count - 1) * 6);
    },

    clear() {
      count = 0;
      head = 0;
      for (const p of points) {
        p.live = false;
        p.hit = false;
        p.age = 0;
      }
      geometry.setDrawRange(0, 0);
    },

    segmentCount() {
      return count;
    },

    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
