// COMPONENTS.md: 검끝 곡선 한 줄 모티프 SVG. 기본 steel, 강조 맥락만 red.light.
// 두께가 한쪽으로 감쇠한다. DESIGN 10절의 모티프이므로 임의 변형 금지.
// 세로 변형은 cover 하단 스크롤 유도에 쓴다.

import { colors } from '../../tokens.js';

/**
 * @param orientation 'horizontal' 섹션 구분 / 'vertical' 스크롤 유도
 * @param accent true면 red.light. demo 근접 맥락에서만
 */
export default function TrailDivider({ orientation = 'horizontal', accent = false, length = 120 }) {
  const stroke = accent ? colors.red.light : colors.steel.mid;
  const vertical = orientation === 'vertical';
  const gradId = `trail-fade-${orientation}-${accent ? 'a' : 'n'}`;

  return (
    <svg
      aria-hidden="true"
      width={vertical ? 24 : '100%'}
      height={vertical ? length : 24}
      viewBox={vertical ? '0 0 24 120' : '0 0 1200 24'}
      preserveAspectRatio={vertical ? 'xMidYMax meet' : 'none'}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
          <stop offset="0%" stopColor={stroke} stopOpacity="0.85" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* 검끝이 그리는 곡선 한 줄. 끝으로 갈수록 얇아지고 사라진다 */}
      <path
        d={vertical ? 'M12 0 C 12 44, 6 72, 12 120' : 'M0 12 C 300 2, 900 22, 1200 12'}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
