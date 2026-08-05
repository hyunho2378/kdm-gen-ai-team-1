// BottomSheet.jsx — S02 (p.12,37)
// 바텀시트 베이스 컴포넌트

import { colors, typography, layout, spacing, shadow } from '../../tokens/tokens'
import { usePlatform } from '../../hooks/usePlatform'

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const isAndroid = usePlatform() === 'android'
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isAndroid ? 'rgba(0,0,0,0.32)' : colors.surface.overlay,
        }}
      />

      {/* 시트 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: layout.viewport,
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: colors.surface.card,
          borderTopLeftRadius: isAndroid ? '28px' : layout.radiusModal,
          borderTopRightRadius: isAndroid ? '28px' : layout.radiusModal,
          boxShadow: shadow.modal,
          maxHeight: '90vh',
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${spacing[6]})`,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: typography.fontFamily,
          animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* 핸들 바 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: spacing[3],
            paddingBottom: title ? spacing[2] : spacing[3],
          }}
        >
          <div
            style={{
              width: isAndroid ? '32px' : '40px',
              height: '4px',
              borderRadius: layout.radiusPill,
              backgroundColor: isAndroid ? colors.gray[400] : colors.gray[300],
            }}
          />
        </div>

        {/* 제목 */}
        {title && (
          <div
            style={{
              padding: `0 ${layout.margin} ${spacing[3]}`,
              borderBottom: `1px solid ${colors.gray[100]}`,
            }}
          >
            <span
              style={{
                fontSize: typography.size.md,
                fontWeight: typography.weight.semibold,
                color: colors.gray[900],
              }}
            >
              {title}
            </span>
          </div>
        )}

        {/* 콘텐츠 */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
