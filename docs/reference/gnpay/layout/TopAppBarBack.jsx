import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { colors, typography, layout, spacing } from '../../tokens/tokens'
import { usePlatform } from '../../hooks/usePlatform'

export default function TopAppBarBack({ title, onBack, rightAction }) {
  const navigate = useNavigate()
  const platform = usePlatform()
  const isAndroid = platform === 'android'

  function handleBack() {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: colors.surface.card,
      height: layout.topBarHeight,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '4px',
      paddingRight: layout.margin,
      borderBottom: `1px solid ${colors.gray[200]}`,
    }}>
      {/* 뒤로가기 버튼 */}
      <button
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          width: layout.touchMin,
          height: layout.touchMin,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ArrowLeft size={22} color={colors.gray[900]} strokeWidth={2} />
      </button>

      {/* 제목 — iOS: 중앙 / Android: 좌측 */}
      <span style={{
        flex: 1,
        textAlign: isAndroid ? 'left' : 'center',
        marginLeft: isAndroid ? spacing[2] : 0,
        fontSize: typography.size.md,
        fontWeight: typography.weight.semibold,
        color: colors.gray[900],
        fontFamily: isAndroid ? `'Noto Sans KR', ${typography.fontFamily}` : typography.fontFamily,
        marginRight: isAndroid ? '0' : (rightAction ? '0' : layout.touchMin),
      }}>
        {title}
      </span>

      {/* 우측 액션 (선택적) */}
      {rightAction && (
        <div style={{ flexShrink: 0 }}>
          {rightAction}
        </div>
      )}
    </div>
  )
}
