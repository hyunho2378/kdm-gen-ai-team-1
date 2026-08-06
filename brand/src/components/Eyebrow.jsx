// 아이브로우 v2 (DESIGN 4절 개정, REBOOT_PLAN 2.2). 전 페이지가 이 컴포넌트 하나를 쓴다.
//
// **불릿 원(레드 점)을 없앴다.** 장식 요소를 걷어내는 전역 규율의 일부다.
// 원이 지던 존재감은 크기가 대신 진다(caption 13px에서 21px로, tokens의 eyebrow 역할).
// weight 600 세미볼드와 영문 위 국문 아래 스택은 유지한다.
//
// 색 단독 구분 금지(DESIGN 13절)는 여기서 문제가 되지 않는다. 아이브로우는 상태 표시가
// 아니라 라벨이고, 영문과 국문의 색 차이는 위계 표현이지 정보 구분이 아니다.
//
// **톤 인자를 받는다.** 관문 카드처럼 카드 안에서 쓰이는 자리는 레드가 과해서
// 예전에 개별 구현으로 갈라져 나갔다. 색만 갈아 끼우게 열어 두면 구현이 다시 안 갈라진다.

import { colors, typography } from '../tokens.js';

/** 라벨 색 갈래. 기본은 레드이고 카드 안처럼 조용해야 하는 자리는 plain을 쓴다. */
export const EYEBROW_TONE = {
  RED: 'red',
  PLAIN: 'plain',
};

const EN_COLOR = {
  [EYEBROW_TONE.RED]: colors.red.light,
  [EYEBROW_TONE.PLAIN]: colors.text.primary,
};

const base = {
  fontFamily: typography.family,
  fontSize: typography.eyebrow.size,
  fontWeight: typography.eyebrow.weight,
  letterSpacing: typography.eyebrow.tracking,
  lineHeight: typography.eyebrow.leading,
};

export default function Eyebrow({ en, ko, tone = EYEBROW_TONE.RED }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ ...base, color: EN_COLOR[tone] ?? EN_COLOR[EYEBROW_TONE.RED] }}>{en}</span>
      {ko ? <span style={{ ...base, color: colors.text.dim }}>{ko}</span> : null}
    </span>
  );
}
