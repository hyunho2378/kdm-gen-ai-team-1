// VISION(`/vision`). Apple의 visionOS 면 자리다.
//
// 큰 미디어 하나로 비전화면을 세우고, **유파 셋은 딥다이브로 지나간다.**
// 나란한 세 카드가 곧 카드 나열이라 고정 미디어 옆을 차례로 지나가는 문법으로 옮겼다.
// 유파와 성향과 스타일과 인용은 그대로다.

import { DUELISTS, MEDIA_PENDING, PRODUCT_NAV, PRODUCT_SITE } from '../copy.js';
import { Dive, SectionHead, WideMedia } from '../components/Blocks.jsx';
import ProductLayout from '../components/ProductLayout.jsx';
import { captionStyle } from '../components/typo.js';

const TAB = PRODUCT_NAV.tabs.find((t) => t.key === 'vision');

export default function Vision() {
  const copy = PRODUCT_SITE.sections.vision;
  const steps = DUELISTS.cards.map((d) => ({
    title: d.name,
    body: d.style,
    note: d.quote,
    kicker: `${d.ver} ${d.trait}`,
  }));

  return (
    <ProductLayout>
      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <WideMedia pending={MEDIA_PENDING} />
        <SectionHead label={{ en: TAB.label, ko: TAB.ko }} title={copy.title} line={copy.line} as="h1" />
      </section>

      <Dive
        label={DUELISTS.header.eyebrow}
        steps={steps}
        media={<span style={captionStyle}>{MEDIA_PENDING}</span>}
      />
    </ProductLayout>
  );
}
