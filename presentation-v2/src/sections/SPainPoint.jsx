// 인사이트 PAIN POINT. 원본 레이아웃은 `1.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼았고
// 좌표는 SVG에서 직접 뽑았다(base64를 걷어낸 뒤 파싱해야 한다. 750KB라 정규식이 그대로는 안 돈다).
//
// 원본 실측(1920 기준):
//   배경  풀블리드 사진 + black 0.63 오버레이
//   라벨  PAIN POINT  #E60D15 size 24 weight 600  x 57.6  y 256.1 → 3.0% / 23.7%
//         INSIGHT     같은 스타일               x 57.6  y 708.2 → 3.0% / 65.6%
//   상단 글래스 카드  x 381.883 / 817.883 / 1253.883,  y 235.441,  w 389.5,  h 261.5,  rx 24.75
//         채움 black 0.01 + 그라디언트 스트로크. 카드 간격 46.5
//   점선 화살표  x 577.1 / 1013.1 / 1449.1,  y 537 → 649
//   하단 레드 카드  x 392.633 / 828.633 / 1264.633,  y 685.948,  w 368,  h 223.743,  rx 25
//         채움 #B3122C 알파 0.35 → 브랜드 확정색 tokens.red로 교체
//   **열 중심이 상하 동일하다.** 상단 576.6 / 1012.6 / 1448.6, 하단도 576.6 / 1012.6 / 1448.6
//   하단 카드가 21.5 좁고 10.75 안쪽으로 들어와 중심이 맞는다. 이 정렬이 이 페이지의 핵심이다
//
// 배경 사진은 라이선스 미확인 시안이라 임베드하지 않는다. 파일이 없으면 다크 플레이스홀더로 내려앉는다.
// 진입: 상단 카드 좌→우 → 화살표 → 하단 카드 순서. transform과 opacity만.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, inkA, bgA } from '../tokens.js';
import { PAINPOINT, PAINPOINT_COLUMNS } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow } from '../components/Bits.jsx';

export default function SPainPoint({ active }) {
  const painRefs = useRef([]);
  const arrowRefs = useRef([]);
  const insightRefs = useRef([]);
  const labelRefs = useRef([]);

  useEffect(() => {
    if (!active) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pains = painRefs.current.filter(Boolean);
    const arrows = arrowRefs.current.filter(Boolean);
    const insights = insightRefs.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!pains.length) return undefined;

    if (reduced) {
      gsap.set([...labels, ...pains, ...arrows, ...insights], { opacity: 1, x: 0, y: 0, scaleY: 1 });
      return undefined;
    }

    gsap.set(labels, { opacity: 0, x: -12 });
    gsap.set(pains, { opacity: 0, y: 26 });
    gsap.set(arrows, { opacity: 0, scaleY: 0 });
    gsap.set(insights, { opacity: 0, y: 26 });

    // 셸의 섹션 이동이 1초다. 지연이 없으면 착지 전에 연출이 끝난다.
    const tl = gsap.timeline({ delay: 0.45 });
    tl.to(labels, { opacity: 1, x: 0, duration: 0.5, ease: motion.gsapOut, stagger: 0.1 });
    // 1. 상단 카드 좌 → 우
    tl.to(pains, { opacity: 1, y: 0, duration: 0.55, ease: motion.gsapOut, stagger: 0.13 }, 0.1);
    // 2. 화살표가 위에서 아래로 자란다
    tl.to(arrows, { opacity: 1, scaleY: 1, duration: 0.45, ease: motion.gsapOut, stagger: 0.11 }, 0.62);
    // 3. 하단 인사이트 카드
    tl.to(insights, { opacity: 1, y: 0, duration: 0.55, ease: motion.gsapOut, stagger: 0.13 }, 0.94);

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 배경 사진 + 라이트 딤. 라이트 반전: 블랙 오버레이 → bg. 사진이 오면 라이트로 눌러 카드 대비를 살린다. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AssetImage src={PAINPOINT.bg} fit="cover" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: bgA(0.5),
          }}
        />
      </div>

      {/* 좌측 라벨 둘. 좌마진은 전역 그리드, top은 각 카드 행에 맞춘다(두 밴드 라벨). */}
      <div
        ref={(el) => { labelRefs.current[0] = el; }}
        style={{ position: 'absolute', left: grid.marginX, top: '23.7%', zIndex: 4, opacity: 0, pointerEvents: 'none' }}
      >
        <Eyebrow en={PAINPOINT.painLabel} />
      </div>
      <div
        ref={(el) => { labelRefs.current[1] = el; }}
        style={{ position: 'absolute', left: grid.marginX, top: '65.6%', zIndex: 4, opacity: 0, pointerEvents: 'none' }}
      >
        <Eyebrow en={PAINPOINT.insightLabel} />
      </div>

      {/* 3열 그리드. 상단 카드 / 화살표 / 하단 카드를 같은 열에 세운다.
          원본 카드 블록은 x 19.89% ~ 85.59%로 좌측 라벨 자리를 비워 두느라 오른쪽으로 밀려 있다. */}
      <div
        style={{
          position: 'absolute',
          left: '19.89%',
          right: '14.41%',
          top: '21.8%',
          bottom: '15.8%',
          zIndex: 3,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          // 상단 카드 24.2% / 화살표 10.4% / 하단 카드 20.7% (1080 기준 원본 비율)
          gridTemplateRows: 'minmax(0, 261.5fr) minmax(0, 189fr) minmax(0, 223.7fr)',
          columnGap: 'clamp(10px, 2.42vw, 58px)',
          pointerEvents: 'none',
        }}
      >
        {/* 1행: 상단 글래스 카드 */}
        {PAINPOINT_COLUMNS.map((c, i) => (
          <div
            key={`pain-${c.key}`}
            ref={(el) => { painRefs.current[i] = el; }}
            style={{
              gridRow: 1,
              gridColumn: i + 1,
              opacity: 0,
              borderRadius: 25,
              // 라이트 반전: 아주 옅은 잉크 틴트 + 잉크 테두리가 카드를 만든다.
              background: colors.surface.glass,
              border: `1px solid ${colors.line.default}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(8px, 1.8vh, 22px)',
              textAlign: 'center',
              padding: 'clamp(12px, 2vh, 26px) clamp(10px, 1.4vw, 28px)',
              minHeight: 0,
              willChange: 'transform, opacity',
            }}
          >
            <div
              style={{
                fontFamily: typography.family,
                fontSize: 'clamp(0.7rem, 1.25vw, 1.36rem)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: colors.text.secondary,
              }}
            >
              {c.title}
            </div>
            <div>
              {c.pain.map((line) => (
                <div
                  key={line}
                  style={{
                    fontFamily: typography.family,
                    fontSize: 'clamp(0.76rem, 1.35vw, 1.48rem)',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.6,
                    color: colors.text.primary,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 2행: 점선 화살표. 원본 x 577.1 / 1013.1 / 1449.1이 곧 각 열의 중심이다. */}
        {PAINPOINT_COLUMNS.map((c, i) => (
          <div
            key={`arrow-${c.key}`}
            aria-hidden="true"
            ref={(el) => { arrowRefs.current[i] = el; }}
            style={{
              gridRow: 2,
              gridColumn: i + 1,
              opacity: 0,
              justifySelf: 'center',
              alignSelf: 'center',
              width: 9,
              height: '58%',
              transformOrigin: 'top center',
              position: 'relative',
              willChange: 'transform, opacity',
            }}
          >
            {/* 점선 세로줄 */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 7,
                width: 1,
                transform: 'translateX(-50%)',
                backgroundImage: `repeating-linear-gradient(to bottom, ${inkA(0.45)} 0 5px, transparent 5px 11px)`,
              }}
            />
            {/* 화살촉 */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 0,
                width: 8,
                height: 8,
                transform: 'translateX(-50%) rotate(45deg)',
                borderRight: `1px solid ${inkA(0.55)}`,
                borderBottom: `1px solid ${inkA(0.55)}`,
              }}
            />
          </div>
        ))}

        {/* 3행: 하단 레드 카드. 원본은 상단보다 좁아 중심이 맞는다(폭 368 대 389.5). */}
        {PAINPOINT_COLUMNS.map((c, i) => (
          <div
            key={`insight-${c.key}`}
            ref={(el) => { insightRefs.current[i] = el; }}
            style={{
              gridRow: 3,
              gridColumn: i + 1,
              opacity: 0,
              // 원본 카드 폭 368 / 389.5 = 94.5%. 중심을 맞춰 좁힌다.
              width: '94.5%',
              justifySelf: 'center',
              borderRadius: 25,
              // 라이트 반전: 레드 강조 카드를 솔리드 잉크로. 아웃라인 페인 카드와 위계가 갈린다.
              background: colors.ink,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 'clamp(12px, 2vh, 26px) clamp(10px, 1.4vw, 26px)',
              minHeight: 0,
              willChange: 'transform, opacity',
            }}
          >
            {c.insight.map((line) => (
              <div
                key={line}
                style={{
                  fontFamily: typography.family,
                  fontSize: 'clamp(0.76rem, 1.35vw, 1.48rem)',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.6,
                  color: colors.text.onFill,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
