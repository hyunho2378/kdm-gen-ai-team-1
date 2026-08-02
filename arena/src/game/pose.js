// 책임: 검 자세 연속 채널. 렌더러 전용이다.
//
// 이 파일은 engine.js가 import하지 않는다. 그것이 결정성의 생명선이다(ARENA_INPUT 3절).
// 폰을 흔드는 아날로그 값이 판정에 새면 같은 시드가 같은 결과를 못 낸다.
// 소비처는 GameCanvas 하나뿐이고, GameCanvas가 renderer.setSwordPose()로 넘긴다.

export const PRESET = { REST: 'rest', THRUST: 'thrust', GUARD: 'guard' };

/**
 * 반환 형태는 판별 유니온이다(ARENA_SCENE 3절 확정본).
 *   { kind: 'preset',     value: 'rest' | 'thrust' | 'guard' }
 *   { kind: 'quaternion', value: [x, y, z, w] }
 */
export function createPoseChannel() {
  let kind = 'preset';
  let preset = PRESET.REST;
  // 보정 전 원본과 캘리브레이션 기준. 둘 다 판정에 쓰이지 않는다.
  let raw = null;
  let calib = null;

  /** q0의 켤레를 원본에 곱해 기준 자세를 원점으로 옮긴다. 단위 쿼터니언 전제. */
  function applyCalibration(q, q0) {
    if (!q0) return q;
    const [x0, y0, z0, w0] = q0;
    // 켤레 = 축 성분 부호 반전
    const cx = -x0;
    const cy = -y0;
    const cz = -z0;
    const cw = w0;
    const [x, y, z, w] = q;
    return [
      cw * x + cx * w + cy * z - cz * y,
      cw * y - cx * z + cy * w + cz * x,
      cw * z + cx * y - cy * x + cz * w,
      cw * w - cx * x - cy * y - cz * z,
    ];
  }

  return {
    setPreset(id) {
      preset = id;
      kind = 'preset';
    },
    /** C3에서 소켓 어댑터가 30Hz로 부른다. */
    setQuaternion(q) {
      if (!Array.isArray(q) || q.length !== 4) return;
      raw = q;
      kind = 'quaternion';
    },
    setCalibration(q0) {
      calib = Array.isArray(q0) && q0.length === 4 ? q0 : null;
    },
    /** 컨트롤러가 끊기면 프리셋으로 되돌린다. 경기는 계속 돈다. */
    fallbackToPreset() {
      kind = 'preset';
      raw = null;
    },
    read() {
      if (kind === 'quaternion' && raw) {
        return { kind: 'quaternion', value: applyCalibration(raw, calib) };
      }
      return { kind: 'preset', value: preset };
    },
    reset() {
      kind = 'preset';
      preset = PRESET.REST;
      raw = null;
      calib = null;
    },
  };
}
