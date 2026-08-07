// 히어로. **발표 표지 구도다.** 마스크(좌)와 컨트롤러(우)가 중앙 로고를 향해 선다.
//
// ── 진입 순서 ───────────────────────────────────────────────────────────────
//   1. 인물이 중앙에서 좌측으로 이동하며 등장
//   2. 컨트롤러가 우측 하단에서 중앙으로 이동하며 등장
//   3. 로고가 중앙에 안착
//
// `transform`과 `opacity`만 건드린다(MOTION 11절). 레이아웃을 읽지 않으므로 리플로가 없다.
//
// ── 이 구간만 블랙이다 ──────────────────────────────────────────────────────
// 페이지 전체는 라이트 그라디언트인데(`html`이 진다) 이 섹션이 그 위를 블랙으로 덮는다.
// **아래로 내려가면 라이트로 열리는 대비가 이 히어로의 절반이다.** 그래서 섹션 바닥에
// 블랙에서 투명으로 가는 띠를 두어 경계가 칼로 자른 선으로 안 보이게 한다.
//
// ── 리본 궤적을 여기서 걷었다 ───────────────────────────────────────────────
// 표지 구도가 주인공인데 움직이는 것이 넷이 되면 시선이 갈린다. 그리고 그 리본은
// **라이트 배경용 잉크(#101010)로 튜닝돼 있어 블랙 위에서 안 보인다**(BV2-2에서 크롬
// 그라디언트를 걷고 평면 잉크로 내린 그 값이다). WebGL 컨텍스트 하나가 줄어 아래
// 영상 둘과 같이 돌 때도 유리하다.
//
// ── 에셋 ────────────────────────────────────────────────────────────────────
// `web-1.png`(919x1000) 인물, `web-2.png`(920x920) 컨트롤러, `web-logo.svg`(497x243, 흰색).
// **`web-main.svg`는 안 쓴다.** 열어 보니 앞의 두 PNG를 `<pattern>`으로 embed한 31MB
// 합성본이라 같은 그림에 26배를 낸다.
//
// **모션을 줄여 달라고 했으면 셋이 최종 자리에 그대로 선다.** 등장만 생략하고 구도는 같다.

import { useEffect, useRef } from 'react';
import { spacing, typography } from '../tokens.js';
import { HERO } from '../copy.js';
import { gsap, isReduced } from '../lib/motion.js';

export default function HeroCover() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const ctx = gsap.context(() => {
      // **gsap.context와 revert가 필수다.** kill로 정리하면 StrictMode 이중 마운트에서
      // 첫 타임라인이 남긴 인라인 스타일(opacity 0)을 두 번째 `from()`이 도착 상태로 읽어
      // 요소가 영원히 안 뜬다(BV2-2에서 실측으로 잡았다)
      if (isReduced()) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      // 1. 인물. 중앙에서 좌측으로 밀려 나오며 뜬다
      tl.from('[data-cover="mask"]', { opacity: 0, xPercent: 42, scale: 0.94, duration: 0.9 })
        // 2. 컨트롤러. 우측 하단에서 중앙으로 올라온다
        .from('[data-cover="controller"]', { opacity: 0, xPercent: -34, yPercent: 30, scale: 0.92, duration: 0.85 }, '-=0.55')
        // 3. 로고가 가운데 안착
        .from('[data-cover="logo"]', { opacity: 0, scale: 0.86, duration: 0.7 }, '-=0.45')
        .from('[data-cover="text"]', { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, '-=0.35');
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="vx-cover vx-bleed" aria-label={HERO.wordmark}>
      <div className="vx-cover-stage">
        <img
          data-cover="mask"
          className="vx-cover-mask"
          src="/images/home/web-1.png"
          alt={HERO.maskAlt}
          width={919}
          height={1000}
        />
        {/* 로고가 가운데다. 둘 사이에 서서 둘이 그것을 향하는 구도가 된다 */}
        <img
          data-cover="logo"
          className="vx-cover-logo"
          src="/images/home/web-logo.svg"
          alt={HERO.wordmark}
          width={497}
          height={243}
        />
        <img
          data-cover="controller"
          className="vx-cover-controller"
          src="/images/home/web-2.png"
          alt={HERO.controllerAlt}
          width={920}
          height={920}
        />
      </div>

      <div className="vx-shell vx-cover-copy">
        {/* **공용 Eyebrow를 안 쓴다.** 그것은 라이트 팔레트라 영문이 네이비(#263E5F),
            국문이 잉크 60퍼센트인데 **블랙 위에서 둘 다 안 보인다**(실측: 네이비가 1.9:1,
            잉크 dim은 1.1:1). 이 섹션만 무대가 반대라 여기서 흰 계열로 세운다 */}
        <div data-cover="text" className="vx-cover-eyebrow">
          <span>{HERO.eyebrow.en}</span>
          <span>{HERO.eyebrow.ko}</span>
        </div>
        <p data-cover="text" className="vx-cover-sub">{HERO.sub}</p>
        <div data-cover="text" className="vx-cover-tail">
          <span>{HERO.team}</span>
          <span style={{ letterSpacing: typography.hud.tracking, fontWeight: typography.hud.weight }}>
            {HERO.scrollHint}
          </span>
        </div>
      </div>

      {/* 블랙에서 아래 라이트로 넘어가는 띠. 경계가 칼로 자른 선으로 안 보이게 한다 */}
      <div aria-hidden="true" className="vx-cover-fade" style={{ height: spacing.unit * 10 }} />
    </section>
  );
}
