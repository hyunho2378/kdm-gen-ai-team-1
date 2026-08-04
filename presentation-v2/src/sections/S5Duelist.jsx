// 유파별 AI. 서브 진행 6단계(0 인트로 → 1 카드1 → 2 복귀 → 3 카드2 → 4 복귀 → 5 카드3).
//
// --- 레이아웃 출처 ---
// `Slide 16_9 - 7.svg`(1920x1080)를 Chromium으로 렌더해 기준으로 삼고 좌표를 SVG에서 직접 뽑았다.
//   인물 3장  x 581.1 w 609.4 h 934.8 / x 1153.1 w 290.1 h 987.0 / x 1504.6 w 196.7 h 987.0
//     → **원본은 인물 폭이 제각각이다.** 런지 자세가 넓고 서 있는 둘은 좁다. 높이를 맞추고 폭은 놔둔다
//   배지 3개  y 936.575  h 60.35  rx 30.17(= h/2 필). x 787.7 w 190.3 / x 1188.2 w 220 / x 1521.9 w 220
//   레드 글로우 ellipse cx 1165.5 cy 718 rx 997.1 ry 730
//     원본 스톱은 알파 0.9에서 시작하고 주황(#D93E16 #EA520C #FF6A00)으로 번진다.
//     **브랜드 팔레트에 주황이 없고 지시가 저알파 radial이라 tokens.red 한 색으로 낮은 알파만 쓴다.**
//
// --- 카드 인터랙션 출처 ---
// 포폴 저장소 `client/src/components/work/StackCarousel.jsx`(26-portfolio-hyunho)를 실제로 열고
// 아래 메커니즘을 가져왔다. 추론이 아니다.
//   - circDist(i, activePos, N): 원형 최단거리. 모듈로 두 번으로 음수를 접고 N/2 넘으면 반대편으로(43~47행)
//   - isActive = absD < 0.5 (214행)
//   - z 정렬  z = Math.round(100 - absD) (217행)
//   - dim 계산 absD < 0.02면 0, 아니면 Math.min(0.35, absD * 0.12) (225~227행)
//   - 락 기반 한 칸 스텝 go(dir) + lockRef (83~88행)
//   - transition 패턴 'transform ...ms cubic-bezier(0.22,1,0.36,1), opacity ...ms ease' (230~232행)
// **안무는 다르다.** StackCarousel은 아치형 팬 캐러셀이고 여기는 가로 일렬에서 한 장이 앞으로 나온다.
// 위 계산식 위에 이 섹션의 안무를 새로 짰다.

import { useEffect, useRef, useState } from 'react';
import { colors, typography, motion } from '../tokens.js';
import { DUELIST, DUELIST_STYLES } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { Eyebrow, Badge, StepDots } from '../components/Bits.jsx';

const N = DUELIST_STYLES.length;
const STATES = N * 2; // 0 인트로 + (전진, 복귀) x 3 → 마지막 복귀는 없으므로 0~5
// 상태 → 앞으로 나온 카드. null이면 인트로/복귀(가로 일렬).
const FOCUS_BY_STATE = [null, 0, null, 1, null, 2];

// 인트로에서 카드가 앉는 x 중심. 원본 인물 중심 885.7 / 1298.2 / 1602.9 을 1920으로 나눈 값.
const REST_X = [46.1, 67.6, 83.5];
// 포커스된 카드가 이동하는 x 중심. 좌측으로 빠지고 우측을 상세에 내준다.
const FOCUS_X = 25;
const FOCUS_SCALE = 1.16;
const REST_SCALE = 0.86; // 포커스 상태에서 나머지 카드가 물러나는 배율

// StackCarousel 43~47행 그대로. 원형 최단거리.
const circDist = (i, activePos, n) => {
  let d = ((((i - activePos) % n) + n) % n);
  if (d > n / 2) d -= n;
  return d;
};

// StackCarousel 230~232행의 곡선을 그대로 쓰고 길이만 이 안무에 맞춘다.
// 커지는 전환 0.6s, 복귀는 더 느리게(0.9s).
const EASE = 'cubic-bezier(0.22,1,0.36,1)';
const trans = (ms) => `transform ${ms}ms ${EASE}, opacity ${Math.round(ms * 0.8)}ms ease, filter ${ms}ms ease`;

export default function S5Duelist({ registerHandler, registerEnter }) {
  const [state, setState] = useState(0);
  const stateRef = useRef(0);
  const lockRef = useRef(false); // StackCarousel 83~88행의 락을 그대로 가져왔다
  const growingRef = useRef(false); // 커지는 중인지 복귀 중인지. 전환 길이를 가른다

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 락으로 한 번에 한 칸만. 연타로 안무가 건너뛰지 않는다.
    // 원본은 260ms 전환에 90ms 락이지만 이 안무는 600~900ms라 그에 맞춰 늘렸다.
    const go = (dir) => {
      const next = stateRef.current + dir;
      if (next < 0 || next >= STATES) return false; // 경계 → 셸이 S4/S6로 옮긴다
      growingRef.current = FOCUS_BY_STATE[next] !== null;
      stateRef.current = next;
      setState(next);
      if (!reduced) {
        lockRef.current = true;
        setTimeout(() => { lockRef.current = false; }, growingRef.current ? 620 : 920);
      }
      return true;
    };

    const handleStep = (dir) => {
      // 전환 중 입력은 삼킨다(consume). 안 그러면 애니메이션 도중에 섹션이 넘어간다.
      if (lockRef.current) return true;
      return go(dir);
    };

    const handleEnter = (dir) => {
      const next = dir > 0 ? 0 : STATES - 1;
      growingRef.current = FOCUS_BY_STATE[next] !== null;
      stateRef.current = next;
      setState(next);
      lockRef.current = false;
    };

    registerHandler(handleStep);
    registerEnter(handleEnter);
    return () => {
      registerHandler(null);
      registerEnter(null);
    };
  }, [registerHandler, registerEnter]);

  const focus = FOCUS_BY_STATE[state];
  const focused = focus !== null;
  const growing = growingRef.current;
  const dur = growing ? 600 : 900; // 커지는 전환 0.6s, 복귀는 더 느리게

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 저알파 레드 radial. 원본 ellipse 중심 cx 1165.5 cy 718 → 60.7% / 66.5% */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '60.7%',
          top: '66.5%',
          width: '104vw',
          height: '135vh',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse at 50% 50%, rgba(230,13,21,0.16) 0%, rgba(230,13,21,0.07) 37%, rgba(230,13,21,0.02) 62%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 상단 좌측 헤더. 포커스 상태에서는 헤드라인과 서브를 물려 카드에 자리를 내준다. */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(20px, 5.33vw, 130px)',
          top: 'clamp(44px, 18vh, 200px)',
          width: 'min(52vw, 900px)',
          zIndex: 6,
          pointerEvents: 'none',
          textShadow: '0 2px 26px rgba(16,16,16,0.9)',
        }}
      >
        <Eyebrow en={DUELIST.label.en} ko={DUELIST.label.ko} />
        <div
          style={{
            opacity: focused ? 0 : 1,
            transform: focused ? 'translateY(-8px)' : 'translateY(0)',
            transition: `opacity ${dur}ms ease, transform ${dur}ms ${EASE}`,
          }}
        >
          <h2
            style={{
              margin: 'clamp(12px, 1.9vh, 24px) 0 0',
              fontFamily: typography.family,
              fontSize: 'clamp(1.15rem, 2.4vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.32,
              color: colors.text.primary,
            }}
          >
            {DUELIST.headline}
          </h2>
          <div style={{ marginTop: 'clamp(10px, 1.7vh, 22px)' }}>
            {DUELIST.sub.map((line) => (
              <div
                key={line}
                style={{
                  fontFamily: typography.family,
                  fontSize: 'clamp(0.72rem, 1.09vw, 1.2rem)',
                  fontWeight: 400,
                  lineHeight: 1.72,
                  color: colors.text.secondary,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 카드 3장. 인트로는 가로 일렬, 포커스 상태는 한 장이 좌측으로 나오고 나머지는 blur로 물러난다. */}
      {DUELIST_STYLES.map((s, i) => {
        // StackCarousel의 원형 최단거리. 포커스가 없으면 자기 자신을 중심으로 둬 d = 0.
        const d = circDist(i, focused ? focus : i, N);
        const absD = Math.abs(d);
        const isActive = focused && absD < 0.5; // StackCarousel 214행

        // dim: StackCarousel 225~227행의 식. 카드가 3장뿐이라 absD 상한이 1이고
        // 그대로 쓰면 0.12까지만 어두워진다. 포커스 상태에서만 배수를 걸되 **원본 상한 0.35를 지킨다.**
        const dim = absD < 0.02 ? 0 : Math.min(0.35, absD * 0.12 * (focused ? 3 : 1));
        const blur = focused ? Math.min(6, absD * 6) : 0;
        const z = Math.round(100 - absD); // StackCarousel 217행

        const x = isActive ? FOCUS_X : REST_X[i];
        const scale = focused ? (isActive ? FOCUS_SCALE : REST_SCALE) : 1;

        return (
          <div
            key={s.key}
            style={{
              position: 'absolute',
              left: `${x}%`,
              bottom: 0,
              height: '91%',
              width: 'clamp(160px, 30vw, 620px)',
              zIndex: z,
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: 'center bottom',
              filter: `blur(${blur}px)`,
              transition: trans(dur),
              pointerEvents: 'none',
              willChange: 'transform, filter',
            }}
          >
            {/* 인물. 원본처럼 바닥 정렬 contain이라 폭은 각자 자연 비율대로 앉는다. */}
            <div style={{ position: 'absolute', inset: '0 0 20% 0' }}>
              <AssetImage src={s.img} fit="contain" position="center bottom" />
              {/* 비활성 카드를 눌러 어둡게. dim을 검은 막의 알파로 쓴다. */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: colors.black,
                  opacity: dim,
                  transition: `opacity ${dur}ms ease`,
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* 유파명 + Ver 배지. 원본 배지는 y 936.575, rx = h/2 인 필이다.
                하단 진행 도트와 겹치지 않게 띄운다(실측에서 유파명이 도트와 부딪혔다). */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 'clamp(38px, 5.4vh, 62px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'clamp(5px, 0.9vh, 11px)',
                textAlign: 'center',
                textShadow: '0 2px 20px rgba(16,16,16,0.95)',
              }}
            >
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: 'clamp(0.6rem, 0.94vw, 1.05rem)',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: colors.text.secondary,
                  whiteSpace: 'nowrap',
                }}
              >
                {s.school}
              </span>
              <Badge text={s.badge} filled={isActive} />
            </div>
          </div>
        );
      })}

      {/* 우측 상세. 포커스 상태에서만 뜬다.
          **카드보다 위에 둔다.** 카드 z는 100 - absD(StackCarousel 217행)라 99~100이고
          그대로 두면 흐린 카드가 미디어 슬롯을 덮는다(실측). */}
      <div
        style={{
          position: 'absolute',
          right: 'clamp(20px, 4vw, 96px)',
          top: '50%',
          zIndex: 110,
          width: 'min(40vw, 660px)',
          transform: `translateY(-50%) translateX(${focused ? 0 : 26}px)`,
          opacity: focused ? 1 : 0,
          transition: `opacity ${dur}ms ease, transform ${dur}ms ${EASE}`,
          pointerEvents: 'none',
          textShadow: '0 2px 26px rgba(16,16,16,0.95)',
        }}
      >
        {focused ? (
          <>
            {/* 스타일 2줄 */}
            <div
              style={{
                fontFamily: typography.family,
                fontSize: 'clamp(0.86rem, 1.46vw, 1.6rem)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.45,
                color: colors.text.primary,
              }}
            >
              {DUELIST_STYLES[focus].school}
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: typography.family,
                fontSize: 'clamp(0.74rem, 1.15vw, 1.26rem)',
                fontWeight: 400,
                lineHeight: 1.7,
                color: colors.text.secondary,
              }}
            >
              {DUELIST_STYLES[focus].style}
            </div>

            {/* 인용 */}
            <div
              style={{
                marginTop: 'clamp(12px, 2.2vh, 26px)',
                paddingLeft: 'clamp(10px, 1vw, 16px)',
                borderLeft: `2px solid ${colors.red}`,
                fontFamily: typography.family,
                fontSize: 'clamp(0.78rem, 1.25vw, 1.36rem)',
                fontWeight: 500,
                lineHeight: 1.6,
                color: colors.text.primary,
              }}
            >
              {DUELIST_STYLES[focus].quote}
            </div>

            {/* 상세 미디어 슬롯. 실제 영상이 없어 다크 플레이스홀더로 자리만 잡는다. */}
            <div
              style={{
                marginTop: 'clamp(14px, 2.6vh, 30px)',
                aspectRatio: '16 / 9',
                borderRadius: 14,
                background: `linear-gradient(155deg, ${colors.raised} 0%, ${colors.deep} 62%, ${colors.black} 100%)`,
                boxShadow: `inset 0 0 0 1px ${colors.line.faint}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: 'clamp(0.62rem, 0.94vw, 1rem)',
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  color: colors.text.faint,
                }}
              >
                {DUELIST.mediaPending}
              </span>
            </div>
          </>
        ) : null}
      </div>

      <StepDots count={STATES} active={state} />
    </div>
  );
}
