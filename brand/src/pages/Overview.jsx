// OVERVIEW. **사이트의 첫 화면이고 루트(`/`)다.**
//
// Apple도 제품의 대표 주소가 오버뷰다(`/apple-vision-pro/`). 스펙과 OS는 그 아래
// 다른 주소로 갈린다. 우리도 같은 자리 배분이다.
//
// ── 이 페이지의 구성 ────────────────────────────────────────────────────────
//   히어로        와이드 미디어 + 검끝 궤적 + 워드마크 + 한 줄 + 팀 표기
//   두 장치       와이드 미디어 + 소제목 + 짧은 문장
//   왜 VORTEX인가  **moti 이미지** + 소제목 + 짧은 문장
//   원칙          목록이 아니라 한 덩어리의 큰 문장
//
// 미디어는 moti 하나만 실제 이미지이고 나머지는 첨부 예정 슬롯이다.

import { useEffect, useRef } from 'react';
import { colors, spacing, typography } from '../tokens.js';
import { ABOUT, HERO, MEDIA_PENDING, PRODUCT_NAV, PRODUCT_SITE } from '../copy.js';
import { gsap, isReduced } from '../lib/motion.js';
import { SectionHead, WideMedia } from '../components/Blocks.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import HeroTrail from '../components/HeroTrail.jsx';
import HeroWordmark from '../components/HeroWordmark.jsx';
import ProductLayout from '../components/ProductLayout.jsx';
import { captionStyle, leadStyle, titleStyle } from '../components/typo.js';

const TAB = PRODUCT_NAV.tabs[0];

export default function Overview() {
  const { naming, principles } = ABOUT;
  const copy = PRODUCT_SITE.sections.overview;

  return (
    <ProductLayout>
      <Hero />

      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <WideMedia pending={MEDIA_PENDING} />
        <SectionHead label={{ en: TAB.label, ko: TAB.ko }} title={copy.title} line={copy.line} />
      </section>

      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <WideMedia pending={MEDIA_PENDING} />
        <SectionHead label={naming.eyebrow} title={naming.title} line={naming.body} />
      </section>

      {/* 원칙 셋. **목록으로 눕히지 않는다.** 줄바꿈 하나로 이어진 한 덩어리의 큰 문장이다 */}
      <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)' }}>
        <p data-beat style={{ ...titleStyle, whiteSpace: 'pre-line' }}>{principles.items.join('\n')}</p>
      </section>
    </ProductLayout>
  );
}

/**
 * 히어로. **미디어가 주인공이다.** 와이드 슬롯이 화면 폭을 다 쓰고 카피가 그 안에 작게 앉는다.
 *
 * **gsap.context와 revert가 필수다.** 그냥 kill로 정리하면 StrictMode의 이중 마운트에서
 * 첫 타임라인이 남긴 인라인 스타일(opacity 0)이 그대로 있고, 두 번째 `from()`이 그 값을
 * **도착 상태로 읽어** 워드마크가 영원히 안 뜬다(실측으로 잡았다).
 */
function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const ctx = gsap.context(() => {
      // 모션을 줄여 달라고 했으면 등장을 생략한다. 원래 자리에 그대로 선다
      if (isReduced()) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('[data-enter="wordmark"]', { opacity: 0, y: 28, duration: 0.7 })
        .from('[data-enter="eyebrow"]', { opacity: 0, y: 12, duration: 0.45 }, '-=0.35')
        .from('[data-enter="sub"]', { opacity: 0, y: 14, duration: 0.5 }, '-=0.3')
        .from('[data-enter="tail"]', { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, '-=0.25');
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-label={HERO.wordmark} style={{ paddingBottom: spacing.unit * 4 }}>
      <div className="vx-wide vx-bleed" style={{ justifyContent: 'flex-start' }}>
        {/* 검끝 궤적. 슬롯 안에서만 돈다. 라이트에서 보이게 잉크와 일반 합성으로 바꿨다 */}
        <HeroTrail />

        {/* **이미지 자리 표기.** 카피가 좌측을 쓰므로 우하단에 눕혀 겹치지 않는다 */}
        <span
          data-enter="tail"
          style={{
            position: 'absolute',
            right: 'var(--page-gutter)',
            bottom: spacing.unit * 2,
            ...captionStyle,
            letterSpacing: typography.hud.tracking,
          }}
        >
          {MEDIA_PENDING}
        </span>

        <div
          className="vx-shell"
          style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: spacing.unit }}
        >
          <div data-enter="eyebrow">
            <Eyebrow en={HERO.eyebrow.en} ko={HERO.eyebrow.ko} />
          </div>
          {/* **평면 잉크다.** 크롬 셰이더는 라이트 배경에서 대비 1.16:1이라 걷었다 */}
          <HeroWordmark text={HERO.wordmark} />
          <p data-enter="sub" style={{ ...leadStyle, marginTop: spacing.unit }}>
            {HERO.sub}
          </p>
        </div>
      </div>

      {/* 슬롯 아래 띠. 팀 표기와 스크롤 단서만 눕힌다 */}
      <div
        className="vx-shell"
        style={{
          marginTop: spacing.unit * 3,
          display: 'flex',
          justifyContent: 'space-between',
          gap: spacing.unit * 2,
          flexWrap: 'wrap',
        }}
      >
        <p data-enter="tail" style={captionStyle}>{HERO.team}</p>
        <p
          data-enter="tail"
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.hud.size,
            letterSpacing: typography.hud.tracking,
            fontWeight: typography.hud.weight,
            color: colors.text.primary,
          }}
        >
          {HERO.scrollHint}
        </p>
      </div>
    </section>
  );
}
