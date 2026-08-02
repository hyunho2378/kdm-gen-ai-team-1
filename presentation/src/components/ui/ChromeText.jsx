// COMPONENTS.md: display와 title 한정. heading 이하 크기에서 사용 금지.
// 작은 크기에서 그라디언트는 가독성을 죽인다(DESIGN 2절 크롬 스틸).

import { forwardRef } from 'react';
import { colors, typography } from '../../tokens.js';

const ALLOWED = ['display', 'title'];

const ChromeText = forwardRef(function ChromeText(
  { as: Tag = 'h1', variant = 'display', children, style, ...rest },
  ref
) {
  // 가드 주석이 아니라 실제 가드다. 스펙 이탈을 코드가 막는다.
  if (!ALLOWED.includes(variant)) {
    throw new Error(`ChromeText는 display와 title에만 쓴다. 받은 값: ${variant}`);
  }
  const t = typography[variant];

  return (
    <Tag
      ref={ref}
      style={{
        margin: 0,
        fontFamily: typography.family,
        fontSize: t.size,
        fontWeight: t.weight,
        letterSpacing: t.tracking,
        lineHeight: t.leading,
        wordBreak: 'keep-all',
        backgroundImage: colors.steel.gradient,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default ChromeText;
