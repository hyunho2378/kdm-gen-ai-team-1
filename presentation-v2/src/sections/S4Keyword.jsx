// 디자인 키워드. 원본 레이아웃은 `Slide 16_9 - 29.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼았다.
//
// 원본 실측(1920 기준, SVG에서 직접 뽑은 값):
//   좌상단 라벨 2줄  x 64  y 78('Design Keyword') / y 123('디자인 키워드')
//   우측 헤드라인    x 400 y 124, 본문 2줄 y 177 / 222
//   카드 3장  x 60 / 673.333 / 1286.667,  y 293,  w 573.333,  h 624.339,  rx 20  (간격 40)
//   카드 안 원  cx 346.667 / 960 / 1573.333,  cy 605.169,  r 117,  stroke #FDFDFD
//   카드 아래 캡션 2줄  y 959 / 999
// 카드 사진은 원본에 base64로 박혀 있으나 **라이선스 미확인 시안이라 임베드하지 않는다.**
// 실제 파일이 없으면 AssetImage가 다크 플레이스홀더로 내려앉는다.
//
// **서브 진행 3단계.** 정적 동시 표시를 포커스 이동으로 바꿨다.
// 셸 위임 구조는 S2Why(registerHandler/registerEnter)와 같다.
//   단계 0 Dynamic / 1 Precision / 2 Immersion
//   포커스 카드는 **제자리에서** 확대되고 선명해진다(좌우 이동 없음. transform-origin이 중앙이라 중심이 안 움직인다).
//   나머지 둘은 축소 + blur + 어두워짐으로 물러난다.
//   경계(0에서 위 / 2에서 아래)에서만 섹션이 바뀐다.
// 애니메이션은 transform과 opacity와 filter blur만 만진다.
// 부양감은 box-shadow를 트랜지션하지 않고 **별도 글로우 레이어의 opacity**로 낸다(규칙 준수).

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, inkA, bgA } from '../tokens.js';
import { KEYWORD, KEYWORDS } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow, GlassRim, StepDots } from '../components/Bits.jsx';

const CAPTION = {
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  fontWeight: 400,
  lineHeight: 1.7,
  color: colors.text.secondary,
};

const STEPS = KEYWORDS.length; // 3
const FOCUS_SCALE = 1.08;
const REST_SCALE = 0.94;
const REST_BLUR = 5; // px
const REST_BRIGHT = 0.6;
const DUR = 0.55;

export default function S4Keyword({ active, registerHandler, registerEnter }) {
  const headRef = useRef(null);
  const cardsRef = useRef([]);
  const glowRefs = useRef([]);
  const [focus, setFocus] = useState(0);
  const focusRef = useRef(0);

  // ── 서브 진행 위임. S2Why와 같은 구조. ──
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 포커스 값을 실제 트랜스폼으로 옮긴다.
    // opacity는 건드리지 않는다(진입 연출이 쥐고 있다. 겹치면 overwrite로 서로 죽인다).
    const apply = (next, instant) => {
      const d = instant ? 0 : DUR;
      cardsRef.current.filter(Boolean).forEach((el, i) => {
        const on = i === next;
        gsap.to(el, {
          // reduced면 확대와 blur 없이 밝기만으로 포커스를 표시한다.
          scale: reduced ? 1 : on ? FOCUS_SCALE : REST_SCALE,
          filter: reduced
            ? `brightness(${on ? 1 : 0.5})`
            : `blur(${on ? 0 : REST_BLUR}px) brightness(${on ? 1 : REST_BRIGHT})`,
          zIndex: on ? 2 : 1,
          duration: d,
          ease: motion.gsapOut,
          overwrite: 'auto',
        });
      });
      glowRefs.current.filter(Boolean).forEach((el, i) => {
        gsap.to(el, { opacity: i === next && !reduced ? 1 : 0, duration: d, ease: motion.gsapOut, overwrite: 'auto' });
      });
    };

    // 방향키를 소비하면 true(섹션 유지). 경계면 false → 셸이 앞뒤 섹션으로 옮긴다.
    const handleStep = (dir) => {
      const next = focusRef.current + dir;
      if (next < 0 || next >= STEPS) return false;
      focusRef.current = next;
      setFocus(next);
      apply(next, false);
      return true;
    };

    // 진입 방향에 맞는 경계에서 시작한다. 아래로 진입 → 0(Dynamic), 위로 진입 → 2(Immersion).
    const handleEnter = (dir) => {
      const next = dir > 0 ? 0 : STEPS - 1;
      focusRef.current = next;
      setFocus(next);
      apply(next, true);
    };

    apply(focusRef.current, true);
    registerHandler(handleStep);
    registerEnter(handleEnter);
    return () => {
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  // ── 진입 연출. 포커스와 별개 속성(opacity, y)만 만져 서로 안 부딪힌다. ──
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

    gsap.set(head, { opacity: 0, y: 18 });
    gsap.set(cards, { opacity: 0, y: 38 });
    // 셸의 섹션 이동이 1초다. 지연이 없으면 착지 전에 연출이 끝난다.
    const tl = gsap.timeline({ delay: 0.4 });
    tl.to(head, { opacity: 1, y: 0, duration: 0.8, ease: motion.gsapOut });
    tl.to(cards, { opacity: 1, y: 0, duration: 0.95, ease: motion.gsapOut, stagger: 0.13 }, 0.16);

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        // 전역 그리드 마진(아이브로우 좌상단). 컬러 시스템과 같은 값을 공유한다.
        padding: `${grid.marginTop} ${grid.marginX} ${grid.marginBottom}`,
      }}
    >
      {/* 상단: 좌측 라벨 2줄 + 우측 헤드라인과 본문 */}
      <div
        ref={headRef}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'clamp(16px, 4vw, 96px)',
          flexShrink: 0,
        }}
      >
        <div style={{ flex: '0 0 auto', minWidth: 0 }}>
          <Eyebrow en={KEYWORD.label.en} ko={KEYWORD.label.ko} />
        </div>

        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.headline.size,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.5,
              color: colors.text.primary,
            }}
          >
            {KEYWORD.headline}
          </h2>
          {KEYWORD.body.map((line) => (
            <p
              key={line}
              style={{
                margin: 'clamp(6px, 1vh, 12px) 0 0',
                fontFamily: typography.family,
                fontSize: typography.body.size,
                fontWeight: 400,
                lineHeight: 1.65,
                color: colors.text.secondary,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* 카드 3장. 원본 카드 h 624 / 1080 = 57.8vh, rx 20 */}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          marginTop: 'clamp(16px, 3.3vh, 36px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(10px, 2.08vw, 50px)',
        }}
      >
        {KEYWORDS.map((k, i) => (
          <div
            key={k.key}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              minHeight: 0,
              // **중앙 기준 확대.** 좌우 위치가 안 흔들린다.
              transformOrigin: 'center center',
              willChange: 'transform, opacity, filter',
            }}
          >
            {/* 부양감용 글로우. box-shadow를 트랜지션하지 않고 이 레이어의 opacity만 움직인다. */}
            <div
              aria-hidden="true"
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              style={{
                position: 'absolute',
                // **위로는 번지지 않게 한다.** 위쪽으로 열어 두면 헤더 위에 어두운 판이 얹힌다(실측).
                inset: '2% -3% 2% -3%',
                borderRadius: 24,
                opacity: 0,
                // 라이트 반전: 레드 글로우를 걷고 잉크 그림자로만 부양감을 낸다.
                boxShadow: `0 18px 46px ${inkA(0.22)}`,
                pointerEvents: 'none',
              }}
            />

            {/* 사진 자리 + 중앙 원형 라벨 */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 auto',
                minHeight: 0,
                borderRadius: 20,
                overflow: 'hidden',
                background: colors.raised,
              }}
            >
              <AssetImage src={k.img} fit="cover" />
              {/* 사진 위 아주 옅은 딤. 사진을 살리되 라벨 대비를 약간 돕는다(라이트 반전: 다크 → 미세). */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(180deg, ${inkA(0.06)} 0%, ${inkA(0.14)} 100%)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    // 원본 r 117 / 카드 폭 573 = 지름 40.9%
                    position: 'relative',
                    width: '41%',
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    // 라이트 반전: 잉크 라벨이 사진 위에서 읽히게 옅은 라이트 디스크로 받친다.
                    background: bgA(0.55),
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    textAlign: 'center',
                  }}
                >
                  {/* TARGET과 같은 유리 림 문법. */}
                  <GlassRim />
                  <span
                    style={{
                      fontFamily: typography.family,
                      fontSize: typography.headline.size,
                      fontWeight: 400,
                      letterSpacing: '-0.01em',
                      color: colors.text.primary,
                    }}
                  >
                    {k.en}
                  </span>
                  <span
                    style={{
                      fontFamily: typography.family,
                      fontSize: typography.body.size,
                      fontWeight: 500,
                      color: colors.text.primary,
                    }}
                  >
                    {k.ko}
                  </span>
                </div>
              </div>
            </div>

            {/* 카드 아래 캡션 2줄 */}
            <div style={{ marginTop: 'clamp(8px, 1.9vh, 22px)', flexShrink: 0 }}>
              {k.caption.map((line) => (
                <div key={line} style={CAPTION}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 서브 진행 표시(3단계) */}
      <StepDots count={STEPS} active={focus} />
    </div>
  );
}
