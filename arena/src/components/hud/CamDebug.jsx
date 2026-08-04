// 책임: 웹캠 디버그 뷰. 주소 뒤에 ?cam=1을 붙이면 좌하단에 뜬다.
//
// 왜 있는가. "패럴랙스가 약하다"와 "캠이 아예 안 붙었다"가 화면에서 똑같이 보인다.
// 둘은 대응이 완전히 다른데(값을 올릴 일이냐 권한을 줄 일이냐) 눈으로 구분할 방법이 없었다.
// 상태와 지표와 **실제로 카메라에 걸린 오프셋**을 함께 띄워 그 둘을 가른다.
//
// 팽창 조건 줄도 같은 이유다. "왜 슬로우모션이 안 걸리지"를 안정도 수치와 문턱으로 답한다.
//
// fps 미터와 같은 규율이다. 상시 노출 요소라 애니메이션하지 않고(MOTION 0절)
// 갱신은 초당 두 번이라 프레임 경로가 아니다. 프로덕션 번들에도 들어간다.

import { useEffect, useState } from 'react';
import { colors, radius, typography, zIndex } from '../../tokens.js';
import { CAM, CAM_LABEL } from '../../game/faceTracker.js';
import { frameInset, useViewport } from './frame.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** 미터와 같은 표기. 부호를 항상 붙여야 좌우 방향이 읽힌다. */
const signed = (v, digits = 2) => `${v >= 0 ? '+' : ''}${v.toFixed(digits)}`;

export default function CamDebug({ face, rendererRef, reduced = false }) {
  const { w } = useViewport();
  const [v, setV] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setV({ ...face.debug(), parallax: rendererRef.current?.getParallax?.() ?? null });
    }, 500);
    return () => clearInterval(id);
  }, [face, rendererRef]);

  if (!v) return null;

  const inset = frameInset(w);
  const ok = v.status === CAM.READY;
  const cell = { color: colors.text.dim };
  const num = { color: colors.text.primary, fontVariantNumeric: 'tabular-nums' };
  const p = v.parallax;

  return (
    <div
      style={{
        position: 'fixed',
        left: inset,
        bottom: inset,
        zIndex: zIndex.overlay,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 10px',
        borderRadius: radius.sm,
        background: colors.bg.overlay,
        border: `1px solid ${colors.line.default}`,
        fontFamily: MONO,
        fontSize: typography.caption.size,
        lineHeight: 1.35,
        whiteSpace: 'nowrap',
      }}
    >
      {/* 두 줄로 묶는다. 세 줄이면 62px 클리어런스를 넘어 간합 게이지에 걸린다(실측).
          지표 옆에 문턱을 붙여 "0.61"만 보고 얼마나 모자란지 모르는 일이 없게 한다 */}
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={cell}>
          캠{' '}
          <span style={{ ...num, color: ok ? colors.text.primary : colors.red.light }}>
            {CAM_LABEL[v.status]}
          </span>
        </span>
        <span style={cell}>
          머리 x <span style={num}>{signed(v.headX)}</span>
        </span>
        <span style={cell}>
          요 <span style={num}>{signed(v.headYaw)}</span>
          <span style={num}> / {v.focusYaw.toFixed(2)}</span>
        </span>
        <span style={cell}>
          안정도 <span style={num}>{v.stability.toFixed(2)}</span>
          <span style={num}> / {v.focusStability.toFixed(2)}</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, color: colors.text.dim }}>
        {/* 지표가 아니라 화면에 실제로 걸린 양이다. 캠이 돌아도 여기가 0이면 패럴랙스가 안 먹은 것이다 */}
        <span>
          패럴랙스{' '}
          {p ? (
            <span style={num}>
              x {signed(p.x * 1000, 0)}mm z {signed(p.z * 1000, 0)}mm 요 {signed((p.yaw * 180) / Math.PI, 1)}도
            </span>
          ) : (
            <span style={num}>해당 없음</span>
          )}
        </span>
        <span>
          팽창{' '}
          <span style={{ ...num, color: v.focused ? colors.text.primary : colors.red.light }}>
            {v.focused === null ? '근사 폴백' : v.focused ? '충족' : '미충족'}
          </span>
        </span>
        {reduced ? <span style={{ color: colors.red.light }}>모션 감소로 꺼짐</span> : null}
      </div>
    </div>
  );
}
