// VORTEX_DESIGN_SYSTEM 2.4 아이브로우. 전 섹션이 이 컴포넌트 하나를 쓴다.
// 라벨 왼쪽에 레드 원 하나(지름 7px, baseline 정렬), weight 600.
// 영문 위 국문 아래 스택과 단일 라벨을 모두 지원한다.

import { colors, typography } from '../tokens.js';

export default function Eyebrow({ en, ko }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: colors.red.light,
          // 첫 줄의 시각 중심에 맞춘다. 글자 상단에 붙으면 원이 떠 보인다
          marginTop: '0.42em',
          flex: 'none',
        }}
      />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontFamily: typography.family,
            fontSize: typography.caption.size,
            fontWeight: 600,
            letterSpacing: typography.hud.tracking,
            color: colors.red.light,
          }}
        >
          {en}
        </span>
        {ko ? (
          <span
            style={{
              fontFamily: typography.family,
              fontSize: typography.caption.size,
              fontWeight: 600,
              color: colors.text.dim,
            }}
          >
            {ko}
          </span>
        ) : null}
      </span>
    </div>
  );
}
