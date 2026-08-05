// common/Button.jsx
// 강릉페이 공통 버튼 — MD3 4종 위계 + 플랫폼 분기
//
// variant:
//   'filled'   — 주 CTA (primary[700] 채움)         [기존 대부분]
//   'tonal'    — 보조 강조 (primary[100] 연한 채움)
//   'outlined' — 보조 (테두리만)
//   'text'     — 3순위 (텍스트만)
//
// 플랫폼 분기:
//   iOS:     높이 52px, radius 12px(radiusButton), 그림자 O, 폰트 Apple SD Gothic Neo
//   Android: 높이 48px, radius 999(full, MD3 pill), 그림자 X(톤), 폰트 Noto Sans KR, touchMin 48
//
// props: { variant='filled', onClick, disabled, fullWidth=true, size='lg', children, style, ...rest }

import { colors, typography, layout, spacing, shadow } from '../../tokens/tokens'
import { usePlatform } from '../../hooks/usePlatform'

export default function Button({
    variant = 'filled',
    onClick,
    disabled = false,
    fullWidth = true,
    size = 'lg',          // 'lg'(하단 CTA) | 'md'(보조) | 'sm'(인라인)
    children,
    style = {},
    ...rest
}) {
    const platform = usePlatform()
    const isAndroid = platform === 'android'

    // 높이: iOS 52/48/40, Android 48/44/40 (MD3 터치 48dp 보장)
    const heightMap = isAndroid
        ? { lg: 48, md: 48, sm: 40 }
        : { lg: 52, md: 48, sm: 40 }
    const height = heightMap[size] || heightMap.lg

    // 모서리: iOS radiusButton(12), Android full(999, MD3 pill)
    const radius = isAndroid ? layout.radiusPill : layout.radiusButton

    // 폰트
    const fontFamily = isAndroid
        ? `'Noto Sans KR', ${typography.fontFamily}`
        : typography.fontFamily

    // 폰트 크기
    const fontSize = size === 'sm' ? typography.size.sm : typography.size.md

    // variant별 색상
    const variantStyle = (() => {
        if (disabled) {
            return {
                backgroundColor: variant === 'text' || variant === 'outlined' ? 'transparent' : colors.gray[200],
                color: colors.gray[400],
                border: variant === 'outlined' ? `1px solid ${colors.gray[200]}` : 'none',
                boxShadow: 'none',
            }
        }
        switch (variant) {
            case 'tonal':
                return {
                    backgroundColor: colors.primary[100],
                    color: colors.primary[700],
                    border: 'none',
                    boxShadow: 'none',
                }
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    color: colors.primary[700],
                    border: `1px solid ${colors.primary[700]}`,
                    boxShadow: 'none',
                }
            case 'text':
                return {
                    backgroundColor: 'transparent',
                    color: colors.primary[700],
                    border: 'none',
                    boxShadow: 'none',
                }
            case 'filled':
            default:
                return {
                    backgroundColor: colors.primary[700],
                    color: colors.onDark.primary,
                    border: 'none',
                    // iOS는 그림자, Android(MD3)는 톤 surface라 그림자 최소화
                    boxShadow: isAndroid ? 'none' : shadow.button,
                }
        }
    })()

    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            style={{
                width: fullWidth ? '100%' : 'auto',
                height: `${height}px`,
                minHeight: isAndroid ? '48px' : layout.touchMin,
                borderRadius: radius,
                fontSize,
                fontWeight: typography.weight.semibold,
                cursor: disabled ? 'default' : 'pointer',
                fontFamily,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                padding: fullWidth ? 0 : `0 ${spacing[5]}`,
                transition: 'background-color 150ms, opacity 150ms',
                ...variantStyle,
                ...style,
            }}
            {...rest}
        >
            {children}
        </button>
    )
}