// 수렴 영상 스크롤 섹션. **스크롤 진행이 곧 섹션 진행이다.**
//
// ── 무엇이 스크롤에 걸리는가 ────────────────────────────────────────────────
// **영상의 currentTime이 아니라 섹션 진행을 건다.** 스크럽으로 프레임을 직접 찾으면
// 매 스크롤마다 mp4 seek이 걸리는데, 8MB짜리 소스는 키프레임 사이를 되감느라 프레임을
// 떨어뜨린다. 영상은 관찰자가 제 속도로 돌리고(AutoVideo), 스크롤은 정보와 관문의
// 진행만 쥔다. 화면에서 읽히는 결과는 같고 60fps가 안 흔들린다.
//
// ── 좌우 여백이 이 섹션의 절반이다 ──────────────────────────────────────────
// 소스가 2576x1440(1.789:1)이라 세로가 낮다. 화면 가운데에 세우면 좌우가 크게 남는데
// 그 빈자리에 제품 정보를 흰 글씨로 하나씩 세운다. 미리보기라 문장이 아니라 명사다.
//
// ── 무대 색 ─────────────────────────────────────────────────────────────────
// **영상 가장자리 색을 직접 재서 그 값을 무대에 깔았다**(캔버스 좌우 세로 띠 평균,
// 세 시각의 평균: `rgb(8,28,41)`). 페이지의 라이트 판 위에 어두운 사각형이 얹힌 것으로
// 안 보이고 영상이 무대에 녹는다. 흰 글씨는 이 바닥에서 17:1이 넘는다.
//
// ── 모션 감소 ───────────────────────────────────────────────────────────────
// 진행을 1로 고정한다. 정보 넷과 관문이 처음부터 다 서 있고 스크롤에 아무것도 안 걸린다.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CONVERGE, MEDIA_PENDING } from '../copy.js';
import { isReduced } from '../lib/motion.js';
import AutoVideo from './AutoVideo.jsx';
import { navH } from './Blocks.jsx';
import { titleStyle } from './typo.js';

/** 관문이 열리는 진행률. 마지막 정보가 선 뒤다. */
const CTA_AT = 0.82;

export default function ScrubSection() {
  const ref = useRef(null);
  const [p, setP] = useState(() => (isReduced() ? 1 : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || isReduced()) return undefined;
    const pick = () => {
      const r = el.getBoundingClientRect();
      const top = navH();
      // 무대가 붙어 있는 동안의 진행. Dive와 같은 셈이다
      const travel = r.height - (window.innerHeight - top);
      const v = travel > 0 ? (top - r.top) / travel : 0;
      setP(Math.min(1, Math.max(0, v)));
    };
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    pick();
    return () => {
      window.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, []);

  const n = CONVERGE.asides.length;
  // 정보는 한 번 서면 안 사라진다. 되감을 때 글자가 깜빡이며 없어지는 것이
  // 이 문법에서 가장 거슬리는 실패 모드다(ProductLayout의 once와 같은 이유)
  const on = (i) => p >= (i + 1) / (n + 2);
  const side = (parity) =>
    CONVERGE.asides
      .map((a, i) => ({ ...a, i }))
      .filter((a) => a.i % 2 === parity);

  return (
    <section ref={ref} className="vx-scrub" aria-label={CONVERGE.line}>
      <div className="vx-scrub-sticky">
        <div className="vx-scrub-grid">
          <Aside items={side(0)} on={on} align="end" />

          <div className="vx-scrub-media">
            <AutoVideo
              className="vx-scrub-video"
              src={CONVERGE.src}
              pending={MEDIA_PENDING}
              ratio={CONVERGE.ratio}
            />
          </div>

          <Aside items={side(1)} on={on} align="start" />
        </div>

        <div className="vx-scrub-foot">
          {/* **색만 상속으로 돌린다.** titleStyle은 라이트 팔레트라 잉크색을 이고 있는데
              이 무대는 어둡다. 크기와 굵기 위계는 다른 섹션과 같은 값을 그대로 쓴다 */}
          <h2
            className="vx-scrub-line"
            style={{ ...titleStyle, color: 'inherit' }}
            data-on={p >= 0.12 ? 'true' : 'false'}
          >
            {CONVERGE.line}
          </h2>
          {/* 끝까지 내려오면 제품 면으로 가는 문이 열린다. 투명 바탕에 흰 테두리라
              무대를 안 가리고 서 있다. 안 열렸을 때는 포커스도 안 잡히게 숨긴다 */}
          <Link
            to={CONVERGE.ctaTo}
            className="vx-scrub-cta"
            data-on={p >= CTA_AT ? 'true' : 'false'}
            tabIndex={p >= CTA_AT ? 0 : -1}
            aria-hidden={p >= CTA_AT ? undefined : 'true'}
          >
            {CONVERGE.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 여백에 서는 정보 한 줄기. 영문이 위, 국문이 아래다(사이트의 아이브로우 규약). */
function Aside({ items, on, align }) {
  return (
    <div className="vx-scrub-aside" data-align={align}>
      {items.map((a) => (
        <div key={a.en} className="vx-scrub-item" data-on={on(a.i) ? 'true' : 'false'}>
          <span className="vx-scrub-en">{a.en}</span>
          <span className="vx-scrub-ko">{a.ko}</span>
        </div>
      ))}
    </div>
  );
}
