// 책임: 실기 튜닝의 눈 (C2-3). ?debug=1일 때만 뜬다.
//
// 실기에서 임계를 정하려면 숫자가 보여야 한다. 가속 크기 그래프, THRUST 로그(power 포함),
// 가드 상태, 자세 오일러, 현재 임계, 실측 이벤트 주기.
// 상시 노출 요소라 애니메이션하지 않고 갱신은 rAF 하나로 묶는다.

import { useEffect, useRef, useState } from 'react';
import { colors, radius, typography } from '../tokens.js';
import { POSE_STATE, TILT, poseState } from '../../../shared/pose.js';
import { DEFAULTS } from '../sensors/motion.js';

/** 조작 상태 이름. 사람이 읽는 말로 바꾼다. */
const STATE_LABEL = {
  [POSE_STATE.NEUTRAL]: '중립(앙가르드)',
  [POSE_STATE.GUARD]: '가드',
  [POSE_STATE.THRUST_ZONE]: '찌르기 구간',
};

const W = 320;
const H = 90;
const KEEP = W;

/** 프로덕션 번들에서도 파라미터가 있으면 뜬다. dev 빌드는 파라미터 없이도 뜬다.
 * ?debug=0이면 dev에서도 강제로 끈다(UI 미리보기용). */
export function debugEnabled(isDev) {
  if (typeof window === 'undefined') return false;
  const p = new URLSearchParams(window.location.search).get('debug');
  if (p === '0') return false;
  return isDev || p === '1';
}

export default function DebugPanel({ pipeline, log }) {
  const canvasRef = useRef(null);
  const histRef = useRef([]);
  const [info, setInfo] = useState({
    horiz: 0, vert: 0, threshold: 0, hz: 0, guarding: false, support: '-',
    peak: 0, tilt: { pitchDeg: 0, rollDeg: 0 },
  });

  // 샘플 수집은 파이프라인 콜백으로, 그리기는 rAF로 분리한다
  useEffect(() => {
    pipeline.on('sample', (s) => {
      const h = histRef.current;
      h.push(s);
      if (h.length > KEEP) h.shift();
    });
    return () => pipeline.on('sample', null);
  }, [pipeline]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = canvasRef.current;
      const h = histRef.current;
      const last = h[h.length - 1];
      if (c) {
        const g = c.getContext('2d');
        g.clearRect(0, 0, W, H);
        const thr = last?.threshold ?? DEFAULTS.thrust;
        const top = Math.max(thr * 2.6, 30);
        // 임계선
        g.strokeStyle = colors.red.light;
        g.globalAlpha = 0.7;
        g.beginPath();
        const ty = H - (thr / top) * H;
        g.moveTo(0, ty);
        g.lineTo(W, ty);
        g.stroke();
        g.globalAlpha = 1;
        // 수평 성분(판정에 쓰는 값)과 수직 성분을 함께 그린다
        for (const [key, color] of [['vert', colors.steel.shadow], ['horiz', colors.steel.hi]]) {
          g.strokeStyle = color;
          g.beginPath();
          h.forEach((s, i) => {
            const y = H - Math.min(1, s[key] / top) * H;
            if (i === 0) g.moveTo(i, y);
            else g.lineTo(i, y);
          });
          g.stroke();
        }
      }
      if (last) {
        setInfo({
          horiz: last.horiz,
          vert: last.vert,
          threshold: last.threshold,
          hz: pipeline.getHz(),
          guarding: last.guarding,
          support: last.support,
          peak: last.peak ?? 0,
          tilt: last.tilt ?? { pitchDeg: 0, rollDeg: 0 },
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pipeline]);

  const row = (k, v) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ color: colors.text.dim }}>{k}</span>
      <span style={{ color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        left: 8,
        right: 8,
        bottom: 8,
        zIndex: 80,
        padding: 10,
        borderRadius: radius.md,
        background: colors.bg.overlay,
        border: `1px solid ${colors.line.default}`,
        fontFamily: 'ui-monospace, monospace',
        fontSize: typography.caption.size,
        pointerEvents: 'none',
      }}
    >
      <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', height: H, display: 'block' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: 8 }}>
        {row('수평', info.horiz.toFixed(1))}
        {row('수직', info.vert.toFixed(1))}
        {/* **손목 튜닝의 눈.** 앉아서 손목만으로 한 번 지르고 이 값이 임계를 넘는지 본다.
            2초 붙들어 두므로 동작이 끝난 뒤 화면을 봐도 값이 남아 있다 */}
        {row('수평 최대', info.peak.toFixed(1))}
        {row('임계', info.threshold.toFixed(1))}
        {row('주기', `${info.hz.toFixed(0)}Hz`)}
        {row('센서', info.support)}
        {/* 가드가 실제로 보는 두 축이다. shared/pose.js가 이 값으로 상태를 정한다.
            예전 오일러 표시는 분해가 달라서 가드가 왜 켜졌는지를 설명하지 못했다 */}
        {row('좌우 roll', `${info.tilt.rollDeg.toFixed(0)}도 / ${TILT.rollOnDeg}`)}
        {row('앞뒤 pitch', `${info.tilt.pitchDeg.toFixed(0)}도`)}
        {row('가드', info.guarding ? '켜짐' : '꺼짐')}
        {row('상태', STATE_LABEL[poseState(info.guarding, info.tilt)])}
      </div>
      <div style={{ marginTop: 6, color: colors.text.secondary, maxHeight: 62, overflow: 'hidden' }}>
        {log.slice(0, 4).map((l) => (
          <div key={l.id}>{l.text}</div>
        ))}
      </div>
    </div>
  );
}
