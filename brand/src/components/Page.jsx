// 하위 페이지 공통 골격. 헤더가 상주하므로 상단 여백을 헤더 높이만큼 더 준다.
// 랜딩은 히어로가 화면을 통째로 쓰므로 이 골격을 쓰지 않는다.

import { colors, spacing, typography } from '../tokens.js';
import Eyebrow from './Eyebrow.jsx';

// 압축 제목 크기. **title(최대 68px)과 heading(최대 28px) 사이.** 목록 페이지에서 제목 블록이
// 첫 화면 절반을 먹어 카드가 밀리던 것을 줄인다. weight/tracking/leading은 title 그대로라 제목으로 읽힌다.
const COMPACT_TITLE_SIZE = 'clamp(1.5rem, 1rem + 1.8vw, 2.5rem)';

/**
 * @param fit 첫 화면 완결 모드(REBOOT_PLAN 2.3). 높이를 화면에 고정해 자식이 남는 세로를
 *   나눠 갖게 한다. 목록 페이지가 스크롤 없이 끝나야 할 때 쓴다.
 *   기본(false)은 내용만큼 늘어나는 일반 페이지다.
 * @param compact 제목 블록을 압축한다. 제목 크기를 낮추고 간격을 좁혀 상단이 적게 차지하게 한다.
 *   목록 페이지에서 카드가 첫 화면 안에 확실히 들어오게 하려고 쓴다(제품 인덱스).
 */
export default function Page({ eyebrow, headline, sub, fit = false, compact = false, children }) {
  return (
    <main
      className="vx-shell vx-page"
      style={{
        // fit이면 최소가 아니라 **높이 자체**를 화면으로 잡는다. 최소만 주면 자식의 flex가
        // 기댈 바닥이 없어 내용만큼 늘어나고 결국 스크롤이 생긴다
        [fit ? 'height' : 'minHeight']: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? spacing.unit * 2 : spacing.unit * 3,
      }}
    >
      {eyebrow ? <Eyebrow en={eyebrow.en} ko={eyebrow.ko} /> : null}

      {headline ? (
        <h1
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: compact ? COMPACT_TITLE_SIZE : typography.title.size,
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
