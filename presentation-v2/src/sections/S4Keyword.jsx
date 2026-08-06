// 디자인 키워드. 참조 레이아웃은 `frames/ref/Slide 16_9 - 79.svg`(1920x1080).
//   아이브로우 좌상단(x60 y233 계열) + 헤드라인, 3카드가 하단. 카드 배경은 dk_1/2/3 이미지.
//   이미지 아래 어두운 네이비 그라디언트(#111A26→투명)로 카드 하단 흰 텍스트(영문 키워드/국문/설명)를 받친다.
//   상단 표기(팀/행사/제품명)는 넣지 않는다. 인트로 문장도 제거(카드가 세 키워드를 보여줘 중복).
//
// **서브 진행: 기본 3카드 블러 → 방향키로 1,2,3 순서로 하나씩 확장(선명 + 강조).**
//   focus -1(전부 블러) → 0 → 1 → 2. 경계(-1에서 위 / 2에서 아래)에서만 셸이 섹션을 옮긴다(DELEGATE_IDS).
//   확장은 제자리 스케일 + blur 제거 + 밝기. 가장자리 카드는 transformOrigin을 안쪽으로 잡아
//   확장이 그리드 마진 밖으로 안 나간다. 애니메이션은 transform/opacity/filter만 만진다.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, inkA, whiteA, scrimA } from '../tokens.js';
import { KEYWORD, KEYWORDS } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { SlideHeader, StepDots } from '../components/Bits.jsx';

const STEPS = KEYWORDS.length; // 3
const START = -1; // 기본: 전부 블러(포커스 없음)
// 카드를 애초에 줄였고(높이 상한), 확장/기본 스케일도 낮춰 both 축소.
const FOCUS_SCALE = 1.04;
const REST_SCALE = 0.94;
const REST_BLUR = 6; // px
const REST_BRIGHT = 0.72;
const DUR = 0.55;

// 카드 하단 가독 스크림. 아래 진한 네이비 → 위로 투명. 텍스트가 앉는 하단을 덮는다.
const SCRIM =
  `linear-gradient(to top, ${scrimA(0.96)} 0%, ${scrimA(0.82)} 18%, ${scrimA(0.3)} 46%, ${scrimA(0)} 70%)`;

export default function S4Keyword({ active, registerHandler, registerEnter }) {
  const headRef = useRef(null);
  const cardsRef = useRef([]);
  const glowRefs = useRef([]);
  const [focus, setFocus] = useState(START);
  const focusRef = useRef(START);

  // ── 서브 진행 위임(셸 DELEGATE_IDS). ──
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const apply = (next, instant) => {
      const d = instant ? 0 : DUR;
      cardsRef.current.filter(Boolean).forEach((el, i) => {
        const on = i === next; // next=-1이면 어떤 카드도 on이 아니다(전부 블러)
        gsap.to(el, {
          scale: reduced ? 1 : on ? FOCUS_SCALE : REST_SCALE,
          filter: reduced
            ? `brightness(${on ? 1 : 0.6})`
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

    // 방향키 소비: focus를 -1..2에서 옮긴다. 경계 넘으면 false → 셸이 앞뒤 섹션으로.
    const handleStep = (dir) => {
      const next = focusRef.current + dir;
      if (next < START || next >= STEPS) return false;
      focusRef.current = next;
      setFocus(next);
      apply(next, false);
      return true;
    };

    // 진입: 아래로 진입 → -1(전부 블러부터). 위로 진입 → 2(마지막 카드부터).
    const handleEnter = (dir) => {
      const next = dir > 0 ? START : STEPS - 1;
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

  // ── 진입 연출. 포커스와 별개 속성(opacity, y)만. ──
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
        padding: `${grid.marginTop} ${grid.marginX} ${grid.marginBottom}`,
      }}
    >
      {/* 상단: 공용 2단 헤더(아이브로우 좌 | 헤드라인 + 본문 2줄 우). 본문은 레귤러. */}
      <div ref={headRef} style={{ flexShrink: 0 }}>
        <SlideHeader
          eyebrow={{ en: KEYWORD.label.en, ko: KEYWORD.label.ko }}
          headline={KEYWORD.headline}
          sub={KEYWORD.body}
        />
      </div>

      {/* 카드 3장. **축소 + 아래로 내려 텍스트와 간격.** 남는 세로를 채우지 않고 높이 상한을 둔 그리드를
          flex로 세로 중앙에 둔다. 카드 내부가 absolute라 그리드에 높이가 필요하다. */}
      <div style={{ flex: '1 1 auto', minHeight: 0, marginTop: 'clamp(20px, 3.5vh, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          height: 'min(54vh, 480px)',
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
              minWidth: 0,
              minHeight: 0,
              // 확장이 마진 밖으로 안 나가게 가장자리 카드는 안쪽 기준으로 확대.
              transformOrigin:
                i === 0 ? 'left center' : i === KEYWORDS.length - 1 ? 'right center' : 'center center',
              willChange: 'transform, opacity, filter',
            }}
          >
            {/* 포커스 부양감 글로우(잉크 그림자). 포커스 카드만 opacity로 켠다. */}
            <div
              aria-hidden="true"
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              style={{
                position: 'absolute',
                inset: '2% -3%',
                borderRadius: 24,
                opacity: 0,
                boxShadow: `0 20px 50px ${inkA(0.28)}`,
                pointerEvents: 'none',
              }}
            />

            {/* 카드 = 이미지 + 하단 네이비 스크림 + 흰 텍스트. **뒤 흰 판 없음**(이미지 카드만). */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden' }}>
              <AssetImage src={k.img} fit="cover" />
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: SCRIM }} />

              {/* 하단 텍스트: 영문 키워드(작게) + 국문(큰 제목) + 설명 2줄. 전부 흰색. */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: 'clamp(16px, 2.2vw, 30px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(3px, 0.6vh, 8px)',
                }}
              >
                <span
                  style={{
                    fontFamily: typography.family,
                    fontSize: typography.caption.size,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: whiteA(0.72),
                  }}
                >
                  {k.en}
                </span>
                <span
                  style={{
                    fontFamily: typography.family,
                    fontSize: typography.headline.size,
                    fontWeight: typography.headline.weight,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.25,
                    color: colors.white,
                  }}
                >
                  {k.ko}
                </span>
                <div style={{ marginTop: 'clamp(2px, 0.6vh, 6px)' }}>
                  {k.caption.map((line) => (
                    <div
                      key={line}
                      style={{
                        fontFamily: typography.family,
                        fontSize: typography.body.size,
                        fontWeight: 400,
                        lineHeight: 1.55,
                        color: whiteA(0.86),
                        wordBreak: 'keep-all',
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* 서브 진행 표시. 기본(-1)이면 활성 없음, 확장하면 해당 카드. */}
      <StepDots count={STEPS} active={focus} />
    </div>
  );
}
