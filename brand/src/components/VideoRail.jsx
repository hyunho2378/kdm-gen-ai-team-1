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
  const ratiosRef = useRef(new Map());

  /**
   * 재생권을 한 장에게만 준다. **성능 때문이다(실측).**
   *
   * 1440에서 이 레일은 카드 두 장을 통째로 보여 준다(520 + 24 + 520 = 1064 < 1425).
   * 그런데 소스가 1920x1920이라 **둘이 동시에 디코드되면 스크롤 중 p50이 59.9에서
   * 15로 떨어진다**(재생 0/1/2/3장 사다리를 실측했고 절벽은 정확히 두 장째다).
   * 디코더 자체는 멀쩡하다(dropped 0). 무너지는 것은 프레임 예산이다.
   *
   * **동률 버그를 실측으로 잡았다.** `IntersectionObserver`의 `intersectionRatio`로
   * "제일 많이 보이는 한 장"을 고르던 예전 로직은, 1440처럼 카드 두 장이 처음부터 나란히
   * 전부(1.0) 보이는 폭에서 **`con-360` 카드가 영원히 재생권을 못 받는** 결함이 있었다.
   * `r > max`가 엄격 부등호라 동률(1.0 vs 1.0)에서는 먼저 Map에 들어간 첫 카드가 계속
   * 이긴다 — 스크롤이 한 번도 안 걸리면 둘 다 영원히 1.0으로 묶여 둘째 카드는 `paused
   * true readyState 0`로 못 벗어난다(실측으로 재현: `con-360.mp4`가 어느 스크롤 위치에서도
   * 재생되지 않았다).
   *
   * **좌표 기반 두 시도가 이 카드 수에서 다 깨졌다(실측, 순서대로 시도하고 버린 기록).**
   * (1) `scrollLeft` vs 카드 `offsetLeft`: 카드가 셋뿐이라 콘텐츠 총폭(1681)이 뷰포트(1425)를
   * 겨우 256px 넘는다. `scrollLeft` 최댓값이 256이라 화살표를 끝까지 눌러도 `con-360`의
   * `offsetLeft`(581)엔 못 닿아 여전히 mask-360이 가깝다고 판정됐다.
   * (2) 카드 중심과 레일 중심의 거리(뷰포트 좌표): 이번엔 반대로 **스크롤 전이든 후든 항상
   * 가운데 카드(con-360)가 레일 전체 폭의 기하학적 중심에 가장 가까워** 정지 상태에서도
   * con-360이 이겨 버렸다. 카드 셋이 뷰포트에 거의 다 들어와 "중심에 가장 가까운 카드"가
   * "지금 스냅된 카드"와 다른 뜻이 됐다.
   *
   * **좌표를 버리고 히스테리시스로 바꿨다.** `intersectionRatio`는 그대로 쓰되, "전체에서
   * 제일 큰 값"이 아니라 **"지금 재생권을 쥔 카드보다 더 많이 보이는 카드가 있는가"만** 본다.
   * 동률(둘 다 1.0)에서는 아무도 현재 카드보다 "더" 보이지 않으므로 그대로 유지된다 —
   * 정지 상태에서 mask-360이 계속 재생권을 쥔다. 화살표를 눌러 스크롤하면 mask-360이
   * 화면 밖으로 밀리며 실제 노출 비율이 내려가고(실측 0.579), 그 순간 con-360(1.0)이
   * "현재보다 더 보임"으로 이겨 재생권이 넘어간다. 좌표의 절대값이 아니라 **현재 대비
   * 상대적 변화**를 보므로 스크롤 범위가 짧아도 깨지지 않는다.
   */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    const ratios = ratiosRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target.dataset.railCard, e.intersectionRatio);
        setLive((cur) => {
          let best = cur;
          let bestRatio = ratios.get(cur) ?? 0;
          for (const [key, r] of ratios) {
            if (r > bestRatio) { bestRatio = r; best = key; }
          }
          return best;
        });
      },
      { root: rail, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    // 정지 화면 카드(영상이 아님)는 재생권 경쟁에서 뺀다
    const videoKeys = new Set(VIDEO_RAIL.items.filter((i) => i.src).map((i) => i.key));
    for (const card of rail.querySelectorAll('[data-rail-card]')) {
      if (videoKeys.has(card.dataset.railCard)) io.observe(card);
    }
    return () => io.disconnect();
  }, []);

  /**
   * **차례로 넘겨 준다.** 카드 둘이 동시에 디코드되면 프레임 예산이 무너져(위 실측) 한 장만
   * 돌린다. 그런데 한 장에 재생권이 붙박이면 다른 카드 영상이 영영 안 도는 것처럼 보인다
   * (컨트롤러 카드가 그랬다). 화면에 절반 이상 보이는 영상 카드끼리 한 바퀴(5.08초 / 0.5배속
   * = 약 10초)마다 재생권을 넘긴다. 재생권을 뺏긴 카드는 그 자리에서 멈춘다.
   */
  useEffect(() => {
    const id = setInterval(() => {
      const videos = VIDEO_RAIL.items.filter((i) => i.src).map((i) => i.key);
      setLive((cur) => {
        const seen = videos.filter((k) => (ratiosRef.current.get(k) ?? 0) >= 0.5);
        if (seen.length < 2) return cur;
        const at = seen.indexOf(cur);
        return seen[(at + 1) % seen.length];
      });
    }, 10400);
    return () => clearInterval(id);
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
            {item.image ? (
              // 정지 화면 카드. 영상이 아니라 재생권과 무관하다
              <img
                className="vx-rail-media"
                src={item.image}
                alt={item.alt}
                loading="lazy"
                style={{ aspectRatio: item.ratio, objectFit: 'cover' }}
              />
            ) : (
              <AutoVideo
                className="vx-rail-media"
                src={item.src}
                poster={item.poster}
                pending={MEDIA_PENDING}
                ratio={item.ratio}
                rate={item.rate}
                active={live === item.key}
              />
            )}
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
