// RECORDS 탭 차트 둘. **SVG로 직접 그린다. 차트 라이브러리를 안 들인다.**
//
// 필요한 것이 도넛 하나와 꺾은선 하나뿐이라 라이브러리를 들이면 번들만 커진다
// (DESIGN 15절 출처 계약은 "가져오면 실파일을 읽고 쓴다"이지 "무엇이든 가져온다"가 아니다).
//
// **색으로만 구분하지 않는다**(DESIGN 13절). 도넛은 조각마다 라벨과 숫자를 함께 세우고,
// 꺾은선은 점과 값을 함께 찍는다. 색을 못 보는 눈에도 같은 정보가 남는다.
//
// 모션을 줄여 달라고 했으면 전역 CSS가 전환을 끄고, 여기 애니메이션은 애초에 없다.

import { colors, ig, radius, typography } from '../tokens.js';

/**
 * 승률 도넛. 조각은 승/패/무 셋이고 가운데에 승률을 적는다.
 *
 * **stroke-dasharray로 그린다.** path를 계산하면 0퍼센트와 100퍼센트에서 호가 사라지거나
 * 겹치는 경계 조건이 생기는데, 원 하나에 대시를 얹으면 그 경계가 없다.
 */
export function DonutChart({ slices, centerLabel, centerValue, size = 132, thickness = 16 }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${centerLabel} ${centerValue}`}>
          {/* 바닥 링. 표본이 0이어도 원은 남아 자리가 안 접힌다 */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.line.default} strokeWidth={thickness} />
          {total > 0
            ? slices.map((s) => {
                const len = (s.value / total) * c;
                const dash = `${len} ${c - len}`;
                const rot = (offset / c) * 360 - 90;
                offset += len;
                return (
                  <circle
                    key={s.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={thickness}
                    strokeDasharray={dash}
                    transform={`rotate(${rot} ${size / 2} ${size / 2})`}
                  />
                );
              })
            : null}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <span
            style={{
              fontFamily: typography.family,
              fontSize: ig.title2.size,
              fontWeight: 700,
              color: colors.text.primary,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {centerValue}
          </span>
          <span style={{ fontFamily: typography.family, fontSize: ig.caption2.size, color: colors.text.dim }}>
            {centerLabel}
          </span>
        </div>
      </div>

      {/* 범례. **색 옆에 항상 이름과 숫자가 붙는다** */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 0 }}>
        {slices.map((s) => (
          <li key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 999, background: s.color, flexShrink: 0 }} />
            <span style={{ fontFamily: typography.family, fontSize: ig.footnote.size, color: colors.text.secondary, flex: 1 }}>
              {s.label}
            </span>
            <span
              style={{
                fontFamily: typography.family,
                fontSize: ig.footnote.size,
                fontWeight: 600,
                color: colors.text.primary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 점수 추이 꺾은선. 경기 순서대로 내가 낸 점수를 잇는다.
 *
 * **격자를 긋지 않는다.** 표본이 열 개 안쪽이라 격자가 있으면 선보다 격자가 먼저 읽힌다.
 * 대신 최대값 가로선 하나만 두어 높이의 기준을 준다.
 */
export function TrendChart({ points, height = 120, max = 5 }) {
  const w = 100; // viewBox 가로 단위. preserveAspectRatio none으로 폭을 채운다
  const pad = 6;
  const n = Math.max(points.length, 2);
  const x = (i) => pad + (i * (w - pad * 2)) / (n - 1);
  const y = (v) => height - pad - (Math.min(v, max) / max) * (height - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(p.value).toFixed(2)}`).join(' ');

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height, display: 'block' }}
        role="img"
        aria-label={`점수 추이. ${points.map((p) => p.value).join(', ')}`}
      >
        {/* 상한선. 5점이 경기 승리 점수라 그 자리가 기준이 된다 */}
        <line x1={pad} y1={y(max)} x2={w - pad} y2={y(max)} stroke={colors.line.default} strokeWidth={0.6} />
        <path
          d={d}
          fill="none"
          stroke={colors.accent.base}
          strokeWidth={1.4}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p, i) => (
          <circle key={p.key} cx={x(i)} cy={y(p.value)} r={2} fill={colors.text.primary} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {/* 값을 글로도 남긴다. 선만 보면 정확한 점수를 못 읽는다 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {points.map((p) => (
          <span
            key={p.key}
            style={{
              fontFamily: typography.family,
              fontSize: ig.caption2.size,
              color: colors.text.dim,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {p.value}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 차트를 담는 판. 카드 표면과 여백을 한 곳에서 정한다. */
export function ChartCard({ title, badge, children }) {
  return (
    <section
      style={{
        background: colors.bg.raised,
        border: `1px solid ${colors.line.default}`,
        borderRadius: radius.card,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: ig.subhead.size,
            fontWeight: 600,
            color: colors.text.primary,
            flex: 1,
          }}
        >
          {title}
        </h3>
        {badge ? (
          <span
            style={{
              fontFamily: typography.family,
              fontSize: ig.caption2.size,
              color: colors.text.dim,
              border: `1px solid ${colors.line.default}`,
              borderRadius: radius.pill,
              padding: '2px 8px',
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
