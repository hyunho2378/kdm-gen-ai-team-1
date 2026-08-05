import { useState, useEffect } from 'react'
import statusBarSvg from '../../assets/icons/status-bar-android.svg?url'
import { colors } from '../../tokens/tokens'

const STATUS_BAR_HEIGHT_ANDROID = 42

export default function StatusBarAndroid({ backgroundColor, light = false }) {
  const bg = backgroundColor || colors.surface.background
  const [time, setTime] = useState(() => {
    const d = new Date()
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  })

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setTime(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`)
    }
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      position: 'relative',
      height: `${STATUS_BAR_HEIGHT_ANDROID}px`,
      backgroundColor: bg,
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* SVG 우측 아이콘 */}
      <img
        src={statusBarSvg}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          filter: light ? 'brightness(0) invert(1)' : 'none',
        }}
      />
      {/* 좌측 실시간 시계 텍스트 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '16px',
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: light ? '#FFFFFF' : '#222227',
          fontFamily: "'Noto Sans KR', sans-serif",
          letterSpacing: '0.2px',
        }}>
          {time}
        </span>
      </div>
    </div>
  )
}

export { STATUS_BAR_HEIGHT_ANDROID }
