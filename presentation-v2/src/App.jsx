// presentation-v2 조작 셸. GSAP Observer(휠/터치) + 키보드(방향키/스페이스) → Lenis scrollTo로
// 한 입력에 한 섹션씩 1초 이징 이동. 이동 중 입력을 잠근다. 우하단에 현재/전체 표시.
// 지금은 색만 다른 빈 풀스크린 8섹션. 내용은 S1부터 하나씩 채운다.

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import Lenis from 'lenis';
import { colors } from './tokens.js';
import { SECTION_LABELS, PLACEHOLDER_SUFFIX, COVER_HINT } from './copy.js';
import S1Cover from './sections/S1Cover.jsx';
import S2Why from './sections/S2Why.jsx';
import S3Concept from './sections/S3Concept.jsx';
import S4Experience from './sections/S4Experience.jsx';
import S5Duelist from './sections/S5Duelist.jsx';
// 보존: sections/S2Background.jsx(프레임 스크럽), S3Trajectory.jsx(궤적 리본), S4Concept.jsx(리퀴드 글래스).
// 발표 덱 골격 이식으로 이번 배치에서는 쓰지 않는다. 파일은 뒤 섹션 재사용 예정이라 지우지 않는다.

gsap.registerPlugin(Observer);

// 8섹션. 발표 덱 시안 골격. 바탕은 전부 브랜드 블랙. 문구는 copy.js가 단일 원천이다.
const SECTIONS = SECTION_LABELS;

// easeInOutCubic. 1초 섹션 이동에 붙는다.
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function App() {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);
  const lenisRef = useRef(null);
  // 서브 진행 위임. 섹션이 방향키를 자기 단계로 소비할 수 있게 인덱스별 핸들러를 잡아 둔다.
  // 지금 위임하는 섹션은 셋. 1 문제(2단계) / 3 인터랙션(4단계) / 4 유파(3단계).
  const subHandlers = useRef({});
  const subEnters = useRef({});

  // 인덱스별 register 함수는 렌더마다 새로 만들면 자식 useEffect가 매번 다시 돈다. 한 번만 만든다.
  const reg = useMemo(() => {
    const mk = (i) => ({
      handler: (fn) => { subHandlers.current[i] = fn; },
      enter: (fn) => { subEnters.current[i] = fn; },
    });
    return { 1: mk(1), 3: mk(3), 4: mk(4) };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lenis는 scrollTo 애니메이션 전용. smoothWheel을 꺼 자유 휠 스크롤을 잡지 않는다(입력은 Observer가 잡음).
    const lenis = new Lenis({ smoothWheel: false, smoothTouch: false });
    lenisRef.current = lenis;
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    let unlockTimer = null;
    const go = (dir) => {
      if (animatingRef.current) return;
      // 위임 섹션에 머무는 동안 방향키는 그 섹션의 서브 단계를 소비한다.
      // 경계(처음/끝)에서만 핸들러가 false를 돌려 섹션이 바뀐다.
      const sub = subHandlers.current[currentRef.current];
      if (sub && sub(dir)) return;
      const next = currentRef.current + dir;
      if (next < 0 || next >= SECTIONS.length) return; // 경계에서 멈춘다(순환 없음)
      animatingRef.current = true;
      currentRef.current = next;
      setCurrent(next);
      // 위임 섹션으로 진입하면 방향에 맞는 경계 단계에서 시작하도록 알린다(아래→처음, 위→끝)
      subEnters.current[next]?.(dir);
      const target = document.getElementById(SECTIONS[next].id);
      const unlock = () => {
        animatingRef.current = false;
      };
      lenis.scrollTo(target, {
        duration: reduced ? 0 : 1,
        easing: easeInOut,
        lock: true, // 이동 중 사용자 스크롤 잠금
        force: true,
        onComplete: unlock,
      });
      // 안전망: onComplete가 어떤 이유로 안 오면 화면이 영구 잠긴다. 시간 상한으로 반드시 푼다.
      clearTimeout(unlockTimer);
      unlockTimer = setTimeout(unlock, (reduced ? 0 : 1) * 1000 + 200);
    };

    // 휠/터치: Observer가 잡고 네이티브 스크롤을 막는다. debounce 기본값이라 한 제스처=한 섹션.
    const observer = Observer.create({
      type: 'wheel,touch',
      tolerance: 10,
      preventDefault: true,
      onDown: () => go(1), // 아래로(휠 다운/콘텐츠 위로) → 다음
      onUp: () => go(-1), // 위로 → 이전
    });

    // 키보드: Observer가 키를 안 잡으므로 별도 처리. 네이티브 스크롤을 막는다.
    const onKey = (e) => {
      const k = e.key;
      if (k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Spacebar') {
        e.preventDefault();
        go(1);
      } else if (k === 'ArrowUp' || k === 'PageUp') {
        e.preventDefault();
        go(-1);
      } else if (k === 'Home') {
        e.preventDefault();
        go(-currentRef.current);
      } else if (k === 'End') {
        e.preventDefault();
        go(SECTIONS.length - 1 - currentRef.current);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(unlockTimer);
      observer.kill();
      window.removeEventListener('keydown', onKey);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <main>
        {SECTIONS.map((s, i) => (
          <section
            id={s.id}
            key={s.id}
            aria-label={`${i + 1} ${s.ko}`}
            style={{
              position: 'relative',
              height: '100dvh',
              overflow: 'hidden',
              background: colors.black,
            }}
          >
            {i === 0 ? (
              <S1Cover />
            ) : i === 1 ? (
              <S2Why registerHandler={reg[1].handler} registerEnter={reg[1].enter} />
            ) : i === 2 ? (
              <S3Concept active={current === 2} />
            ) : i === 3 ? (
              <S4Experience registerHandler={reg[3].handler} registerEnter={reg[3].enter} />
            ) : i === 4 ? (
              <S5Duelist registerHandler={reg[4].handler} registerEnter={reg[4].enter} />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  // 아직 채우지 않은 섹션임을 드러내는 은은한 경계
                  boxShadow: 'inset 0 0 0 1px rgba(242,246,255,0.04)',
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(4rem, 18vh, 12rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: 'rgba(242,246,255,0.14)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    color: 'rgba(242,246,255,0.7)',
                  }}
                >
                  {s.ko}
                </span>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    letterSpacing: '0.24em',
                    color: 'rgba(242,246,255,0.3)',
                  }}
                >
                  {`${s.en}  ${PLACEHOLDER_SUFFIX}`}
                </span>
              </div>
            )}
          </section>
        ))}
      </main>

      {/* 진행 표시. 우하단, 얇게. */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          right: 'clamp(16px, 3vw, 40px)',
          bottom: 'max(16px, env(safe-area-inset-bottom))',
          zIndex: 100,
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.8125rem',
          letterSpacing: '0.14em',
          color: 'rgba(242,246,255,0.55)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
        }}
      >
        <span style={{ color: 'rgba(242,246,255,0.92)', fontWeight: 600 }}>
          {String(current + 1).padStart(2, '0')}
        </span>
        <span style={{ opacity: 0.5 }}>/ {String(SECTIONS.length).padStart(2, '0')}</span>
      </div>

      {/* 첫 화면 조작 힌트. */}
      <div
        style={{
          position: 'fixed',
          left: 'clamp(16px, 3vw, 40px)',
          bottom: 'max(16px, env(safe-area-inset-bottom))',
          zIndex: 100,
          fontSize: '0.75rem',
          letterSpacing: '0.16em',
          color: 'rgba(242,246,255,0.35)',
          pointerEvents: 'none',
          opacity: current === 0 ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      >
        {COVER_HINT}
      </div>
    </>
  );
}
