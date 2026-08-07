// 로고 가이드 (참조 `frames/ref/Slide 16_9 - 85.svg` 벤토 그리드). SVG를 렌더하지 않고 구조만 재현.
//   좌상단 아이브로우(헤드라인 문장 없음). 아래 벤토 4셀:
//     좌 큰 셀 조합형(네이비 그라디언트, 2행 span) — **심볼(흰 logo.svg) + 워드마크(흰 마스크 black_wm.svg)를
//       개별 요소로 분리**해 각각 등장을 제어한다.
//     우상 로고타입(실버, 잉크 워드마크) / 우하좌 심볼(실버, 잉크 심볼) / 우하우 그리드 버전(실버, lgoo_line).
//   라벨은 영문만(좌상단). 상단 표기(팀/행사/제품명)는 넣지 않는다.
//
// **모티프→가이드 연결 인터랙션.** 아래로 진입(dir>0)하면 App의 트래블링 오버레이가 모티프 로고를
//   조합형 심볼 자리로 날려 보내고(≈1초), 착지에 맞춰 순차 등장 타임라인이 돈다:
//     비트3 심볼 착지 → 심볼 셀 + 그리드 셀(심볼 크롭) 등장
//     비트4 워드마크 좌→우 그리기 → 로고타입 셀 등장
//     비트5 그리드 셀 클립 확장(그리드 선/사각형 채워짐)
//   위로 진입(dir<0, 컬러에서)이나 reduced motion이면 전부 정착 상태로 즉시 표시.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion, grid, brandNavyStops, brandSilverStops } from '../tokens.js';
import { LOGO_GUIDE } from '../copy.js';
import { Eyebrow } from '../components/Bits.jsx';

// **위에서 아래로 그라데이션(참조 벤토).** 네이비/실버 견본이 내용이라 이 슬라이드에서만 보인다.
const NAVY_V = `linear-gradient(180deg, ${brandNavyStops[0]} 0%, ${brandNavyStops[1]} 100%)`;
const SILVER_V = `linear-gradient(180deg, ${brandSilverStops[0]} 0%, ${brandSilverStops[1]} 100%)`;

const FLIGHT_DUR = 1.0; // App 트래블링 오버레이 비행 시간과 일치. 타임라인은 이만큼 대기 후 시작.

// 셀 공통 껍데기(라벨 + 콘텐츠 슬롯). 라벨은 영문만, 좌상단.
function cellBase(onNavy) {
  return {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    background: onNavy ? NAVY_V : SILVER_V,
    boxShadow: onNavy ? 'none' : `inset 0 0 0 1px ${colors.line.faint}`,
    display: 'flex',
    flexDirection: 'column',
    padding: 'clamp(16px, 1.8vw, 32px)',
    minWidth: 0,
    minHeight: 0,
  };
}
function CellLabel({ text, onNavy }) {
  return (
    <div
      style={{
        flexShrink: 0,
        fontFamily: typography.family,
        fontSize: typography.body.size,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        color: onNavy ? colors.white : colors.text.primary,
      }}
    >
      {text}
    </div>
  );
}
// 라벨 아래 콘텐츠 중앙 슬롯.
const SLOT = { flex: '1 1 auto', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(8px, 1.5vh, 24px)' };

export default function SLogoGuide({ registerHandler, registerEnter }) {
  const headRef = useRef(null);
  const combSymRef = useRef(null); // 조합형 심볼(흰 logo.svg) — 오버레이 착지 지점
  const combWmRef = useRef(null); // 조합형 워드마크(흰 마스크) — 좌→우 그리기
  const typeCellRef = useRef(null); // 로고타입 셀
  const symCellRef = useRef(null); // 심볼 셀
  const gridClipRef = useRef(null); // 그리드 셀 클립 대상(lgoo_line)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const head = headRef.current;
    const combSym = combSymRef.current;
    const combWm = combWmRef.current;
    const typeCell = typeCellRef.current;
    const symCell = symCellRef.current;
    const gridClip = gridClipRef.current;
    const all = [head, combSym, combWm, typeCell, symCell, gridClip];
    if (all.some((el) => !el)) return undefined;

    let tl = null;

    // 정착 상태(전부 보임). 위 진입/reduced/기본값.
    const settle = () => {
      if (tl) tl.kill();
      gsap.set(head, { opacity: 1, y: 0 });
      gsap.set([combSym, typeCell, symCell], { opacity: 1, y: 0 });
      gsap.set(combWm, { clipPath: 'inset(0 0% 0 0)' });
      gsap.set(gridClip, { clipPath: 'inset(0%)' });
    };

    // 아래 진입: 오버레이 착지(≈FLIGHT_DUR)에 맞춰 순차 등장.
    const play = () => {
      if (tl) tl.kill();
      gsap.set(head, { opacity: 1, y: 0 }); // 아이브로우는 즉시(모티프에서 이미 라이트 배경 연속)
      gsap.set(combSym, { opacity: 0 });
      gsap.set(combWm, { clipPath: 'inset(0 100% 0 0)' });
      gsap.set([typeCell, symCell], { opacity: 0, y: 24 });
      gsap.set(gridClip, { clipPath: 'inset(50% 50% 50% 50%)' });

      tl = gsap.timeline({ delay: FLIGHT_DUR });
      // 비트3: 심볼 착지 → 심볼 셀 + 그리드 셀(심볼 크롭)
      tl.to(combSym, { opacity: 1, duration: 0.35, ease: motion.gsapOut }, 0);
      tl.to(symCell, { opacity: 1, y: 0, duration: 0.55, ease: motion.gsapOut }, 0);
      tl.to(gridClip, { clipPath: 'inset(24% 30% 24% 30%)', duration: 0.55, ease: motion.gsapOut }, 0);
      // 비트4: 워드마크 좌→우 그리기 + 로고타입 셀 (너무 늦지 않게 심볼 직후)
      tl.to(combWm, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: motion.gsapInOut }, 0.32);
      tl.to(typeCell, { opacity: 1, y: 0, duration: 0.55, ease: motion.gsapOut }, 0.36);
      // 비트5: 그리드 선/사각형 채워짐(클립 전개)
      tl.to(gridClip, { clipPath: 'inset(0%)', duration: 0.6, ease: motion.gsapInOut }, 0.95);
    };

    // dir>0 아래(모티프에서) → play, dir<0 위(컬러에서) → settle.
    const handleEnter = (dir) => {
      if (reduced || dir < 0) settle();
      else play();
    };
    const handleStep = () => false; // 내부 스텝 없음. 방향키는 셸이 섹션 전환에 쓴다.

    settle(); // 기본값(직접 로드/새로고침 대비)
    registerHandler(handleStep);
    registerEnter(handleEnter);
    return () => {
      if (tl) tl.kill();
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        padding: `${grid.marginTop} ${grid.marginX} ${grid.marginBottom}`,
      }}
    >
      {/* 아이브로우만(헤드라인 문장 없음). 좌상단 전역 그리드. */}
      <div ref={headRef} style={{ flexShrink: 0 }}>
        <Eyebrow en={LOGO_GUIDE.label.en} ko={LOGO_GUIDE.label.ko} />
      </div>

      {/* 벤토 4셀: 조합형(좌, 2행 span) / 로고타입(우상, 2열) / 심볼(우하좌) / 그리드(우하우). */}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          marginTop: 'clamp(16px, 3vh, 34px)',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gridTemplateAreas: '"comb type type" "comb symbol grid"',
          gap: 'clamp(10px, 1.6vw, 32px)',
        }}
      >
        {/* 조합형(네이비): 심볼 + 워드마크 개별 요소. 세로 스택 중앙. */}
        <div style={{ ...cellBase(true), gridArea: 'comb' }}>
          <CellLabel text="Combination Mark" onNavy />
          <div style={{ ...SLOT, flexDirection: 'column', gap: 'clamp(10px, 1.6vh, 22px)' }}>
            {/* 흰 심볼(logo.svg). App 오버레이가 여기로 착지. */}
            <img
              id="guide-comb-symbol"
              ref={combSymRef}
              src="/images/assets/logo.svg"
              alt="Combination Mark"
              draggable="false"
              style={{ width: 'min(46%, 190px)', objectFit: 'contain', userSelect: 'none', willChange: 'opacity' }}
            />
            {/* 흰 워드마크: black_wm.svg(잉크)를 흰색 마스크로 찍는다. 좌→우 clip으로 그린다. */}
            <div
              ref={combWmRef}
              aria-hidden="true"
              style={{
                width: 'min(76%, 320px)',
                aspectRatio: '520 / 62',
                background: colors.white,
                WebkitMaskImage: 'url(/images/assets/black_wm.svg)',
                maskImage: 'url(/images/assets/black_wm.svg)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                willChange: 'clip-path',
              }}
            />
          </div>
        </div>

        {/* 로고타입(실버): 잉크 워드마크. */}
        <div ref={typeCellRef} style={{ ...cellBase(false), gridArea: 'type', willChange: 'transform, opacity' }}>
          <CellLabel text="Logotype" />
          <div style={SLOT}>
            <img src="/images/assets/black_wm.svg" alt="Logotype" draggable="false" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none' }} />
          </div>
        </div>

        {/* 심볼(실버): 잉크 심볼. */}
        <div ref={symCellRef} style={{ ...cellBase(false), gridArea: 'symbol', willChange: 'transform, opacity' }}>
          <CellLabel text="Logo Symbol" />
          <div style={SLOT}>
            <img src="/images/assets/logo_black.svg" alt="Logo Symbol" draggable="false" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none' }} />
          </div>
        </div>

        {/* 그리드(실버): lgoo_line.svg. 클립 2단(심볼 크롭 → 전체 그리드선). */}
        <div style={{ ...cellBase(false), gridArea: 'grid' }}>
          <CellLabel text="Grid" />
          <div style={SLOT}>
            <img
              ref={gridClipRef}
              src="/images/assets/lgoo_line.svg"
              alt="Grid"
              draggable="false"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none', willChange: 'clip-path' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
