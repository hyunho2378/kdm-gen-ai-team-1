// presentation-v2 조작 셸. GSAP Observer(휠/터치) + 키보드(방향키/스페이스) → Lenis scrollTo로
// 한 입력에 한 섹션씩 1초 이징 이동. 이동 중 입력을 잠근다. 우하단에 현재/전체 표시.
// 지금은 색만 다른 빈 풀스크린 8섹션. 내용은 S1부터 하나씩 채운다.

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import Lenis from 'lenis';
import { colors } from './tokens.js';
import S1Cover from './sections/S1Cover.jsx';
import S2Background from './sections/S2Background.jsx';
import S3Trajectory from './sections/S3Trajectory.jsx';
import S4Concept from './sections/S4Concept.jsx';
import S5Interactions from './sections/S5Interactions.jsx';

gsap.registerPlugin(Observer);

// 8섹션. 바탕은 전부 브랜드 블랙(네이비 금지). 아직 안 채운 섹션은 번호로 구분한다.
const SECTIONS = [
  { id: 's1', label: '표지', en: 'COVER' },
  { id: 's2', label: '배경', en: 'BACKGROUND' },
  { id: 's3', label: '인사이트', en: 'INSIGHT' },
  { id: 's4', label: '컨셉', en: 'CONCEPT' },
  { id: 's5', label: '인터랙션', en: 'INTERACTIONS' },
  { id: 's6', label: 'AI 워크플로우', en: 'AI WORKFLOW' },
  { id: 's7', label: '산출물', en: 'OUTPUTS' },
  { id: 's8', label: '데모', en: 'DEMO' },
];

// easeInOutCubic. 1초 섹션 이동에 붙는다.
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function App() {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);
  const lenisRef = useRef(null);
  // S2가 방향키를 서브 진행(프레임 스크럽)으로 소비할 수 있게 위임 핸들러를 잡아 둔다.
  const s2HandlerRef = useRef(null);
  const s2EnterRef = useRef(null);
  const s5HandlerRef = useRef(null);
  const s5EnterRef = useRef(null);

  const registerS2Handler = useCallback((fn) => { s2HandlerRef.current = fn; }, []);
  const registerS2Enter = useCallback((fn) => { s2EnterRef.current = fn; }, []);
  const registerS5Handler = useCallback((fn) => { s5HandlerRef.current = fn; }, []);
  const registerS5Enter = useCallback((fn) => { s5EnterRef.current = fn; }, []);

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
      // S2에 머무는 동안 방향키는 프레임 스크럽을 소비한다. 경계(처음/끝)에서만 아래로 떨어져 섹션이 바뀐다.
      if (currentRef.current === 1 && s2HandlerRef.current && s2HandlerRef.current(dir)) return;
      // S5(인터랙션 4종)도 같은 구조: 판1~4를 방향키로 넘기고 판4 끝에서만 섹션이 바뀐다.
      if (currentRef.current === 4 && s5HandlerRef.current && s5HandlerRef.current(dir)) return;
      const next = currentRef.current + dir;
      if (next < 0 || next >= SECTIONS.length) return; // 경계에서 멈춘다(순환 없음)
      animatingRef.current = true;
      currentRef.current = next;
      setCurrent(next);
      // S2로 진입하면 방향에 맞는 프레임 경계에서 시작하도록 알린다(위→처음, 아래→끝)
      if (next === 1) s2EnterRef.current?.(dir);
      if (next === 4) s5EnterRef.current?.(dir);
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
            aria-label={`${i + 1} ${s.label}`}
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
              <S2Background registerHandler={registerS2Handler} registerEnter={registerS2Enter} />
            ) : i === 2 ? (
              <S3Trajectory active={current === 2} />
            ) : i === 3 ? (
              <S4Concept active={current === 3} />
            ) : i === 4 ? (
              <S5Interactions
                active={current === 4}
                registerHandler={registerS5Handler}
                registerEnter={registerS5Enter}
              />
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
                  {s.label}
                </span>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    letterSpacing: '0.24em',
                    color: 'rgba(242,246,255,0.3)',
                  }}
                >
                  {s.en} · 플레이스홀더
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

      {/* 첫 화면 조작 힌트. S1을 채우면 이 힌트도 교체한다. */}
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
        ↑ ↓ · SPACE · SCROLL
      </div>
    </>
  );
}
