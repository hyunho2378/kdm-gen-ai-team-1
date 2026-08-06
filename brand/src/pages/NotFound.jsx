// 전역 NotFound. 제품 상세의 "없는 제품이다"를 경로 전체로 승격한 것이다.
//
// **랜딩으로 리다이렉트하지 않는다.** 조용히 홈으로 튕기면 주소가 틀렸다는 사실이 화면에 안 남고
// 사람이 오타를 못 찾는다. 사유를 내고 돌아갈 길을 준다(PATTERNS 우아한 저하).

import { Link } from 'react-router-dom';
import { colors, radius, spacing, typography, weight } from '../tokens.js';
import { NOT_FOUND } from '../copy.js';

export default function NotFound() {
  return (
    <main
      className="vx-shell vx-page"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: spacing.unit * 2,
      }}
    >
      <span
        style={{
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          letterSpacing: typography.hud.tracking,
          fontWeight: weight.semibold,
          color: colors.red.light,
        }}
      >
        {NOT_FOUND.code}
      </span>
      <h1
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.title.size,
          fontWeight: typography.title.weight,
          letterSpacing: typography.title.tracking,
          lineHeight: typography.title.leading,
          color: colors.text.primary,
        }}
      >
        {NOT_FOUND.title}
      </h1>
      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.body.size,
          lineHeight: typography.body.leading,
          color: colors.text.secondary,
          wordBreak: 'keep-all',
        }}
      >
        {NOT_FOUND.line}
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 44,
          padding: '10px 20px',
          borderRadius: radius.pill,
          border: `1px solid ${colors.line.strong}`,
          fontFamily: typography.family,
          fontSize: typography.body.size,
          color: colors.text.primary,
          textDecoration: 'none',
        }}
      >
        {NOT_FOUND.home}
      </Link>
    </main>
  );
}
