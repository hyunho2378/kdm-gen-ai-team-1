// 자동 재생 영상 하나. **Apple 오버뷰의 재생 방식을 그대로 옮겼다.**
//
// ── Apple 실측 (1440, 직접 열어 computed로) ─────────────────────────────────
//   muted   loop   playsInline   controls 없음   preload="none"
//   **`autoplay` 속성이 없다.** 28개가 전부 `paused: true`로 대기하고 있었다.
//   스크립트가 뷰포트에 들어올 때 `play()`를 부르고 나가면 멈춘다.
//
// **속성 대신 관찰자를 쓰는 이유가 성능이다.** `autoplay`를 달면 브라우저가 문서의 모든
// 영상을 동시에 물어 디코더를 나눠 쓴다. 우리 영상 둘이 각각 8~10MB라 그 차이가 크다.
// `preload="none"`이 파일도 자리에 올 때까지 안 받는다.
//
// **모바일 자동 재생 정책.** iOS와 안드로이드 모두 `muted` + `playsInline`이면 사용자
// 제스처 없이 재생을 허용한다. 셋 중 하나라도 빠지면 `play()`가 거부된다.
// 그래서 거부를 조용히 삼키지 않고 컨트롤을 켜서 **사람이 직접 누를 길을 남긴다**
// (PATTERNS 우아한 저하. 아무 일도 안 일어나는 검은 사각형이 제일 나쁜 실패다).
//
// **모션을 줄여 달라고 했으면 재생하지 않는다.** 자동으로 도는 영상은 그 설정이 막으려는
// 바로 그것이다. 그때는 첫 프레임에서 멈춘 채로 서고 컨트롤이 뜬다.

import { useEffect, useRef, useState } from 'react';
import { isReduced } from '../lib/motion.js';
import { captionStyle } from './typo.js';

export default function AutoVideo({ src, pending, ratio = '1425 / 848', rate, className, style }) {
  const ref = useRef(null);
  // 자동 재생이 거부됐거나 모션 감소면 컨트롤을 켠다. 사람이 누를 길이 남아야 한다
  const [manual, setManual] = useState(false);

  // 재생 속도. **속성이 아니라 프로퍼티라 마크업으로 못 준다.** 1보다 작으면 느려진다.
  // 매 재생마다 다시 걸어야 한다. `play()`가 값을 되돌리지는 않지만 소스가 바뀌면 1로 돌아간다
  useEffect(() => {
    const el = ref.current;
    if (el && rate) el.playbackRate = rate;
  }, [rate, src]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return undefined;
    if (isReduced()) {
      setManual(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // play()는 Promise다. 거부를 안 잡으면 콘솔에 미처리 거부가 남고 화면엔 아무 단서도 없다.
            //
            // **거부를 다 같게 보면 안 된다(실측으로 잡았다).** 빠르게 스크롤해서 지나가면
            // 아직 안 풀린 play()를 아래 pause()가 끊고 그것이 `AbortError`로 온다.
            // 그건 정상 동작이지 자동 재생 거부가 아닌데, 여기서 컨트롤을 켜 버리면
            // 한 번 훑고 지나간 것만으로 영상이 영영 컨트롤 달린 채로 남는다.
            // **막힌 것은 `NotAllowedError` 하나다.** 그때만 사람이 누를 길을 연다
            if (rate) el.playbackRate = rate;
            el.play().catch((err) => {
              if (err?.name === 'NotAllowedError') setManual(true);
            });
          } else {
            el.pause();
          }
        }
      },
      // 완전히 들어오기 전에 시작한다. 스크롤이 멈춘 뒤에 켜지면 첫 순간을 놓친다
      { rootMargin: '15% 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src, rate]);

  if (!src) {
    return (
      <div className={className} style={{ ...style, aspectRatio: ratio }}>
        <span style={captionStyle}>{pending}</span>
      </div>
    );
  }

  return (
    <video
      ref={ref}
      className={className}
      style={{ ...style, aspectRatio: ratio, objectFit: 'cover' }}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      controls={manual}
      // 데코가 아니라 내용이라 스크린리더가 건너뛰지 않게 역할을 준다
      aria-hidden={manual ? undefined : 'true'}
    />
  );
}
