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

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { KEYWORD, KEYWORDS } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { SectionLabel, GlassRim } from '../components/Bits.jsx';

const CAPTION = {
  fontFamily: typography.family,
  fontSize: 'clamp(0.66rem, 0.94vw, 1.05rem)',
  fontWeight: 400,
  lineHeight: 1.7,
  color: colors.text.secondary,
};

// 캡션 한 줄. 문자열이면 그대로, { terms, suffix }면 가운데점 대신 얇은 선으로 낱말을 가른다.
function CaptionLine({ line }) {
  if (typeof line === 'string') return <div style={CAPTION}>{line}</div>;
  const last = line.terms.length - 1;
  return (
    <div style={{ ...CAPTION, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
      {line.terms.map((t, i) => (
        <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {i > 0 ? (
            <span aria-hidden="true" style={{ width: 10, height: 1, background: colors.line.strong }} />
          ) : null}
          {/* 조사는 마지막 낱말에 붙인다. 떼면 '타이밍  을'로 읽힌다. */}
          <span>{i === last ? `${t}${line.suffix}` : t}</span>
        </span>
      ))}
    </div>
  );
}

export default function S4Keyword({ active }) {
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

    gsap.set(head, { opacity: 0, y: 18 });
    gsap.set(cards, { opacity: 0, y: 38 });
    const tl = gsap.timeline();
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
        background: colors.black,
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(28px, 7.2vh, 78px) clamp(16px, 3.13vw, 76px) clamp(24px, 5vh, 56px)',
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
          <SectionLabel label={{ en: KEYWORD.label.en }} />
          <div
            style={{
              marginTop: 'clamp(8px, 1.5vh, 18px)',
              fontFamily: typography.family,
              fontSize: 'clamp(0.86rem, 1.35vw, 1.5rem)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: colors.text.primary,
              whiteSpace: 'nowrap',
            }}
          >
            {KEYWORD.label.ko}
          </div>
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
            {KEYWORD.headline}
          </h2>
          {KEYWORD.body.map((line) => (
            <p
              key={line}
              style={{
                margin: 'clamp(6px, 1vh, 12px) 0 0',
                fontFamily: typography.family,
                fontSize: 'clamp(0.72rem, 1.04vw, 1.16rem)',
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
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              minHeight: 0,
              willChange: 'transform, opacity',
            }}
          >
            {/* 사진 자리 + 중앙 원형 라벨 */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 auto',
                minHeight: 0,
                borderRadius: 20,
                overflow: 'hidden',
                background: colors.deep,
              }}
            >
              <AssetImage src={k.img} fit="cover" />
              {/* 사진 위 딤. 원형 라벨 글자가 읽히게. */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(16,16,16,0.28) 0%, rgba(16,16,16,0.42) 100%)',
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
                    // **채움 없음.** 뒤 사진이 그대로 비친다.
                    background: 'transparent',
                    // TARGET과 달리 여기는 뒤가 사진이라 blur가 실제로 보인다. 아주 약하게만.
                    backdropFilter: 'blur(3px)',
                    WebkitBackdropFilter: 'blur(3px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    textAlign: 'center',
                    textShadow: '0 2px 18px rgba(16,16,16,0.9)',
                  }}
                >
                  {/* TARGET과 같은 유리 림 문법. */}
                  <GlassRim />
                  <span
                    style={{
                      fontFamily: typography.family,
                      fontSize: 'clamp(0.8rem, 1.56vw, 1.75rem)',
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
                      fontSize: 'clamp(0.7rem, 1.35vw, 1.5rem)',
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
              {k.caption.map((line, li) => (
                <CaptionLine key={li} line={line} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
