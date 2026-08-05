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
  // **모드는 소스가 바꾼다. 프리셋 갱신은 모드를 건드리지 않는다.**
  // GameCanvas가 매 프레임 setPreset을 부르는데 그것이 모드까지 바꾸면
  // 컨트롤러가 쿼터니언을 흘려도 다음 프레임에 프리셋이 덮어써 검이 영원히 안 돈다(C3 실측).
  // 쿼터니언에서 내려오는 길은 fallbackToPreset 하나뿐이다(끊김과 F9).
  let mode = 'preset';
  let preset = PRESET.REST;
  // 보정 전 원본과 캘리브레이션 기준. 둘 다 판정에 쓰이지 않는다.
  let raw = null;
  let calib = null;

  // 반환 객체를 재사용한다. read()는 매 프레임 불리므로 여기서 새로 만들면
  // 초당 60개씩 쓰레기가 쌓여 GC가 프레임 사이에 끼어든다. 소비처는 즉시 읽고 버린다.
  const out = { kind: 'preset', value: PRESET.REST };
  const calibrated = [0, 0, 0, 1];

  /** q0의 켤레를 원본에 곱해 기준 자세를 원점으로 옮긴다. 단위 쿼터니언 전제. */
  function applyCalibration(q, q0) {
    if (!q0) {
      calibrated[0] = q[0];
      calibrated[1] = q[1];
      calibrated[2] = q[2];
      calibrated[3] = q[3];
      return calibrated;
    }
    const [x0, y0, z0, w0] = q0;
    // 켤레 = 축 성분 부호 반전
    const cx = -x0;
    const cy = -y0;
    const cz = -z0;
    const cw = w0;
    const [x, y, z, w] = q;
    calibrated[0] = cw * x + cx * w + cy * z - cz * y;
    calibrated[1] = cw * y - cx * z + cy * w + cz * x;
    calibrated[2] = cw * z + cx * y - cy * x + cz * w;
    calibrated[3] = cw * w - cx * x - cy * y - cz * z;
    return calibrated;
  }

  return {
    /** 키보드 프리셋 갱신. 모드는 안 바꾼다. 폴백했을 때 최신값이 서 있도록 계속 받는다. */
    setPreset(id) {
      preset = id;
    },
    /** C3에서 소켓 어댑터가 30Hz로 부른다. */
    setQuaternion(q) {
      if (!Array.isArray(q) || q.length !== 4) return;
      raw = q;
      mode = 'quaternion';
    },
    setCalibration(q0) {
      calib = Array.isArray(q0) && q0.length === 4 ? q0 : null;
    },
    /** 컨트롤러가 끊기거나 F9를 누르면 프리셋으로 되돌린다. 경기는 계속 돈다. */
    fallbackToPreset() {
      mode = 'preset';
      raw = null;
    },
    read() {
      if (mode === 'quaternion' && raw) {
        out.kind = 'quaternion';
        out.value = applyCalibration(raw, calib);
      } else {
        out.kind = 'preset';
        out.value = preset;
      }
      return out;
    },
    reset() {
      mode = 'preset';
      preset = PRESET.REST;
      raw = null;
      calib = null;
    },
  };
}
