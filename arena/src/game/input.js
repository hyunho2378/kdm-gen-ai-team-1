// 책임: 입력 추상화. 키보드와 소켓 action이 같은 큐로 수렴한다.
// 판정 코드는 입력이 어디서 왔는지 모른다. 소스를 추가할 때 이 파일만 늘어난다.
//
// C3 확장 규율(ARENA_INPUT 2절): **공개 동작을 바꾸지 않는다.**
// 기준 서명은 judge.selftest.js가 setHeld()와 push(INPUT.THRUST)를 직접 불러 만든다.
// 그 둘의 시그니처와 의미를 보존하므로 대본이 그대로 돌고 서명이 그대로 나온다.
// 새로 생긴 emit()은 그 위에 얹은 전송 계층이고, 두 함수가 내부에서 emit()으로 위임한다.

import { INPUT_EVENT, SCHOOL } from '../../../shared/protocol.js';

export const INPUT = {
  ADVANCE: 'ADVANCE',
  RETREAT: 'RETREAT',
  THRUST: 'THRUST',
  GUARD: 'GUARD',
};

// CONTROLLER는 SOCKET의 읽기 좋은 별칭이다. 같은 슬롯을 가리키므로 값이 늘지 않는다.
export const SOURCE = { KEYBOARD: 'KEYBOARD', SOCKET: 'SOCKET', CONTROLLER: 'SOCKET' };

/** 이산 이벤트 타입에서 홀드 슬롯으로. thrust는 홀드가 아니라 null이다. */
const HOLD_OF = {
  [INPUT_EVENT.GUARD_ON]: INPUT.GUARD,
  [INPUT_EVENT.GUARD_OFF]: INPUT.GUARD,
  [INPUT_EVENT.ADVANCE]: INPUT.ADVANCE,
  [INPUT_EVENT.RETREAT]: INPUT.RETREAT,
};

/**
 * 이산 이벤트는 큐에 쌓고, 홀드 상태는 별도로 유지한다.
 * 전진과 후퇴와 가드는 홀드, 찌르기는 이산이다.
 *
 * **홀드는 소스별로 따로 기록하고 isHeld()가 OR을 돌려준다.**
 * 소스별로 나누지 않으면 한쪽의 뗌이 다른 쪽의 누름을 지운다. 페어링 상태에서 키보드를
 * 병행하면 그 일이 실제로 난다(ARENA_INPUT 6.3). 소스가 하나일 때는 OR이 항등이라
 * 기존 동작과 완전히 같고, 그것이 기준 서명이 보존되는 이유다.
 */
export function createInputQueue() {
  const events = [];
  const held = {
    [SOURCE.KEYBOARD]: { [INPUT.ADVANCE]: false, [INPUT.RETREAT]: false, [INPUT.GUARD]: false },
    [SOURCE.SOCKET]: { [INPUT.ADVANCE]: false, [INPUT.RETREAT]: false, [INPUT.GUARD]: false },
  };

  function slot(source) {
    return held[source] ?? held[SOURCE.KEYBOARD];
  }

  return {
    /**
     * 이산 스키마의 단일 입구(ARENA_INPUT 2절). 이산은 큐로, 엣지는 홀드로 접는다.
     * **여기서 새 판정 규칙을 만들지 않는다.** 형식을 옮길 뿐이다.
     */
    emit(event) {
      if (!event || typeof event.type !== 'string') return;
      const source = event.source === SOURCE.SOCKET ? SOURCE.SOCKET : SOURCE.KEYBOARD;
      if (event.type === INPUT_EVENT.THRUST) {
        events.push({ kind: INPUT.THRUST, source, payload: event });
        return;
      }
      const hold = HOLD_OF[event.type];
      if (!hold) return;
      // 가드는 on/off 타입이 방향을 쥐고, 전진과 후퇴는 power가 쥔다(스키마 그대로)
      const on = event.type === INPUT_EVENT.GUARD_ON
        ? true
        : event.type === INPUT_EVENT.GUARD_OFF
        ? false
        : Number(event.power) > 0;
      slot(source)[hold] = on;
    },

    /** 이산 입력. 찌르기가 여기로 들어온다. 시그니처 보존(셀프테스트가 쓴다). */
    push(kind, source = SOURCE.KEYBOARD, payload = null) {
      if (kind !== INPUT.THRUST) return;
      events.push({ kind, source, payload });
    },
    /** 홀드 입력 갱신. 시그니처 보존(셀프테스트가 쓴다). */
    setHeld(kind, value, source = SOURCE.KEYBOARD) {
      const s = slot(source);
      if (kind in s) s[kind] = Boolean(value);
    },
    /** 소스별 홀드의 OR. 소스가 하나면 결과가 이전과 동일하다. */
    isHeld(kind) {
      return held[SOURCE.KEYBOARD][kind] === true || held[SOURCE.SOCKET][kind] === true;
    },
    /** 큐를 비우며 돌려준다. 한 스텝에 한 번만 부른다. */
    drain() {
      if (events.length === 0) return [];
      return events.splice(0, events.length);
    },
    /** 모드 전환이나 phase 재시작 때 입력 잔재를 지운다. 전 소스가 대상이다. */
    clear() {
      events.length = 0;
      for (const s of Object.values(held)) {
        s[INPUT.ADVANCE] = false;
        s[INPUT.RETREAT] = false;
        s[INPUT.GUARD] = false;
      }
    },
    /**
     * 한 소스의 홀드만 푼다. 컨트롤러가 끊길 때 쓴다.
     * 안 풀면 마지막으로 누른 가드가 영원히 켜진 채로 남는다.
     */
    clearSource(source) {
      const s = slot(source);
      s[INPUT.ADVANCE] = false;
      s[INPUT.RETREAT] = false;
      s[INPUT.GUARD] = false;
    },
  };
}

const KEY_MAP = {
  ArrowUp: INPUT_EVENT.ADVANCE,
  ArrowRight: INPUT_EVENT.ADVANCE,
  ArrowDown: INPUT_EVENT.RETREAT,
  ArrowLeft: INPUT_EVENT.RETREAT,
  ShiftLeft: INPUT_EVENT.GUARD_ON,
  ShiftRight: INPUT_EVENT.GUARD_ON,
};

/** 로컬 유파 선택 키. 1/2/3/4가 진입점의 school 인자로 접힌다(앱 select 메시지와 같은 값). */
const SCHOOL_KEY = {
  Digit1: SCHOOL.SABRE,
  Digit2: SCHOOL.EPEE,
  Digit3: SCHOOL.HUNGARIAN,
  Digit4: SCHOOL.MIXED,
};

/**
 * 키보드를 큐에 붙인다. F9는 게임 입력이 아니라 모드 토글이므로 따로 뺀다.
 * 반환값은 해제 함수다.
 *
 * 내부는 emit()으로 갈아끼웠고 **외부 동작은 무변경이다.**
 * onSelectSchool은 게임 입력이 아니라 로비 선택이라 큐를 거치지 않는다(F9, Enter와 같은 등급).
 */
export function attachKeyboard(queue, { onToggleKeyboardMode, onStart, onSelectSchool } = {}) {
  const send = (type, power) =>
    queue.emit({ type, power, ts: performance.now(), source: SOURCE.KEYBOARD });

  function onKeyDown(e) {
    if (e.code === 'F9') {
      e.preventDefault();
      onToggleKeyboardMode?.();
      return;
    }
    if (e.repeat) return;

    if (e.code === 'Space') {
      e.preventDefault();
      send(INPUT_EVENT.THRUST, 1);
      return;
    }
    if (e.code === 'Enter') {
      onStart?.();
      return;
    }
    if (SCHOOL_KEY[e.code] && onSelectSchool) {
      e.preventDefault();
      onSelectSchool(SCHOOL_KEY[e.code]);
      return;
    }
    const mapped = KEY_MAP[e.code];
    if (mapped) {
      e.preventDefault();
      send(mapped, 1);
    }
  }

  function onKeyUp(e) {
    const mapped = KEY_MAP[e.code];
    if (!mapped) return;
    // 가드만 별도 타입으로 뗀다. 나머지는 power 0이 곧 뗌이다(스키마 그대로)
    send(mapped === INPUT_EVENT.GUARD_ON ? INPUT_EVENT.GUARD_OFF : mapped, 0);
  }

  // 창 포커스를 잃으면 키를 누른 채로 남는다. 키보드 소스의 홀드만 강제로 푼다.
  function onBlur() {
    queue.clearSource(SOURCE.KEYBOARD);
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
