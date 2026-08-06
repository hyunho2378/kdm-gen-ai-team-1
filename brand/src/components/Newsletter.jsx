// 뉴스레터 리빌 블록(R6). CTA 아래로 더 스크롤하면 아래에서 올라오며 드러난다.
//
// **리빌은 GSAP ScrollTrigger scrub 하나로 낸다.** transform(y)과 opacity만 움직인다(DESIGN 7절).
// **fixed pin을 쓰지 않는다.** 월드빌딩 pin이 워프 조상 안에서 뷰포트 기준을 잃던 함정을 피한다
// (PITFALLS transform 조상). pin이 없으므로 워프 skew가 걸려도 리빌 진행은 scrollY로만 계산돼 어긋나지 않는다.
//
// reduced motion에서는 트리거를 아예 걸지 않는다. 블록은 자연 상태(보임)로 그대로 선다.
//
// **전송 백엔드가 없다.** 입력과 버튼은 세우되 제출은 자리표시 동작이다. 눌러도 죽지 않고
// 안내 한 줄과 콘솔 로그만 남긴다. label과 input을 연결하고 키보드 제출과 focus-visible을 지킨다.

import { useEffect, useRef, useState } from 'react';
import { colors, radius, spacing, typography } from '../tokens.js';
import { LANDING } from '../copy.js';
import { gsap, isReduced, ScrollTrigger } from '../lib/motion.js';

const { newsletter } = LANDING.outro;
const EMAIL_ID = 'vx-newsletter-email';

export default function Newsletter({ id }) {
  const rootRef = useRef(null);
  const revealRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const el = revealRef.current;
    // 모션을 줄여 달라고 했으면 리빌을 생략한다. 블록은 자연 상태로 이미 보인다
    if (!el || isReduced()) return undefined;
    const ctx = gsap.context(() => {
      // 아래에서 올라오며 드러난다. scrub이라 스크롤 진행에 1:1로 묶인다.
      // 시작 전(블록이 화면 아래)에는 from 상태(숨김), 화면 중상단에 닿으면 자연 상태로 완성
      gsap.from(el, {
        y: 48,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          end: 'top 45%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, rootRef);
    // 하단 섹션이 새로 늘어 문서 높이가 바뀌었으므로 트리거 위치를 다시 잰다
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    // **전송 백엔드가 없다.** 자리표시 동작만 한다(PROGRESS에 미연결 기록)
    console.info('[brand] 뉴스레터 구독은 백엔드 미연결이라 자리표시 동작이다.');
    setSubmitted(true);
  }

  return (
    <section
      id={id}
      ref={rootRef}
      className="vx-shell vx-section"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        ref={revealRef}
        style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 3, willChange: 'transform, opacity' }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.title.size,
            fontWeight: typography.title.weight,
            letterSpacing: typography.title.tracking,
            lineHeight: typography.title.leading,
            color: colors.text.primary,
            maxWidth: spacing.maxContent,
            wordBreak: 'keep-all',
          }}
        >
          {newsletter.title}
        </h2>

        <p
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.body.size,
            lineHeight: typography.body.leading,
            color: colors.text.secondary,
            maxWidth: 720,
            wordBreak: 'keep-all',
          }}
        >
          {newsletter.note}
        </p>

        {/* 입력 한 칸과 구독 버튼. **입력 필드 border는 기능이라 R1 선 제거 예외**(최소한).
            채움과 press는 .vx-cta 클래스가 쥔다. focus-visible red 2px는 index.css 전역이 건다 */}
        <form
          onSubmit={onSubmit}
          noValidate={false}
          style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.unit * 1.5, alignItems: 'center', maxWidth: 520 }}
        >
          <label htmlFor={EMAIL_ID} className="sr-only">{newsletter.label}</label>
          <input
            id={EMAIL_ID}
            type="email"
            required
            autoComplete="email"
            placeholder={newsletter.placeholder}
            style={{
              flex: '1 1 220px',
              minWidth: 0,
              minHeight: 44,
              padding: '10px 16px',
              borderRadius: radius.md,
              border: `1px solid ${colors.line.strong}`,
              background: 'transparent',
              color: colors.text.primary,
              fontFamily: typography.family,
              fontSize: typography.body.size,
            }}
          />
          <button type="submit" className="vx-cta" style={submitStyle}>
            {newsletter.button}
          </button>
        </form>

        {/* 제출 뒤 자리표시 안내. aria-live로 스크린리더에도 상태 변화를 알린다 */}
        {submitted ? (
          <p
            role="status"
            aria-live="polite"
            style={{ margin: 0, fontFamily: typography.family, fontSize: typography.caption.size, color: colors.text.dim }}
          >
            {newsletter.pending}
          </p>
        ) : null}
      </div>
    </section>
  );
}

// **background를 인라인으로 걸지 않는다.** .vx-cta가 채움과 :active press를 쥔다(PITFALLS 인라인 우선).
const submitStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '10px 24px',
  borderRadius: radius.pill,
  border: 'none',
  fontFamily: typography.family,
  fontSize: typography.body.size,
  fontWeight: 600,
  lineHeight: 1,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
