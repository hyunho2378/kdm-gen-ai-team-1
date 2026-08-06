// 책임: 폰 없이 검 자세와 조작 판정을 확인하는 미리보기. 주소 뒤에 ?posetest=1을 붙이면 뜬다.
//
// 왜 있는가. 문턱을 맞추려면 자세를 몇십 번 만들어 봐야 하는데 그때마다 폰을 흔들면
// **사람이 먼저 지친다.** 실기 피드백이 "체력 소모가 커서 테스트조차 힘들다"였다.
// 슬라이더로 앞뒤와 좌우를 넣으면 검이 그 자세로 서고 지금 상태가 무엇인지 글자로 뜬다.
//
// **판정 규칙을 여기서 다시 구현하지 않는다.** `shared/pose.js`를 컨트롤러와 똑같이 읽는다.
// 미리보기가 자기만의 계산을 하면 실기와 다른 말을 하게 되고 그러면 사람을 속인다.
//
// 검에 값을 넣는 경로도 폰과 같다. poseChannel.setQuaternion이라 렌더 전용이고
// 판정에는 닿지 않는다(ARENA_INPUT 3절). **폰이 붙어 있으면 30Hz 실값이 이걸 덮는다.**
//
// fps 미터와 같은 규율이다. 상시 노출 요소라 애니메이션하지 않고 프로덕션 번들에도 들어간다.

import { useEffect, useState } from 'react';
import { colors, radius, typography, zIndex } from '../../tokens.js';
import {
  POSE_STATE,
  TILT,
  nextGuard,
  poseState,
  quaternionFromTilt,
  tiltFromQuaternion,
} from '../../../../shared/pose.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** 프로덕션에서도 파라미터가 있으면 뜬다. 발표 노트북에서 바로 확인할 수 있어야 한다. */
export function poseTestEnabled() {
  try {
    return new URLSearchParams(window.location.search).get('posetest') === '1';
  } catch {
    return false;
  }
}

const STATE_LABEL = {
  [POSE_STATE.NEUTRAL]: '중립 (앙가르드)',
  [POSE_STATE.GUARD]: '가드',
  [POSE_STATE.THRUST_ZONE]: '찌르기 구간',
};

/** 한 번에 확인할 자세들. 슬라이더를 안 만져도 네 상태를 바로 볼 수 있다. */
const PRESETS = [
  ['중립', 0, 0],
  ['가드 좌', 0, -30],
  ['가드 우', 0, 30],
  ['찌르기', 85, 0],
];

export default function PoseTest({ poseChannel }) {
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  // 가드는 이력이 있는 상태다(히스테리시스). 실기와 같게 이전 상태를 이어 간다
  const [guarding, setGuarding] = useState(false);

  useEffect(() => {
    const q = quaternionFromTilt(pitch, roll);
    poseChannel.setQuaternion(q);
    setGuarding((prev) => nextGuard(prev, tiltFromQuaternion(q)));
  }, [pitch, roll, poseChannel]);

  const tilt = { pitchDeg: pitch, rollDeg: roll };
  const state = poseState(guarding, tilt);
  const guardColor = guarding ? colors.red.light : colors.text.primary;

  const slider = (label, value, set, min, max) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: colors.text.dim, width: 76 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ flex: 1, accentColor: colors.red.fill }}
      />
      <span
        style={{
          color: colors.text.primary,
          fontVariantNumeric: 'tabular-nums',
          width: 46,
          textAlign: 'right',
        }}
      >
        {value}도
      </span>
    </label>
  );

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: zIndex.overlay,
        // 이 패널은 만져야 하므로 HUD와 달리 포인터를 받는다
        pointerEvents: 'auto',
        width: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 14px',
        borderRadius: radius.sm,
        background: colors.bg.overlay,
        border: `1px solid ${colors.line.default}`,
        fontFamily: MONO,
        fontSize: typography.caption.size,
        lineHeight: 1.4,
      }}
    >
      <div style={{ color: colors.text.dim }}>자세 미리보기 (폰 없이 확인)</div>

      {slider('앞뒤 pitch', pitch, setPitch, -30, 90)}
      {slider('좌우 roll', roll, setRoll, -60, 60)}

      <div style={{ display: 'flex', gap: 6 }}>
        {PRESETS.map(([label, p, r]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setPitch(p);
              setRoll(r);
            }}
            style={{
              flex: 1,
              minHeight: 28,
              borderRadius: radius.sm,
              border: `1px solid ${colors.line.default}`,
              background: 'transparent',
              color: colors.text.primary,
              fontFamily: MONO,
              fontSize: typography.caption.size,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: colors.text.dim }}>상태</span>
        <span style={{ color: guardColor }}>{STATE_LABEL[state]}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: colors.text.dim }}>guard 이벤트</span>
        <span style={{ color: guardColor }}>{guarding ? 'guard_on 유지' : '없음'}</span>
      </div>
      {/* 문턱을 함께 낸다. "왜 아직 가드가 아니지"를 숫자로 답한다 */}
      <div style={{ color: colors.text.dim }}>
        가드 문턱 좌우 {TILT.rollOnDeg}도에서 켜지고 {TILT.rollOffDeg}도에서 풀린다.
        앞뒤가 좌우보다 크면 가드가 아니다.
      </div>
    </div>
  );
}
