// S2 문제(WHY). 서브 진행 2단계.
// 단계 0: asis.png 풀블리드 그레이스케일. 하단 중앙 AS-IS 배지와 캡션 2줄.
// 단계 1: 사진이 좌측 패널로 축소 이동(transform scale + translateX만. width 애니메이션 금지).
//   우측에 tobe.png가 opacity와 밝기 상승으로 등장. TO-BE 배지는 red 채움.
//   두 패널 사이 세로 경계에 얇은 그라디언트 라인.
// 단계 1에서 아래 → 다음 섹션 이탈. 위 방향 역재생.
//
// 셸 위임 구조는 S2Background(프레임 스크럽)와 같다. registerHandler가 방향키를 소비하면 섹션이 유지되고
// 경계(단계 0에서 위 / 단계 1에서 아래)에서만 false를 돌려 셸이 섹션을 옮긴다.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, inkA, bgA } from '../tokens.js';
import { WHY } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow, Badge, StepDots } from '../components/Bits.jsx';

const STEPS = 1; // 단계 0과 1

// 단계 1의 패널 기하. 좌우 대칭이라 부호만 뒤집는다.
// scale 0.49 + translateX ∓24.5vw → 각각 화면의 좌/우 절반에 정확히 앉는다(uniform scale이라 왜곡 없음).
const PANEL_SCALE = 0.49;
const PANEL_SHIFT = 24.5; // vw

const LINE2 = {
  fontFamily: typography.family,
  fontSize: 'clamp(0.78rem, 1.35vw, 1rem)',
  fontWeight: 400,
  lineHeight: 1.65,
  color: colors.text.secondary,
};

export default function S2Why({ registerHandler, registerEnter }) {
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  const asisRef = useRef(null);
  const tobeRef = useRef(null);
  const dividerRef = useRef(null);
  const asisBadgeRef = useRef(null);
  const tobeBadgeRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 단계 값을 실제 트랜스폼으로 옮긴다. 전부 transform과 opacity(그리고 TO-BE 밝기 한 곳)만 만진다.
    const apply = (next, instant) => {
      const d = instant || reduced ? 0 : 1;
      const split = next >= 1;

      gsap.to(asisRef.current, {
        scale: split ? PANEL_SCALE : 1,
        x: split ? `${-PANEL_SHIFT}vw` : '0vw',
        duration: d,
        ease: motion.gsapInOut,
        overwrite: 'auto',
      });

      // TO-BE는 자리(패널 트랜스폼)에 계속 있고 등장은 opacity가 맡는다.
      // filter brightness는 이 사진 한 곳만 허용된 예외다. reduced에서는 opacity 페이드로만 간다.
      gsap.to(tobeRef.current, {
        opacity: split ? 1 : 0,
        filter: reduced ? 'none' : `brightness(${split ? 1 : 0.4})`,
        duration: d,
        ease: motion.gsapInOut,
        overwrite: 'auto',
      });

      gsap.to(dividerRef.current, {
        opacity: split ? 1 : 0,
        duration: d * 0.6,
        ease: motion.gsapInOut,
        overwrite: 'auto',
      });

      // 배지와 캡션은 패널에 딸려 축소되면 못 읽는다. 별도 요소로 두고 translateX만 준다.
      gsap.to(asisBadgeRef.current, {
        x: split ? `${-PANEL_SHIFT}vw` : '0vw',
        duration: d,
        ease: motion.gsapInOut,
        overwrite: 'auto',
      });
      gsap.to(tobeBadgeRef.current, {
        opacity: split ? 1 : 0,
        duration: d,
        ease: motion.gsapInOut,
        overwrite: 'auto',
      });
    };

    // 방향키를 소비하면 true(섹션 유지). 경계면 false → 셸이 S1/S3으로 옮긴다.
    const handleStep = (dir) => {
      const next = stepRef.current + dir;
      if (next < 0 || next > STEPS) return false;
      stepRef.current = next;
      setStep(next);
      apply(next, false);
      return true;
    };

    // 진입 방향에 맞는 경계 단계에서 시작한다(아래로 진입 → 0, 위로 진입 → 마지막).
    const handleEnter = (dir) => {
      const next = dir > 0 ? 0 : STEPS;
      stepRef.current = next;
      setStep(next);
      apply(next, true);
    };

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
      {/* AS-IS: 풀블리드에서 좌측 패널로. 그레이스케일은 AS-IS의 성격이라 계속 유지한다. */}
      <div
        ref={asisRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1, filter: 'grayscale(1)', willChange: 'transform' }}
      >
        <AssetImage src="/images/why/asis.png" fit="cover" />
      </div>

      {/* TO-BE: 우측 패널 자리에 미리 앉아 있고 등장만 한다. */}
      <div
        ref={tobeRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          opacity: 0,
          transform: `translateX(${PANEL_SHIFT}vw) scale(${PANEL_SCALE})`,
          willChange: 'transform, opacity',
        }}
      >
        <AssetImage src="/images/why/tobe.png" fit="cover" />
      </div>

      {/* 두 패널 사이 세로 경계. 위아래로 사라지는 잉크 라인. */}
      <div
        ref={dividerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: `${50 - (PANEL_SCALE * 100) / 2}%`,
          height: `${PANEL_SCALE * 100}%`,
          width: 1,
          zIndex: 3,
          opacity: 0,
          background:
            `linear-gradient(180deg, transparent 0%, ${inkA(0.32)} 26%, ${colors.ink} 50%, ${inkA(0.32)} 74%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 라이트 스크림 두 밴드. 상단(헤드라인)과 하단(배지)에만 bg를 얹어 잉크 텍스트 가독을 보장한다.
          사진 중앙은 비워 인물이 살아 있게 둔다. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
          background:
            `linear-gradient(180deg, ${bgA(0.9)} 0%, ${bgA(0.45)} 20%, transparent 40%),` +
            `linear-gradient(0deg, ${bgA(0.9)} 0%, ${bgA(0.4)} 16%, transparent 36%)`,
        }}
      />

      {/* 상단 좌측: 라벨과 헤드라인 2줄. 아이브로우는 전역 그리드 좌상단. */}
      <div
        style={{
          position: 'absolute',
          left: grid.marginX,
          top: grid.marginTop,
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        <Eyebrow en={WHY.label.en} ko={WHY.label.ko} />
        <div style={{ marginTop: 'clamp(12px, 1.8vh, 22px)' }}>
          {WHY.headline.map((line) => (
            <div
              key={line}
              style={{
                fontFamily: typography.family,
                fontSize: 'clamp(1.25rem, 3vw, 2.4rem)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.28,
                color: colors.text.primary,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 배지와 캡션. 단계 0에서는 화면 하단 중앙, 단계 1에서는 각 패널 아래. */}
      <div
        ref={asisBadgeRef}
        style={{ ...badgeBoxStyle, willChange: 'transform' }}
      >
        <Badge text={WHY.asis.badge} filled={false} />
        {WHY.asis.caption.map((c) => (
          <div key={c} style={LINE2}>
            {c}
          </div>
        ))}
      </div>

      <div
        ref={tobeBadgeRef}
        style={{
          ...badgeBoxStyle,
          opacity: 0,
          transform: `translateX(${PANEL_SHIFT}vw)`,
          willChange: 'transform, opacity',
        }}
      >
        <Badge text={WHY.tobe.badge} filled />
        {WHY.tobe.caption.map((c) => (
          <div key={c} style={LINE2}>
            {c}
          </div>
        ))}
      </div>

      {/* 서브 진행 표시(2단계) */}
      <StepDots count={STEPS + 1} active={step} />
    </div>
  );
}

const badgeBoxStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 'clamp(58px, 10vh, 118px)',
  zIndex: 6,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: '0 20px',
  textAlign: 'center',
  pointerEvents: 'none',
};
