// 아이브로우 v2 (DESIGN 4절 개정, REBOOT_PLAN 2.2). 전 페이지가 이 컴포넌트 하나를 쓴다.
//
// **불릿 원(레드 점)을 없앴다.** 장식 요소를 걷어내는 전역 규율의 일부다.
// 원이 지던 존재감은 크기가 대신 진다(caption 13px에서 21px로, tokens의 eyebrow 역할).
// 영문 위 국문 아래 스택은 유지한다.
//
// **영문 라벨이 네이비다.** 아이브로우는 사이트에서 강조가 가장 자주 서는 자리이고,
// 프라이머리가 여기 있어야 브랜드 색이 페이지마다 한 번씩 나온다.
// 최악 배경(그라디언트 최상단 #C1C1C1)에서 5.97:1이라 12px 본문 기준 4.5를 넘긴다.
//
// **굵기는 tokens가 쥐고 여기서 덮지 않는다.**
//
// 색 단독 구분 금지(DESIGN 13절)는 여기서 문제가 되지 않는다. 아이브로우는 상태 표시가
// 아니라 라벨이고, 영문과 국문의 색 차이는 위계 표현이지 정보 구분이 아니다.
//
// **톤 인자를 걷었다.** 레드 시절 카드 안에서 색을 낮추려고 두었던 것인데, 레드가
// 사라지면서 두 갈래가 같은 값이 되어 이름만 남은 분기였다(`RED`가 잉크를 가리켰다).

import { colors, spacing, typography } from '../tokens.js';

const base = {
  fontFamily: typography.family,
  fontSize: typography.eyebrow.size,
  fontWeight: typography.eyebrow.weight,
  letterSpacing: typography.eyebrow.tracking,
  lineHeight: typography.eyebrow.leading,
};

export default function Eyebrow({ en, ko }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 0.5 }}>
      <span style={{ ...base, color: colors.accent.base }}>{en}</span>
      {ko ? <span style={{ ...base, color: colors.text.dim }}>{ko}</span> : null}
    </span>
  );
}
