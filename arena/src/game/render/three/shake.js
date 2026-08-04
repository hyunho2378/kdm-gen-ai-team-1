// 책임: 카메라 셰이크. trauma 방식이다.
//
// `three-screenshake`는 npm에 없어(404 확인) `sajmoni/screen-shake`(MIT)의 trauma 방식을 포팅했다.
// CREDITS.md에 "MIT, 로직 포팅"으로 기록되어 있다.
//
// trauma를 제곱해서 쓰는 것이 이 방식의 핵심이다. 선형으로 줄이면 끝이 질질 끌리는데
// 제곱이면 초반에 세게 흔들리고 꼬리가 빠르게 죽어 타격감이 산다.
//
// 카메라를 직접 옮긴다. 내 검이 카메라의 자식이라 검도 함께 흔들리고, 그것이 맞다.

import * as THREE from 'three';

const DECAY_PER_SEC = 3.6;
const MAX_OFFSET = 0.05;   // m. ARENA_SCENE 11절 진폭
const MAX_ROLL = 0.035;    // rad
const FREQ = 26;

export function createShake(camera) {
  const base = camera.position.clone();
  const baseQuat = camera.quaternion.clone();
  const tmpQuat = new THREE.Quaternion();
  const axis = new THREE.Vector3(0, 0, 1);
  let trauma = 0;
  let t = 0;
  // 위상만 다른 사인 셋. 난수를 프레임마다 뽑으면 지지직거려 흔들림이 아니라 노이즈가 된다
  const phase = [0, 2.1, 4.3];

  return {
    /** 명중 세기. 0~1이 누적되지만 1을 넘지 않는다. */
    kick(amount = 0.6) {
      trauma = Math.min(1, trauma + amount);
    },

    update(dtSec) {
      if (trauma <= 0) return;
      t += dtSec;
      trauma = Math.max(0, trauma - DECAY_PER_SEC * dtSec * trauma * 0.9 - dtSec * 0.6);
      const s = trauma * trauma;
      camera.position.set(
        base.x + Math.sin(t * FREQ + phase[0]) * MAX_OFFSET * s,
        base.y + Math.sin(t * FREQ * 1.13 + phase[1]) * MAX_OFFSET * s,
        base.z + Math.sin(t * FREQ * 0.87 + phase[2]) * MAX_OFFSET * s * 0.5
      );
      tmpQuat.setFromAxisAngle(axis, Math.sin(t * FREQ * 0.91) * MAX_ROLL * s);
      camera.quaternion.copy(baseQuat).multiply(tmpQuat);
      if (trauma <= 0.001) {
        trauma = 0;
        camera.position.copy(base);
        camera.quaternion.copy(baseQuat);
      }
    },

    /**
     * 기준 자세 갱신 (R5). 헤드 패럴랙스가 카메라를 옮기므로 셰이크의 기준도 따라와야 한다.
     * 둘 다 camera.position에 절대값을 쓰면 프레임마다 서로를 덮어써 떨림이 된다.
     * **패럴랙스가 기준을 정하고 셰이크는 그 위에 얹는다.**
     */
    setBase(pos, quat) {
      base.copy(pos);
      if (quat) baseQuat.copy(quat);
    },

    reset() {
      trauma = 0;
      camera.position.copy(base);
      camera.quaternion.copy(baseQuat);
    },
    getTrauma() {
      return trauma;
    },
  };
}
