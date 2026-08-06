// 유파 셀렉션 페이지.
//
// **B7에서 정적 3카드를 셀렉션으로 올렸다.** 안무와 입력은 DuelistSelector가 소유한다.
// 이 페이지는 머리말과 안내 라벨만 세운다.
//
// 문구는 brand 확정본(copy.js DUELISTS)이다. VORTEX_DESIGN_SYSTEM 3.11 원문과 어미가 다른 것은
// 알려진 미해결이고 통일은 presentation 담당 별도 세션이다. 여기서 그 문서를 건드리지 않는다.

import { useEffect, useState } from 'react';
import { colors, typography } from '../tokens.js';
import { DUELISTS } from '../copy.js';
import { isReduced } from '../lib/motion.js';
import Page from '../components/Page.jsx';
import DuelistSelector from '../components/DuelistSelector.jsx';

export default function Duelists() {
  // 렌더 중에 matchMedia를 읽지 않는다. 첫 페인트 뒤 한 번 정하고 셀렉터에 내린다
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(isReduced()), []);

  return (
    <Page eyebrow={DUELISTS.header.eyebrow} headline={DUELISTS.header.title} sub={DUELISTS.header.sub}>
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          fontWeight: 600,
          letterSpacing: typography.hud.tracking,
          color: colors.text.dim,
        }}
      >
        {DUELISTS.selection.guide}
      </span>

      <DuelistSelector reduced={reduced} />
    </Page>
  );
}
