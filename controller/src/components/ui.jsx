// 책임: controller 공용 조각. COMPONENTS.md 공통 스펙을 이 앱에 구현한 것이다.
// 색과 간격은 전부 tokens 경유다. HEX를 적지 마라.

import { ArrowLeft } from 'lucide-react';
import { colors, ig, motion, radius, typography } from '../tokens.js';
import { usePlatform } from '../hooks/usePlatform.js';

/**
 * 뒤로가기 탑바(강릉페이 TopAppBarBack 이식, 색만 VORTEX). 라우터 대신 onBack 콜백을 쓴다.
 * Nielsen: #3 사용자 제어와 자유(항상 나갈 길). 아이콘은 lucide만(이모지 금지).
 */
export function TopBarBack({ title, onBack }) {
  const isAndroid = usePlatform() === 'android';
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 4,
        paddingRight: 16,
        background: colors.bg.base,
        borderBottom: `1px solid ${colors.line.default}`,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          touchAction: 'manipulation',
        }}
      >
        <ArrowLeft size={22} color={colors.text.primary} strokeWidth={2} />
      </button>
      <span
        style={{
          flex: 1,
          textAlign: isAndroid ? 'left' : 'center',
          marginLeft: isAndroid ? 8 : 0,
          marginRight: isAndroid ? 0 : 44,
          fontSize: ig.callout.size,
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: typography.family,
        }}
      >
        {title}
      </span>
    </div>
  );
}

/** COMPONENTS.md ButtonPrimary. red.fill 배경, pill, press scale(0.97), 최소 44px. */
export function ButtonPrimary({ children, onPointerDown, onClick, style, ...rest }) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onClick={onClick}
      style={{
        minHeight: 52,
        padding: '14px 28px',
        borderRadius: radius.pill,
        border: 'none',
        background: colors.red.fill,
        color: colors.text.onFill,
        fontFamily: typography.family,
        fontSize: typography.body.size,
        fontWeight: 600,
        letterSpacing: typography.hud.tracking,
        transition: `transform ${motion.duration.press}ms ${motion.easeOut}`,
        touchAction: 'manipulation',
        ...style,
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/** COMPONENTS.md ButtonGhost. 투명 배경, line.strong 보더. */
export function ButtonGhost({ children, style, ...rest }) {
  return (
    <button
      type="button"
      style={{
        minHeight: 44,
        padding: '10px 20px',
        borderRadius: radius.pill,
        border: `1px solid ${colors.line.strong}`,
        background: 'transparent',
        color: colors.text.primary,
        fontFamily: typography.family,
        fontSize: typography.body.size,
        touchAction: 'manipulation',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/** COMPONENTS.md StatusChip. 상태 텍스트 라벨 필수(색 단독 구분 금지). */
export function StatusChip({ label, value, degraded = false }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px',
        borderRadius: radius.pill,
        background: colors.bg.raised,
        border: `1px solid ${colors.line.default}`,
        fontFamily: typography.family,
        fontSize: typography.caption.size,
        letterSpacing: typography.hud.tracking,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: colors.text.dim }}>{label}</span>
      <span style={{ color: degraded ? colors.red.light : colors.text.primary }}>{value}</span>
    </span>
  );
}

/** 화면 제목. 세로 390 기준이라 title 상한을 넘기지 않는다. */
export function Title({ children }) {
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: typography.family,
        fontSize: typography.heading.size,
        fontWeight: typography.heading.weight,
        letterSpacing: typography.heading.tracking,
        lineHeight: typography.heading.leading,
        color: colors.text.primary,
        wordBreak: 'keep-all',
        textAlign: 'center',
      }}
    >
      {children}
    </h1>
  );
}

export function Body({ children, tone }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: typography.family,
        fontSize: typography.body.size,
        lineHeight: typography.body.leading,
        color: tone ?? colors.text.secondary,
        wordBreak: 'keep-all',
        textAlign: 'center',
      }}
    >
      {children}
    </p>
  );
}

/**
 * 화면 골격. ScreenContainer(100dvh) 안에서 남은 공간을 채운다(flex:1).
 * 100vh 금지(iOS 주소창에서 흔들림)는 ScreenContainer가 100dvh로 이미 지킨다.
 */
export function Screen({ children, gap = 20, justify = 'center' }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: justify,
        gap,
        padding: '24px 20px',
        background: colors.bg.base,
      }}
    >
      {children}
    </div>
  );
}
