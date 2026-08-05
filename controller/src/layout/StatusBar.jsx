// StatusBar.jsx — 강릉페이 StatusBar 이식(발표 시연용 가짜 상태바, 데스크톱 한정).
// SVG 배경(우측 신호/와이파이/배터리) + 좌측 실시간 시계 덮어쓰기.
//
// **VORTEX 조정: 다크 배경이라 light 모드가 기본이다.** SVG를 brightness(0) invert(1)로 희게 하고
// 시계 텍스트도 흰색. 색은 tokens 경유(HEX 하드코딩 금지).
//
// Nielsen: #1 시스템 상태 가시성(시간). 원본 로직 그대로, 색만 VORTEX.

import { useState, useEffect } from 'react';
import { colors, typography } from '../tokens.js';
import statusBarIcons from '../assets/status-bar-icons.svg?url';

const STATUS_BAR_HEIGHT = 41;

export default function StatusBar({ backgroundColor, light = true }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const hh = time.getHours();
  const mm = String(time.getMinutes()).padStart(2, '0');
  const displayTime = `${hh}:${mm}`;

  return (
    <div
      style={{
        width: '100%',
        height: `${STATUS_BAR_HEIGHT}px`,
        position: 'relative',
        backgroundColor: backgroundColor || colors.bg.base,
        flexShrink: 0,
      }}
    >
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
      <span
        style={{
          position: 'absolute',
          left: '13%',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '17px',
          fontWeight: 600,
          color: light ? colors.text.primary : colors.bg.base,
          fontFamily: typography.family,
          letterSpacing: '-0.5px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {displayTime}
      </span>
    </div>
  );
}

export { STATUS_BAR_HEIGHT };
