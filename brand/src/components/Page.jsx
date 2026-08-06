// 하위 페이지 공통 골격. 헤더가 상주하므로 상단 여백을 헤더 높이만큼 더 준다.
// 랜딩은 히어로가 화면을 통째로 쓰므로 이 골격을 쓰지 않는다.

import { colors, spacing, typography } from '../tokens.js';
import Eyebrow from './Eyebrow.jsx';

/**
 * @param fit 첫 화면 완결 모드(REBOOT_PLAN 2.3). 높이를 화면에 고정해 자식이 남는 세로를
 *   나눠 갖게 한다. 목록 페이지가 스크롤 없이 끝나야 할 때 쓴다.
 *   기본(false)은 내용만큼 늘어나는 일반 페이지다.
 */
export default function Page({ eyebrow, headline, sub, fit = false, children }) {
  return (
    <main
      className="vx-shell vx-page"
      style={{
        // fit이면 최소가 아니라 **높이 자체**를 화면으로 잡는다. 최소만 주면 자식의 flex가
        // 기댈 바닥이 없어 내용만큼 늘어나고 결국 스크롤이 생긴다
        [fit ? 'height' : 'minHeight']: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.unit * 3,
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
