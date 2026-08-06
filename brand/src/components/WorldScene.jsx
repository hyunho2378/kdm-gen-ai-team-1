// 월드빌딩 한 컷. 히어로 다음 서사이고 스크롤이 이 구간을 끌고 간다.
//
// **두 번째 WebGL 컨텍스트를 만들지 않는다.** 히어로 궤적이 이미 컨텍스트 하나를 쥐고 있고
// 브라우저 컨텍스트 한도와 성능 때문에 한 페이지에 둘을 띄우지 않는다.
// 검끝 문법의 통일은 SVG 선 하나로 낸다. 모티프 재현이 아니라 **같은 선 문법**이다.
//
// 연출은 GSAP ScrollTrigger의 pin과 scrub만 쓴다. 새 라이브러리를 들이지 않았고
// 사용 불가 판정 저장소(JosephASG cinematic-scroll, codrops FullscreenLayoutPageTransitions)는
// 열어 보지도 않았다(LIBRARIES 판정표).
//
// reduced motion에서는 pin과 scrub을 아예 걸지 않는다. 한 화면에 전부 정적으로 읽힌다.

import { useEffect, useRef } from 'react';
import { colors, spacing, typography } from '../tokens.js';
import { gsap, isReduced, ScrollTrigger } from '../lib/motion.js';
import Eyebrow from './Eyebrow.jsx';

// pin 구간 길이. 화면 높이의 배수다. 길수록 단계가 천천히 넘어간다
const PIN_SCREENS = 2;

export default function WorldScene({ id, eyebrow, title, body }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || isReduced()) return undefined;

    const ctx = gsap.context(() => {
      // **dash 길이를 손으로 적지 않는다.** 상수로 박으면 실제 path 길이와 어긋나
      // 선이 중간에 끊겨 조각으로 보인다(실측). 브라우저가 잰 길이를 그대로 쓴다
      const stroke = root.querySelector('[data-world="stroke"]');
      const len = stroke ? stroke.getTotalLength() : 0;
      if (stroke) gsap.set(stroke, { strokeDasharray: len, strokeDashoffset: len });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${window.innerHeight * PIN_SCREENS}`,
          pin: true,
          // 스크롤에 1:1로 붙되 1초만큼 뒤따라 감속한다. 계단이 아니라 흐름으로 읽힌다
          scrub: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      });

      // 1단계. 제목이 서고 배경 원이 깊이로 물러난다
      tl.from('[data-world="title"]', { opacity: 0, y: 40 })
        .from('[data-world="depth"]', { scale: 1.35, opacity: 0.2 }, 0)
        // 2단계. 검끝 선이 그려진다. stroke-dashoffset은 transform이 아니지만
        // SVG 경로 그리기의 유일한 통로이고 레이아웃을 만들지 않는다
        .to(stroke, { strokeDashoffset: 0 }, 0.35)
        // 3단계. 본문이 뒤따라 뜬다
        .from('[data-world="body"]', { opacity: 0, y: 24 }, 0.55);
    }, root);

    // 위 섹션(히어로)의 높이가 dvh라 주소창 변화에 흔들린다. 갱신 한 번 걸어 둔다
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section
      id={id}
      ref={rootRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: spacing.unit * 3,
        padding: `${spacing.section} ${spacing.gutter}`,
        maxWidth: spacing.maxWide,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 깊이층. 아주 낮은 알파의 원 하나가 뒤로 물러나며 공간을 만든다 */}
      <div
        aria-hidden="true"
        data-world="depth"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: `radial-gradient(circle at 62% 50%, ${colors.line.default} 0%, transparent 55%)`,
        }}
      />

      {/* 검끝 선. 히어로 궤적과 같은 문법이되 WebGL이 아니라 SVG다.
          **경로를 하단으로 눌렀다.** 화면 중앙을 지나던 곡선이 본문을 가로질러
          읽는 줄 위에 선이 얹혔다(실측 스크린샷). 텍스트 블록 아래에서만 흐른다 */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, zIndex: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="world-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={colors.steel.shadow} />
            <stop offset="55%" stopColor={colors.steel.mid} />
            <stop offset="100%" stopColor={colors.red.light} />
          </linearGradient>
        </defs>
        <path
          data-world="stroke"
          d="M -20 388 C 200 378, 300 330, 460 306 S 720 246, 820 176"
          fill="none"
          stroke="url(#world-stroke)"
          strokeWidth="1.5"
          strokeOpacity="0.7"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="0"
          strokeDashoffset="0"
        />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: spacing.unit * 3 }}>
        <Eyebrow en={eyebrow.en} ko={eyebrow.ko} />

        <h2
          data-world="title"
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
          {title}
        </h2>

        <p
          data-world="body"
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
          {body}
        </p>
      </div>
    </section>
  );
}
