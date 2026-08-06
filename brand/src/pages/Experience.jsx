// 체험 관문. arena로 나가는 문이다(BRAND_SITE_GUIDE 0절 "이 연결이 brand의 핵심").
//
// 문구는 B4 확정 라이팅이다. 주의 사항 한 줄만 아직 미확정이라 자리표시가 뜬다.

import { colors, spacing, typography, weight } from '../tokens.js';
import { EXPERIENCE } from '../copy.js';
import Page from '../components/Page.jsx';
import ArenaCta from '../components/ArenaCta.jsx';

export default function Experience() {
  return (
    <Page eyebrow={EXPERIENCE.eyebrow} headline={EXPERIENCE.title} sub={EXPERIENCE.body}>
      {/* 3단계. 번호는 순서라 시각 요소가 아니라 내용이다 */}
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.unit * 2,
          counterReset: 'step',
        }}
      >
        {/* 카드 보더와 판, 번호 원 테두리를 걷어냈다(REBOOT_PLAN 2.1).
            번호는 원 없이 크기와 색으로 선다. 순서는 내용이라 남고 장식만 빠진다 */}
        {EXPERIENCE.steps.map((step, i) => (
          <li
            key={step}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: spacing.unit * 1.5,
              paddingBlock: spacing.unit,
            }}
          >
            <span
              style={{
                flex: 'none',
                fontFamily: typography.family,
                fontSize: typography.eyebrow.size,
                fontWeight: weight.bold,
                lineHeight: 1,
                color: colors.text.primary,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontFamily: typography.family,
                fontSize: typography.body.size,
                color: colors.text.primary,
                wordBreak: 'keep-all',
              }}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>

      <ArenaCta label={EXPERIENCE.cta} />

      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          lineHeight: 1.6,
          color: colors.text.dim,
          wordBreak: 'keep-all',
        }}
      >
        {EXPERIENCE.notice}
      </p>
    </Page>
  );
}
