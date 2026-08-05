/**
 * TopAppBar (Phase 3 rewrite)
 * Feedback: 햄버거 삭제 → 알림종, 검색 → /search
 * Strategy: Nielsen #4 consistency, Shneiderman #1
 */
import { Search, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { colors, typography, layout, spacing } from '../../tokens/tokens'
import LogoBlue from '../../assets/logos/강릉페이로고_블루.svg'

export default function TopAppBar() {
  const navigate = useNavigate()
  const { isLargeText, toggleLargeText } = useApp()

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: colors.surface.background,
      height: layout.topBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: layout.margin,
      paddingRight: '8px',
      borderBottom: 'none',
    }}>
      {/* 로고 + 텍스트 */}
      {/* 장식 예외: 브랜드 마크 tight grouping (디자인시스템 단계 3-B) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: spacing[1] }}>
        <img src={LogoBlue} alt="강릉페이" style={{ height: '22px' }} />
        <span style={{
          fontSize: typography.size.xl,
          fontWeight: typography.weight.bold,
          color: colors.primary[700],
          fontFamily: typography.fontFamily,
          lineHeight: 1,
        }}>
          강릉페이
        </span>
      </div>

      {/* 우측 액션 */}
      {/* 장식 예외: 아이콘 버튼 그룹 마이크로 간격 (디자인시스템 단계 3-B) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {/* 큰글씨 pill */}
        <button
          onClick={toggleLargeText}
          style={{
            padding: '4px 10px',
            borderRadius: layout.radiusPill,
            border: `1px solid ${isLargeText ? colors.primary[300] : colors.gray[200]}`,
            backgroundColor: isLargeText ? colors.primary[100] : colors.surface.card,
            color: isLargeText ? colors.primary[700] : colors.gray[500],
            fontSize: typography.size.xxs,
            fontWeight: typography.weight.medium,
            cursor: 'pointer',
            fontFamily: typography.fontFamily,
            whiteSpace: 'nowrap',
          }}
        >
          {isLargeText ? '큰글씨 켜짐' : '큰글씨'}
        </button>

        {/* 검색 → /search (Phase 3: 매장이 아닌 검색 전용 페이지) */}
        <button
          onClick={() => navigate('/search')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: layout.touchMin,
            height: layout.touchMin,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Search size={20} color={colors.gray[800]} strokeWidth={1.8} />
        </button>

        {/* 알림 종 (Phase 3: 햄버거 → Bell) */}
        <button
          onClick={() => navigate('/notification')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: layout.touchMin,
            height: layout.touchMin,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={20} color={colors.gray[800]} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}
