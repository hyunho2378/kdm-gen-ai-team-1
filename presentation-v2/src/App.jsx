// presentation-v2 조작 셸. GSAP Observer(휠/터치) + 키보드(방향키/스페이스) → Lenis scrollTo로
// 한 입력에 한 섹션씩 1초 이징 이동. 이동 중 입력을 잠근다. 우하단에 현재/전체 표시.
// 지금은 색만 다른 빈 풀스크린 8섹션. 내용은 S1부터 하나씩 채운다.

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import Lenis from 'lenis';
import { colors, grid } from './tokens.js';
import { SECTION_LABELS } from './copy.js';
import { SlideHeader } from './components/Bits.jsx';
import S1Cover from './sections/S1Cover.jsx';
import SPrologue from './sections/SPrologue.jsx';
import SPainPoint from './sections/SPainPoint.jsx';
import S2Why from './sections/S2Why.jsx';
import S3Target from './sections/S3Target.jsx';
import S4Keyword from './sections/S4Keyword.jsx';
import S5Naming from './sections/S5Naming.jsx';
import S6ColorSystem from './sections/S6ColorSystem.jsx';
import S3Concept from './sections/S3Concept.jsx';
import S4Experience from './sections/S4Experience.jsx';
import S5Duelist from './sections/S5Duelist.jsx';
import S7Demo from './sections/S7Demo.jsx';
// 보존: sections/S2Background.jsx(프레임 스크럽), S3Trajectory.jsx(궤적 리본), S4Concept.jsx(리퀴드 글래스).
// 발표 덱 골격 이식으로 이번 배치에서는 쓰지 않는다. 파일은 뒤 섹션 재사용 예정이라 지우지 않는다.

gsap.registerPlugin(Observer);

// 섹션 목록. 발표 덱 시안 골격. 바탕은 전부 브랜드 블랙. 문구는 copy.js가 단일 원천이다.
const SECTIONS = SECTION_LABELS;

// 서브 진행을 위임하는 섹션의 id.
// **인덱스를 어디에도 쓰지 않는다.** 등록도 조회도 전부 id로 한다.
// 예전에는 인덱스로 조회했는데 앞에 섹션을 끼울 때마다 위임이 엉뚱한 섹션에 붙었다.
// 이제 표지 뒤에 두 장을 더 넣어도 아래 두 줄과 각 섹션 코드가 그대로 산다.
const DELEGATE_IDS = ['why', 'keyword', 'duelist'];

// easeInOutCubic. 1초 섹션 이동에 붙는다.
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function App() {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);
  const lenisRef = useRef(null);
  // 서브 진행 위임. 섹션이 방향키를 자기 단계로 소비할 수 있게 **id별로** 핸들러를 잡아 둔다.
  // 지금 위임하는 섹션은 둘. 문제(2단계) / 유파(6단계).
  const subHandlers = useRef({});
  const subEnters = useRef({});

  // id별 register 함수는 렌더마다 새로 만들면 자식 useEffect가 매번 다시 돈다. 한 번만 만든다.
  const reg = useMemo(() => {
    const map = {};
    DELEGATE_IDS.forEach((id) => {
      map[id] = {
        handler: (fn) => { subHandlers.current[id] = fn; },
        enter: (fn) => { subEnters.current[id] = fn; },
      };
    });
    return map;
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 새로고침은 항상 첫 섹션에서 시작한다. 브라우저 스크롤 복원을 끄고 맨 위로 보낸다.
    // (섹션 인덱스는 메모리 state뿐이라 이미 0으로 리셋되지만, 스크롤 위치는 브라우저가 복원할 수 있다.)
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

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
      // 경계(처음/끝)에서만 핸들러가 false를 돌려 섹션이 바뀐다. **조회는 현재 섹션 id로 한다.**
      const sub = subHandlers.current[SECTIONS[currentRef.current].id];
      if (sub && sub(dir)) return;
      const next = currentRef.current + dir;
      if (next < 0 || next >= SECTIONS.length) return; // 경계에서 멈춘다(순환 없음)
      animatingRef.current = true;
      currentRef.current = next;
      setCurrent(next);
      // 위임 섹션으로 진입하면 방향에 맞는 경계 단계에서 시작하도록 알린다(아래→처음, 위→끝)
      subEnters.current[SECTIONS[next].id]?.(dir);
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
              background: colors.bg,
            }}
          >
            {/* **인덱스가 아니라 id로 고른다.** 섹션을 끼워 넣어도 짝이 어긋나지 않는다. */}
            {s.id === 'cover' ? (
              <S1Cover active={current === i} />
            ) : s.id === 'prologue' ? (
              <SPrologue active={current === i} />
            ) : s.id === 'painpoint' ? (
              <SPainPoint active={current === i} />
            ) : s.id === 'why' ? (
              <S2Why registerHandler={reg[s.id].handler} registerEnter={reg[s.id].enter} />
            ) : s.id === 'target' ? (
              <S3Target active={current === i} />
            ) : s.id === 'keyword' ? (
              // 위임 섹션이지만 진입 연출 트리거로 active도 함께 받는다.
              <S4Keyword
                active={current === i}
                registerHandler={reg[s.id].handler}
                registerEnter={reg[s.id].enter}
              />
            ) : s.id === 'naming' ? (
              <S5Naming active={current === i} />
            ) : s.id === 'color' ? (
              <S6ColorSystem active={current === i} />
            ) : s.id === 'concept' ? (
              <S3Concept active={current === i} />
            ) : s.id === 'experience' ? (
              <S4Experience active={current === i} />
            ) : s.id === 'duelist' ? (
              <S5Duelist registerHandler={reg[s.id].handler} registerEnter={reg[s.id].enter} />
            ) : s.id === 'demo' ? (
              <S7Demo active={current === i} />
            ) : (
              // 아직 안 채운 섹션(워크플로우, 산출물). 공용 2단 헤더 틀에 맞춰 아이브로우 좌상단 +
              // 우측 열에 옅은 "콘텐츠 확정 예정"만. 채워지면 전용 섹션 컴포넌트로 교체한다.
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: `${grid.marginTop} ${grid.marginX} ${grid.marginBottom}`,
                  boxShadow: `inset 0 0 0 1px ${colors.line.hairline}`,
                }}
              >
                <SlideHeader
                  eyebrow={{ en: s.en, ko: s.ko }}
                  headline="콘텐츠 확정 예정"
                  headlineColor={colors.text.faint}
                />
              </div>
            )}
          </section>
        ))}
      </main>
    </>
  );
}
