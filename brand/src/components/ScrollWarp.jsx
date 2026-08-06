// 스크롤 워프. 스크롤 속도에 따라 콘텐츠가 미세하게 기울고, 멈추면 정확히 0으로 돌아온다.
// 실측된 lusion 문법의 재현이다(REBOOT_PLAN 1.2). 새 라이브러리 없이 GSAP만 쓴다.
//
// ── 속도를 어디서 읽는가 ────────────────────────────────────────────────────
// **우리 Lenis는 네이티브 스크롤을 그대로 민다**(실측: html에 lenis 클래스만 붙고
// body/html transform은 none, 휠에 window.scrollY가 0에서 600으로 실제로 움직인다).
// 가상 이동 래퍼가 없다는 뜻이라 skew를 걸 대상은 우리가 새로 세워야 한다.
//
// 그래서 속도도 `window.scrollY`의 프레임 차분으로 읽는다. Lenis의 velocity 정의가
// 정확히 그것(animatedScroll의 프레임 차분)이고, 이렇게 하면 Lenis 인스턴스를
// 참조하지 않아도 된다. 참조하면 부모(App)의 효과가 자식보다 늦게 도는 React 순서 탓에
// 첫 프레임에 null을 잡는다.
//
// ── 왜 fixed 요소가 이 안에 없는가 ──────────────────────────────────────────
// **transform이 걸린 조상 안에서 position fixed는 뷰포트가 아니라 그 조상을 기준으로 잡힌다.**
// 실측으로 확인했다. pin 중이던 월드빌딩 섹션(fixed)이 main에 skewY(3deg)를 거는 순간
// 뷰포트 기준 top 0에서 **-1836으로 날아갔다.**
// 그래서 헤더와 커서와 프리로더는 App에서 이 래퍼의 형제로 남는다(전부 fixed다).
// (R5에서 월드빌딩 pin을 걷어내 이제 래퍼 안에 fixed가 없다. pin이 다시 생기면 pinType으로 푼다.)
//
// ── 텍스트 선명도 ───────────────────────────────────────────────────────────
// skew가 걸려 있는 동안 요소는 합성 레이어로 올라가 글자가 흐려진다. 정지하면
// **transform과 will-change를 속성째 지운다.** 0으로 두는 것과 다르다. 값이 남아 있으면
// 레이어도 남아 흐린 렌더가 그대로 간다.

import { useEffect, useRef } from 'react';
import { gsap, isReduced } from '../lib/motion.js';

/** 최대 기울기(도). lusion 실측 3.5도보다 보수적으로 잡았다. */
const MAX_DEG = 3;

/**
 * 이 속도(px/프레임)에서 최대 기울기에 닿는다.
 * 실측 프레임 델타: 휠 한 번 15, 세게 한 번 99, 연타 125, PageDown 311.
 * 평소 빠른 휠이 최대에 닿고 PageDown 같은 도약만 상한에 잘리는 자리가 110이다.
 */
const VMAX = 110;

/** 복귀 시간(초)과 이징. 0에 정확히 닿는 이징이라야 지운 상태로 넘어간다. */
const SETTLE_SEC = 0.45;
const SETTLE_EASE = 'power3.out';

/** 이 각(도) 아래는 0으로 본다. 눈에 안 보이는 값 때문에 레이어를 붙들지 않는다. */
const REST_DEG = 0.02;

/** 워프에서 빼는 요소. 같은 각을 빼서 항등으로 되돌린다(히어로 리본 캔버스). */
const EXCLUDE = '[data-warp="none"]';

export default function ScrollWarp({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    // 모션을 줄여 달라고 했으면 워프를 아예 걸지 않는다. 래퍼는 남지만 transform이 없다
    if (!el || isReduced()) return undefined;

    const state = { deg: 0 };
    let anti = [];
    let warped = false;

    function render() {
      const deg = state.deg;
      if (Math.abs(deg) < REST_DEG) {
        if (!warped) return;
        warped = false;
        // **0을 쓰는 게 아니라 속성을 지운다.** 합성 레이어를 놓아야 글자가 원래대로 그려진다
        el.style.transform = '';
        el.style.willChange = '';
        for (const n of anti) {
          n.style.transform = '';
          n.style.willChange = '';
        }
        return;
      }
      if (!warped) {
        warped = true;
        // 움직이기 시작할 때 한 번만 훑는다. 라우트가 바뀌어도 다음 스크롤에 새로 잡힌다
        anti = [...el.querySelectorAll(EXCLUDE)];
        el.style.willChange = 'transform';
        for (const n of anti) n.style.willChange = 'transform';
      }
      el.style.transform = `skewY(${deg}deg)`;
      // **skewY는 각이 더해진다.** 같은 각을 빼면 두 행렬의 곱이 정확히 항등이라
      // 이 요소만 안 기운 채로 남는다
      for (const n of anti) n.style.transform = `skewY(${-deg}deg)`;
    }

    // quickTo는 트윈 하나를 재사용한다. 매 프레임 목표가 바뀌는 경로라 이게 맞다
    const to = gsap.quickTo(state, 'deg', {
      duration: SETTLE_SEC,
      ease: SETTLE_EASE,
      onUpdate: render,
    });

    let last = window.scrollY;
    // GSAP ticker에 얹는다. 앱에 rAF 루프를 하나 더 만들지 않는다
    function tick() {
      const y = window.scrollY;
      const dy = y - last;
      last = y;
      // **제곱이라 저속에서 거의 0이다.** 델타 15(살살 굴릴 때)면 0.06도로 안 보이고,
      // 60이면 0.9도, 110 이상이면 3도로 포화한다
      const t = Math.min(1, Math.abs(dy) / VMAX);
      to(Math.sign(dy) * t * t * MAX_DEG);
    }
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      to.tween.kill();
      state.deg = 0;
      render();
    };
  }, []);

  return (
    <div ref={ref} className="vx-warp">
      {children}
    </div>
  );
}
