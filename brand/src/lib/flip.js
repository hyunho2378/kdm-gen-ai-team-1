// 페이지를 건너뛰는 shared element 전환. 카드가 상세의 대표 비주얼 자리로 확대된다.
//
// **상태를 모듈 변수에 둔다.** 라우트가 바뀌면 카드 컴포넌트가 언마운트되므로
// React state로는 넘길 수 없다. 클릭한 쪽이 기록하고 도착한 쪽이 한 번 꺼내 쓴다.
//
// 매칭은 `data-flip-id`가 한다. 카드의 썸네일과 상세의 대표 비주얼이 같은 id
// (`product-<slug>`)를 달고 있어서 원본이 DOM에서 사라져도 Flip이 짝을 찾는다.
//
// **전환이 실패해도 이동은 항상 성공해야 한다.** 그래서 기록도 재생도 try/catch로 감싸고
// 실패하면 조용히 아무것도 하지 않는다. 라우팅은 Flip과 무관하게 이미 일어난 뒤다.

import { Flip, gsap, isReduced } from './motion.js';

// 페이지 전환 모핑. DESIGN 7절의 modal 200~500ms 구간을 쓴다.
// 크로스페이드(150~200ms)가 아니라 모달 확대에 가까운 동작이라 그 구간이 맞다
const DURATION = 0.48;
// 기록해 두고 도착을 안 하면(뒤로 가기, 새 탭, 링크 취소) 상태가 남는다.
// 다음 진입에서 엉뚱한 자리에서 날아오지 않게 유효 시간을 둔다
const STALE_MS = 1200;

let pending = null;
// 지금 재생 중인 전환이 끝나는 시각. 무거운 초기화를 이 뒤로 미루려는 쪽이 읽는다
let playingUntil = 0;

/** 떠나는 쪽에서 부른다. 이 요소의 지금 자리를 기록한다. */
export function captureFlip(el) {
  pending = null;
  if (!el || isReduced()) return;
  try {
    // id를 함께 들고 간다. 도착지에 후보가 여럿일 때(제품군 3카드) 짝을 고르는 근거다
    pending = { state: Flip.getState(el), at: performance.now(), id: el.getAttribute('data-flip-id') };
  } catch {
    pending = null;
  }
}

/**
 * 지금 기록된 전환의 flip-id. **꺼내지 않고 보기만 한다.**
 * 도착지가 카드 여러 장이면 이 id로 어느 카드가 짝인지 먼저 정한다.
 * 안 보고 아무 카드에나 붙이면 Flip이 짝을 못 찾아 전환이 통째로 죽는다(실측으로 잡았다).
 */
export function pendingFlipId() {
  return pending ? pending.id : null;
}

/**
 * 도착한 쪽에서 부른다. 기록이 있으면 그 자리에서 지금 자리로 날아온다.
 *
 * **꺼내는 즉시 비운다.** StrictMode는 layout effect를 두 번 돌리는데
 * 두 번째 호출이 빈손이 되어 전환이 중복 재생되지 않는다(히어로 타임라인과 같은 함정).
 */
export function playFlip(el) {
  const p = pending;
  pending = null;
  if (!el || !p || isReduced()) return false;
  if (performance.now() - p.at > STALE_MS) return false;
  try {
    // 겹쳐 들어오는 트윈을 먼저 끊는다. 연타로 두 전환이 같은 요소를 다투지 않게
    gsap.killTweensOf(el);
    playingUntil = performance.now() + DURATION * 1000;
    Flip.from(p.state, {
      targets: el,
      duration: DURATION,
      ease: 'power3.out',
      // 원본과 목표의 비율이 다르다(카드 4대3, 상세 16대9). scale로 맞춰 늘린다
      scale: true,
      absolute: true,
    });
    return true;
  } catch {
    // 전환이 죽어도 화면은 이미 목표 자리에 정상으로 서 있다
    return false;
  }
}

/** 기록만 버린다. 전환 없이 이동시키고 싶을 때. */
export function clearFlip() {
  pending = null;
}

/**
 * 재생 중인 전환이 끝나기까지 남은 시간(ms). 전환이 없으면 0.
 *
 * **무거운 초기화를 이 시간만큼 미루라고 알려 주는 값이다.** 도착지에서 WebGL 컨텍스트를
 * 만들면 첫 셰이더 컴파일이 메인 스레드를 수백 ms 잡는데, 그 자리가 전환 구간과 겹치면
 * rAF가 굶어 전환이 두 프레임으로 끊긴다(제품 상세 뷰어에서 실측했다. 800ms에 프레임 2개).
 */
export function flipSettleMs() {
  return Math.max(0, playingUntil - performance.now());
}
