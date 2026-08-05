// StatusBarAndroid.jsx — 강릉페이 StatusBarAndroid 이식. usePlatform으로 분기해 쓴다.
// **VORTEX 조정: 다크 배경이라 light 기본, 색은 tokens 경유.** 원본 SVG 그대로.

import { useState, useEffect } from 'react';
import { colors, typography } from '../tokens.js';
import statusBarSvg from '../assets/status-bar-android.svg?url';

const STATUS_BAR_HEIGHT_ANDROID = 42;

export default function StatusBarAndroid({ backgroundColor, light = true }) {
  const bg = backgroundColor || colors.bg.base;
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setTime(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        height: `${STATUS_BAR_HEIGHT_ANDROID}px`,
        backgroundColor: bg,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
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
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '16px',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: light ? colors.text.primary : colors.bg.base,
            fontFamily: typography.family,
            letterSpacing: '0.2px',
          }}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

export { STATUS_BAR_HEIGHT_ANDROID };
