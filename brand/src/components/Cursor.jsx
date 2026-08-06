// 날카로운 화이트 커서 (REBOOT_PLAN 2.4). DOM 두 겹 + GSAP, transform만 건드린다.
//
// **react-creative-cursor(MIT)를 실설치해 판정하고 미채택했다.** 사유는 LIBRARIES 판정표에 있다.
// 요약하면 그 구현은 대상 요소를 마운트 시점에 `querySelectorAll`로 한 번만 모은다.
// 우리는 라우터 SPA라 페이지 내용이 항상 커서보다 나중에 마운트되고, 그래서 호버가
// 어느 요소에도 안 걸린다(실측: 마운트 뒤에 태그를 단 요소는 6회 이동 후에도 리스너 0).
// 클릭 수축도 그 라이브러리에는 아예 없다(mousedown 처리 없음, 실측으로 12px 고정).
//
// 그래서 여기서는 **이벤트 위임**을 쓴다. document 하나에만 리스너를 걸고 매 이벤트마다
// `closest`로 판단하므로 나중에 생긴 요소도 그대로 걸린다. 리스너가 자라지 않는다.
//
// ── 폴백 ────────────────────────────────────────────────────────────────────
// 터치 기기와 모션 감소 요청에서는 **아예 렌더하지 않는다.** 기본 커서가 그대로 산다.
// 커서는 pointer-events가 없고 포커스를 만지지 않으므로 키보드 사용자에게 영향이 없다.

import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/motion.js';

/** 인터랙티브로 볼 대상. 이 목록에 걸리면 커서가 커진다. */
const HOT = 'a, button, [role="tab"], [role="option"], input, textarea, select, summary, [data-cursor]';

const DOT = 8;      // 기본 점 지름
const RING = 40;    // 호버 시 링 지름
const PRESS = 0.7;  // 클릭 순간 수축 배율

/** 따라오는 시정수. 점은 즉시, 링은 조금 늦게 와서 방향이 읽힌다. */
const DOT_SEC = 0.08;
const RING_SEC = 0.24;

/** 터치 기기이거나 모션을 줄여 달라고 했으면 커스텀 커서를 띄우지 않는다. */
function shouldDisable() {
  if (typeof window === 'undefined') return true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return coarse || noHover || reduced;
}

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  // 렌더 자체를 막는다. 숨기는 것이 아니라 DOM에 없어야 한다
  const [off, setOff] = useState(true);

  useEffect(() => {
    const check = () => setOff(shouldDisable());
    check();
    // 마우스를 나중에 꽂는 경우가 있다. 조건이 바뀌면 그때 켜진다
    const mqs = ['(pointer: coarse)', '(hover: none)', '(prefers-reduced-motion: reduce)'].map((q) =>
      window.matchMedia(q)
    );
    for (const mq of mqs) mq.addEventListener('change', check);
    return () => {
      for (const mq of mqs) mq.removeEventListener('change', check);
    };
  }, []);

  useEffect(() => {
    if (off) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    // quickTo는 트윈을 매번 새로 만들지 않는다. 60Hz로 좌표가 들어오는 경로라 이게 맞다
    const dx = gsap.quickTo(dot, 'x', { duration: DOT_SEC, ease: 'power3.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: DOT_SEC, ease: 'power3.out' });
    const rx = gsap.quickTo(ring, 'x', { duration: RING_SEC, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: RING_SEC, ease: 'power3.out' });

    let hot = false;
    let pressed = false;

    /** 링 크기는 호버가, 수축은 클릭이 정한다. 둘을 한 곳에서 합쳐 서로 덮어쓰지 않게 한다. */
    function applyScale() {
      const base = hot ? 1 : DOT / RING;
      gsap.to(ring, {
        scale: base * (pressed ? PRESS : 1),
        duration: 0.22,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      gsap.to(dot, {
        opacity: hot ? 0 : 1,
        duration: 0.18,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }

    function onMove(e) {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    }

    // **위임이라 나중에 생긴 요소도 그대로 걸린다.** 라우트가 바뀌어도 다시 붙일 것이 없다
    function onOver(e) {
      const next = !!(e.target instanceof Element && e.target.closest(HOT));
      if (next === hot) return;
      hot = next;
      applyScale();
    }

    function onDown() {
      pressed = true;
      applyScale();
    }
    function onUp() {
      pressed = false;
      applyScale();
    }

    // 창 밖으로 나가면 숨긴다. 안 그러면 마지막 자리에 점이 남는다
    const onLeave = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.15, overwrite: 'auto' });
    const onEnter = () => {
      gsap.to(ring, { autoAlpha: 1, duration: 0.15, overwrite: 'auto' });
      gsap.to(dot, { autoAlpha: hot ? 0 : 1, duration: 0.15, overwrite: 'auto' });
    };

    gsap.set(ring, { scale: DOT / RING, xPercent: -50, yPercent: -50 });
    gsap.set(dot, { xPercent: -50, yPercent: -50 });

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);
    // 기본 커서는 커스텀이 실제로 떠 있는 동안에만 감춘다
    document.documentElement.setAttribute('data-cursor-on', 'true');

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
      document.documentElement.removeAttribute('data-cursor-on');
    };
  }, [off]);

  if (off) return null;

  return (
    <>
      <div ref={ringRef} className="vx-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="vx-cursor-dot" aria-hidden="true" />
    </>
  );
}
