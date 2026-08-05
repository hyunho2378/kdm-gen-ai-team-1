// ArenaOnboarding — 첫 판 온보딩(B3). 코치마크 순차 4종 → 카운트다운 5-4-3-2-1 → 시작.
//
// Strategy: 첫 사용자 단계별 맥락 안내(강릉페이 S7).
// Nielsen: #10 도움말, #6 인식 우선(요소를 직접 가리킨다). Shneiderman: #8 단기기억 부담 감소.
//
// **게임 시계는 이 동안 timeScale 0**(GameCanvas frozen). judge를 안 거치므로 서명·결정성 무관.
// 스포트라이트는 강릉페이 CoachMarkOverlay와 같은 기법(하이라이트 박스 + 거대 box-shadow로 나머지를 딤).
// FUI 문법: 팔각 설명 박스(clip-path), steel 라인, red 액센트. reduced motion은 정적(전환 없음).

import { useEffect, useState } from 'react';
import { colors, glow, radius, typography, zIndex } from '../tokens.js';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// target은 뷰포트 % 사각 영역(HUD 요소 위치에 맞췄다). place는 설명 박스 방향.
const STEPS = [
  {
    target: { x: 33, y: 80, w: 34, h: 13 },
    place: 'above',
    title: '간합 게이지',
    desc: '거리가 가운데 붉은 유효 구간에 있을 때만 찌르기가 닿는다. 방향키로 거리를 잡는다.',
  },
  {
    target: { x: 37, y: 32, w: 26, h: 30 },
    place: 'below',
    title: '상대의 예고',
    desc: '상대가 준비 동작에서 멈추면 진짜 공격이다. 시프트로 막는다. 페인트면 그대로 찔러 득점한다.',
  },
  {
    target: { x: 4, y: 11, w: 24, h: 11 },
    place: 'below',
    title: '심판기 램프',
    desc: '붉은 쪽이 나, 파란 쪽이 상대다. 명중하면 그쪽 램프가 켜진다.',
  },
  {
    target: { x: 30, y: 9, w: 42, h: 8 },
    place: 'below',
    title: '피스트',
    desc: '뒤로 밀리면 붉은 경고선이 뜬다. 라인 끝을 넘으면 실점이다.',
  },
];

const OCTAGON = 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)';
const COUNT_MS = 800;

export default function ArenaOnboarding({ onDone }) {
  const reduced = prefersReduced();
  const [step, setStep] = useState(0); // 0..STEPS.length-1 코치마크, 그 뒤 카운트다운
  const [count, setCount] = useState(0); // 0이면 코치 단계, >0이면 카운트다운 숫자

  // 카운트다운 진행. count가 1이 되고 시간이 지나면 종료한다.
  useEffect(() => {
    if (count <= 0) return undefined;
    if (count === 1) {
      const t = setTimeout(onDone, reduced ? 300 : COUNT_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), reduced ? 250 : COUNT_MS);
    return () => clearTimeout(t);
  }, [count, onDone, reduced]);

  // 카운트다운 화면
  if (count > 0) {
    return (
      <div style={scrimStyle}>
        <div
          key={count}
          style={{
            fontFamily: typography.family,
            fontSize: 'clamp(6rem, 22vw, 14rem)',
            fontWeight: 800,
            lineHeight: 1,
            color: colors.red.light,
            textShadow: glow.red,
            animation: reduced ? 'none' : 'vortexPop 0.8s ease-out',
          }}
        >
          {count}
        </div>
        <style>{`@keyframes vortexPop { 0% { opacity: 0; transform: scale(1.4); } 30% { opacity: 1; transform: scale(1); } 100% { opacity: 0.15; transform: scale(0.9); } }`}</style>
      </div>
    );
  }

  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  const next = () => (last ? setCount(5) : setStep((n) => n + 1));

  // 설명 박스는 타깃 위/아래에 붙는다. 가로는 타깃 중앙, 뷰포트 안으로 clamp.
  const boxTop = s.place === 'below' ? `${s.target.y + s.target.h + 2}%` : undefined;
  const boxBottom = s.place === 'above' ? `${100 - s.target.y + 2}%` : undefined;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: zIndex.modal, fontFamily: typography.family }}>
      {/* 스포트라이트: 하이라이트 박스 + 거대 box-shadow가 나머지를 딤. red/steel 링 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `${s.target.x}%`,
          top: `${s.target.y}%`,
          width: `${s.target.w}%`,
          height: `${s.target.h}%`,
          borderRadius: radius.md,
          border: `2px solid ${colors.red.light}`,
          boxShadow: `0 0 0 9999px ${colors.bg.overlay}, ${glow.red}`,
          transition: reduced ? 'none' : 'all 220ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* 설명 박스(팔각 FUI). 리더 화살표가 타깃을 가리킨다 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: boxTop,
          bottom: boxBottom,
          width: 'min(440px, 86vw)',
          padding: '18px 20px',
          background: colors.bg.raised,
          border: `1px solid ${colors.line.strong}`,
          borderTop: `2px solid ${colors.red.light}`,
          clipPath: OCTAGON,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i === step ? colors.red.light : colors.line.strong,
              }}
            />
          ))}
          <span style={{ marginLeft: 'auto', fontSize: typography.caption.size, color: colors.text.dim }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <span style={{ fontSize: typography.heading.size, fontWeight: typography.heading.weight, color: colors.text.primary }}>
          {s.title}
        </span>
        <span style={{ fontSize: typography.body.size, lineHeight: typography.body.leading, color: colors.text.secondary, wordBreak: 'keep-all' }}>
          {s.desc}
        </span>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => setCount(5)}
            style={ghostBtn}
          >
            건너뛰기
          </button>
          <button type="button" onClick={next} style={fillBtn}>
            {last ? '시작' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
}

const scrimStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: zIndex.modal,
  background: colors.bg.overlay,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ghostBtn = {
  minHeight: 40,
  padding: '8px 16px',
  borderRadius: radius.pill,
  border: `1px solid ${colors.line.strong}`,
  background: 'transparent',
  color: colors.text.secondary,
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  cursor: 'pointer',
};

const fillBtn = {
  minHeight: 40,
  padding: '8px 20px',
  borderRadius: radius.pill,
  border: 'none',
  background: colors.red.fill,
  color: colors.text.onFill,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  fontWeight: 600,
  cursor: 'pointer',
};
