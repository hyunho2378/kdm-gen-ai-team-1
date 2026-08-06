// 이미지 계약 한 곳. 경로에 파일이 있으면 그리고, 없으면(404/디코드 실패) tokens 기반 라이트
// 그라디언트 플레이스홀더 div로 내려앉는다. **이미지 부재로 섹션이 죽으면 안 된다.**
//
// 표지를 포함한 현재 이미지는 전부 임시 시안이다. 교체는 public/images 경로 덮어쓰기로 끝난다.

import { useState } from 'react';
import { colors } from '../tokens.js';

export default function AssetImage({
  src,
  alt = '',
  fit = 'cover',
  position = 'center',
  style,
  imgStyle,
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          // 라이트 위 옅게 눌린 그라디언트. 사진 자리를 결함이 아니라 면으로 읽히게 한다.
          background: `linear-gradient(155deg, ${colors.raised} 0%, ${colors.bg} 100%)`,
          boxShadow: `inset 0 0 0 1px ${colors.line.faint}`,
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable="false"
      onError={() => setFailed(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: fit,
        objectPosition: position,
        display: 'block',
        userSelect: 'none',
        ...style,
        ...imgStyle,
      }}
    />
  );
}
