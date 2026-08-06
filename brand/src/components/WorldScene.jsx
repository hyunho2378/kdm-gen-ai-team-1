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
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${window.innerHeight * PIN_SCREENS}`,
          pin: true,
          // **pin을 transform으로 잡는다.** 기본값은 fixed인데(설치본 ScrollTrigger가
          // 뷰포트 스크롤러면 fixed를 고른다), 스크롤 워프가 조상에 skew를 걸면
          // 그 fixed가 뷰포트 기준을 잃는다. 실측으로 pin 한복판에서 이 섹션이
          // 뷰포트 top 0에서 **-1836으로 날아갔다.** transform 방식은 조상이 기울어도
          // 자기 자리를 그대로 지킨다
          pinType: 'transform',
          // 스크롤에 1:1로 붙되 1초만큼 뒤따라 감속한다. 계단이 아니라 흐름으로 읽힌다
          scrub: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      });

      // **두 단계만 남는다.** 배경 원과 검끝 선을 걷어내면서 그 두 단계도 함께 빠졌다.
      // 제목이 서고 본문이 뒤따르는 시차가 이 구간의 전부다
      tl.from('[data-world="title"]', { opacity: 0, y: 40 })
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
      className="vx-shell vx-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: spacing.unit * 3,
      }}
    >
      {/* **깊이 radial과 검끝 SVG 선을 둘 다 걷어냈다(REBOOT_PLAN 2.1).**
          radial은 배경을 물들이는 그라디언트이고 선은 장식 선이라 각각 금지 항목에 걸린다.
          공간은 여백과 타이포 스케일이 만들고, 연출은 제목과 본문의 시차만으로 남는다.
          검끝 문법은 히어로의 진짜 궤적 리본이 이미 지고 있다 */}
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
