// 푸터. 사이트의 맨 아래 한 덩어리다.
//
// **랜딩에 있던 것을 제품 페이지로 옮겼다.** 사이트가 제품 5탭 한 페이지로 줄면서
// 랜딩이 사라졌는데, 그대로 두면 크레딧과 팀과 저작권이 사이트에서 통째로 없어진다.
//
// **메뉴 줄만 뺐다.** 헤더의 네 항목을 그대로 받아 쓰던 자리인데 그 페이지들이 전부
// 사라져서 링크가 갈 곳이 없다. 워드마크도 링크를 걷었다. 지금 있는 페이지가 이것뿐이라
// 자기 자신으로 가는 링크가 된다.
//
// **무배경, 선 없음.** 층은 여백이 낸다(REBOOT_PLAN 2.1).

import { colors, displayFamily, spacing, steelText, typography } from '../tokens.js';
import { FOOTER } from '../copy.js';

export default function Footer() {
  return (
    <footer
      className="vx-shell"
      style={{
        paddingBlock: spacing.unit * 6,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit * 3,
      }}
    >
      <span
        style={{
          fontFamily: displayFamily,
          fontSize: typography.heading.size,
          fontWeight: typography.display.weight,
          letterSpacing: typography.display.tracking,
          lineHeight: 1,
          ...steelText,
        }}
      >
        {FOOTER.wordmark}
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 0.5 }}>
        <span style={metaStyle}>{FOOTER.credit}</span>
        <span style={metaStyle}>{FOOTER.team}</span>
      </div>

      <span style={metaStyle}>{FOOTER.copyright}</span>
    </footer>
  );
}

const metaStyle = {
  fontFamily: typography.family,
  fontSize: typography.caption.size,
  color: colors.text.dim,
  wordBreak: 'keep-all',
};
