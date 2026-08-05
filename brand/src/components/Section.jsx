// 랜딩 섹션 골격. 이 세션은 뼈대만이라 배치와 여백만 책임진다.
// 셰이더와 궤적과 유리는 다음 세션이고 그때 각 섹션 안쪽만 채운다.
//
// 높이를 100vh로 잡지 않는다(PITFALLS 동적 뷰포트). 최소 높이만 dvh로 두고
// 내용이 길면 그만큼 늘어난다. 일반 스크롤이라 섹션이 화면에 갇힐 이유가 없다.

import { spacing, typography, colors } from '../tokens.js';
import Eyebrow from './Eyebrow.jsx';

export default function Section({ id, eyebrow, headline, sub, temp = false, children }) {
  return (
    <section
      id={id}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: spacing.unit * 3,
        padding: `${spacing.section} ${spacing.gutter}`,
        maxWidth: spacing.maxWide,
        margin: '0 auto',
        width: '100%',
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
          {temp ? <TempMark /> : null}
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
            maxWidth: 720,
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

/** 확정 카피가 아님을 화면에 드러낸다. 임시 문장이 확정처럼 보이면 검수에서 못 걸린다. */
export function TempMark() {
  return (
    <span
      style={{
        marginLeft: 8,
        padding: '2px 8px',
        borderRadius: 999,
        border: `1px solid ${colors.line.strong}`,
        fontFamily: typography.family,
        fontSize: typography.caption.size,
        fontWeight: 400,
        letterSpacing: typography.hud.tracking,
        color: colors.text.dim,
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
      }}
    >
      임시
    </span>
  );
}
