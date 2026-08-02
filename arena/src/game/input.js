// 책임: 입력 추상화. 키보드와 (C3의) 소켓 action이 같은 큐로 수렴한다.
// 판정 코드는 입력이 어디서 왔는지 모른다. 소스를 추가할 때 이 파일만 늘어난다.

export const INPUT = {
  ADVANCE: 'ADVANCE',
  RETREAT: 'RETREAT',
  THRUST: 'THRUST',
  GUARD: 'GUARD',
};

export const SOURCE = { KEYBOARD: 'KEYBOARD', SOCKET: 'SOCKET' };

/**
 * 이산 이벤트는 큐에 쌓고, 홀드 상태는 별도로 유지한다.
 * 전진과 후퇴와 가드는 홀드, 찌르기는 이산이다.
 */
export function createInputQueue() {
  const events = [];
  const held = { [INPUT.ADVANCE]: false, [INPUT.RETREAT]: false, [INPUT.GUARD]: false };

  return {
    /** 이산 입력. 찌르기가 여기로 들어온다. */
    push(kind, source = SOURCE.KEYBOARD, payload = null) {
      events.push({ kind, source, payload });
    },
    /** 홀드 입력 갱신. */
    setHeld(kind, value) {
      if (kind in held) held[kind] = Boolean(value);
    },
    isHeld(kind) {
      return held[kind] === true;
    },
    /** 큐를 비우며 돌려준다. 한 스텝에 한 번만 부른다. */
    drain() {
      if (events.length === 0) return [];
      return events.splice(0, events.length);
    },
    /** 모드 전환이나 phase 재시작 때 입력 잔재를 지운다. */
    clear() {
      events.length = 0;
      held[INPUT.ADVANCE] = false;
      held[INPUT.RETREAT] = false;
      held[INPUT.GUARD] = false;
    },
  };
}

const KEY_MAP = {
  ArrowUp: INPUT.ADVANCE,
  ArrowRight: INPUT.ADVANCE,
  ArrowDown: INPUT.RETREAT,
  ArrowLeft: INPUT.RETREAT,
  ShiftLeft: INPUT.GUARD,
  ShiftRight: INPUT.GUARD,
};

/**
 * 키보드를 큐에 붙인다. F9는 게임 입력이 아니라 모드 토글이므로 따로 뺀다.
 * 반환값은 해제 함수다.
 */
export function attachKeyboard(queue, { onToggleKeyboardMode, onStart } = {}) {
  function onKeyDown(e) {
    if (e.code === 'F9') {
      e.preventDefault();
      onToggleKeyboardMode?.();
      return;
    }
    if (e.repeat) return;

    if (e.code === 'Space') {
      e.preventDefault();
      queue.push(INPUT.THRUST, SOURCE.KEYBOARD);
      return;
    }
    if (e.code === 'Enter') {
      onStart?.();
      return;
    }
    const mapped = KEY_MAP[e.code];
    if (mapped) {
      e.preventDefault();
      queue.setHeld(mapped, true);
    }
  }

  function onKeyUp(e) {
    const mapped = KEY_MAP[e.code];
    if (mapped) queue.setHeld(mapped, false);
  }

  // 창 포커스를 잃으면 키를 누른 채로 남는다. 홀드를 강제로 푼다.
  function onBlur() {
    queue.setHeld(INPUT.ADVANCE, false);
    queue.setHeld(INPUT.RETREAT, false);
    queue.setHeld(INPUT.GUARD, false);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
  };
}
