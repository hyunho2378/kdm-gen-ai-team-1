// 책임: 피스트 14m를 가로 바 하나로 줄인 위치 표시 (R3-1).
//
// 실룰의 피스트는 폭 1.5m가 측면 이동을 봉쇄해 모든 전술이 전진과 후퇴 1차원으로 압축된다.
// 그래서 가는 가로 바 하나가 경기 공간을 온전히 담는다. 두 점의 간격이 곧 간합이다.
//
// 시각 문법은 팔각 프레임과 같다(얇은 steel 라인, red.light 액센트).
// 상시 노출 요소라 등장 애니메이션이 없고, 위치는 transform으로만 움직인다(MOTION 11절).
// 판정 상태를 폴링으로 읽는다. DistanceGauge와 같은 방식이라 프레임마다 리렌더하지 않는다.

import { useEffect, useRef } from 'react';
import { colors, typography } from '../../tokens.js';
import { PISTE } from '../../game/judge.js';

const H = 3;            // 바 두께
const DOT = 9;          // 위치 점 지름
const WARN_H = 9;       // 경고선 눈금 높이

/** 미터를 바 위 비율로. 0m가 내 뒤, 14m가 상대 뒤다. */
const pct = (m) => (m / PISTE.LENGTH) * 100;

export default function PisteStrip({ getPiste }) {
  const meRef = useRef(null);
  const aiRef = useRef(null);
  const meWarnRef = useRef(null);
  const aiWarnRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    // 경고 점등은 상태가 바뀔 때만 만진다. 매 프레임 style을 쓰면 합성이 계속 깨진다
    let warnMe = null;
    let warnAi = null;
    const tick = () => {
      const p = getPiste();
      if (meRef.current) meRef.current.style.transform = `translateX(${pct(p.me)}%)`;
      if (aiRef.current) aiRef.current.style.transform = `translateX(${pct(p.ai)}%)`;
      if (p.warnMe !== warnMe) {
        warnMe = p.warnMe;
        if (meWarnRef.current) meWarnRef.current.style.opacity = warnMe ? '1' : '0';
      }
      if (p.warnAi !== warnAi) {
        warnAi = p.warnAi;
        if (aiWarnRef.current) aiWarnRef.current.style.opacity = warnAi ? '1' : '0';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getPiste]);

  return (
    <div
      aria-hidden="true"
      style={{ position: 'relative', flex: 1, minWidth: 120, maxWidth: 520, fontFamily: typography.family }}
    >
      {/* 바 본체. 트랙은 어둡게 깔고 경고 구간만 밝힌다 */}
      <div style={{ position: 'relative', height: DOT + 6 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: (DOT + 6 - H) / 2,
            height: H,
            background: colors.line.default,
          }}
        />
        {/* 경고선 눈금 2개. 각 끝에서 2m 안쪽이다 */}
        {[PISTE.WARN, PISTE.LENGTH - PISTE.WARN].map((m) => (
          <div
            key={m}
            style={{
              position: 'absolute',
              left: `${pct(m)}%`,
              top: (DOT + 6 - WARN_H) / 2,
              width: 1,
              height: WARN_H,
              background: colors.line.strong,
            }}
          />
        ))}
        {/* 두 위치 점. 나 red, 상대 blue. 색 단독 구분이 아니라 아래 라벨을 함께 낸다 */}
        <Dot innerRef={meRef} color={colors.red.light} />
        <Dot innerRef={aiRef} color={colors.blue.light} />
      </div>

      {/* 경고 문구. 경고선을 넘어야 뜬다 */}
      <div style={{ position: 'relative', height: 14, marginTop: 2 }}>
        <Warn innerRef={meWarnRef} align="flex-start" text="내 뒤 없음" />
        <Warn innerRef={aiWarnRef} align="flex-end" text="상대 뒤 없음" />
      </div>
    </div>
  );
}

function Dot({ innerRef, color }) {
  return (
    <div
      ref={innerRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 3,
        // 래퍼가 트랙 전체 폭이라 translateX 퍼센트가 곧 피스트 위치가 된다.
        // left를 애니메이션하면 레이아웃이 돌므로 transform만 쓴다(MOTION 11절)
        width: '100%',
        height: 0,
        willChange: 'transform',
      }}
    >
      <div
        style={{
          width: DOT,
          height: DOT,
          marginLeft: -DOT / 2,
          borderRadius: '50%',
          background: color,
        }}
      />
    </div>
  );
}

/**
 * 피스트 이탈 경고. **소유 색이 아니라 UI 경고다.**
 * 내 쪽과 상대 쪽 양쪽이 같은 것을 쓰므로 레드로 두면 "내 것"이라는 뜻과 충돌한다
 * (실측에서 "상대 뒤 없음"이 레드로 떠 있는 것을 잡았다). 실버는 네이비 위 11.3:1이라
 * 레드(4.13:1)보다 읽기도 낫다.
 */
function Warn({ innerRef, align, text }) {
  return (
    <div
      ref={innerRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: align,
        opacity: 0,
        transition: 'opacity 150ms ease-out',
      }}
    >
      <span
        style={{
          fontSize: typography.caption.size,
          letterSpacing: typography.hud.tracking,
          color: colors.accent.base,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  );
}
