// 프리로더와 VORTEX 슬라이스 스플래시 (BRAND_REBOOT_PLAN 1.1, 2.5). 앱 최초 로드에 한 번.
//
// **히어로 코드를 고치지 않고 인계한다.** 여기서 `[data-enter="wordmark"]`의 실제 상자를 읽어
// 스플래시를 그 자리로 옮겨 겹친 뒤 크로스페이드한다. 히어로는 이 오버레이의 존재를 모른다.
// 그래서 워드마크가 둘 다 또렷하게 보이는 순간이 없다. 하나가 그 자리에서 다른 하나가 된다.
//
// ── 진행률은 진짜다 ─────────────────────────────────────────────────────────
// 가짜 타이머가 아니라 실제 로드 넷을 센다(폰트, 워드마크 SVG, 본문 마운트, window load).
// 에셋이 가벼워 순식간이면 최소 1.2초 동안 읽히게 늘리되 그 이상 인위로 끌지 않는다.
// **상한 5초.** 어떤 로드가 실패해도(WebGL 차단 포함) 프리로더가 영원히 걸려 있으면 안 된다.
//
// ── StrictMode ──────────────────────────────────────────────────────────────
// 이중 마운트에서 두 번 재생되거나 멈추면 안 된다. `gsap.context` + `revert()`로 정리하고
// **재생이 끝난 시점에만 모듈 플래그를 세운다.** 효과 시작에 세우면 StrictMode의 버리는
// 첫 마운트가 플래그를 먹어 진짜 마운트에서 스플래시가 통째로 사라진다(Landing의 선례와 같은 함정).

import { useEffect, useRef, useState } from 'react';
import { gsap, isReduced } from '../lib/motion.js';

const WORDMARK_URL = '/brand/vortex-wordmark.svg';

/** 세로 슬라이스 조각 수. 2.5절이 5에서 7을 허용한다. */
const SLICES = 6;

/**
 * 최소 표시 시간. 이보다 빨리 끝나면 카운터가 안 읽힌다.
 * **네비게이션 기준이다.** `performance.now()`가 곧 페이지가 시작된 뒤 흐른 시간이라
 * 그 값을 그대로 견준다. 효과가 언제 실행됐는지를 기준으로 재면 모듈 파싱 시간만큼
 * 앞당겨져서 사람이 보는 시간은 1.2초에 못 미친다(실측 979ms로 미달했다).
 */
const MIN_MS = 1200;
/** 모션 감소에서는 최소 표시를 걸지 않는다. **총 1초 미만**이 사양이라 기다림 자체가 위반이다. */
const MIN_MS_REDUCED = 0;
/** 상한. 넘으면 무조건 완료 처리하고 진입한다. */
const CAP_MS = 5000;

/** 세는 로드의 개수. 폰트, 워드마크, 본문 마운트, window load. */
const TOTAL = 4;

/** 스플래시가 히어로 자리로 날아가는 시간(초). 판이 걷히는 시점도 이 값에 묶인다. */
const MOVE_SEC = 0.7;

/** 앱 마운트당 1회. **재생이 끝난 시점에만 세운다.** localStorage를 쓰지 않는다(절대 규칙). */
let played = false;

/** App이 Lenis를 세울지 판단할 때 읽는다. 스플래시가 뜨는 로드에서만 스크롤을 잠근다. */
export function splashPlayed() {
  return played;
}

/** 자리당 숫자 목록. 끝에 0을 하나 더 두어 9에서 0으로 굴러갈 때 뒤로 튀지 않는다. */
const ROLL = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const HUND = ['0', '1'];

export default function Preloader({ onDone }) {
  // 첫 렌더에 한 번만 정한다. 라우트가 바뀌어도 App은 리마운트되지 않으므로 여기서 끝난다
  const [show, setShow] = useState(() => !played);
  const rootRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!show) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    let cancelled = false;
    let finished = false;
    let capTimer = 0;
    let doneCount = 0;
    const teardown = [];
    const reduced = isReduced();
    /** 이 시점 이전에는 끝내지 않는다. 모션 감소에서는 바닥이 0이라 곧바로 넘어간다 */
    const notBefore = reduced ? MIN_MS_REDUCED : MIN_MS;

    const q = (sel) => root.querySelector(sel);
    const rollH = q('[data-roll="h"]');
    const rollT = q('[data-roll="t"]');
    const rollO = q('[data-roll="o"]');
    const bar = q('[data-pre="bar"]');
    const counter = q('[data-pre="counter"]');
    const track = q('[data-pre="track"]');
    const stage = q('[data-pre="stage"]');
    const sliceEls = [...root.querySelectorAll('[data-slice]')];

    const state = { v: 0 };

    /**
     * 카운터와 진행 획을 값 하나에서 그린다.
     * **자리마다 연속값을 쓴다.** 정수로 끊으면 자리가 바뀔 때 툭 튀는데,
     * 연속값이면 일의 자리가 빠르게 백의 자리가 느리게 굴러 오도미터로 읽힌다.
     * 열 끝에 0을 하나 더 둔 덕에 9에서 0으로 넘어가는 지점이 이어져 보인다.
     */
    function draw() {
      const v = Math.min(100, Math.max(0, state.v));
      const unit = 100 / ROLL.length;         // 한 칸이 스택 높이의 몇 퍼센트인가
      const unitH = 100 / HUND.length;
      if (rollH) gsap.set(rollH, { yPercent: -(v / 100) * unitH });
      if (rollT) gsap.set(rollT, { yPercent: -((v / 10) % 10) * unit });
      if (rollO) gsap.set(rollO, { yPercent: -(v % 10) * unit });
      if (bar) gsap.set(bar, { scaleX: v / 100 });
    }

    /** 목표까지 부드럽게 민다. 로드가 하나 끝날 때마다 다시 부른다. */
    function tweenTo(target, duration) {
      gsap.to(state, { v: target, duration, ease: 'power2.out', overwrite: true, onUpdate: draw });
    }

    function finish() {
      if (cancelled || finished) return;
      // **최소 표시를 여기서 한 번 더 지킨다.** 트윈의 이징이 끝값에 일찍 닿아도
      // 사람이 보는 시간은 이 문이 보장한다
      const wait = notBefore - performance.now();
      if (wait > 0) {
        gsap.delayedCall(wait / 1000, finish);
        return;
      }
      finished = true;
      clearTimeout(capTimer);
      playSplash();
    }

    function step() {
      if (cancelled || finished) return;
      doneCount = Math.min(TOTAL, doneCount + 1);
      const target = (doneCount / TOTAL) * 100;
      if (target < 100) {
        tweenTo(target, 0.4);
        return;
      }
      // **마지막 구간이 최소 표시 시간을 채운다.** 남은 만큼만 늘리고 그 이상 끌지 않는다.
      // **이징을 none으로 둔다.** power2.out은 끝값의 99.5퍼센트에 지속의 93퍼센트에서
      // 닿아 버려서 카운터가 100을 예정보다 일찍 보여 준다
      const remain = Math.max(0, notBefore - performance.now());
      const dur = reduced ? 0.01 : Math.max(0.35, remain / 1000);
      gsap.to(state, { v: 100, duration: dur, ease: 'none', overwrite: true, onUpdate: draw });
      gsap.delayedCall(dur, finish);
    }

    /** 상한. 무엇이 실패했든 여기서 끊고 들어간다. */
    function force() {
      if (cancelled || finished) return;
      doneCount = TOTAL;
      tweenTo(100, 0.3);
      gsap.delayedCall(0.3, finish);
    }

    /**
     * 히어로 워드마크의 **글리프 상자**. 없으면(랜딩이 아닌 경로) null이고 제자리에서 사라진다.
     *
     * **h1 상자를 그대로 쓰면 안 된다.** 그 상자는 line-height 여백을 위아래로 품고 있어
     * 실제 글자보다 크고 위로 밀려 있다. 그대로 착지시켰더니 스플래시가 히어로 워드마크보다
     * 25px쯤 위에 서서 **워드마크가 둘로 보였다**(실측 스크린샷).
     *
     * 우리 SVG는 viewBox가 글자에 딱 붙은 캡 상자다(0 0 570 108, 대문자만이라 디센더가 없다).
     * 그래서 히어로 쪽도 같은 기준의 상자를 구해야 한다. canvas TextMetrics의
     * `actualBoundingBox*`가 그 값을 준다. HeroWordmark가 마스크를 구울 때 쓰는 것과 같은 방법이다.
     */
    function heroGlyphBox() {
      const el = document.querySelector('[data-enter="wordmark"]');
      if (!el) return null;
      // 보이는 글자 스팬. 첫 aria-hidden 자식이고 sr-only는 clip으로 접혀 있어 섞이지 않는다
      const span = el.querySelector('span[aria-hidden="true"]');
      const node = span && span.firstChild;
      if (!span || !node) return null;

      // Range 상자는 line-height가 아니라 폰트 상자를 준다. 여기서 베이스라인을 잡는다
      const range = document.createRange();
      range.selectNodeContents(span);
      const box = range.getBoundingClientRect();
      if (!(box.width > 0)) return null;

      const cs = getComputedStyle(span);
      const ctx2d = document.createElement('canvas').getContext('2d');
      ctx2d.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx2d.measureText(span.textContent);
      const fontAsc = m.fontBoundingBoxAscent;
      const capAsc = m.actualBoundingBoxAscent;
      const capDesc = m.actualBoundingBoxDescent;
      const inkLeft = m.actualBoundingBoxLeft;
      const inkRight = m.actualBoundingBoxRight;
      if (!(capAsc > 0) || !(inkRight + inkLeft > 0)) return null;

      // 베이스라인은 Range 상자 위에서 폰트 어센트만큼 내려온 자리다
      const baseline = box.top + fontAsc;
      return {
        left: box.left - inkLeft,
        top: baseline - capAsc,
        width: inkLeft + inkRight,
        height: capAsc + capDesc,
      };
    }

    function playSplash() {
      const tl = gsap.timeline({
        onComplete: () => {
          if (cancelled) return;
          played = true;
          setShow(false);
          doneRef.current?.();
        },
      });

      // 프리로더 요소가 먼저 걷힌다
      tl.to([counter, track].filter(Boolean), {
        opacity: 0,
        duration: reduced ? 0.01 : 0.28,
        ease: 'power2.out',
      });

      if (reduced) {
        // 모션 감소. 시차도 이동도 없다. 정적 워드마크 한 박자 뒤 즉시 히어로.
        // 여기까지 오는 시간과 합쳐 총 1초 미만이어야 한다(실측으로 확인한다)
        tl.set(sliceEls, { opacity: 1, yPercent: 0 })
          .to(root, { opacity: 0, duration: 0.18, ease: 'none' }, '+=0.22');
        return;
      }

      // 슬라이스가 시차로 드러난다. transform과 opacity만 움직인다(clip-path는 정적으로 걸려 있다)
      tl.to(sliceEls, {
        opacity: 1,
        yPercent: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.07,
      });

      // 등장 완료 후 한 박자 정지
      tl.addLabel('hold', '+=0.32');

      // 히어로 워드마크 자리로 이동 축소. 도착 무렵에 글자가 사라진다
      tl.add(() => {
        if (!stage) return;
        const hero = heroGlyphBox();
        const now = stage.getBoundingClientRect();
        if (!hero || now.width === 0) {
          // 히어로가 없는 경로. 제자리에서 조용히 사라진다
          gsap.to(stage, { opacity: 0, duration: 0.45, ease: 'power2.inOut' });
          return;
        }
        // transformOrigin을 좌상단에 두어 계산값이 그대로 좌표가 된다
        gsap.set(stage, { transformOrigin: 'top left' });
        gsap.to(stage, {
          x: hero.left - now.left,
          y: hero.top - now.top,
          scale: hero.width / now.width,
          duration: MOVE_SEC,
          ease: 'power3.inOut',
        });
        // **도착한 뒤에 사라진다.** 이동 중에 판이 걷히면 아직 다른 자리에 있는 글자가
        // 히어로 워드마크와 나란히 보인다. 그래서 페이드를 도착 시점으로 미룬다
        gsap.to(stage, { opacity: 0, duration: 0.3, delay: MOVE_SEC - 0.02, ease: 'power2.in' });
      }, 'hold');

      // **검은 판도 스플래시가 도착한 뒤에 걷힌다.** 둘이 같은 자리에 겹친 상태에서
      // 함께 사라지므로 워드마크가 둘로 읽히는 프레임이 없다
      tl.to(root, { opacity: 0, duration: 0.42, ease: 'power2.inOut' }, `hold+=${MOVE_SEC}`);
    }

    const ctx = gsap.context(() => {
      gsap.set(sliceEls, { opacity: 0, yPercent: 12 });
      draw();

      // ── 실제 로드 넷을 센다 ────────────────────────────────────────────
      // 1. 폰트
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(step);
      else step();

      // 2. 워드마크 SVG. 스플래시가 이 그림을 쓰므로 뜨기 전에 받아 둔다
      const probe = new Image();
      probe.onload = step;
      probe.onerror = step;   // 실패해도 진행을 막지 않는다. 화면이 멈추는 것보다 낫다
      probe.src = WORDMARK_URL;

      // 3. 본문 마운트. 랜딩이면 히어로가, 다른 경로면 그 페이지가 선 시점이다
      if (document.querySelector('main')) step();
      else {
        const mo = new MutationObserver(() => {
          if (!document.querySelector('main')) return;
          mo.disconnect();
          step();
        });
        mo.observe(document.body, { childList: true, subtree: true });
        teardown.push(() => mo.disconnect());
      }

      // 4. window load
      if (document.readyState === 'complete') step();
      else {
        window.addEventListener('load', step, { once: true });
        teardown.push(() => window.removeEventListener('load', step));
      }

      capTimer = setTimeout(force, CAP_MS);
    }, root);

    return () => {
      cancelled = true;
      clearTimeout(capTimer);
      for (const fn of teardown) fn();
      // **revert가 인라인 스타일을 되돌린다.** StrictMode의 버리는 첫 마운트가 남긴 값이
      // 두 번째 실행의 출발 상태로 읽히는 사고를 막는다(Landing 선례)
      ctx.revert();
    };
  }, [show]);

  if (!show) return null;

  return (
    <div ref={rootRef} className="vx-pre" aria-hidden="true">
      {/* 좌하단 초대형 카운터. 화면 밖으로 살짝 잘리게 둔다(1.1절 실측 문법) */}
      <div className="vx-pre-counter" data-pre="counter">
        {[['h', HUND], ['t', ROLL], ['o', ROLL]].map(([k, list]) => (
          <span key={k} className="vx-pre-digit">
            <span className="vx-pre-roll" data-roll={k}>
              {list.map((n, i) => (
                <span key={`${k}-${i}`}>{n}</span>
              ))}
            </span>
          </span>
        ))}
      </div>

      {/* 중앙 진행 획. **기능 요소라 장식 선 금지의 대상이 아니다**(R1 규율).
          검끝 모티프의 가는 획이 좌에서 우로 차오른다 */}
      <div className="vx-pre-track" data-pre="track">
        <span className="vx-pre-bar" data-pre="bar" />
      </div>

      {/* 스플래시. 같은 SVG 사본 여섯 장을 겹치고 각자 자기 세로 밴드만 보이게 자른다.
          통짜 path라 글자별 분리가 불가능해서 나온 방식이다(2.5절) */}
      <div className="vx-pre-stage" data-pre="stage">
        {Array.from({ length: SLICES }, (_, i) => (
          <img
            key={i}
            data-slice={i}
            src={WORDMARK_URL}
            alt=""
            style={{
              clipPath: `inset(0 ${((SLICES - i - 1) / SLICES) * 100}% 0 ${(i / SLICES) * 100}%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
