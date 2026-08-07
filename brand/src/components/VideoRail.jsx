// 영상 캐러셀. **Apple 오버뷰의 갤러리 구조를 옮겼다.**
//
// ── Apple 실측 (1440, 직접 열어 computed로) ─────────────────────────────────
//   컨테이너  `.scrolling-container`, clientW 1425, scrollW 4365~6885
//             `scroll-snap-type: x mandatory`
//   영상 카드  **820x530 (1.547:1)**
//   화살표    `paddlenav-arrow` **36x36**, `aria-label="Previous, <이름> gallery"`
//
// **넘김은 스크롤이 진다. 화살표는 그것의 대응물이다.**
// 가로 스크롤 컨테이너에 스냅을 걸면 트랙패드와 터치가 그대로 동작하고, 마우스만 있는
// 사람을 위해 화살표가 같은 일을 한다. 자바스크립트 캐러셀을 새로 짜지 않는다.
//
// **Apple의 영상과 문구는 한 글자도 안 가져온다**(DESIGN 15절). 치수와 스냅 문법만이다.

import { useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { colors, spacing } from '../tokens.js';
import { MEDIA_PENDING, VIDEO_RAIL } from '../copy.js';
import AutoVideo from './AutoVideo.jsx';
import { bodyStyle } from './typo.js';

export default function VideoRail() {
  const railRef = useRef(null);
  // 양 끝에서는 그쪽 화살표를 끈다. 눌러도 아무 일이 없는 버튼이 제일 나쁜 실패다
  const [edge, setEdge] = useState({ start: true, end: false });

  const readEdge = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  }, []);

  const step = useCallback((dir) => {
    const el = railRef.current;
    if (!el) return;
    // 카드 한 장 + 간격만큼 민다. 스냅이 나머지를 맞춘다
    const card = el.querySelector('[data-rail-card]');
    const by = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * by, behavior: 'smooth' });
  }, []);

  return (
    <section aria-label={VIDEO_RAIL.label} style={{ paddingBlock: 'var(--section-gap)' }}>
      <div
        className="vx-shell"
        style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.unit, marginBottom: spacing.unit * 2 }}
      >
        <RailArrow dir={-1} label={VIDEO_RAIL.prev} onClick={() => step(-1)} disabled={edge.start} />
        <RailArrow dir={1} label={VIDEO_RAIL.next} onClick={() => step(1)} disabled={edge.end} />
      </div>

      <div ref={railRef} className="vx-rail" onScroll={readEdge}>
        {VIDEO_RAIL.items.map((item) => (
          <figure key={item.key} data-rail-card className="vx-rail-card">
            <AutoVideo
              className="vx-rail-media"
              src={item.src}
              pending={MEDIA_PENDING}
              // Apple 카드 820x530과 같은 비율이다
              ratio="820 / 530"
            />
            <figcaption style={{ ...bodyStyle, marginTop: spacing.unit * 1.5 }}>{item.line}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** 화살표. Apple 36x36과 같은 크기이고 터치 타깃은 44px로 넓힌다. */
function RailArrow({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="vx-rail-arrow"
      style={{ opacity: disabled ? 0.35 : 1, cursor: disabled ? 'default' : 'pointer' }}
    >
      {label === VIDEO_RAIL.prev ? (
        <ChevronLeft size={18} color={colors.text.primary} aria-hidden="true" />
      ) : (
        <ChevronRight size={18} color={colors.text.primary} aria-hidden="true" />
      )}
    </button>
  );
}
