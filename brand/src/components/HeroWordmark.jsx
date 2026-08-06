// 히어로 워드마크. **평면 잉크다. 크롬 셰이더를 걷었다(BV2-2).**
//
// ── 걷어낸 근거 (실제 GPU에서 실측) ──────────────────────────────────────────
// `@paper-design/shaders`의 liquid-metal을 라이트 배경(#C1C1C1~#F6F6F6)에서 돌려
// 워드마크 자리 픽셀을 배경과 대조했다. 셰이더는 정상 가동했고(폴백 글자가 hidden이었다)
// 결과가 이랬다.
//
//   배경 밝기            207
//   워드마크 평균        193  →  대비 1.16:1
//   가장 밝은 획         252  →  대비 1.52:1   배경보다 밝아서 글자에 구멍이 난다
//   가장 어두운 획       102  →  대비 3.69:1   본문 4.5 미달
//
// 크롬은 어두운 무대에서 밝은 면이 도는 재질이다. 밝은 무대에서는 밝은 면이 배경과
// 같아져 획이 끊기고, 남는 것은 흐린 금속 얼룩이다. 확대 캡처로도 글자 모서리가 사라졌다.
// **평면 잉크는 같은 자리에서 10.57:1이다.** 헤더 워드마크와 스플래시가 이미 평면 잉크라
// (BV2-1) 셋이 같은 얼굴이 된다.
//
// `@paper-design/shaders` 의존성과 `public/licenses/paper-design-shaders/`는 건드리지 않았다.
// 배포물에서 코드가 빠지는 것과 패키지를 지우는 것은 다른 결정이라 사용자 판단으로 남긴다.

import { displayFamily, typography } from '../tokens.js';

/**
 * 워드마크 한 줄. 색은 `steelText`가 쥔다(v2에서 평면 잉크로 재정의됐다).
 * 크기는 display 토큰이고 히어로에서만 쓴다.
 */
export default function HeroWordmark({ text, style }) {
  return (
    <span
      data-enter="wordmark"
      style={{
        display: 'block',
        fontFamily: displayFamily,
        fontSize: typography.display.size,
        fontWeight: typography.display.weight,
        letterSpacing: typography.display.tracking,
        lineHeight: typography.display.leading,
        whiteSpace: 'nowrap',
        color: 'var(--text-primary)',
        ...style,
      }}
    >
      {text}
    </span>
  );
}
