// 유파별 AI (순환 캐러셀). 상단 표기 없음.
//
// **3개 유파를 중앙 기준으로 놓고, 중앙 카드를 무대처럼 크게 강조한다.**
//   방향키를 누르면 중앙 카드가 옆으로 나오고 다음 유파가 중앙으로 온다(ver1→ver2→ver3, 순환식).
//   상태 0/1/2 = 각 유파가 중앙. 경계(0에서 위 / 2에서 아래)에서만 셸이 섹션을 옮긴다.
//   **상세 영상/블러/상세 패널 없음.** 중앙(강조) 카드에 유파의 스타일 한 줄 + 인용 한 줄을 얹는다.
//   옆 카드는 작게·흐리게(opacity만, 블러 없음). transform과 opacity 위주.
//
// --- 좌표/캐러셀 출처 ---
// 원형 최단거리 circDist와 락 기반 한 칸 스텝은 포폴 `client/src/components/work/StackCarousel.jsx`
// (43~47행 circDist, 83~88행 lock)에서 가져왔다. 안무(가로 3슬롯 중앙 강조)는 이 섹션에 맞게 새로 짰다.

import { useEffect, useRef, useState } from 'react';
import { colors, typography, grid, whiteA } from '../tokens.js';
import { DUELIST, DUELIST_STYLES } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import { SlideHeader } from '../components/Bits.jsx';

const N = DUELIST_STYLES.length; // 3
const STATES = N; // 상태 0/1/2 = 각 유파가 중앙(순환)

// 슬롯 위치(중앙 기준 대칭). d = 원형 최단거리. 중앙 50%, 우 75%, 좌 25%.
const slotX = (d) => 50 + d * 25;
const FOCUS_SCALE = 1.08; // 중앙 무대 강조
const SIDE_SCALE = 0.78; // 옆 카드는 물러난다
const SIDE_OPACITY = 0.5; // 흐리게(블러 아님, opacity만)
// 프라이머리 네이비(colors.navy #263E5F = rgb 38,62,95)의 반투명. 옆 유파 배지 글래스에 쓴다.
const NAVY_GLASS = 'rgba(38, 62, 95, 0.72)';

// Ver 배지: 글래스(반투명 + backdrop blur + 테두리 빛). 중앙=라이트 글래스(잉크 글자),
// 옆(비중앙)=프라이머리 네이비 글래스(흰 글자)로 강조.
function GlassBadge({ text, center }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: 999,
        fontFamily: typography.family,
        fontSize: 'clamp(0.66rem, 1vw, 0.8rem)',
        fontWeight: 700,
        letterSpacing: '0.2em',
        backdropFilter: 'blur(10px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.2)',
        background: center ? whiteA(0.5) : NAVY_GLASS,
        border: `1px solid ${center ? whiteA(0.7) : whiteA(0.28)}`,
        boxShadow: `inset 0 1px 0 ${whiteA(0.4)}`, // 상단 림(테두리 빛)
        color: center ? colors.text.primary : colors.white,
      }}
    >
      {text}
    </span>
  );
}

// StackCarousel 43~47행 그대로. 원형 최단거리.
const circDist = (i, activePos, n) => {
  let d = ((((i - activePos) % n) + n) % n);
  if (d > n / 2) d -= n;
  return d;
};

const EASE = 'cubic-bezier(0.22,1,0.36,1)';
const DUR = 620;
const trans = `transform ${DUR}ms ${EASE}, opacity ${DUR}ms ease`;

export default function S5Duelist({ registerHandler, registerEnter }) {
  const [state, setState] = useState(0);
  const stateRef = useRef(0);
  const lockRef = useRef(false); // StackCarousel 83~88행의 락

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const go = (dir) => {
      const next = stateRef.current + dir;
      if (next < 0 || next >= STATES) return false; // 경계 → 셸이 S4/S6로 옮긴다
      stateRef.current = next;
      setState(next);
      if (!reduced) {
        lockRef.current = true;
        setTimeout(() => { lockRef.current = false; }, DUR);
      }
      return true;
    };

    const handleStep = (dir) => {
      if (lockRef.current) return true; // 전환 중 입력은 삼킨다
      return go(dir);
    };
    const handleEnter = (dir) => {
      const next = dir > 0 ? 0 : STATES - 1; // 아래로 진입 ver1, 위로 진입 ver3
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

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.bg }}>
      {/* 상단 2단 헤더(항상 표시). 아이브로우 좌 네이비 | 헤드라인 + 서브 우. PV 타이포. */}
      <div style={{ position: 'absolute', left: grid.marginX, right: grid.marginX, top: grid.marginTop, zIndex: 6, pointerEvents: 'none' }}>
        <SlideHeader
          eyebrow={{ en: DUELIST.label.en, ko: DUELIST.label.ko, tone: colors.navy }}
          headline={DUELIST.headline}
          sub={DUELIST.sub}
        />
      </div>

      {/* 카드 3장. 중앙(active)은 크게 강조 + 스타일/인용, 옆은 작게 흐리게. */}
      {DUELIST_STYLES.map((s, i) => {
        const d = circDist(i, state, N);
        const isCenter = d === 0;
        const x = slotX(d);
        const scale = isCenter ? FOCUS_SCALE : SIDE_SCALE;
        const z = 100 - Math.abs(d) * 10; // 중앙이 위, 옆은 아래(감싸는 카드는 중앙 뒤로 지난다)

        return (
          <div
            key={s.key}
            style={{
              position: 'absolute',
              left: `${x}%`,
              // 바닥에 안 붙게 위로. 카드를 키워(사진 확대) 인물은 상단, 캡션은 하단으로 자리를 가른다.
              bottom: 'clamp(36px, 6vh, 84px)',
              height: '64%',
              width: 'clamp(150px, 20vw, 400px)',
              zIndex: z,
              opacity: isCenter ? 1 : SIDE_OPACITY,
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: 'center bottom',
              transition: trans,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          >
            {/* 인물. **하단 캡션 영역을 비워 위로 올린다**(라벨과 안 겹침). 그 안에서 바닥 정렬 contain.
                중앙은 스타일/인용까지 있어 더 비운다. */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: isCenter ? 'clamp(134px, 19.5vh, 215px)' : 'clamp(86px, 11.6vh, 144px)' }}>
              <AssetImage src={s.img} fit="contain" position="center bottom" />
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: isCenter ? 'clamp(16px, 2.6vh, 34px)' : 'clamp(28px, 4vh, 50px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'clamp(6px, 1vh, 12px)',
                textAlign: 'center',
                padding: '0 clamp(8px, 1vw, 18px)',
              }}
            >
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: typography.body.size,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: colors.text.primary,
                  whiteSpace: 'nowrap',
                }}
              >
                {s.school}
              </span>
              <GlassBadge text={s.badge} center={isCenter} />

              {/* 중앙 카드만: 스타일 한 줄 + 인용 한 줄. */}
              {isCenter && (
                <>
                  <span
                    style={{
                      marginTop: 'clamp(2px, 0.6vh, 8px)',
                      fontFamily: typography.family,
                      fontSize: typography.body.size,
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: colors.text.secondary,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {s.style}
                  </span>
                  <span
                    style={{
                      fontFamily: typography.family,
                      fontSize: typography.body.size,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      color: colors.text.primary,
                      wordBreak: 'keep-all',
                    }}
                  >
                    “{s.quote}”
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
