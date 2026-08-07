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

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { colors, spacing } from '../tokens.js';
import { MEDIA_PENDING, VIDEO_RAIL } from '../copy.js';
import AutoVideo from './AutoVideo.jsx';
import { bodyStyle } from './typo.js';

export default function VideoRail() {
  const railRef = useRef(null);
  // 양 끝에서는 그쪽 화살표를 끈다. 눌러도 아무 일이 없는 버튼이 제일 나쁜 실패다
  const [edge, setEdge] = useState({ start: true, end: false });
  // **한 번에 한 장만 돈다.** 아래 관찰자가 지금 보고 있는 카드를 고른다
  const [live, setLive] = useState(VIDEO_RAIL.items[0].key);

  /**
   * 재생권을 한 장에게만 준다. **성능 때문이다(실측).**
   *
   * 1440에서 이 레일은 카드 두 장을 통째로 보여 준다(520 + 24 + 520 = 1064 < 1425).
   * 그런데 소스가 1920x1920이라 **둘이 동시에 디코드되면 스크롤 중 p50이 59.9에서
   * 15로 떨어진다**(재생 0/1/2/3장 사다리를 실측했고 절벽은 정확히 두 장째다).
   * 디코더 자체는 멀쩡하다(dropped 0). 무너지는 것은 프레임 예산이다.
   *
   * 그래서 레일 자신을 기준(root)으로 카드가 얼마나 보이는지를 재고 **제일 많이 보이는
   * 한 장만** 돌린다. 스냅 캐러셀이라 어차피 한 장이 자리를 잡고, 옆 카드는 첫 프레임에
   * 멈춰 선다. 넘기면 그 자리가 바로 넘어간다.
   */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    const ratios = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target.dataset.railCard, e.intersectionRatio);
        let best = null;
        let max = 0;
        for (const [key, r] of ratios) {
          if (r > max) { max = r; best = key; }
        }
        if (best) setLive(best);
      },
      { root: rail, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    for (const card of rail.querySelectorAll('[data-rail-card]')) io.observe(card);
    return () => io.disconnect();
  }, []);

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
    // **아래 여백만 절반이다.** 뒤에 오는 수렴 섹션이 어두운 판이라 표준 간격을 다 주면
    // 그 판이 페이지에서 떨어져 나온 조각으로 읽힌다. 캐러셀에서 그대로 잠기게 붙인다
    <section
      aria-label={VIDEO_RAIL.label}
      style={{ paddingTop: 'var(--section-gap)', paddingBottom: 'calc(var(--section-gap) * 0.5)' }}
    >
      <div
        className="vx-shell"
        style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.unit, marginBottom: spacing.unit * 2 }}
      >
        <RailArrow dir={-1} label={VIDEO_RAIL.prev} onClick={() => step(-1)} disabled={edge.start} />
        <RailArrow dir={1} label={VIDEO_RAIL.next} onClick={() => step(1)} disabled={edge.end} />
      </div>

      <div ref={railRef} className="vx-rail" onScroll={readEdge}>
        {VIDEO_RAIL.items.map((item) => (
          <figure key={item.key} data-rail-card={item.key} className="vx-rail-card">
            {/* **비율은 소스가 정한다.** Apple 카드는 820x530(1.547:1)인데 우리 mask-360은
                1920x1920 정사각이라 그 틀에 넣으면 위아래가 잘려 마스크가 깎인다(실측).
                치수 문법은 카드 폭이 지고 비율은 소재가 진다 */}
            <AutoVideo
              className="vx-rail-media"
              src={item.src}
              pending={MEDIA_PENDING}
              ratio={item.ratio}
              rate={item.rate}
              active={live === item.key}
            />
            {/* 영상과 이름 사이. **12에서 32로 벌렸다.** 붙어 있으면 이름이 영상의
                자막처럼 읽힌다. 떨어져야 그것이 제품 이름으로 선다 */}
            <figcaption style={{ ...bodyStyle, marginTop: spacing.unit * 4 }}>{item.line}</figcaption>
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
