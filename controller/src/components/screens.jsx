// 책임: controller VORTEX 앱 화면. HANDOVER 3절 흐름:
// HOME(별도 파일) → CONNECT → SELECT → PERMISSION → CALIBRATION → PLAY → RESULT.
// **센서·소켓 로직 무변경. 화면 계층만.**

import { useEffect, useRef, useState } from 'react';
import { colors, ig, motion, radius, typography } from '../tokens.js';
import { Body, ButtonGhost, ButtonPrimary, Screen, Spinner, StatusChip, Title, TopBarBack } from './ui.jsx';
import { CALIB_MS } from '../pipeline.js';
import { LINK, LINK_ERROR } from '../net/socket.js';

/** 혼동 문자를 뺀 코드 알파벳. 0/O와 1/I를 서로 못 읽는 사고를 막는다. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LEN = 4;

/** 접속 진행 중 상태 문구. 상태마다 사람이 기대할 다음이 다르다(N1 시스템 상태 가시성). */
const CONNECTING_TEXT = {
  [LINK.CONNECTING]: '서버에 연결하는 중입니다. 무료 플랜은 첫 접속이 느릴 수 있습니다.',
  [LINK.JOINED]: 'arena 화면을 기다리는 중입니다.',
  [LINK.RECONNECTING]: '연결이 끊겨 다시 붙는 중입니다.',
};

/**
 * CONNECT(구 JOIN). 두 모드다.
 * - 코드 입력: 네이티브 input 대신 칸 4개 + 자체 키패드(PITFALLS 네이티브 UI 노출, 혼동 문자 제외).
 * - 접속 중/실패: 스피너(연결 중) 또는 평문 에러 + 재시도(무한 스피너 금지 N9, N1 상태 가시성).
 *   paired가 되면 App이 SELECT로 넘긴다.
 */
export function ConnectScreen({ initialCode, onDone, onBack, connecting, linkStatus, linkError, onRetry, onCancel }) {
  const [code, setCode] = useState(initialCode ?? '');
  const boxRef = useRef(null);

  const ok = code.length === CODE_LEN;
  const push = (ch) => setCode((c) => (c.length >= CODE_LEN ? c : c + ch));

  // 접속 진행/실패 모드. 코드 입력 위에 덮지 않고 화면을 통째로 바꾼다(한 화면 한 초점).
  if (connecting) {
    const failed = linkStatus === LINK.ERROR;
    return (
      <>
        <TopBarBack title="세션 연결" onBack={onCancel} />
        <Screen>
          {failed ? (
            <>
              <Title>연결되지 않았다</Title>
              <Body tone={colors.red.light}>{LINK_REASON_TEXT[linkError] ?? '알 수 없는 이유로 끊겼다.'}</Body>
              <div style={{ display: 'flex', gap: 10 }}>
                <ButtonGhost onClick={onCancel}>코드 다시 입력</ButtonGhost>
                <ButtonPrimary onClick={onRetry}>재시도</ButtonPrimary>
              </div>
            </>
          ) : (
            <>
              <Spinner />
              <Title>{code || initialCode} 방에 연결 중</Title>
              <Body tone={colors.text.dim}>{CONNECTING_TEXT[linkStatus] ?? '연결하는 중입니다.'}</Body>
            </>
          )}
        </Screen>
      </>
    );
  }

  return (
    <>
      {onBack ? <TopBarBack title="세션 연결" onBack={onBack} /> : null}
    <Screen>
      <Title>세션 코드</Title>
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
      <Body tone={colors.text.dim}>다음을 누르면 그 방으로 접속한다.</Body>
    </Screen>
    </>
  );
}

/**
 * PERMISSION. **버튼 핸들러 첫 줄에서 권한을 부른다.**
 * 앞에 await를 하나라도 두면 iOS가 제스처 컨텍스트를 잃고 조용히 거부한다.
 */
export function PermissionScreen({ needsPrompt, onRequest, denied, onTapMode, onBack }) {
  return (
    <>
      {onBack ? <TopBarBack title="센서 준비" onBack={onBack} /> : null}
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
      <Body tone={colors.text.dim}>세로로 들고 충전 단자가 아래로 가게 손잡이 쥐듯 잡는다.</Body>
    </Screen>
    </>
  );
}

/**
 * CALIBRATION. 검처럼 쥐고 정지 3초.
 * 진행 링은 검끝 곡선 문법을 따라 stroke-dashoffset으로 그린다(COMPONENTS TrailDivider 계열).
 *
 * **여기서 잡는 자세가 arena 검의 앙가르드가 된다.** 그래서 그립을 문구로 못 박는다.
 * 폰 세로 + 단자 아래 + 화면이 몸 쪽이면 기기 좌표계가 카메라 좌표계와 그대로 맞아떨어져
 * ThreeRenderer의 GRIP_TO_BLADE 보정 하나로 검이 옳게 선다. 다른 자세로 잡으면 그 전제가 깨진다.
 */
export function CalibrationScreen({ onDone, onBack }) {
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
    <>
      {onBack ? <TopBarBack title="캘리브레이션" onBack={onBack} /> : null}
    <Screen>
      <Title>폰을 세로로 세워 쥐고 정지</Title>
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
      <Body tone={colors.text.dim}>충전 단자가 아래, 화면이 나를 본다. 이 자세가 검의 기본 자세가 된다.</Body>
    </Screen>
    </>
  );
}

/**
 * PLAY. 화면 전체가 입력 면이다.
 * 상단 방 코드와 상태, 중앙 안내 최소, 하단 절반이 스와이프 영역(엄지 도달권).
 */
export function PlayScreen({ code, support, tapMode, guarding, onStep, onStepEnd, onTapThrust, onTapGuard, lastAction, linkLabel = '대기', linkOk = false }) {
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
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: colors.bg.base,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: 16 }}>
        <StatusChip label="방" value={code || '없음'} />
        <StatusChip label="연결" value={linkLabel} degraded={!linkOk} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 20px' }}>
        {tapMode ? (
          <>
            <ButtonPrimary onPointerDown={onTapThrust} style={{ width: '100%', minHeight: 108, fontSize: ig.title2.size, fontWeight: ig.title2.weight }}>
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
                fontSize: ig.body.size,
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
              {support === 'gravityOnly' ? '간이 센서 모드로 동작 중이다.' : '세워 두면 가드. 앞으로 눕혀 지르면 찌르기.'}
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

/**
 * 연결 실패. **무한 스피너 대신 사유와 재시도 버튼을 낸다.**
 * 사유마다 사람이 할 수 있는 다음 행동이 다르므로 문구를 따로 쓴다.
 */
const LINK_REASON_TEXT = {
  [LINK_ERROR.NO_URL]: '서버 주소가 설정되지 않았다. 배포 환경 변수 VITE_SERVER_URL을 확인한다.',
  [LINK_ERROR.UNREACHABLE]: '서버에 닿지 않는다. 서버가 깨어나는 중이거나 주소가 틀렸다.',
  [LINK_ERROR.NOT_FOUND]: '그 방이 없다. arena 화면에 떠 있는 코드를 다시 확인한다.',
  [LINK_ERROR.BAD_ROLE]: '서버가 접속을 거부했다.',
};

export function LinkErrorScreen({ reason, onRetry, onBack }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: colors.bg.base,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: '24px 20px',
        maxWidth: 390,
        margin: '0 auto',
      }}
    >
      <Title>연결되지 않았다</Title>
      <Body tone={colors.red.light}>{LINK_REASON_TEXT[reason] ?? '알 수 없는 이유로 끊겼다.'}</Body>
      <div style={{ display: 'flex', gap: 10 }}>
        <ButtonGhost onClick={onBack}>코드 다시 입력</ButtonGhost>
        <ButtonPrimary onClick={onRetry}>재시도</ButtonPrimary>
      </div>
      <Body tone={colors.text.dim}>연결이 없어도 폰은 계속 센서를 읽는다. 붙으면 그때부터 검이 된다.</Body>
    </div>
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
 *
 * **flash는 매번 새 객체다.** 같은 패턴이 연달아 와도 이펙트가 다시 돌아야 하는데
 * 예전에는 부모가 10ms 뒤 null로 되돌려 그 역할을 대신했다. 그것이 화면이 빨간 채로
 * 굳는 버그의 원인이었다. null이 들어오면 의존성이 바뀌어 **이전 실행의 정리 함수가
 * 140ms 복귀 타이머를 지우고** 새 실행은 조기 반환해서 setOn(null)에 영영 못 닿았다.
 * 그래서 첫 명중 이후 경기 내내, 결과 화면까지 빨간색이 남았다.
 *
 * 지금은 **효과가 flash 하나에서 on을 통째로 결정한다.** 조기 반환이 없으므로
 * null이 들어오면 그 자리에서 꺼진다(경기 종료 리셋이 이 경로를 쓴다).
 */
export function HapticFlash({ flash }) {
  const [on, setOn] = useState(null);
  useEffect(() => {
    setOn(flash ? flash.pattern : null);
    if (!flash) return undefined;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(flash.pattern === 'parry' ? 30 : 60);
    }
    const t = setTimeout(() => setOn(null), 140);
    return () => clearTimeout(t);
  }, [flash]);

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
