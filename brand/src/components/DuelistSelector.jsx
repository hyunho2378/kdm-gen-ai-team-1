// 유파 셀렉션. 3카드가 제자리에서 포커스를 주고받는다.
//
// **메커니즘 출처: 팀 포폴 `hyunho2378/26-portfolio-hyunho`의
// `client/src/components/work/StackCarousel.jsx`.** 실제 파일을 clone해 읽고 가져왔다(DESIGN 15절).
// 가져온 것 다섯.
//   1. `circDist(i, activePos, N)` 원형 최단거리. 모듈로로 감아 양끝이 반대편으로 이어진다
//   2. 거리 기반 dim 계산(중앙 0, 멀수록 어둡게). 원본의 `Math.min(0.35, absD * 0.12)` 형태를 이 배치에 맞춰 다시 잡았다
//   3. z 정렬 `100 - absD`
//   4. 락 기반 한 칸 스텝(`go(dir)` + `lockRef` + 짧은 해제 타이머). 연타로 여러 칸이 밀리는 것을 막는다
//   5. 드래그 판별(6px에서 이동으로 보고, 30px 넘으면 스텝, 아니면 클릭) 과 `touchAction: 'pan-y'`
//
// **안 가져온 것.** 아치 회전(ARC_ANGLE, ARC_RADIUS, transformOrigin)과 휠 핸들러다.
// 원본은 부채꼴 캐러셀이라 안무가 다르고, **brand는 일반 스크롤 사이트라 휠을 가로채면 안 된다.**
// 세로 스크롤은 Lenis가 그대로 쥔다. 여기서 `wheel`에 `preventDefault`를 걸지 않는다.
//
// 이 페이지는 이미지와 DOM과 CSS로 충분하다. **three.js 컨텍스트를 만들지 않는다.**

import { useCallback, useEffect, useRef, useState } from 'react';
import { colors, glow, motion, radius, spacing, typography, weight } from '../tokens.js';
import { DUELISTS } from '../copy.js';

// 규약 경로. 파일을 이 자리에 놓으면 코드 수정 없이 뜬다.
// **지금 brand public에 없다.** 없으면 아래 onError가 다크 플레이스홀더로 내려앉는다
const IMAGES = {
  sabre: '/images/duelist/style-1.png',
  epee: '/images/duelist/style-2.png',
  hungarian: '/images/duelist/style-3.png',
};

// 비활성 카드 연출. reduced motion에서는 밝기만 남기고 전부 끈다
const INACTIVE = { scale: 0.9, blur: 5, brightness: 0.6 };
const STEP_LOCK_MS = 90;   // 원본 락 해제 시간
const DRAG_MOVE_PX = 6;    // 이만큼 움직이면 클릭이 아니라 드래그로 본다
const DRAG_STEP_PX = 30;   // 이만큼 넘으면 한 칸 넘긴다

/** 원형 최단거리(StackCarousel 이식). 카드 i가 활성에서 좌우로 얼마나 떨어졌는가. */
function circDist(i, activePos, N) {
  let d = ((((i - activePos) % N) + N) % N);
  if (d > N / 2) d -= N;
  return d;
}

export default function DuelistSelector({ reduced }) {
  const cards = DUELISTS.cards;
  const N = cards.length;
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});
  const activeRef = useRef(active);
  activeRef.current = active;
  const lockRef = useRef(false);
  const drag = useRef({ active: false, startX: 0, dx: 0, moved: false, index: null });
  const cardRefs = useRef([]);
  const listRef = useRef(null);

  useEffect(() => () => { lockRef.current = false; }, []);

  /** 락 기반 한 칸 스텝(StackCarousel 이식). 연타로 여러 칸이 밀리지 않는다. */
  const go = useCallback((dir) => {
    if (lockRef.current) return;
    setActive((prev) => (((prev + dir) % N) + N) % N);
    lockRef.current = true;
    setTimeout(() => { lockRef.current = false; }, STEP_LOCK_MS);
  }, [N]);

  // 활성이 바뀌면 포커스도 따라간다. 키보드 사용자가 지금 어디에 있는지 잃지 않게
  const focusActive = useCallback((i) => {
    cardRefs.current[i]?.focus({ preventScroll: true });
  }, []);

  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = (((activeRef.current - 1) % N) + N) % N;
      go(-1);
      focusActive(next);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (activeRef.current + 1) % N;
      go(1);
      focusActive(next);
    }
  }

  // 스와이프. 세로 제스처는 건드리지 않는다(touchAction pan-y가 세로를 브라우저에 넘긴다)
  function onPointerDown(e) {
    const cardEl = e.target.closest('[data-card-index]');
    drag.current = {
      active: true,
      startX: e.clientX,
      dx: 0,
      moved: false,
      index: cardEl ? Number(cardEl.getAttribute('data-card-index')) : null,
    };
  }

  function onPointerMove(e) {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > DRAG_MOVE_PX) drag.current.moved = true;
    drag.current.dx = dx;
  }

  function onPointerUp() {
    if (!drag.current.active) return;
    const { dx, moved, index } = drag.current;
    drag.current.active = false;

    if (moved && Math.abs(dx) > DRAG_STEP_PX) {
      // 왼쪽으로 밀면 다음 유파가 온다
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (!moved && index !== null) {
      // 클릭. 비활성 카드를 누르면 그 카드가 활성이 된다
      setActive(index);
      focusActive(index);
    }
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={DUELISTS.selection.guide}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: spacing.unit * 2,
        // **세로는 브라우저에 넘긴다.** 가로 제스처만 우리가 읽는다. Lenis 스크롤이 그대로 산다
        touchAction: 'pan-y',
        outline: 'none',
      }}
    >
      {cards.map((d, i) => {
        const dist = Math.abs(circDist(i, active, N));
        const isActive = dist < 0.5;
        // 거리 기반 dim(StackCarousel 이식). 3장 고정 배치라 계수만 이 화면에 맞췄다
        const dim = isActive ? 0 : Math.min(0.4, dist * 0.4);
        const z = Math.round(100 - dist);

        // 비활성만 blur를 건다. filter는 비싸고 활성 카드는 선명해야 한다
        const filter = isActive || reduced
          ? 'none'
          : `blur(${INACTIVE.blur}px) brightness(${INACTIVE.brightness})`;
        const scale = isActive || reduced ? 1 : INACTIVE.scale;

        return (
          <div
            key={d.key}
            ref={(el) => { cardRefs.current[i] = el; }}
            role="option"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            data-card-index={i}
            data-active={isActive ? 'true' : 'false'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActive(i);
              }
            }}
            style={{
              position: 'relative',
              zIndex: z,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.unit * 1.5,
              minHeight: 44,
              padding: spacing.unit * 3,
              borderRadius: radius.lg,
              // **테두리를 걷어냈다(REBOOT_PLAN 2.1).** 선택 상태는 글로우와 배율과 흐림이 낸다.
              // 셋이 함께 움직이므로 색 단독 구분이 아니다(DESIGN 13절)
              background: colors.bg.raised,
              boxShadow: isActive && !reduced ? glow.red : 'none',
              cursor: 'pointer',
              transform: `scale(${scale})`,
              filter,
              // 원본의 전환 패턴. DESIGN 7절 easeOut과 같은 계열이다
              transition: reduced
                ? 'none'
                : `transform 560ms ${motion.easeOut}, filter 560ms ${motion.easeOut}, opacity 560ms ${motion.easeOut}, box-shadow 240ms ${motion.easeOut}`,
              opacity: 1 - dim,
            }}
          >
            {/* 인물. 파일이 없으면 다크 플레이스홀더로 내려앉는다(화면을 비우지 않는다).
                **높이를 뷰포트로 묶는다.** 3대4 비율로 두었더니 카드가 900px가 넘어
                유파명과 스타일과 인용이 화면 밖으로 밀렸다(실측 스크린샷). 선택 화면은 한눈에 들어와야 한다 */}
            <div
              style={{
                height: 'clamp(180px, 24vh, 300px)',
                borderRadius: radius.md,
                // 테두리를 걷어냈다. 사진이 들어차는 자리라 판은 남는다
                background: colors.bg.deep,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {failed[d.key] ? (
                // 바로 아래에 유파명이 또 나오므로 여기서는 버전만 낸다. 같은 문장을 두 번 읽히지 않는다
                <span style={{ fontFamily: typography.family, fontSize: typography.caption.size, color: colors.text.dim }}>
                  {d.ver}
                </span>
              ) : (
                <img
                  src={IMAGES[d.key]}
                  alt=""
                  onError={() => setFailed((f) => ({ ...f, [d.key]: true }))}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
            </div>

            <span
              style={{
                fontFamily: typography.family,
                fontSize: typography.caption.size,
                letterSpacing: typography.hud.tracking,
                color: colors.red.light,
              }}
            >
              {d.ver} {d.trait}
            </span>

            <span
              data-role="name"
              style={{
                fontFamily: typography.family,
                fontSize: typography.heading.size,
                // **색과 blur만으로 활성을 구분하지 않는다.** 굵기도 함께 올린다(DESIGN 13절)
                fontWeight: isActive ? 700 : typography.heading.weight,
                color: colors.text.primary,
                wordBreak: 'keep-all',
              }}
            >
              {d.name}
            </span>

            <span
              style={{
                fontFamily: typography.family,
                fontSize: typography.body.size,
                lineHeight: typography.body.leading,
                color: isActive ? colors.text.secondary : colors.text.dim,
                wordBreak: 'keep-all',
              }}
            >
              {d.style}
            </span>

            <blockquote
              style={{
                margin: 0,
                paddingLeft: spacing.unit * 1.5,
                // **인용 왼쪽 선을 걷어냈다(REBOOT_PLAN 2.1).** 들여쓰기와 기울임이 인용을 낸다
                fontFamily: typography.family,
                fontSize: typography.caption.size,
                lineHeight: 1.6,
                color: isActive ? colors.text.secondary : colors.text.dim,
                wordBreak: 'keep-all',
              }}
            >
              {d.quote}
            </blockquote>

            {/* 활성 카드에만 선다. **동작이 없으므로 비활성 모양이고 사유를 옆에 적는다.**
                눌러도 아무 일이 없는 버튼이 제일 나쁜 실패다(ArenaCta와 같은 규율) */}
            {isActive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.unit * 1.5, flexWrap: 'wrap', marginTop: 'auto' }}>
                <span aria-disabled="true" style={enterStyle}>
                  {DUELISTS.selection.enter}
                </span>
                <span style={{ fontFamily: typography.family, fontSize: typography.caption.size, color: colors.text.dim }}>
                  {DUELISTS.selection.pending}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const enterStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '10px 24px',
  borderRadius: radius.pill,
  border: `1px solid ${colors.line.default}`,
  background: 'transparent',
  color: colors.text.dim,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  fontWeight: weight.semibold,
  lineHeight: 1,
  cursor: 'not-allowed',
};
