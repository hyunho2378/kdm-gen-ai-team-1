// 컬러 시스템. 원본 레이아웃은 `Slide 16_9 - 31.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼았다.
//
// 원본 실측(1920 기준, SVG에서 직접 뽑은 값):
//   좌상단 라벨 2줄  x 60  y 78('Color System') / y 123('컬러 시스템')
//   우측 헤드라인 x 400 y 126, 서브 y 172
//   좌 대형 Branding Red  x 60.1  y 256  w 1064  h 764  rx 20  fill #E60D15
//   우상 Primary          x 1164.1 y 256  w 696  h 369  rx 20  fill #101010 + 흰 보더
//   우하 Brand Gradient   x 1164.1 y 665  w 696  h 355  rx 20
//   원본 그라디언트 스톱 순서 ['#101010', '#80070C', '#E60D15', '#FDFDFD']
//
// **이 페이지는 토큰의 진열장이다.** 화면에 뜨는 색값(HEX와 RGB와 스톱)을 전부 tokens에서 읽는다.
// 색 리터럴을 여기에 적으면 토큰과 화면이 갈라진다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  colors,
  typography,
  motion,
  grid,
  whiteA,
  inkA,
  brandGradient,
  brandGradientStops,
  hexToRgbText,
} from '../tokens.js';
import { COLOR_SYSTEM } from '../copy.js';
import { Eyebrow } from '../components/Bits.jsx';

const CARD_RADIUS = 20;

// 밝은 면 위에 얹히는 흰 글자용 그림자. 그라디언트 카드에만 쓴다.
const ON_LIGHT_SHADOW = `0 1px 3px ${inkA(0.55)}, 0 0 14px ${inkA(0.7)}`;

const SWATCH_TITLE = {
  fontFamily: typography.family,
  fontSize: 'clamp(0.86rem, 1.35vw, 1.5rem)',
  fontWeight: 400,
  letterSpacing: '-0.01em',
};

const KEY_LABEL = {
  fontFamily: typography.family,
  fontSize: 'clamp(0.62rem, 0.94vw, 1.05rem)',
  fontWeight: 400,
  lineHeight: 1.9,
};

// 한 스와치의 HEX/RGB 표기. 값은 인자로 받은 토큰에서 유도한다.
function HexRgb({ hex, tone }) {
  return (
    <div style={{ display: 'flex', gap: 'clamp(24px, 6vw, 140px)' }}>
      <div>
        <div style={{ ...KEY_LABEL, color: tone.dim }}>{COLOR_SYSTEM.hex}</div>
        <div style={{ ...KEY_LABEL, color: tone.strong }}>{hex.toUpperCase()}</div>
      </div>
      <div>
        <div style={{ ...KEY_LABEL, color: tone.dim }}>{COLOR_SYSTEM.rgb}</div>
        <div style={{ ...KEY_LABEL, color: tone.strong }}>{hexToRgbText(hex)}</div>
      </div>
    </div>
  );
}

export default function S6ColorSystem({ active }) {
  const headRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    const cards = cardsRef.current.filter(Boolean);
    if (!head) return undefined;

    if (reduced) {
      gsap.set([head, ...cards], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(head, { opacity: 0, y: 16 });
    gsap.set(cards, { opacity: 0, y: 32 });
    const tl = gsap.timeline();
    tl.to(head, { opacity: 1, y: 0, duration: 0.75, ease: motion.gsapOut });
    tl.to(cards, { opacity: 1, y: 0, duration: 0.9, ease: motion.gsapOut, stagger: 0.12 }, 0.18);

    return () => {
      tl.kill();
    };
  }, [active]);

  // **견본 카드는 다크/레드/그라디언트 면이라 라벨은 라이트 테마와 무관하게 흰 글자다.**
  // (라이트 반전 후 text.primary는 잉크라 다크 견본 위에서 안 보인다. 그래서 white 파생으로 고정.)
  const onRed = { strong: colors.text.onFill, dim: whiteA(0.82) };
  const onDark = { strong: colors.white, dim: whiteA(0.55) };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        // 전역 그리드 원천. 이 슬라이드의 실측 마진이 grid 토큰이 됐다(다른 슬라이드가 이 값을 공유한다).
        padding: `${grid.marginTop} ${grid.marginX} ${grid.marginBottom}`,
      }}
    >
      {/* 상단: 좌측 라벨 2줄 + 우측 헤드라인과 서브 */}
      <div
        ref={headRef}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'clamp(16px, 4vw, 96px)',
          flexShrink: 0,
        }}
      >
        <div style={{ flex: '0 0 auto' }}>
          {/* 네이비는 이 슬라이드에서만 허용된 액센트다(전역 금지). 아이브로우 영문 라벨에 얹는다. */}
          <Eyebrow en={COLOR_SYSTEM.label.en} ko={COLOR_SYSTEM.label.ko} tone={colors.navy} />
        </div>

        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: 'clamp(0.92rem, 1.35vw, 1.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.5,
              color: colors.text.primary,
            }}
          >
            {COLOR_SYSTEM.headline}
          </h2>
          <p
            style={{
              margin: 'clamp(6px, 1vh, 12px) 0 0',
              fontFamily: typography.family,
              fontSize: 'clamp(0.72rem, 1.04vw, 1.16rem)',
              fontWeight: 400,
              lineHeight: 1.65,
              color: colors.text.secondary,
            }}
          >
            {COLOR_SYSTEM.sub}
          </p>
        </div>
      </div>

      {/* 스와치. 좌 대형 55.4% / 우 컬럼 36.25%(원본 1064 대 696 비율) */}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          marginTop: 'clamp(14px, 3.2vh, 34px)',
          display: 'grid',
          gridTemplateColumns: '1064fr 696fr',
          gap: 'clamp(10px, 2.08vw, 50px)',
        }}
      >
        {/* 좌: Branding Red */}
        <div
          ref={(el) => { cardsRef.current[0] = el; }}
          style={{
            borderRadius: CARD_RADIUS,
            background: colors.red,
            padding: 'clamp(14px, 3vh, 34px) clamp(16px, 2.24vw, 44px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 0,
            willChange: 'transform, opacity',
          }}
        >
          <div style={{ ...SWATCH_TITLE, color: colors.text.onFill }}>{COLOR_SYSTEM.brandingRed}</div>
          <HexRgb hex={colors.red} tone={onRed} />
        </div>

        {/* 우: Primary 위, Brand Gradient 아래(원본 369 대 355 높이 비율) */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: '369fr 355fr',
            gap: 'clamp(10px, 2.08vw, 50px)',
            minHeight: 0,
          }}
        >
          <div
            ref={(el) => { cardsRef.current[1] = el; }}
            style={{
              borderRadius: CARD_RADIUS,
              background: colors.black,
              border: `1px solid ${colors.line.default}`,
              padding: 'clamp(14px, 3vh, 34px) clamp(16px, 2.24vw, 44px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0,
              willChange: 'transform, opacity',
            }}
          >
            <div style={{ ...SWATCH_TITLE, color: colors.text.primary }}>{COLOR_SYSTEM.primary}</div>
            <HexRgb hex={colors.black} tone={onDark} />
          </div>

          <div
            ref={(el) => { cardsRef.current[2] = el; }}
            style={{
              borderRadius: CARD_RADIUS,
              background: brandGradient,
              padding: 'clamp(14px, 3vh, 34px) clamp(16px, 2.24vw, 44px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0,
              willChange: 'transform, opacity',
            }}
          >
            {/* 그라디언트의 밝은 쪽(#FDFDFD 스톱) 위에 흰 글자가 얹힌다.
                **원본 SVG도 같은 문제다**(실측 Color1 라벨 뒤 190/255에 흰 글자).
                그라디언트는 지정 토큰이라 그대로 두고, 레이아웃을 안 바꾸는 그림자로만 읽히게 한다. */}
            <div style={{ ...SWATCH_TITLE, color: colors.text.onFill, textShadow: ON_LIGHT_SHADOW }}>
              {COLOR_SYSTEM.brandGradient}
            </div>
            <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 42px)', flexWrap: 'wrap' }}>
              {brandGradientStops.map((stop, i) => (
                <div key={stop}>
                  <div style={{ ...KEY_LABEL, color: whiteA(0.82), textShadow: ON_LIGHT_SHADOW }}>
                    {COLOR_SYSTEM.stopLabels[i]}
                  </div>
                  <div style={{ ...KEY_LABEL, color: colors.text.onFill, textShadow: ON_LIGHT_SHADOW }}>
                    {stop.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
