// COMPONENTS.md: 스크롤 연동 궤적. 스크롤 진행률로 stroke-dashoffset을 제어한다.
// DESIGN 10절 모티프: 검끝이 그리는 곡선 한 줄. 평시 크롬, 명중과 CTA 맥락에서만 레드로 물든다.
//
// 배치 원칙. 본문을 덮지 않는다. 콘텐츠 컬럼 왼쪽 여백에 세로 띠로 고정한다.
// 폭 계산을 CSS min과 max로만 하므로 스크롤과 리사이즈에서 레이아웃을 읽지 않는다.
// ProgressRail은 우측 네비게이션, ScrollTrail은 좌측 서사다. 둘을 겹치지 않는다.

import { useEffect, useMemo, useRef, useState } from 'react';
import { colors, spacing, zIndex } from '../tokens.js';
import { gsap, ScrollTrigger } from '../lib/scroll.js';
import { isReduced } from '../lib/motionMode.js';
import { SECTIONS } from '../content/sections.js';

const UNITS = SECTIONS.length;   // 리듬 마디 수를 섹션 수에 맞춘다
const UNIT_H = 100;              // 마디 하나의 viewBox 높이
const VB_W = 100;
const VB_H = UNITS * UNIT_H;
// 준비 곡선이 마디의 앞 72퍼센트, 짧고 급한 찌르기 직선이 뒤 28퍼센트다.
const PREP_RATIO = 0.72;

// pathLength를 1로 두면 GSAP이 px 값을 정수로 반올림해 dashoffset이 1과 0만 오간다(실측).
// 길이를 키워 반올림 오차를 무해하게 만든다. getTotalLength를 부르지 않는 이점은 그대로다.
const PATH_LENGTH = 1000;

/** 균등 분할. 측정 전 첫 페인트와 SSR 대비 기본값이다. */
const EVEN_SPANS = Array.from({ length: UNITS }, () => 1 / UNITS);

/**
 * 검끝 리듬 path. 완만한 준비 곡선 뒤에 짧고 급한 직선이 반복된다.
 *
 * spans는 섹션별 스크롤 점유 비율이다. 섹션 높이가 제각각이라(interactions는 pin으로 훨씬 길다)
 * 균등 8등분으로 그리면 리듬 마디가 섹션 경계에서 어긋난다. 그래서 마디 높이를 실제 비율에 맞춘다.
 * 좌우 진폭도 마디 높이에 비례시켜 도형을 닮은꼴로 유지한다. 그래야 마디별 path 길이가
 * 높이에 비례하고, 길이 기준으로 도는 dashoffset이 경계에서 정확히 떨어진다.
 */
function buildPath(spans) {
  const mid = VB_W / 2;
  let d = `M ${mid} 0`;
  let y = 0;
  spans.forEach((span, i) => {
    const h = span * VB_H;
    const amp = Math.min(28, h * 0.28);
    const prepEnd = y + h * PREP_RATIO;
    // 준비 구간은 좌우로 번갈아 부풀어 검을 당기는 예비 동작을 만든다
    const swing = i % 2 === 0 ? mid - amp : mid + amp;
    d += ` C ${swing} ${y + h * 0.2}, ${swing} ${y + h * 0.5}, ${mid} ${prepEnd}`;
    // 찌르기는 직선이다. 곡선으로 부드럽게 만들면 리듬이 죽는다
    const thrust = i % 2 === 0 ? mid + amp * 0.5 : mid - amp * 0.5;
    y += h;
    d += ` L ${thrust} ${y}`;
    if (i < spans.length - 1) d += ` L ${mid} ${y}`;
  });
  return d;
}

/**
 * 섹션 경계의 스크롤 진행률을 잰다. 레이아웃 읽기지만 스크롤 핸들러가 아니라
 * 마운트와 refresh에서만 부른다(스래싱 없음).
 * 반환값 길이는 UNITS + 1이고 0으로 시작해 1로 끝난다.
 */
function measureBounds() {
  const max = document.body.scrollHeight - window.innerHeight;
  if (max <= 0) return null;

  const tops = SECTIONS.map((s) => document.getElementById(s.id));
  if (tops.some((el) => !el)) return null;

  // 섹션 i의 경계는 그 섹션 상단이 뷰포트 top에 닿는 스크롤 위치다.
  const bounds = tops.map((el) =>
    Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY) / max))
  );
  bounds.push(1);
  // 단조 증가를 보장한다. pin 재계산 도중 역전이 들어오면 보간이 깨진다.
  for (let i = 1; i < bounds.length; i += 1) {
    if (bounds[i] < bounds[i - 1]) bounds[i] = bounds[i - 1];
  }
  return bounds;
}

/** 경계 진행률을 마디 높이 비율로 바꾼다. */
function boundsToSpans(bounds) {
  const spans = [];
  for (let i = 0; i < UNITS; i += 1) spans.push(Math.max(0.01, bounds[i + 1] - bounds[i]));
  const total = spans.reduce((a, v) => a + v, 0);
  return spans.map((v) => v / total);
}

/**
 * 마디 경계가 path 길이의 어디에 있는지 잰다.
 * 진폭에 상한이 있어 마디 길이가 높이에 정확히 비례하지 않는다(긴 마디에서 3.6퍼센트 어긋남 실측).
 * 그래서 기하에 맡기지 않고 경계 지점의 실제 길이를 찾아 앵커로 쓴다.
 */
function measureLengthAnchors(path, bounds) {
  const total = path.getTotalLength();
  if (!total) return null;

  const lengthAtY = (targetY) => {
    let lo = 0;
    let hi = total;
    for (let i = 0; i < 32; i += 1) {
      const mid = (lo + hi) / 2;
      if (path.getPointAtLength(mid).y < targetY) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2 / total;
  };

  return bounds.map((b, i) => {
    if (i === 0) return 0;
    if (i === bounds.length - 1) return 1;
    return lengthAtY(b * VB_H);
  });
}

/** 스크롤 진행률을 그려질 길이 비율로 옮긴다. 산술만 한다. 레이아웃을 읽지 않는다. */
function mapProgress(p, bounds, anchors) {
  if (!bounds || !anchors) return p;
  for (let i = 1; i < bounds.length; i += 1) {
    if (p <= bounds[i]) {
      const span = bounds[i] - bounds[i - 1];
      const t = span <= 0 ? 1 : (p - bounds[i - 1]) / span;
      return anchors[i - 1] + (anchors[i] - anchors[i - 1]) * t;
    }
  }
  return 1;
}

// 콘텐츠 컬럼 왼쪽에 붙는 띠. 뷰포트가 maxWide보다 좁으면 좌측 거터 안에서만 그린다.
const SIDE_SPACE = `calc((100vw - ${spacing.maxWide}) / 2)`;
const BAND_W = `min(72px, max(${spacing.gutter}, ${SIDE_SPACE}))`;
const BAND_LEFT = `max(0px, calc(${SIDE_SPACE} - 72px))`;

export default function ScrollTrail() {
  const pathRef = useRef(null);
  const [bounds, setBounds] = useState(null);
  const anchorsRef = useRef(null);
  const boundsRef = useRef(null);
  const spans = useMemo(() => (bounds ? boundsToSpans(bounds) : EVEN_SPANS), [bounds]);
  const pathD = useMemo(() => buildPath(spans), [spans]);

  // 섹션 높이는 pin과 폰트 로드로 바뀐다. refresh 때마다 경계를 다시 잰다.
  useEffect(() => {
    const remeasure = () => {
      const b = measureBounds();
      if (b) setBounds(b);
    };
    ScrollTrigger.addEventListener('refresh', remeasure);
    remeasure();
    return () => ScrollTrigger.removeEventListener('refresh', remeasure);
  }, []);

  // path가 새 경계로 다시 그려진 뒤에 길이 앵커를 잡는다.
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !bounds) return;
    boundsRef.current = bounds;
    anchorsRef.current = measureLengthAnchors(path, bounds);
  }, [bounds, pathD]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return undefined;

    if (isReduced()) {
      // 그려지는 연출 없이 완성된 정적 상태로 둔다.
      gsap.set(path, { strokeDashoffset: 0 });
      return undefined;
    }

    gsap.set(path, { strokeDashoffset: PATH_LENGTH });
    // 프록시를 스크럽하고 그 값을 앵커 테이블로 옮긴다.
    // onUpdate는 산술만 한다. 레이아웃을 읽지 않으므로 스래싱이 없다.
    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        // 스크럽이 스크롤과 그리기 사이의 지연을 만든다. 1 내외가 손에 붙는다.
        scrub: 1,
        // interactions의 pin이 문서 높이를 늘린다. 그보다 늦게 재계산해야 끝 지점이 맞는다.
        // 우선순위를 낮춰 두지 않으면 pin 이전 높이로 굳어 67퍼센트에서 완주한다(실측).
        refreshPriority: -1,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        const frac = mapProgress(proxy.p, boundsRef.current, anchorsRef.current);
        path.style.strokeDashoffset = String(PATH_LENGTH * (1 - frac));
      },
    });

    ScrollTrigger.refresh();
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      style={{
        position: 'fixed',
        top: 0,
        left: BAND_LEFT,
        width: BAND_W,
        height: '100dvh',
        // 콘텐츠 위, 레일 아래. 본문을 덮지 않는 것은 배치가 보장한다
        zIndex: zIndex.content + 1,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id="scroll-trail-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.steel.hi} stopOpacity="0.35" />
          <stop offset="18%" stopColor={colors.steel.mid} stopOpacity="0.75" />
          {/* demo 섹션 근접 구간에서 레드로 물든다. 급하지 않게 두 스톱에 걸쳐 넘긴다 */}
          <stop offset="76%" stopColor={colors.steel.mid} stopOpacity="0.75" />
          <stop offset="90%" stopColor={colors.red.light} stopOpacity="0.85" />
          <stop offset="100%" stopColor={colors.red.light} stopOpacity="1" />
        </linearGradient>
      </defs>

      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="url(#scroll-trail-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={PATH_LENGTH}
        strokeDasharray={PATH_LENGTH}
        strokeDashoffset={PATH_LENGTH}
        // 4K에서 선 두께가 커지거나 흐려지지 않게 한다
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
