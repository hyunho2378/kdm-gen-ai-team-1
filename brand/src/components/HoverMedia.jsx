// 호버 자동 재생. 지정 슬롯 위에 마우스가 오면 그 영상이 재생, 떼면 정지+첫 프레임 복귀.
//
// **`<video muted playsInline loop>`**. 자동재생 정책상 muted가 필수, playsInline이라 모바일에서 전체화면 안 뜬다.
// 호버 진입 play(), 이탈 pause()+currentTime=0. 클릭 유도 없이 마우스만으로 미리보기.
//
// **커스텀 커서(R1)와 연동.** 슬롯에 `data-cursor`를 달면 Cursor의 위임 셀렉터(HOT)에 걸려 커서가 커진다.
// 별도 배선이 필요 없다(Cursor는 document 위임이라 나중에 생긴 요소도 자동으로 걸린다).
//
// **영상 없을 때(slot).** `src`가 없으면 영상 태그를 렌더하지 않고 대기 표면(pending)만 둔다.
// 로직(호버 play/pause, 커서 반응)은 그대로 살아 있어 영상이 오면 `src`만 넘기면 된다.
// reduced-motion·터치에서는 자동재생을 걸지 않는다(호버 개념이 없다).

import { useRef } from 'react';
import { isReduced } from '../lib/motion.js';
import { captionStyle } from './typo.js';

export default function HoverMedia({ src, poster, pending, label, ratio = '1 / 1' }) {
  const vref = useRef(null);

  const canPlay = () =>
    src &&
    !isReduced() &&
    !window.matchMedia('(hover: none)').matches;

  const onEnter = () => {
    const v = vref.current;
    if (!v || !canPlay()) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => {}); // 자동재생 거부는 조용히 무시
  };
  const onLeave = () => {
    const v = vref.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0; // 첫 프레임 복귀
  };

  return (
    <div
      className="vx-hover-media"
      data-cursor
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <video
          ref={vref}
          className="vx-hover-video"
          src={src}
          poster={poster}
          muted
          playsInline
          loop
          preload="metadata"
        />
      ) : (
        // 영상 대기 슬롯. 표면 + 라벨. 호버/커서 로직은 위 컨테이너에 그대로 산다.
        <span className="vx-hover-pending" style={captionStyle}>{pending}</span>
      )}
      {label ? <span className="vx-hover-label">{label}</span> : null}
    </div>
  );
}
