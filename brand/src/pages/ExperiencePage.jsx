// EXPERIENCE(`/experience`). **영상 풀블리드 면이다.**
// Apple도 열두 섹션 중 하나를 영상으로 쓴다(실측). 우리는 이 면이 그 자리다.
//
// arena로 나가는 유일한 출구이기도 하다(BRAND_SITE_GUIDE 0절).

import { spacing } from '../tokens.js';
import { EXPERIENCE, PRODUCT_DETAIL, PRODUCT_NAV, PRODUCT_SITE, VIDEO_PENDING } from '../copy.js';
import { SectionHead, WideMedia } from '../components/Blocks.jsx';
import ArenaCta from '../components/ArenaCta.jsx';
import ProductLayout from '../components/ProductLayout.jsx';
import { bodyStyle, captionStyle } from '../components/typo.js';

const TAB = PRODUCT_NAV.tabs.find((t) => t.key === 'experience');

export default function ExperiencePage() {
  const copy = PRODUCT_SITE.sections.experience;
  return (
    <ProductLayout>
      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <WideMedia pending={VIDEO_PENDING} />
        <SectionHead label={{ en: TAB.label, ko: TAB.ko }} title={copy.title} line={copy.line} as="h1" />
      </section>

      <section
        className="vx-shell"
        style={{ paddingBottom: 'var(--section-gap)', display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 }}
      >
        <p data-beat style={bodyStyle}>{EXPERIENCE.body}</p>
        {/* **3단계를 목록으로 눕히지 않는다.** 한 줄 흐름으로 읽는다 */}
        <p data-beat style={captionStyle}>{EXPERIENCE.flow}</p>
        <div data-beat>
          <ArenaCta label={PRODUCT_DETAIL.cta} />
        </div>
        <p data-beat style={captionStyle}>{EXPERIENCE.notice}</p>
      </section>
    </ProductLayout>
  );
}
