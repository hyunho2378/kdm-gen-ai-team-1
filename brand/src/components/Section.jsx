// 랜딩 섹션 골격. 이 세션은 뼈대만이라 배치와 여백만 책임진다.
// 셰이더와 궤적과 유리는 다음 세션이고 그때 각 섹션 안쪽만 채운다.
//
// 높이를 100vh로 잡지 않는다(PITFALLS 동적 뷰포트). 최소 높이만 dvh로 두고
// 내용이 길면 그만큼 늘어난다. 일반 스크롤이라 섹션이 화면에 갇힐 이유가 없다.

import { spacing, typography, colors } from '../tokens.js';
import Eyebrow from './Eyebrow.jsx';

export default function Section({ id, eyebrow, headline, sub, children }) {
  return (
    <section
      id={id}
      className="vx-shell vx-section"
      style={{
        // **세로 중앙 정렬을 걷어냈다.** 100dvh를 통으로 잡고 콘텐츠를 중앙에 놓으면
        // 헤더 아래부터 콘텐츠까지 화면 위 3분의 1이 텅 빈다. 이제 콘텐츠 높이에 맞춰
        // 자연히 흐르고 위아래 간격은 `.vx-section`의 section-gap이 진다(상단 기준 배치).
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit * 3,
      }}
    >
      {eyebrow ? <Eyebrow en={eyebrow.en} ko={eyebrow.ko} /> : null}

      {headline ? (
        <h2
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.title.size,
            fontWeight: typography.title.weight,
            letterSpacing: typography.title.tracking,
            lineHeight: typography.title.leading,
            color: colors.text.primary,
            maxWidth: spacing.maxContent,
            wordBreak: 'keep-all',
          }}
        >
          {headline}
        </h2>
      ) : null}

      {sub ? (
        <p
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.body.size,
            lineHeight: typography.body.leading,
            color: colors.text.secondary,
            maxWidth: 'var(--measure)',
            wordBreak: 'keep-all',
          }}
        >
          {sub}
        </p>
      ) : null}

      {children}
    </section>
  );
}

