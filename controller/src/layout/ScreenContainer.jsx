// ScreenContainer.jsx — 강릉페이 ScreenContainer 이식.
// maxWidth 390px 중앙, 100dvh, safe-area inset. 데스크톱(폭 768 이상 + 비터치, 둘 다 만족)에서만
// 폰 프레임 보더와 가짜 스테이터스바를 그린다. 실기 폰에서는 진짜 시스템 바가 있으므로 렌더하지 않는다.
// transparentStatusBar 모드(absolute 오버레이, pointer-events none)도 원본 그대로.
//
// **VORTEX 조정: 색만 tokens 경유(다크). 프레임 보더는 steel 계열 저강도.** 로직은 원본과 동일.

import { useState, useEffect } from 'react';
import { colors } from '../tokens.js';
import StatusBar from './StatusBar.jsx';
import StatusBarAndroid from './StatusBarAndroid.jsx';
import { usePlatform } from '../hooks/usePlatform.js';

export default function ScreenContainer({
  children,
  statusBarBg,
  statusBarLight = true,
  fullBleedTop = false,
  transparentStatusBar = false,
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const platform = usePlatform();

  useEffect(() => {
    const check = () => {
      // 데스크톱 판정: 폭 768px 이상 + 비터치 디바이스(둘 다 만족). 원본 로직 그대로.
      const wideScreen = window.innerWidth >= 768;
      const noTouch = !('ontouchstart' in window) && navigator.maxTouchPoints === 0;
      setIsDesktop(wideScreen && noTouch);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const Bar = platform === 'android' ? StatusBarAndroid : StatusBar;

  return (
    <div
      id="screen-container"
      style={{
        maxWidth: '390px',
        margin: '0 auto',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: statusBarBg || colors.bg.base,
        position: 'relative',
        overflowX: 'hidden',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: fullBleedTop || transparentStatusBar ? 0 : 'env(safe-area-inset-top)',
        ...(isDesktop && {
          borderLeft: `1px solid ${colors.line.default}`,
          borderRight: `1px solid ${colors.line.default}`,
        }),
      }}
    >
      {isDesktop && !fullBleedTop && !transparentStatusBar && (
        <Bar backgroundColor={statusBarBg} light={statusBarLight} />
      )}
      {isDesktop && transparentStatusBar && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: 'none' }}>
          <Bar backgroundColor="transparent" light={statusBarLight} />
        </div>
      )}
      {children}
    </div>
  );
}
