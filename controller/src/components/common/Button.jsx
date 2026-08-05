// common/Button.jsx — 강릉페이 Button 이식. MD3 4종 위계 + 플랫폼 분기(iOS HIG / Android MD3).
// **색만 VORTEX 다크로.** filled=red 채움(주 CTA, 화면당 1개), tonal=red 저알파, outlined, text.
//
// Strategy: 화면당 강조 1개 원칙(주 액션만 filled).
// Nielsen: #4 일관성과 표준(위계 고정), #6 오류 예방(disabled는 사유 병기가 사용 규율).
// Shneiderman: #2 숙련자 지름길(위계로 시선 유도).
//
// iOS: 높이 52/48/40, radius 12, filled에 red glow. Android: 48/48/40, radius pill(999), glow 없음.

import { colors, glow, ig, radius, typography } from '../../tokens.js';
import { usePlatform } from '../../hooks/usePlatform.js';

export default function Button({
  variant = 'filled',
  onClick,
  disabled = false,
  fullWidth = true,
  size = 'lg', // 'lg'(하단 CTA) | 'md'(보조) | 'sm'(인라인)
  children,
  style = {},
  ...rest
}) {
  const isAndroid = usePlatform() === 'android';

  const heightMap = isAndroid ? { lg: 48, md: 48, sm: 40 } : { lg: 52, md: 48, sm: 40 };
  const height = heightMap[size] || heightMap.lg;
  const r = isAndroid ? radius.pill : radius.button;
  const fontSize = size === 'sm' ? ig.subhead.size : ig.body.size;

  const variantStyle = (() => {
    if (disabled) {
      return {
        backgroundColor: variant === 'text' || variant === 'outlined' ? 'transparent' : colors.bg.raised,
        color: colors.text.dim,
        border: variant === 'outlined' ? `1px solid ${colors.line.default}` : 'none',
        boxShadow: 'none',
      };
    }
    switch (variant) {
      case 'tonal':
        return { backgroundColor: colors.red.tonal, color: colors.red.light, border: 'none', boxShadow: 'none' };
      case 'outlined':
        return { backgroundColor: 'transparent', color: colors.text.primary, border: `1px solid ${colors.line.strong}`, boxShadow: 'none' };
      case 'text':
        return { backgroundColor: 'transparent', color: colors.red.light, border: 'none', boxShadow: 'none' };
      case 'filled':
      default:
        // 주 CTA. 다크 무대라 그림자 대신 red glow가 강조를 만든다(Android는 톤이라 생략)
        return { backgroundColor: colors.red.fill, color: colors.text.onFill, border: 'none', boxShadow: isAndroid ? 'none' : glow.red };
    }
  })();

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: `${height}px`,
        minHeight: 44,
        borderRadius: r,
        fontSize,
        fontWeight: 600,
        letterSpacing: ig.body.tracking,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: typography.family,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: fullWidth ? 0 : '0 20px',
        transition: 'background-color 150ms, opacity 150ms, transform 120ms',
        touchAction: 'manipulation',
        ...variantStyle,
        ...style,
      }}
      onPointerDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
