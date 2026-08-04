// S2 배경(문제 제기). 3겹.
// 레이어1(주인공, 풀블리드): 펜싱 선수 프레임 시퀀스를 canvas에 그린다. 방향키를 누르면(이 섹션 서브 진행)
//   프레임이 스크럽되어 선수가 자세를 바꾸며 다가온다. 자동재생 아님 — 입력에 묶인다.
//   화면 비율에 따라 landscape/portrait를 manifest 기준 자동 선택.
// 레이어2: 블랙 오버레이 + 미세한 레드 비네트 + 필름 그레인. 선수가 순수한 어둠에서 떠오른다(네이비 금지).
// 레이어3: 명사 3개(보이지 않는 감각 · 거리 · 타이밍)가 진행에 맞춰 하나씩 좌하단에. 레드 악센트 한 줄.
//
// 셸 위임: 이 섹션이 현재일 때 방향키는 프레임 스크럽을 소비하고, 경계(처음/끝)에서만 섹션이 바뀐다.
// 스크럽은 락을 걸지 않는다 — 연속 입력이 즉시 스텝을 올려(overwrite 트윈) 방향키 6~7번이면 끝까지 간다.
// canvas-scroll-clip은 window 스크롤에 묶여 우리 셸과 충돌하므로 그 로직(프레임 인덱스=round(p*(count-1)))만 canvas 2D로 포팅했다.

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { colors } from '../tokens.js';

const STEPS = 6; // 방향키 6번이면 p 0→1(끝), 7번째에 S3로. 한 번당 프레임을 넉넉히 진행.
const NOUNS = ['보이지 않는 감각', '거리', '타이밍'];
const NOUN_AT = [0.05, 0.4, 0.72]; // 각 명사가 드러나는 진행 임계값

// 필름 그레인(SVG feTurbulence, data URI). 텍스처 오버레이일 뿐 히어로 비주얼이 아니다.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

const pickSet = () => (window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait');

export default function S2Background({ registerHandler, registerEnter }) {
  const canvasRef = useRef(null);
  const [nounLevel, setNounLevel] = useState(0);

  const imagesRef = useRef([]);
  const countRef = useRef(0);
  const curFrameRef = useRef(-1);
  const pRef = useRef({ v: 0 });
  const stepRef = useRef(0);
  const nounLevelRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let cancelled = false;
    let curSet = null;
    const pad4 = (n) => String(n).padStart(4, '0');

    function draw(frame) {
      const img = imagesRef.current[frame];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // cover fit
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      curFrameRef.current = frame;
    }

    function drawByP() {
      const c = countRef.current;
      if (!c) return;
      const frame = Math.round(pRef.current.v * (c - 1));
      if (frame !== curFrameRef.current) draw(frame);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      curFrameRef.current = -1;
      drawByP();
    }

    function updateNouns() {
      const p = pRef.current.v;
      let lvl = 0;
      for (let i = 0; i < NOUN_AT.length; i += 1) if (p >= NOUN_AT[i]) lvl = i + 1;
      if (lvl !== nounLevelRef.current) {
        nounLevelRef.current = lvl;
        setNounLevel(lvl);
      }
    }

    function loadSet(set) {
      curSet = set;
      return fetch(`/frames/${set}/manifest.json`)
        .then((r) => r.json())
        .then((m) => {
          if (cancelled || curSet !== set) return;
          countRef.current = m.count;
          const imgs = new Array(m.count);
          const srcOf = (i) => `/frames/${set}/` + m.pattern.replace('%04d', pad4(i + 1));
          const first = new Image();
          first.decoding = 'async';
          first.src = srcOf(0);
          imgs[0] = first;
          imagesRef.current = imgs;
          first.decode().catch(() => {}).finally(() => {
            if (cancelled || curSet !== set) return;
            resize();
            curFrameRef.current = -1;
            drawByP();
          });
          for (let i = 1; i < m.count; i += 1) {
            const im = new Image();
            im.decoding = 'async';
            im.src = srcOf(i);
            imgs[i] = im;
          }
        })
        .catch(() => {});
    }

    const ro = new ResizeObserver(() => {
      resize();
      const want = pickSet();
      if (want !== curSet) loadSet(want);
    });
    ro.observe(canvas);
    loadSet(pickSet());

    // --- 셸 위임 ---
    // 방향키를 소비하면 true(섹션 유지), 경계면 false(셸이 섹션 이동). 락 없음 — 연속 입력이 즉시 스텝을 올린다.
    const handleScrub = (dir) => {
      const nextStep = stepRef.current + dir;
      if (nextStep < 0 || nextStep > STEPS) return false; // 경계 → 셸이 S1/S3로 이동
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      stepRef.current = nextStep;
      gsap.to(pRef.current, {
        v: nextStep / STEPS,
        duration: reduced ? 0 : 0.45,
        ease: 'power2.out',
        overwrite: true, // 연속 입력 시 이전 트윈을 덮어써 매끄럽게 이어간다(락 대신)
        onUpdate: () => {
          drawByP();
          updateNouns();
        },
        onComplete: () => {
          drawByP();
          updateNouns();
        },
      });
      return true;
    };
    const handleEnter = (dir) => {
      gsap.killTweensOf(pRef.current); // 스크럽 중 벗어났다 돌아온 경우 남은 트윈이 p를 되돌리는 것을 막는다
      stepRef.current = dir > 0 ? 0 : STEPS;
      pRef.current.v = stepRef.current / STEPS;
      curFrameRef.current = -1;
      drawByP();
      updateNouns();
    };
    registerHandler(handleScrub);
    registerEnter(handleEnter);

    return () => {
      cancelled = true;
      ro.disconnect();
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 레이어1: 선수 프레임 시퀀스 */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* 레이어2: 블랙 오버레이(선수가 어둠에서 떠오르게) + 미세한 레드 비네트 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(10,10,11,0.5) 0%, rgba(5,5,6,0.66) 55%, rgba(5,5,6,0.86) 100%),' +
            'radial-gradient(ellipse at 50% 44%, transparent 0%, transparent 50%, rgba(179,18,44,0.05) 84%, rgba(179,18,44,0.11) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: GRAIN,
          opacity: 0.06,
          mixBlendMode: 'overlay',
        }}
      />

      {/* 레이어3: 명사 3개, 좌하단, 진행에 맞춰 하나씩. 왼쪽에 레드 악센트 한 줄. */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(20px, 5vw, 72px)',
          bottom: 'clamp(64px, 12vh, 140px)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(4px, 1vh, 12px)',
          paddingLeft: 'clamp(14px, 1.6vw, 22px)',
          pointerEvents: 'none',
          textShadow: '0 2px 30px rgba(5,5,6,0.7)',
        }}
      >
        {/* 레드 악센트: 브랜드 레드 한 점(명사 강조). 진행이 시작되면 나타난다. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '6%',
            bottom: '6%',
            width: 2,
            background: colors.red,
            boxShadow: `0 0 12px ${colors.redGlow}`,
            opacity: nounLevel > 0 ? 0.95 : 0,
            transform: nounLevel > 0 ? 'scaleY(1)' : 'scaleY(0.4)',
            transformOrigin: 'bottom',
            transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.23,1,0.32,1)',
          }}
        />
        {NOUNS.map((n, i) => (
          <span
            key={n}
            style={{
              fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
              fontSize: i === 0 ? 'clamp(1.6rem, 4.5vw, 3.2rem)' : 'clamp(1.1rem, 2.6vw, 1.9rem)',
              fontWeight: i === 0 ? 700 : 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: i === 0 ? colors.text.primary : colors.text.secondary,
              opacity: nounLevel > i ? 1 : 0,
              transform: nounLevel > i ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.23,1,0.32,1)',
            }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
