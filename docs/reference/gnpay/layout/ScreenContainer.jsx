import { useState, useEffect } from 'react'
import { colors } from '../../tokens/tokens'
import StatusBar from './StatusBar'
import StatusBarAndroid from './StatusBarAndroid'
import { usePlatform } from '../../hooks/usePlatform'

export default function ScreenContainer({ children, statusBarBg, statusBarLight, fullBleedTop = false, transparentStatusBar = false }) {
  const [isDesktop, setIsDesktop] = useState(false)
  const platform = usePlatform()

  useEffect(() => {
    const check = () => {
      // 데스크탑 판정: 폭 768px 이상 + 비터치 디바이스 (둘 다 만족)
      const wideScreen = window.innerWidth >= 768
      const noTouch = !('ontouchstart' in window) && navigator.maxTouchPoints === 0
      setIsDesktop(wideScreen && noTouch)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div id="screen-container" style={{
      maxWidth: '390px',
      margin: '0 auto',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: statusBarBg || colors.surface.background,
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingTop: (fullBleedTop || transparentStatusBar) ? 0 : 'env(safe-area-inset-top)',
      // 데스크탑 한정 폰 프레임 효과
      ...(isDesktop && {
        borderLeft: `1px solid ${colors.gray[200]}`,
        borderRight: `1px solid ${colors.gray[200]}`,
      }),
    }}>
      {isDesktop && !fullBleedTop && !transparentStatusBar && (
        platform === 'android'
          ? <StatusBarAndroid backgroundColor={statusBarBg} light={statusBarLight} />
          : <StatusBar backgroundColor={statusBarBg} light={statusBarLight} />
      )}
      {isDesktop && transparentStatusBar && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          {platform === 'android'
            ? <StatusBarAndroid backgroundColor="transparent" light={statusBarLight} />
            : <StatusBar backgroundColor="transparent" light={statusBarLight} />
          }
        </div>
      )}
      {children}
    </div>
  )
}
