// IA 2절 1번: 표지 히어로. P3에서 영상 스크럽으로 개편했다.
// 구조: section이 200vh, 안쪽 sticky 100dvh 레이어에 펜싱 프레임 canvas(배경) + 스크림 + 콘텐츠.
// 스크롤 진행률 → 프레임 인덱스(imageSequence 로직 포팅: progress 스냅 + curFrame 비교 redraw 방지, scrub 없이 1:1).
// 워드마크 SplitText 글자 단위 등장은 이 섹션에서만 1회 허용한다(MOTION 0절). 스크럽 위 콘텐츠 레이어로 유지한다.
// reduced motion: 200vh·스크럽 없이 대표 프레임 한 장 정지(전정기관 자극 회피).

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll.js';
import { isReduced, REDUCED_FADE_MS } from '../lib/motionMode.js';
import { whenBooted, markAssetsReady } from '../lib/boot.js';
import { colors, spacing, typography, breakpoints, zIndex } from '../tokens.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { RAIL_RESERVE_PX } from '../components/ProgressRail.jsx';
import ChromeText from '../components/ui/ChromeText.jsx';
import TrailDivider from '../components/ui/TrailDivider.jsx';
import Reveal from '../components/Reveal.jsx';

const BASE = '/frames/hero/';

export default function CoverSection({ data }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const markRef = useRef(null);
  const wide = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const reduced = isReduced();

  // --- 프레임 스크럽 ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return undefined;
    const ctx = canvas.getContext('2d');

    let images = [];
    let count = 0;
    let transparent = false;
    let curFrame = -1;
    let st = null;
    let cancelled = false;
    const pad4 = (n) => String(n).padStart(4, '0');

    function drawFrame(i) {
      const img = images[i];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      if (transparent) ctx.clearRect(0, 0, cw, ch); // 투명 프레임은 매 프레임 지운다
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // cover fit
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      curFrame = i;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // DPR 캡: 4K에서 캔버스 과대 방지
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      const f = curFrame < 0 ? 0 : curFrame;
      curFrame = -1; // 캔버스 클리어됐으므로 강제 재그리기
      drawFrame(f);
    }

    window.addEventListener('resize', resize);

    fetch(BASE + 'manifest.json')
      .then((r) => r.json())
      .then((m) => {
        if (cancelled) return;
        count = m.count;
        transparent = !!m.transparent;
        images = new Array(count);
        const srcOf = (i) => BASE + m.pattern.replace('%04d', pad4(i + 1));

        // 프레임 0을 먼저 디코드해 즉시 그린다(빈 canvas 금지). 준비되면 프리로더에 알린다.
        const first = new Image();
        first.decoding = 'async';
        first.src = srcOf(0);
        images[0] = first;
        first.decode().catch(() => {}).finally(() => {
          if (cancelled) return;
          resize();
          drawFrame(0);
          markAssetsReady();
        });

        // 나머지는 fetch만 걸어 둔다(압축 데이터 ~프레임당 수십 KB). 디코드는 draw 시점 온디맨드.
        // ponytail: 240장 1080p 실물에서 메모리가 오르면 현재 인덱스 ±10만 유지하는 윈도잉으로 올린다.
        for (let i = 1; i < count; i += 1) {
          const im = new Image();
          im.decoding = 'async';
          im.src = srcOf(i);
          images[i] = im;
        }

        if (reduced) {
          // 스크럽 없이 대표 프레임 한 장 정지(마지막 = 찌르기 완성).
          const rep = count - 1;
          const im = images[rep];
          const ready = im.complete ? Promise.resolve() : im.decode().catch(() => {});
          ready.then(() => {
            if (!cancelled) {
              resize();
              drawFrame(rep);
            }
          });
          return;
        }

        // 스크럽 트리거. progress → 프레임 인덱스 스냅. scrub 없이 스크롤과 1:1.
        st = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const i = Math.round(self.progress * (count - 1));
            if (i !== curFrame) drawFrame(i);
          },
        });
        // cover가 200vh가 되며 문서 높이가 바뀌었다. ScrollTrail 앵커 테이블을 다시 잰다.
        ScrollTrigger.refresh();
      })
      .catch(() => {
        if (!cancelled) markAssetsReady(); // 프레임 실패해도 부팅은 진행(핵심 UI 인질 금지)
      });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
      st?.kill();
    };
  }, [reduced]);

  // --- 워드마크 SplitText 1회 (기존 연출 보존) ---
  useEffect(() => {
    const el = markRef.current;
    if (!el) return undefined;
    let split = null;
    let tween = null;
    let cancelled = false;

    // 프리로더가 걷힌 뒤에 시작한다. 실패해도 반드시 다시 보이게 한다(PITFALLS 서드파티 절).
    gsap.set(el, { opacity: 0 });
    whenBooted().then(() => {
      if (cancelled) return;
      if (isReduced()) {
        gsap.to(el, { opacity: 1, duration: REDUCED_FADE_MS / 1000, ease: 'none' });
        return;
      }
      import('gsap/SplitText')
        .then(({ SplitText }) => {
          if (cancelled) return;
          gsap.registerPlugin(SplitText);
          gsap.set(el, { opacity: 1 });
          split = new SplitText(el, { type: 'chars' }); // 완성형 글자 단위(PATTERNS 12절)
          tween = gsap.from(split.chars, { opacity: 0, yPercent: 40, duration: 0.7, ease: 'power3.out', stagger: 0.06 });
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
    <section
      ref={sectionRef}
      id="cover"
      style={{
        position: 'relative',
        // 200vh 스크롤 동안 안쪽 sticky 레이어가 고정된 채 프레임이 넘어간다. reduced는 핀 없이 한 화면.
        height: reduced ? undefined : '200vh',
        minHeight: '100dvh',
      }}
    >
      <div
        style={{
          position: reduced ? 'relative' : 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            zIndex: zIndex.content,
            background: colors.bg.deep,
          }}
        />
        {/* 스크림: 프레임 위 텍스트 가독성. 좌측을 짙게, 우측은 프레임을 보여준다 */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: zIndex.content + 1,
            pointerEvents: 'none',
            background: `linear-gradient(90deg, ${colors.bg.overlay} 0%, rgba(5,5,6,0.4) 46%, transparent 78%),
                        linear-gradient(0deg, ${colors.bg.deep} 0%, transparent 32%)`,
          }}
        />

        {/* 콘텐츠 레이어. Section 골격의 패딩·레일 여백을 여기서 재현한다 */}
        <div
          style={{
            position: 'relative',
            zIndex: zIndex.content + 2,
            width: '100%',
            maxWidth: spacing.maxWide,
            marginInline: 'auto',
            paddingLeft: spacing.gutter,
            paddingRight: wide ? `calc(${spacing.gutter} + ${RAIL_RESERVE_PX}px)` : spacing.gutter,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: typography.hud.size,
              fontWeight: typography.hud.weight,
              letterSpacing: typography.hud.tracking,
              lineHeight: typography.hud.leading,
              color: colors.text.dim,
              textTransform: 'uppercase',
            }}
          >
            {data.label}
          </p>

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
        </div>
      </div>
    </section>
  );
}
