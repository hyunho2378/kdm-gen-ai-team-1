// IA 2절 1번: 표지. 크롬 워드마크, 한 줄 정의, 스크롤 유도.
// SplitText 글자 단위 등장은 이 섹션에서만 1회 허용한다(MOTION 0절 최초 1회 연출).
// 다른 섹션에 글자 단위 등장을 복제하지 마라.

import { useEffect, useRef } from 'react';
import { gsap } from '../lib/scroll.js';
import { isReduced, REDUCED_FADE_MS } from '../lib/motionMode.js';
import { whenBooted } from '../lib/boot.js';
import { colors, spacing, typography } from '../tokens.js';
import ChromeText from '../components/ui/ChromeText.jsx';
import TrailDivider from '../components/ui/TrailDivider.jsx';
import Reveal from '../components/Reveal.jsx';

export default function CoverSection({ data }) {
  const markRef = useRef(null);

  useEffect(() => {
    const el = markRef.current;
    if (!el) return undefined;

    let split = null;
    let tween = null;
    let cancelled = false;

    // 프리로더가 걷힌 뒤에 시작한다. 먼저 터지면 순서가 뒤집혀 보인다.
    // 그동안 워드마크를 숨겨 두되, 실패해도 반드시 다시 보이게 한다(PITFALLS 서드파티 절).
    gsap.set(el, { opacity: 0 });

    whenBooted().then(() => {
      if (cancelled) return;

      // reduced motion에서는 글자 분해 자체를 하지 않는다. 짧은 페이드로 대체한다.
      if (isReduced()) {
        gsap.to(el, { opacity: 1, duration: REDUCED_FADE_MS / 1000, ease: 'none' });
        return;
      }

      // SplitText는 GSAP 3.13부터 무료다. 실패해도 워드마크는 보여야 하므로 방어한다.
      import('gsap/SplitText')
        .then(({ SplitText }) => {
          if (cancelled) return;
          gsap.registerPlugin(SplitText);
          gsap.set(el, { opacity: 1 });
          // 한글은 완성형 글자 단위로만 쪼갠다. 자소 분리는 금지다(PATTERNS 13절).
          split = new SplitText(el, { type: 'chars' });
          tween = gsap.from(split.chars, {
            opacity: 0,
            yPercent: 40,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.06,
          });
        })
        .catch(() => {
          if (!cancelled) gsap.to(el, { opacity: 1, duration: 0.4, ease: 'power3.out' });
        });
    });

    return () => {
      cancelled = true;
      tween?.kill();
      split?.revert();
      gsap.set(el, { opacity: 1 });
    };
  }, []);

  return (
    <>
      {/* 시각디자이너 SVG 레터링 슬롯. 확정 워드마크가 오면 이 ChromeText를 교체한다(DESIGN 4절) */}
      <ChromeText as="h1" variant="display" ref={markRef} style={{ marginTop: spacing.unit * 2 }}>
        {data.title}
      </ChromeText>

      <Reveal style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
        <p
          style={{
            margin: `${spacing.unit * 3}px 0 0`,
            fontFamily: typography.family,
            fontSize: typography.heading.size,
            fontWeight: typography.heading.weight,
            letterSpacing: typography.heading.tracking,
            lineHeight: typography.heading.leading,
            color: colors.text.primary,
            maxWidth: '34ch',
            wordBreak: 'keep-all',
          }}
        >
          {data.lead}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.body.size,
            lineHeight: typography.body.leading,
            color: colors.text.secondary,
            wordBreak: 'keep-all',
          }}
        >
          {data.sub}
        </p>
      </Reveal>

      {/* 스크롤 유도. 검끝 곡선이 아래로 감쇠한다 */}
      <div style={{ marginTop: spacing.unit * 6, display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
        <TrailDivider orientation="vertical" length={110} />
        <span
          style={{
            fontFamily: typography.family,
            fontSize: typography.caption.size,
            letterSpacing: typography.hud.tracking,
            color: colors.text.dim,
          }}
        >
          스크롤
        </span>
      </div>
    </>
  );
}
