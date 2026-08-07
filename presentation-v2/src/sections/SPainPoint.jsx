// 문제점 (프롤로그 반부활 인터랙션). 상단 표기 없음.
//
// **풀블리드 배경 사진(prb.png) + 어두운 오버레이 위 유리(글래스모피즘) 카드.**
//   스텝0: 헤드 텍스트가 화면 중앙에 크게(프롤로그처럼). 문제/인사이트 카드 없음.
//   스텝1: 방향키 → 헤드 텍스트가 2단 헤더의 헤드라인 자리로 올라가며 작아지고, 아이브로우가 뜬다.
//          동시에 문제 3카드(Functional/Economic/Social)가 아래에서 올라온다.
//   스텝2: 한 번 더 → 필요(인사이트) 3카드 + 폴리곤 화살표가 올라온다.
//   방향키 하위 스텝(위임). 경계(0에서 위 / 2에서 아래)에서만 셸이 섹션을 옮긴다.
//   애니메이션은 transform과 opacity 위주(헤드 텍스트 크기 전환만 fontSize 트윈 — 축소 시 텍스트가 또렷).
//   네이비 위 흰 텍스트, 대비 확보.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, whiteA, scrimA } from '../tokens.js';
import { PAINPOINT, PAINPOINT_COLUMNS } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow, StepDots } from '../components/Bits.jsx';

const STEPS = 2;

// 헤드 텍스트 크기(rem, gsap가 트윈 가능한 단일 단위). 프롤로그(중앙 큰) ↔ 헤드라인(2단 좌상단).
// 헤드 텍스트가 너무 커 절반 수준으로 축소(지시). 프롤로그 2.8→1.5rem, 헤드라인 1.4→1.2rem.
const HEAD_BIG = '1.5rem';
const HEAD_SMALL = '1.2rem';

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
  const headRef = useRef(null);
  const eyebrowRef = useRef(null);
  const problemsRef = useRef(null);
  const arrowsRef = useRef(null);
  const insightsRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 헤드 텍스트를 2단 헤더 헤드라인 자리로 보낼 때 아이브로우를 비켜갈 좌측 여백(측정값 + 갭).
    const headLeftPad = () => {
      const e = eyebrowRef.current;
      if (!e) return 200;
      const gap = Math.min(96, Math.max(16, 0.04 * window.innerWidth));
      return e.offsetWidth + gap;
    };

    const applyHead = (next, d) => {
      const prologue = next === 0;
      const head = headRef.current;
      // textAlign은 트윈 대상이 아니라 전환 시작에 스냅한다.
      head.style.textAlign = prologue ? 'center' : 'left';
      gsap.to(head, {
        y: prologue ? '43vh' : 0,
        yPercent: prologue ? -50 : 0,
        fontSize: prologue ? HEAD_BIG : HEAD_SMALL,
        paddingLeft: prologue ? 0 : headLeftPad(),
        duration: d,
        ease: motion.gsapInOut,
        overwrite: 'auto',
      });
      // 아이브로우는 프롤로그에서 숨고 헤더가 될 때(스텝1+) 뜬다.
      gsap.to(eyebrowRef.current, { opacity: prologue ? 0 : 1, duration: d, ease: motion.gsapOut, overwrite: 'auto' });
    };

    // 카드(문제/인사이트) 등장·유지·숨김. **새로 등장할 때만** 오파시티 즉시 전환(블러 페이드 방지) + y 슬라이드,
    // appearDelay만큼 늦춰 앞 연출(헤드 축소)이 끝난 뒤 뜨게 한다. 이미 떠 있으면 유지(재-히드 안 함).
    const setCard = (ref, showPrev, showNext, appearDelay, instant, d) => {
      if (showNext && !showPrev) {
        gsap.killTweensOf(ref);
        gsap.set(ref, { opacity: 0, y: '8vh' });
        const rd = instant ? 0 : appearDelay;
        gsap.to(ref, { opacity: 1, duration: 0.001, delay: rd, overwrite: 'auto' });
        gsap.to(ref, { y: '0vh', duration: instant ? 0 : 0.6, delay: rd, ease: motion.gsapOut, overwrite: 'auto' });
      } else if (showNext && showPrev) {
        gsap.set(ref, { opacity: 1, y: '0vh' }); // 유지
      } else {
        gsap.to(ref, { opacity: 0, duration: d, overwrite: 'auto' });
        gsap.to(ref, { y: '8vh', duration: d, ease: motion.gsapOut, overwrite: 'auto' });
      }
    };

    const apply = (next, instant, prev) => {
      const d = instant || reduced ? 0 : 0.8;
      applyHead(next, d);
      const pShowPrev = prev >= 1, pShowNext = next >= 1; // 문제 카드
      const iShowPrev = prev >= 2, iShowNext = next >= 2; // 필요(인사이트) 카드 + 화살표
      // **순서: 텍스트 축소(d) 완료 → 문제 3카드 등장.** 문제 카드 등장을 헤드 duration만큼 지연한다.
      setCard(problemsRef.current, pShowPrev, pShowNext, d, instant, d);
      // 인사이트는 그다음 스텝에서(헤드 안 움직임 → 지연 없음).
      setCard(insightsRef.current, iShowPrev, iShowNext, 0, instant, d);
      gsap.to(arrowsRef.current, { opacity: iShowNext ? 1 : 0, duration: d * 0.8, ease: motion.gsapOut, overwrite: 'auto' });
    };

    const handleStep = (dir) => {
      const prev = stepRef.current;
      const next = prev + dir;
      if (next < 0 || next > STEPS) return false;
      stepRef.current = next;
      setStep(next);
      apply(next, false, prev);
      return true;
    };
    const handleEnter = (dir) => {
      const next = dir > 0 ? 0 : STEPS;
      stepRef.current = next;
      setStep(next);
      apply(next, true, -1); // 진입은 즉시(아무것도 안 뜬 상태에서 필요분만 스냅)
    };

    gsap.set(problemsRef.current, { yPercent: -50 });
    gsap.set(insightsRef.current, { yPercent: -50 });
    apply(0, true, -1);
    registerHandler(handleStep);
    registerEnter(handleEnter);
    return () => {
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  // 헤드 텍스트: 줄 배열이 곧 br(각 줄 display:block). 줄 안에 볼드 조각 섞기(keep-all).
  const headText = PAINPOINT.head.map((line, li) => (
    <span key={li} style={{ display: 'block' }}>
      {line.map((sg, si) => (
        <span key={si} style={{ fontWeight: sg.b ? 700 : 400 }}>{sg.t}</span>
      ))}
    </span>
  ));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 풀블리드 배경 사진 + 어두운 네이비 오버레이(가독). */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AssetImage src={PAINPOINT.bg} fit="cover" />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${scrimA(0.42)} 0%, ${scrimA(0.5)} 100%)` }} />
      </div>

      {/* 상단 좌측 아이브로우(네이비 배경이라 흰색). 프롤로그에서 숨고 스텝1+에 뜬다. */}
      <div ref={eyebrowRef} style={{ position: 'absolute', left: grid.marginX, top: grid.marginTop, zIndex: 6, opacity: 0, pointerEvents: 'none' }}>
        <Eyebrow en={PAINPOINT.label.en} ko={PAINPOINT.label.ko} tone={colors.white} onDark />
      </div>

      {/* 헤드 텍스트: 프롤로그(중앙 큰) → 스텝1+ 헤드라인(2단 좌상단). 콘텐츠 폭을 채운다. */}
      <div
        ref={headRef}
        style={{
          position: 'absolute',
          left: grid.marginX,
          right: grid.marginX,
          top: grid.marginTop,
          zIndex: 6,
          fontFamily: typography.family,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.45,
          color: colors.white,
          wordBreak: 'keep-all',
          pointerEvents: 'none',
          willChange: 'transform, font-size',
        }}
      >
        {headText}
      </div>

      {/* 문제 3카드(스텝1 등장). */}
      <div ref={problemsRef} style={{ ...ROW, top: '47%', zIndex: 4, opacity: 0 }}>
        {PAINPOINT_COLUMNS.map((c) => (
          <GlassCard key={c.key} title={c.title} lines={c.pain} tone={colors.white} />
        ))}
      </div>

      {/* 폴리곤 화살표(열마다 하나, 스텝2 등장). */}
      <div ref={arrowsRef} style={{ ...ROW, top: '63%', zIndex: 4, opacity: 0, pointerEvents: 'none' }}>
        {PAINPOINT_COLUMNS.map((c) => (
          <div key={c.key} style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              aria-hidden="true"
              style={{
                width: 0,
                height: 0,
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                borderTop: `24px solid ${whiteA(0.78)}`,
              }}
            />
          </div>
        ))}
      </div>

      {/* 필요(인사이트) 3카드(스텝2 등장). */}
      <div ref={insightsRef} style={{ ...ROW, top: '76%', zIndex: 4, opacity: 0 }}>
        {PAINPOINT_COLUMNS.map((c) => (
          <GlassCard key={c.key} lines={c.insight} tone={colors.white} />
        ))}
      </div>

      <StepDots count={STEPS + 1} active={step} onDark />
    </div>
  );
}
