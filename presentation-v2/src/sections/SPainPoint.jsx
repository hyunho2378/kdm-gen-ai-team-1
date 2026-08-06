// 문제점. 참조 `frames/ref/Slide 16_9 - 89.svg` 레이아웃. 상단 표기 없음.
//
// **풀블리드 배경 사진(prb.png) + 어두운 오버레이 위 유리(글래스모피즘) 카드.**
//   스텝0: 문제 3카드(Functional/Economic/Social)만 화면 중앙.
//   스텝1: 방향키 한 번 더 → 문제 카드가 위로 + 폴리곤 화살표 등장 + 아래에 인사이트 3카드 등장.
//   방향키 하위 스텝(위임). 경계(0에서 위 / 1에서 아래)에서만 셸이 섹션을 옮긴다.
//   애니메이션은 transform과 opacity만. 네이비 위 흰 텍스트, 대비 확보.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, whiteA, scrimA } from '../tokens.js';
import { PAINPOINT, PAINPOINT_COLUMNS } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow, StepDots } from '../components/Bits.jsx';

const STEPS = 1;

// 유리 카드. 반투명 + 배경 블러 + 미세 테두리 빛 + 상단 림 하이라이트.
const GLASS = {
  background: whiteA(0.1),
  backdropFilter: 'blur(18px) saturate(1.25)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
  border: `1px solid ${whiteA(0.2)}`,
  boxShadow: `0 12px 40px ${scrimA(0.4)}, inset 0 1px 0 ${whiteA(0.24)}`,
  borderRadius: 18,
};

const ROW = {
  position: 'absolute',
  left: grid.marginX,
  right: grid.marginX,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'clamp(10px, 2vw, 44px)',
};

function GlassCard({ title, lines, tone }) {
  return (
    <div style={{ ...GLASS, padding: 'clamp(16px, 1.8vw, 30px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 1.4vh, 18px)', textAlign: 'center' }}>
      {title ? (
        <div style={{ fontFamily: typography.family, fontSize: typography.caption.size, fontWeight: 500, color: whiteA(0.7) }}>{title}</div>
      ) : null}
      <div>
        {lines.map((l) => (
          <div key={l} style={{ fontFamily: typography.family, fontSize: typography.body.size, fontWeight: 500, lineHeight: 1.55, color: tone, wordBreak: 'keep-all' }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

export default function SPainPoint({ registerHandler, registerEnter }) {
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const problemsRef = useRef(null);
  const arrowsRef = useRef(null);
  const insightsRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const apply = (next, instant) => {
      const d = instant || reduced ? 0 : 0.7;
      const open = next >= 1;
      // 문제 카드: 스텝0 중앙(y 0) → 스텝1 위로(-20vh). yPercent -50은 base.
      gsap.to(problemsRef.current, { y: open ? '-20vh' : '0vh', duration: d, ease: motion.gsapInOut, overwrite: 'auto' });
      gsap.to(arrowsRef.current, { opacity: open ? 1 : 0, duration: d * 0.8, ease: motion.gsapOut, overwrite: 'auto' });
      // 인사이트 글래스 카드는 **처음부터 블러(글래스)를 꽉 채워 등장**한다. 오파시티를 즉시 전환(페이드 없음)해
      // 블러가 옅게 차오르지 않게 하고, 등장은 y 슬라이드로만 낸다.
      gsap.set(insightsRef.current, { opacity: open ? 1 : 0 });
      gsap.to(insightsRef.current, { y: open ? '0vh' : '8vh', duration: d, ease: motion.gsapOut, overwrite: 'auto' });
    };

    const handleStep = (dir) => {
      const next = stepRef.current + dir;
      if (next < 0 || next > STEPS) return false;
      stepRef.current = next;
      setStep(next);
      apply(next, false);
      return true;
    };
    const handleEnter = (dir) => {
      const next = dir > 0 ? 0 : STEPS;
      stepRef.current = next;
      setStep(next);
      apply(next, true);
    };

    gsap.set(problemsRef.current, { yPercent: -50 });
    gsap.set(insightsRef.current, { yPercent: -50 });
    apply(0, true);
    registerHandler(handleStep);
    registerEnter(handleEnter);
    return () => {
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 풀블리드 배경 사진 + 어두운 네이비 오버레이(가독). */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AssetImage src={PAINPOINT.bg} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${scrimA(0.42)} 0%, ${scrimA(0.5)} 100%)` }} />
      </div>

      {/* 상단 좌측 아이브로우(네이비 배경이라 흰색). */}
      <div style={{ position: 'absolute', left: grid.marginX, top: grid.marginTop, zIndex: 6, pointerEvents: 'none' }}>
        <Eyebrow en={PAINPOINT.label.en} ko={PAINPOINT.label.ko} tone={colors.white} onDark />
      </div>

      {/* 문제 3카드(스텝0 중앙 → 스텝1 위로). 전체를 약간 아래로(위 정렬 보정). */}
      <div ref={problemsRef} style={{ ...ROW, top: '54%', zIndex: 4 }}>
        {PAINPOINT_COLUMNS.map((c) => (
          <GlassCard key={c.key} title={c.title} lines={c.pain} tone={colors.white} />
        ))}
      </div>

      {/* 폴리곤 화살표(열마다 하나, 스텝1 등장). */}
      <div ref={arrowsRef} style={{ ...ROW, top: '53%', zIndex: 4, opacity: 0, pointerEvents: 'none' }}>
        {PAINPOINT_COLUMNS.map((c) => (
          <div key={c.key} style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              aria-hidden="true"
              style={{
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: `11px solid ${whiteA(0.72)}`,
              }}
            />
          </div>
        ))}
      </div>

      {/* 인사이트 3카드(스텝1 등장). */}
      <div ref={insightsRef} style={{ ...ROW, top: '73%', zIndex: 4, opacity: 0 }}>
        {PAINPOINT_COLUMNS.map((c) => (
          <GlassCard key={c.key} lines={c.insight} tone={colors.white} />
        ))}
      </div>

      <StepDots count={STEPS + 1} active={step} onDark />
    </div>
  );
}
