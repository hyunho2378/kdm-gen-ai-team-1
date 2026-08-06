// 하위 페이지 공통 골격. 헤더가 상주하므로 상단 여백을 헤더 높이만큼 더 준다.
// 랜딩은 히어로가 화면을 통째로 쓰므로 이 골격을 쓰지 않는다.

import { colors, spacing, typography } from '../tokens.js';
import Eyebrow from './Eyebrow.jsx';

export default function Page({ eyebrow, headline, sub, children }) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit * 3,
        // 위쪽만 고정 헤더 높이(68)를 더한다. 헤더가 제목을 덮지 않게 한다
        padding: `calc(${spacing.section} + 68px) ${spacing.gutter} ${spacing.section}`,
        maxWidth: spacing.maxWide,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {eyebrow ? <Eyebrow en={eyebrow.en} ko={eyebrow.ko} /> : null}

      {headline ? (
        <h1
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
        </h1>
      ) : null}

      {sub ? (
        <p
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.body.size,
            lineHeight: typography.body.leading,
            color: colors.text.secondary,
            maxWidth: 720,
            wordBreak: 'keep-all',
          }}
        >
          {sub}
        </p>
      ) : null}

      {children}
    </main>
  );
}
