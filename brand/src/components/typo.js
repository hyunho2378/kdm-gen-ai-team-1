// 페이지들이 공유하는 글자 규격. **다섯 라우트가 같은 자리를 같은 크기로 쓴다.**
//
// 라우트를 나누면서 같은 style 객체가 파일마다 복제될 자리라 한 곳으로 모았다.
// 값은 전부 tokens에서 나온다. 여기에 px나 HEX를 적지 마라.
//
// ── Apple 실측 위계 (1440) ──────────────────────────────────────────────────
//   스테이트먼트  56px      -> display  52.5px / 800
//   소제목       24px      -> heading  21.8px / 700
//   스펙 라벨     24px/600  -> heading  21.8px / 700
//   본문/스펙 값  17px      -> body     16.5px / 400

import { colors, typography } from '../tokens.js';

export const displayStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.display.size,
  fontWeight: typography.display.weight,
  letterSpacing: typography.display.tracking,
  lineHeight: typography.display.leading,
  color: colors.text.primary,
  maxWidth: 'var(--measure)',
  wordBreak: 'keep-all',
};

export const titleStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.title.size,
  fontWeight: typography.title.weight,
  letterSpacing: typography.title.tracking,
  lineHeight: typography.title.leading,
  color: colors.text.primary,
  maxWidth: 'var(--measure)',
  wordBreak: 'keep-all',
};

export const headingStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.heading.size,
  fontWeight: typography.heading.weight,
  letterSpacing: typography.heading.tracking,
  lineHeight: typography.heading.leading,
  color: colors.text.primary,
  wordBreak: 'keep-all',
};

/** 히어로와 섹션 머리 아래 한 줄. 본문보다 한 단 크다. */
export const leadStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.heading.size,
  lineHeight: typography.heading.leading,
  color: colors.text.secondary,
  maxWidth: 'var(--measure)',
  wordBreak: 'keep-all',
};

export const bodyStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  lineHeight: typography.body.leading,
  color: colors.text.secondary,
  maxWidth: 'var(--measure)',
  wordBreak: 'keep-all',
};

export const captionStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  color: colors.text.dim,
  wordBreak: 'keep-all',
};
