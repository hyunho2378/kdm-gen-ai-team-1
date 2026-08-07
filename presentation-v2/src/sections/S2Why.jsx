// 솔루션(AS-IS / TO-BE). 참조 `frames/ref/Slide 16_9 - 90.svg` 레이아웃. 상단 표기 없음.
//
// **브랜드 네이비 그라디언트 배경(이 슬라이드만).** AS-IS/TO-BE 내용은 유지, 배치만 바꾼다.
//   스텝0: AS-IS 패널이 화면 정중앙.  스텝1: AS-IS가 좌측으로 이동 + TO-BE가 우측에 등장.
//   방향키 하위 스텝(위임). 경계(0에서 위 / 1에서 아래)에서만 셸이 섹션을 옮긴다.
//   애니메이션은 transform과 opacity만(밝기 한 곳 예외). 네이비 위 흰 텍스트, 대비 확보.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, whiteA, scrimA, brandNavyGradient } from '../tokens.js';
import { WHY } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { SlideHeader } from '../components/Bits.jsx';

const STEPS = 1; // 스텝 0(AS-IS 중앙)과 1(AS-IS 좌 + TO-BE 우)

// 패널 하단 가독 스크림(네이비). 하단 텍스트를 받친다.
const SCRIM = `linear-gradient(to top, ${scrimA(0.94)} 0%, ${scrimA(0.7)} 22%, ${scrimA(0.12)} 50%, ${scrimA(0)} 72%)`;

// 흰 배지 pill. filled면 흰 채움 + 네이비 글자, 아니면 흰 아웃라인 + 흰 글자.
function WhiteBadge({ text, filled }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: 999,
        fontFamily: typography.family,
        fontSize: 'clamp(0.66rem, 1vw, 0.8rem)',
        // TO-BE(filled)는 미디엄(600), AS-IS는 700. 캡션은 레귤러(아래).
        fontWeight: filled ? 600 : 700,
        letterSpacing: '0.2em',
        color: filled ? '#101925' : colors.white,
        background: filled ? colors.white : 'transparent',
        boxShadow: filled ? 'none' : `inset 0 0 0 1px ${whiteA(0.6)}`,
      }}
    >
      {text}
    </span>
  );
}

function Panel({ left, badge, caption, img, filled, gray, panelRef }) {
  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        left,
        top: '55%',
        width: '40vw',
        height: 'min(56vh, 500px)',
        borderRadius: 20,
        overflow: 'hidden',
        willChange: 'transform, opacity',
        boxShadow: `0 24px 60px ${scrimA(0.5)}`,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, filter: gray ? 'grayscale(1)' : 'none' }}>
        <AssetImage src={img} fit="cover" />
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: SCRIM }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 'clamp(16px, 2vw, 30px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(6px, 1vh, 12px)',
          textAlign: 'center',
        }}
      >
        <WhiteBadge text={badge} filled={filled} />
        {caption.map((c) => (
          <div
            key={c}
            style={{ fontFamily: typography.family, fontSize: typography.body.size, fontWeight: 400, lineHeight: 1.5, color: whiteA(0.9), wordBreak: 'keep-all' }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function S2Why({ registerHandler, registerEnter }) {
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const asisRef = useRef(null);
  const tobeRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 스텝을 트랜스폼/opacity로 옮긴다. AS-IS는 중앙(+22vw)↔좌(0), TO-BE는 우측에서 페이드.
    const apply = (next, instant) => {
      const d = instant || reduced ? 0 : 0.9;
      const split = next >= 1;
      gsap.to(asisRef.current, {
        xPercent: 0,
        x: split ? '0vw' : '22vw',
        yPercent: -50,
        duration: d,
        ease: motion.gsapInOut,
        overwrite: 'auto',
      });
      gsap.to(tobeRef.current, {
        x: split ? '0vw' : '5vw',
        yPercent: -50,
        opacity: split ? 1 : 0,
        duration: d,
        ease: motion.gsapInOut,
        overwrite: 'auto',
      });
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

    gsap.set(asisRef.current, { yPercent: -50 });
    gsap.set(tobeRef.current, { yPercent: -50, opacity: 0 });
    apply(0, true);
    registerHandler(handleStep);
    registerEnter(handleEnter);
    return () => {
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: brandNavyGradient }}>
      {/* 상단: 공용 2단 헤더(네이비 배경이라 흰 텍스트). */}
      <div
        style={{ position: 'absolute', left: grid.marginX, right: grid.marginX, top: grid.marginTop, zIndex: 6, pointerEvents: 'none' }}
      >
        <SlideHeader eyebrow={{ en: WHY.label.en, ko: WHY.label.ko }} headline={WHY.headline} onDark />
      </div>

      {/* AS-IS(좌 컬럼 기준, 스텝0에 중앙) / TO-BE(우 컬럼, 스텝1에 등장). */}
      <Panel
        left="8vw"
        badge={WHY.asis.badge}
        caption={WHY.asis.caption}
        img="/images/why/asis.png"
        gray
        panelRef={asisRef}
      />
      <Panel
        left="52vw"
        badge={WHY.tobe.badge}
        caption={WHY.tobe.caption}
        img="/images/why/tobe.png"
        filled
        panelRef={tobeRef}
      />
    </div>
  );
}
