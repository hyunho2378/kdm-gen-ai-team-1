// 책임: controller 5 phase 화면 (C2-2). IA.md 5절 순서 그대로다.
// JOIN → PERMISSION → CALIBRATION → PLAY → END.

import { useEffect, useRef, useState } from 'react';
import { colors, motion, radius, typography } from '../tokens.js';
import { Body, ButtonGhost, ButtonPrimary, Screen, StatusChip, Title } from './ui.jsx';
import { CALIB_MS } from '../pipeline.js';

/** 혼동 문자를 뺀 코드 알파벳. 0/O와 1/I를 서로 못 읽는 사고를 막는다. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LEN = 4;

/**
 * JOIN. 네이티브 input 대신 칸 4개를 직접 그린다(PITFALLS 네이티브 UI 노출).
 * 실제 접속은 C3이고 여기서는 코드를 보관만 한다.
 */
export function JoinScreen({ initialCode, onDone }) {
  const [code, setCode] = useState(initialCode ?? '');
  const boxRef = useRef(null);

  const ok = code.length === CODE_LEN;
  const push = (ch) => setCode((c) => (c.length >= CODE_LEN ? c : c + ch));

  return (
    <Screen>
      <Title>방 코드</Title>
      <Body>arena 화면의 QR을 찍으면 코드가 자동으로 들어온다. 직접 입력해도 된다.</Body>

      {/* 코드 칸 4개. 탭하면 숨은 입력이 아니라 아래 키패드로 넣는다 */}
      <div ref={boxRef} style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        {Array.from({ length: CODE_LEN }, (_, i) => (
          <div
            key={i}
            style={{
              width: 56,
              height: 68,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.md,
              background: colors.bg.raised,
              border: `1px solid ${code.length === i ? colors.red.light : colors.line.default}`,
              fontFamily: typography.family,
              fontSize: typography.heading.size,
              fontWeight: 700,
              color: colors.text.primary,
            }}
          >
            {code[i] ?? ''}
          </div>
        ))}
      </div>

      {/* 자체 키패드. 자동 대문자이고 혼동 문자가 없다 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 6,
          width: '100%',
          maxWidth: 360,
          marginTop: 8,
        }}
      >
        {ALPHABET.split('').map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => push(ch)}
            style={{
              minHeight: 44,
              borderRadius: radius.sm,
              border: `1px solid ${colors.line.default}`,
              background: 'transparent',
              color: colors.text.primary,
              fontFamily: typography.family,
              fontSize: typography.body.size,
              touchAction: 'manipulation',
            }}
          >
            {ch}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <ButtonGhost onClick={() => setCode((c) => c.slice(0, -1))}>지우기</ButtonGhost>
        <ButtonPrimary
          onClick={() => ok && onDone(code)}
          style={{ opacity: ok ? 1 : 0.45 }}
          aria-disabled={!ok}
        >
          다음
        </ButtonPrimary>
      </div>
      <Body tone={colors.text.dim}>연결은 다음 단계에서 붙는다. 지금은 센서만 준비한다.</Body>
    </Screen>
  );
}

/**
 * PERMISSION. **버튼 핸들러 첫 줄에서 권한을 부른다.**
 * 앞에 await를 하나라도 두면 iOS가 제스처 컨텍스트를 잃고 조용히 거부한다.
 */
export function PermissionScreen({ needsPrompt, onRequest, denied, onTapMode }) {
  return (
    <Screen>
      <Title>폰이 검이 된다</Title>
      <Body>
        {needsPrompt
          ? '동작 센서 사용을 허용해야 폰을 검처럼 쓸 수 있다.'
          : '동작 센서를 준비한다.'}
      </Body>
      {denied ? (
        <>
          <Body tone={colors.red.light}>센서를 쓸 수 없다. 탭 버튼으로도 경기가 된다.</Body>
          <ButtonPrimary onClick={onTapMode}>탭 버튼 모드로 시작</ButtonPrimary>
        </>
      ) : (
        <ButtonPrimary onClick={onRequest}>센서 허용</ButtonPrimary>
      )}
      <Body tone={colors.text.dim}>세로로 들고 손잡이를 쥐듯 잡는다.</Body>
    </Screen>
  );
}

/**
 * CALIBRATION. 검처럼 쥐고 정지 3초.
 * 진행 링은 검끝 곡선 문법을 따라 stroke-dashoffset으로 그린다(COMPONENTS TrailDivider 계열).
 */
export function CalibrationScreen({ onDone }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / CALIB_MS);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const R = 62;
  const C = 2 * Math.PI * R;
  return (
    <Screen>
      <Title>검처럼 쥐고 멈춘다</Title>
      <svg width={R * 2 + 20} height={R * 2 + 20} aria-hidden="true">
        <g transform={`translate(${R + 10} ${R + 10}) rotate(-90)`}>
          <circle r={R} fill="none" stroke={colors.line.default} strokeWidth="3" />
          <circle
            r={R}
            fill="none"
            stroke={colors.red.light}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - t)}
          />
        </g>
      </svg>
      <Body>{Math.ceil((1 - t) * (CALIB_MS / 1000))}초</Body>
      <Body tone={colors.text.dim}>이 자세가 기준이 된다. 흔들지 않는다.</Body>
    </Screen>
  );
}

/**
 * PLAY. 화면 전체가 입력 면이다.
 * 상단 방 코드와 상태, 중앙 안내 최소, 하단 절반이 스와이프 영역(엄지 도달권).
 */
export function PlayScreen({ code, support, tapMode, guarding, onStep, onStepEnd, onTapThrust, onTapGuard, lastAction }) {
  const startY = useRef(null);
  const dir = useRef(null);

  const begin = (e) => {
    startY.current = e.touches?.[0]?.clientY ?? e.clientY ?? null;
    dir.current = null;
  };
  const move = (e) => {
    if (startY.current === null) return;
    const y = e.touches?.[0]?.clientY ?? e.clientY;
    const dy = y - startY.current;
    // 방향 확정 전 10px 임계. 그 뒤로는 1:1 추적이다(MOTION 14절)
    if (Math.abs(dy) < 10 || dir.current) return;
    dir.current = dy < 0 ? 'advance' : 'retreat';
    onStep(dir.current);
  };
  const end = () => {
    if (dir.current) onStepEnd(dir.current);
    startY.current = null;
    dir.current = null;
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bg.base,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: 16 }}>
        <StatusChip label="방" value={code || '없음'} />
        <StatusChip label="연결" value="대기" degraded />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 20px' }}>
        {tapMode ? (
          <>
            <ButtonPrimary onPointerDown={onTapThrust} style={{ width: '100%', minHeight: 108, fontSize: typography.heading.size }}>
              찌르기
            </ButtonPrimary>
            <button
              type="button"
              onPointerDown={() => onTapGuard(true)}
              onPointerUp={() => onTapGuard(false)}
              onPointerLeave={() => onTapGuard(false)}
              style={{
                width: '100%',
                minHeight: 72,
                borderRadius: radius.pill,
                border: `1px solid ${colors.line.strong}`,
                background: 'transparent',
                color: colors.text.primary,
                fontFamily: typography.family,
                fontSize: typography.body.size,
                touchAction: 'manipulation',
              }}
            >
              가드 (누르는 동안)
            </button>
          </>
        ) : (
          <>
            <Title>{guarding ? '가드' : '찌른다'}</Title>
            <Body tone={colors.text.dim}>
              {support === 'gravityOnly' ? '간이 센서 모드로 동작 중이다.' : '앞으로 뻗으면 찌르기. 폰을 세우면 가드.'}
            </Body>
          </>
        )}
      </div>

      {/* 하단 절반 스와이프 영역. 위로 전진, 아래로 후퇴 */}
      <div
        onTouchStart={begin}
        onTouchMove={move}
        onTouchEnd={end}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={end}
        style={{
          height: '38dvh',
          borderTop: `1px solid ${colors.line.default}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: 12,
        }}
      >
        <Body tone={colors.text.dim}>위로 밀면 전진</Body>
        <Body tone={colors.text.dim}>{lastAction ?? '아래로 밀면 후퇴'}</Body>
      </div>
    </div>
  );
}

/** END. 결과 한 줄과 다시. 실제 결과는 C3에서 온다. */
export function EndScreen({ onAgain }) {
  return (
    <Screen>
      <Title>경기 종료</Title>
      <Body tone={colors.text.dim}>결과는 연결된 화면에서 확인한다.</Body>
      <ButtonPrimary onClick={onAgain}>다시</ButtonPrimary>
    </Screen>
  );
}

/** 가로 회전 안내. 센서 스트림은 끊지 않는다(회전해도 계속 돈다). */
export function LandscapeGuard() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: colors.bg.base,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 24,
      }}
    >
      <Title>세로로 돌려서 쥔다</Title>
      <Body tone={colors.text.dim}>가로로는 검 자세가 어긋난다. 센서는 계속 돌고 있다.</Body>
    </div>
  );
}

/**
 * HapticFlash. 패턴 수신 인터페이스만 둔다. 실제 수신은 C3이다.
 * **iOS는 navigator.vibrate가 없다.** 그래서 화면 플래시가 기본 경로이고 진동은 있으면 얹는다.
 */
export function HapticFlash({ pattern }) {
  const [on, setOn] = useState(null);
  useEffect(() => {
    if (!pattern) return undefined;
    setOn(pattern);
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern === 'parry' ? 30 : 60);
    }
    const t = setTimeout(() => setOn(null), 140);
    return () => clearTimeout(t);
  }, [pattern]);

  if (!on) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        pointerEvents: 'none',
        background: on === 'parry' ? colors.steel.mid : colors.red.fill,
        opacity: 0.55,
        transition: `opacity 140ms ${motion.easeOut}`,
      }}
    />
  );
}
