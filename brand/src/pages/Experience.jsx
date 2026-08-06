// 체험 관문. arena로 나가는 문이다(BRAND_SITE_GUIDE 0절 "이 연결이 brand의 핵심").
//
// 헤드라인 ENTER THE VORTEX는 VORTEX_DESIGN_SYSTEM 3.14 원문이고
// 데모 진행 방식 설명은 확정 문장이 없어 자리만 잡았다. 지어내지 않는다.

import { colors, displayFamily, radius, spacing, typography } from '../tokens.js';
import { DEMO, PAGES } from '../copy.js';
import Page from '../components/Page.jsx';
import ArenaCta from '../components/ArenaCta.jsx';

export default function Experience() {
  return (
    <Page eyebrow={PAGES.experience.eyebrow}>
      <h1
        style={{
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: displayFamily,
          fontSize: typography.display.size,
          fontWeight: typography.display.weight,
          letterSpacing: typography.display.tracking,
          lineHeight: typography.display.leading,
          color: colors.text.primary,
        }}
      >
        {DEMO.headline.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h1>

      {/* 데모 설명 자리. 확정 카피는 B4다 */}
      <div
        style={{
          minHeight: 'clamp(160px, 22vh, 300px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.lg,
          border: `1px solid ${colors.line.default}`,
          background: colors.bg.raised,
          padding: spacing.gutter,
          fontFamily: typography.family,
          fontSize: typography.body.size,
          color: colors.text.dim,
          textAlign: 'center',
          wordBreak: 'keep-all',
        }}
      >
        {PAGES.experience.todo}
      </div>

      <ArenaCta />
    </Page>
  );
}
