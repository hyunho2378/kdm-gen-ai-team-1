// 인터랙션(EXPERIENCE). **서브 진행 없음.** 4종을 한 화면에 가로 4열로 동시에 띄운다.
// 이전 판은 카드 1장씩 방향키로 넘기는 서브 진행이었다. 그 위임을 전부 걷었고
// App.jsx의 DELEGATE_IDS에서도 이 섹션(s8)을 뺐다. 이제 방향키 한 번에 통과한다.
//
// --- 레이아웃 출처 ---
// 이 섹션은 리포의 Slide SVG 8장 중 어디에도 없다(8번은 유파 카드 페이지다).
// 원본은 `바인더1.pdf` **6페이지**의 4카드 그리드이고 PyMuPDF로 렌더해 픽셀로 좌표를 쟀다.
//   1600x900 렌더 기준 실측
//   카드 4장  x 85~418 / 449~781 / 813~1145 / 1176~1509
//     → 폭 334 = **20.875%**, 간격 30 = **1.88%**, 좌우 여백 5.31%로 대칭
//   카드 세로 y 388~718 → 상단 43.1%, 높이 36.7%
//   아이콘 원 지름 74 = **카드 폭의 22.2%**, 중심 y 470 → 카드 상단에서 24.8%
//   카드 채움 rgb(26,26,29) ≈ tokens.raised, 원본 레드 rgb(179,17,43)은 tokens.red로 교체
//
// 진입: active가 true가 될 때마다 4장이 좌에서 우로 밀려 들어온다(GSAP stagger).
// **1회성으로 고정하지 않는다.** 발표 중 섹션을 왕복하면 다시 재생돼야 한다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Footprints, PersonStanding, Swords, Brain } from 'lucide-react';
import { colors, typography, motion } from '../tokens.js';
import { EXPERIENCE, INTERACTIONS } from '../copy.js';
import { Eyebrow } from '../components/Bits.jsx';

// copy.js가 아이콘을 이름으로 지정한다. 이름 → 컴포넌트 매핑은 여기 한 곳.
const ICONS = { Footprints, PersonStanding, Swords, Brain };

export default function S4Experience({ active }) {
  const headRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // **active 변화마다 재생한다.** 벗어났다 돌아오면 다시 밀려 들어온다.
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    const cards = cardsRef.current.filter(Boolean);
    if (!head) return undefined;

    if (reduced) {
      // reduced면 이동 없이 페이드만.
      gsap.set(head, { opacity: 1, x: 0, y: 0 });
      gsap.fromTo(cards, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none', stagger: 0.04 });
      return undefined;
    }

    gsap.set(head, { opacity: 0, y: 18 });
    // **셸의 섹션 이동이 1초다.** active는 키를 누른 즉시 true가 되므로 지연이 없으면
    // 스테거가 화면이 도착하기도 전에 끝나 진입 연출이 안 보인다(실측으로 확인).
    // 카드가 밀려 들어오는 구간이 착지 이후에 오도록 늦춘다.
    const tl = gsap.timeline({ delay: reduced ? 0 : 0.5 });
    tl.to(head, { opacity: 1, y: 0, duration: 0.7, ease: motion.gsapOut });
    // 좌에서 우로 하나씩. transform과 opacity만 만진다.
    tl.fromTo(
      cards,
      { opacity: 0, x: -34 },
      { opacity: 1, x: 0, duration: 0.55, ease: motion.gsapOut, stagger: 0.14 },
      0.25
    );

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
        // 원본 좌우 여백 5.31%, 라벨이 세로 20.4%에 앉는다
        padding: 'clamp(28px, 19vh, 210px) clamp(16px, 5.31vw, 130px) clamp(24px, 6vh, 64px)',
      }}
    >
      {/* 상단 좌측: 라벨과 헤드라인 */}
      <div ref={headRef} style={{ flexShrink: 0, opacity: 0 }}>
        <Eyebrow en={EXPERIENCE.label.en} ko={EXPERIENCE.label.ko} />
        <h2
          style={{
            margin: 'clamp(12px, 1.9vh, 24px) 0 0',
            fontFamily: typography.family,
            fontSize: 'clamp(1.1rem, 2.3vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.3,
            color: colors.text.primary,
          }}
        >
          {EXPERIENCE.headline}
        </h2>
      </div>

      {/* 4열 카드. 아주 좁은 폭에서는 2x2로 접힌다. */}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          // 원본 카드 상단이 세로 43.1%에 오도록 띄운다(헤드라인 아래 여백).
          marginTop: 'clamp(18px, 15vh, 150px)',
          display: 'grid',
          // 원본 카드 폭 20.875% / 간격 1.88%. 최소폭을 170px로 둬 모바일 폭에서 2x2로 접힌다.
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
          gap: 'clamp(10px, 1.88vw, 44px)',
          // 원본은 카드 상단이 세로 43.1%다. 남는 공간에 중앙 정렬하면 더 내려가므로 위에 붙인다.
          alignContent: 'start',
        }}
      >
        {INTERACTIONS.map((it, i) => {
          const Icon = ICONS[it.icon];
          return (
            <div
              key={it.key}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              style={{
                opacity: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 'clamp(10px, 1.8vh, 22px)',
                padding: 'clamp(18px, 3.4vh, 40px) clamp(12px, 1.4vw, 30px)',
                background: colors.raised,
                borderRadius: 20,
                minHeight: 0,
                willChange: 'transform, opacity',
              }}
            >
              {/* 상단 원형 아이콘. 원본 지름은 카드 폭의 22.2%. */}
              <span
                aria-hidden="true"
                style={{
                  width: 'clamp(48px, 4.6vw, 96px)',
                  height: 'clamp(48px, 4.6vw, 96px)',
                  borderRadius: '50%',
                  background: colors.red,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 26px ${colors.redGlow}`,
                }}
              >
                {Icon ? (
                  <Icon
                    strokeWidth={1.8}
                    color={colors.text.onFill}
                    style={{ width: '52%', height: '52%' }}
                  />
                ) : null}
              </span>

              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: 'clamp(0.8rem, 1.18vw, 1.32rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.35,
                  color: colors.text.primary,
                }}
              >
                {it.name}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {it.desc.map((line) => (
                  <span
                    key={line}
                    style={{
                      fontFamily: typography.family,
                      fontSize: 'clamp(0.68rem, 0.98vw, 1.08rem)',
                      fontWeight: 400,
                      lineHeight: 1.7,
                      color: colors.text.secondary,
                    }}
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
