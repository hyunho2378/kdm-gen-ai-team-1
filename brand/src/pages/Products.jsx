// 제품군 인덱스.
//
// **`data-flip-id`는 카드의 썸네일이 단다.** 상세의 대표 비주얼과 같은 id를 공유해
// 라우트를 건너뛰는 shared element 전환의 짝이 된다(B8a). 값은 slug다.
// 카드 전체가 아니라 썸네일을 짝으로 잡는다. 카드에는 상세에 없는 문구가 들어 있어
// 통째로 모핑하면 글자가 뭉개진다.

import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing, typography } from '../tokens.js';
import { MEDIA_PENDING, PRODUCTS } from '../copy.js';
import { captureFlip, pendingFlipId, playFlip } from '../lib/flip.js';
import Page from '../components/Page.jsx';

export default function Products() {
  const visualRefs = useRef({});

  // 상세에서 돌아왔을 때의 역방향 전환. 상세 대표 비주얼이 카드 자리로 접힌다.
  // **스크롤을 먼저 맨 위로 보낸다.** ScrollToTop은 useEffect라 이 layout effect 뒤에 도는데,
  // 그때 위치가 바뀌면 날아가는 도중에 목표가 움직인다
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    // **어느 카드가 짝인지 먼저 정한다.** 카드가 셋이라 아무 데나 붙이면
    // Flip이 id 짝을 못 찾아 전환이 통째로 죽는다(실측으로 잡았다)
    const id = pendingFlipId();
    const slug = id ? id.replace('product-', '') : null;
    playFlip(slug ? visualRefs.current[slug] : null);
  }, []);

  return (
    <Page eyebrow={PRODUCTS.index.eyebrow} headline={PRODUCTS.index.title} sub={PRODUCTS.index.line} fit>
      {/* **첫 화면에서 완결한다(REBOOT_PLAN 2.3).** 남는 세로를 격자가 통째로 먹고
          카드 안에서는 비주얼 자리가 늘어난다. 그래서 어느 폭에서도 스크롤 없이 카드 셋이 다 보인다.
          고정 높이(aspect-ratio)를 주면 좁은 화면에서 반드시 화면을 넘긴다 */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          flex: 1,
          minHeight: 0,
          display: 'grid',
          // 3종이라 최소폭을 280으로 올려 유파 격자와 같은 리듬으로 맞춘다.
          // 320에서 1열, 768에서 2열, 넓은 화면에서 3열이 한 줄에 선다. 미디어쿼리 없이 폭만 보고 접힌다
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.unit * 2,
        }}
      >
        {PRODUCTS.cards.map((p) => (
          <li key={p.slug} style={{ minHeight: 0 }}>
            <Link
              to={`/product/${p.slug}`}
              style={cardStyle}
              // 떠나기 직전에 썸네일 자리를 기록한다. 라우트가 바뀌면 이 요소는 사라지므로
              // 상태를 모듈 변수에 맡긴다(lib/flip.js)
              onClick={() => captureFlip(visualRefs.current[p.slug])}
            >
              {/* 대표 비주얼 자리. **박스 없이 문구만 둔다.** Flip 전환의 짝이라 요소 자체는 남는다 */}
              <span
                ref={(el) => { visualRefs.current[p.slug] = el; }}
                data-flip-id={`product-${p.slug}`}
                className="vx-card-visual"
              >
                <span
                  style={{
                    fontFamily: typography.family,
                    fontSize: typography.caption.size,
                    color: colors.text.dim,
                  }}
                >
                  {MEDIA_PENDING}
                </span>
              </span>
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: typography.heading.size,
                  fontWeight: typography.heading.weight,
                  color: colors.text.primary,
                }}
              >
                {p.name}
              </span>
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: typography.caption.size,
                  lineHeight: 1.6,
                  color: colors.text.dim,
                  wordBreak: 'keep-all',
                }}
              >
                {p.line}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}

// **카드 보더와 판을 걷어냈다(REBOOT_PLAN 2.1).** 구분은 여백과 타이포 스케일이 진다.
const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  height: '100%',
  minHeight: 0,
  paddingBlock: spacing.unit,
  textDecoration: 'none',
};

// 대표 비주얼 자리의 배치는 `.vx-card-visual`(index.css)이 쥔다.
// **인라인으로 display를 걸지 않는다.** 걸면 좁은 화면에서 접는 media query가 죽는다(PITFALLS).
