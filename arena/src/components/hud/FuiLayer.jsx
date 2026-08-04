// 책임: XR 글라스의 홀로그램 정보 층. 월드 좌표에 서는 DOM 연출을 그린다.
//
// 시각 문법은 팔각형 프레임과 같다. 팔각, steel 얇은 라인, red.light 액센트, hud 타이포.
// 셋이 산다. 되찌르기 링(D4), 명중 마커(D5), 데미지 인디케이터(D5).
//
// 캔버스 밖 DOM이므로 MOTION 규율을 그대로 지킨다. **transform과 opacity만** 애니메이션한다.
// 좌표는 렌더러가 투영해 준 CSS 픽셀이다(ThreeRenderer.projectToScreen).

import { useEffect, useRef, useState } from 'react';
import { colors, motion, typography, zIndex } from '../../tokens.js';
import { OUTCOME, OWNER, RULES } from '../../game/judge.js';
import { cutSize, octagonPoints, useViewport } from './frame.js';

const RING_R = 34;
const MARK_R = 46;
const ENTER_MS = 150;
const HOLD_MS = motion.duration.judge;

/**
 * 임팩트 증폭 (E3). D5 팔각 레티클은 그대로 두고 그 위에 사건성을 얹는다.
 *
 * **확산 링은 DOM으로 간다.** 캔버스로 옮기면 패스와 드로우콜이 늘고 후처리 순서까지 걸린다.
 * 여기서는 transform과 opacity만 만지므로 합성만 돌고 레이아웃과 페인트가 안 생긴다(MOTION 11절).
 *
 * **r을 애니메이션하지 않는다.** SVG 속성을 흔들면 매 프레임 도형을 다시 그린다.
 * 링은 최종 크기로 한 번 그려 두고 래퍼의 scale만 키운다.
 */
const SHOCK_OUTER_R = 96;
const SHOCK_INNER_R = 62;
const SHOCK_MS = 280;
const FLASH_R = 34;
const FLASH_MS = 150;
const PULSE_MS = 380;

/** 팔각형 꼭짓점. 프레임과 같은 도형 언어를 작은 크기로 되풀이한다. */
function octagon(r) {
  const pts = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** 마운트 다음 프레임에 한 번 켜지는 스위치. CSS transition을 태우는 최소 장치다. */
function useFlip(delayMs = 0) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (delayMs <= 0) {
      const raf = requestAnimationFrame(() => setOn(true));
      return () => cancelAnimationFrame(raf);
    }
    const t = setTimeout(() => setOn(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return on;
}

/**
 * 확산 링 (E3). 명중 지점에서 퍼지며 사라진다.
 * 최종 크기로 그려 둔 원을 scale로 키우고 opacity로 지운다. 둘 다 합성 전용 속성이다.
 */
function Shock({ r, color, width, from, delay = 0, dur = SHOCK_MS }) {
  const on = useFlip(delay);
  return (
    <div
      style={{
        position: 'absolute',
        left: -r,
        top: -r,
        willChange: 'transform, opacity',
        transform: `scale(${on ? 1 : from})`,
        opacity: on ? 0 : 0.95,
        transition: `transform ${dur}ms ${motion.easeOut}, opacity ${dur}ms ${motion.easeOut}`,
      }}
    >
      <svg width={r * 2} height={r * 2}>
        <circle cx={r} cy={r} r={r - width} fill="none" stroke={color} strokeWidth={width} />
      </svg>
    </div>
  );
}

/** 흰 임팩트 플래시 (E3). 명중 코어와 같은 흰색이고 가장 짧다. 사건의 첫 프레임을 때린다. */
function Flash() {
  const on = useFlip();
  return (
    <div
      style={{
        position: 'absolute',
        left: -FLASH_R,
        top: -FLASH_R,
        willChange: 'transform, opacity',
        transform: `scale(${on ? 1.6 : 0.45})`,
        opacity: on ? 0 : 0.9,
        transition: `transform ${FLASH_MS}ms ${motion.easeOut}, opacity ${FLASH_MS}ms ${motion.easeOut}`,
      }}
    >
      <svg width={FLASH_R * 2} height={FLASH_R * 2}>
        <circle cx={FLASH_R} cy={FLASH_R} r={FLASH_R} fill={colors.trail.hit} />
      </svg>
    </div>
  );
}

/**
 * 피격 비네트 펄스 (E3). 화면 가장자리가 붉게 한 번 뛴다.
 * **파란 연출을 쓰지 않는다. 경고의 레드다**(DESIGN 2절).
 * 그라디언트는 고정이고 opacity만 움직인다. 들어올 때 빠르고 빠질 때 느리다.
 */
function DamagePulse() {
  const [peak, setPeak] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setPeak(true));
    const t = setTimeout(() => setPeak(false), 110);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        // 42퍼센트에서 시작하면 붉은 기가 화면 중앙까지 올라와 상대와 판정 문구를 덮는다(실측).
        // 58퍼센트로 죄어 가장자리 띠로만 읽히게 했다
        background: `radial-gradient(ellipse at center, transparent 58%, ${colors.red.glow} 100%)`,
        opacity: peak ? 1 : 0,
        transition: `opacity ${peak ? 90 : PULSE_MS}ms ${motion.easeOut}`,
      }}
    />
  );
}

/** 등장과 이탈을 한 번씩만 태우는 스위치. 유지 시간이 지나면 스스로 꺼진다. */
function useLifecycle(holdMs) {
  const [phase, setPhase] = useState('in');
  useEffect(() => {
    const raf = requestAnimationFrame(() => setPhase('hold'));
    const t = setTimeout(() => setPhase('out'), holdMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [holdMs]);
  return phase;
}

/**
 * 되찌르기 링(D4). 패리 지점에 서서 600ms 동안 줄어든다.
 * 줄어드는 팔각형이 곧 남은 시간이다. 이 안에 찌르면 2점이다.
 */
function RiposteRing({ shot, reduced }) {
  const scaleRef = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    let anim = 0;
    const t0 = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - t0) / RULES.RIPOSTE_WINDOW_MS);
      if (scaleRef.current) scaleRef.current.style.transform = `scale(${(1 - t * 0.62).toFixed(3)})`;
      if (t < 1) anim = requestAnimationFrame(tick);
    }
    if (!reduced) anim = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(anim);
    };
  }, [reduced]);

  return (
    <div
      style={{
        position: 'absolute',
        left: shot.x,
        top: shot.y,
        opacity: shown ? 1 : 0,
        transition: `opacity ${ENTER_MS}ms ${motion.easeOut}`,
      }}
    >
      <div ref={scaleRef} style={{ position: 'absolute', left: -RING_R, top: -RING_R, willChange: 'transform' }}>
        <svg width={RING_R * 2} height={RING_R * 2}>
          <g transform={`translate(${RING_R} ${RING_R})`}>
            <polygon points={octagon(RING_R - 3)} fill="none" stroke={colors.steel.mid} strokeWidth="1.5" />
            <polygon points={octagon(RING_R - 11)} fill="none" stroke={colors.red.light} strokeWidth="2" opacity="0.9" />
          </g>
        </svg>
      </div>
      <Label x={RING_R + 8} y={-9} tone={colors.red.light} text="되찌르기" />
    </div>
  );
}

/**
 * 명중 마커(D5). 내가 득점한 지점에 팔각 레티클이 선다.
 * 팔각 외곽 + 과녁 링 2겹 + 부위 라벨 + 점수 팝업. JUDGE 안에 이탈한다.
 */
function HitMarker({ shot, reduced }) {
  const phase = useLifecycle(HOLD_MS - ENTER_MS);
  const enter = phase !== 'in';
  const leave = phase === 'out';
  // reduced에서는 크기 변화를 빼고 페이드만 남긴다(11절 분기)
  const scale = reduced ? 1 : enter ? 1 : 1.35;

  return (
    <div
      style={{
        position: 'absolute',
        left: shot.x,
        top: shot.y,
        opacity: leave ? 0 : enter ? 1 : 0,
        transform: `scale(${leave ? 1.12 : scale})`,
        transformOrigin: '0 0',
        transition: `opacity ${ENTER_MS}ms ${motion.easeOut}, transform ${ENTER_MS}ms ${motion.easeOut}`,
      }}
    >
      <div style={{ position: 'absolute', left: -MARK_R, top: -MARK_R }}>
        <svg width={MARK_R * 2} height={MARK_R * 2}>
          <g transform={`translate(${MARK_R} ${MARK_R})`}>
            <polygon points={octagon(MARK_R - 3)} fill="none" stroke={colors.steel.mid} strokeWidth="1.5" />
            <circle r={MARK_R - 16} fill="none" stroke={colors.steel.shadow} strokeWidth="1" />
            <circle r={MARK_R - 28} fill="none" stroke={colors.red.light} strokeWidth="1.5" opacity="0.9" />
            {/* 코너 꺾쇠. 프레임과 같은 액센트 문법 */}
            {[0, 90, 180, 270].map((deg) => (
              <path
                key={deg}
                d={`M ${MARK_R - 10} -7 L ${MARK_R - 3} 0 L ${MARK_R - 10} 7`}
                transform={`rotate(${deg})`}
                fill="none"
                stroke={colors.red.light}
                strokeWidth="2"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* E3 임팩트. reduced에서는 링과 플래시를 빼고 정적 마커만 남긴다(11절 분기) */}
      {reduced ? null : (
        <>
          <Flash />
          <Shock r={SHOCK_INNER_R} color={colors.red.light} width={2.5} from={0.3} />
          <Shock r={SHOCK_OUTER_R} color={colors.red.light} width={1.5} from={0.28} delay={70} />
        </>
      )}

      {/* 점수는 pop으로 들어온다. 라벨 자체를 키우지 않고 래퍼 transform만 쓴다 */}
      <ScorePop points={shot.points} reduced={reduced} />
      <Label x={MARK_R + 10} y={2} tone={colors.text.secondary} text={shot.part} />
    </div>
  );
}

/** 점수 팝업 (E3). scale 0.9 → 1.0. transform만 만진다(MOTION 4절 scale(0) 금지). */
function ScorePop({ points, reduced }) {
  const on = useFlip();
  return (
    <div
      style={{
        position: 'absolute',
        left: MARK_R + 10,
        top: -24,
        transformOrigin: '0 50%',
        transform: `scale(${reduced || on ? 1 : 0.9})`,
        transition: reduced ? 'none' : `transform ${ENTER_MS}ms ${motion.easeOut}`,
      }}
    >
      <Label x={0} y={0} tone={colors.red.light} text={`+${points}`} big />
    </div>
  );
}

/**
 * 데미지 인디케이터(D5). 내가 맞았을 때.
 * **파란 연출을 쓰지 않는다.** 팔각 프레임 가장자리에서 맞은 방향 변이 red.light로 점등한다.
 * 경고의 레드이므로 색 규칙에 맞는다.
 */
function DamageEdge({ shot, w, h, reduced }) {
  const phase = useLifecycle(HOLD_MS - ENTER_MS);
  const on = phase === 'hold';

  const pts = octagonPoints(w, h);
  // 화면 중앙에서 피격 지점으로 향하는 방향과 가장 잘 맞는 변을 고른다
  const cx = w / 2;
  const cy = h / 2;
  const vx = shot.x - cx;
  const vy = shot.y - cy;
  const len = Math.hypot(vx, vy) || 1;
  let best = 0;
  let bestDot = -Infinity;
  for (let i = 0; i < 8; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % 8];
    const mx = (a[0] + b[0]) / 2 - cx;
    const my = (a[1] + b[1]) / 2 - cy;
    const m = Math.hypot(mx, my) || 1;
    const dot = (vx / len) * (mx / m) + (vy / len) * (my / m);
    if (dot > bestDot) {
      bestDot = dot;
      best = i;
    }
  }
  const a = pts[best];
  const b = pts[(best + 1) % 8];
  const cut = cutSize(w);

  return (
    <>
      {/* 화면 가장자리가 붉게 한 번 뛴다. reduced에서는 끈다 */}
      {reduced ? null : <DamagePulse />}

      {/* 맞은 자리에 붉은 링. 화면 밖이면 그리지 않는다(프레임 세그먼트가 방향을 대신 진다) */}
      {shot.visible ? (
        <div style={{ position: 'absolute', left: shot.x, top: shot.y }}>
          <div
            style={{
              position: 'absolute',
              left: -RING_R,
              top: -RING_R,
              opacity: on ? 0.9 : 0,
              transition: `opacity ${ENTER_MS}ms ${motion.easeOut}`,
            }}
          >
            <svg width={RING_R * 2} height={RING_R * 2}>
              <g transform={`translate(${RING_R} ${RING_R})`}>
                <polygon points={octagon(RING_R - 4)} fill="none" stroke={colors.red.light} strokeWidth="2" />
              </g>
            </svg>
          </div>
          {reduced ? null : <Shock r={SHOCK_INNER_R} color={colors.red.light} width={2} from={0.32} />}
        </div>
      ) : null}

      <svg
        width={w}
        height={h}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: on ? 1 : 0,
          transition: `opacity ${reduced ? ENTER_MS : 90}ms ${motion.easeOut}`,
        }}
      >
        <line
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          stroke={colors.red.light}
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (a[0] + b[0]) / 2,
          top: (a[1] + b[1]) / 2,
          transform: `translate(${a[0] < w / 2 ? cut : -cut - 60}px, -8px)`,
          opacity: on ? 1 : 0,
          transition: `opacity ${ENTER_MS}ms ${motion.easeOut}`,
        }}
      >
        <Label x={0} y={0} tone={colors.red.light} text={`피격 ${shot.part}`} />
      </div>
    </>
  );
}

function Label({ x, y, tone, text, big = false }) {
  return (
    <span
      style={{
        position: 'absolute',
        left: x,
        top: y,
        whiteSpace: 'nowrap',
        fontFamily: typography.family,
        fontSize: big ? typography.hud.size : typography.caption.size,
        fontWeight: typography.hud.weight,
        letterSpacing: typography.hud.tracking,
        lineHeight: 1,
        color: tone,
      }}
    >
      {text}
    </span>
  );
}

export default function FuiLayer({ shot, reduced = false }) {
  const { w, h } = useViewport();
  if (!shot) return null;

  const scored = shot.outcome === OUTCOME.HIT || shot.outcome === OUTCOME.RIPOSTE;
  const mine = shot.owner === OWNER.ME;
  // 데미지 표시는 프레임 가장자리에 서므로 피격 지점이 화면 밖이어도 그린다
  const needsPoint = !(scored && !mine);
  if (needsPoint && !shot.visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: zIndex.sticky, pointerEvents: 'none' }}
    >
      {shot.outcome === OUTCOME.PARRY ? <RiposteRing key={shot.id} shot={shot} reduced={reduced} /> : null}
      {scored && mine ? <HitMarker key={shot.id} shot={shot} reduced={reduced} /> : null}
      {scored && !mine ? <DamageEdge key={shot.id} shot={shot} w={w} h={h} reduced={reduced} /> : null}
    </div>
  );
}
