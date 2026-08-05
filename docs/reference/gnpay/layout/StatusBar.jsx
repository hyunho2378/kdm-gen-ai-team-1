// StatusBar.jsx — 발표 시연용 가짜 상태바 (데스크탑 한정)
// SVG 배경 + 좌측 실시간 시간 텍스트 덮어쓰기

import { useState, useEffect } from 'react'
import { colors, typography } from '../../tokens/tokens'
import statusBarIcons from '../../assets/icons/status-bar-icons.svg?url'

const STATUS_BAR_HEIGHT = 41

export default function StatusBar({ backgroundColor, light }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const hh = time.getHours()
  const mm = String(time.getMinutes()).padStart(2, '0')
  const displayTime = `${hh}:${mm}`

  return (
    <div style={{
      width: '100%',
      height: `${STATUS_BAR_HEIGHT}px`,
      position: 'relative',
      backgroundColor: backgroundColor || colors.surface.background,
      flexShrink: 0,
    }}>
      {/* 우측 아이콘 SVG (배경) — 중앙 정렬 + 양쪽 균등 3%씩 확장 */}
      <img
        src={statusBarIcons}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          filter: light ? 'brightness(0) invert(1)' : undefined,
        }}
      />

      {/* 좌측 실시간 시간 (SVG 위에 덮어쓰기) */}
      <span style={{
        position: 'absolute',
        left: '13%',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '17px',
        fontWeight: 600,
        color: light ? '#ffffff' : colors.gray[900],
        fontFamily: typography.fontFamily,
        letterSpacing: '-0.5px',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {displayTime}
      </span>
    </div>
  )
}
