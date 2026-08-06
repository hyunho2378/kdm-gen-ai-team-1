// 체험 관문. arena로 나가는 문이다(BRAND_SITE_GUIDE 0절 "이 연결이 brand의 핵심").
//
// 문구는 B4 확정 라이팅이다. 주의 사항 한 줄만 아직 미확정이라 자리표시가 뜬다.

import { colors, radius, spacing, typography } from '../tokens.js';
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
        {EXPERIENCE.steps.map((step, i) => (
          <li
            key={step}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: spacing.unit * 2,
              borderRadius: radius.lg,
              border: `1px solid ${colors.line.default}`,
              background: colors.bg.raised,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                flex: 'none',
                borderRadius: '50%',
                border: `1px solid ${colors.red.light}`,
                fontFamily: typography.family,
                fontSize: typography.caption.size,
                fontWeight: 700,
                color: colors.red.light,
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
