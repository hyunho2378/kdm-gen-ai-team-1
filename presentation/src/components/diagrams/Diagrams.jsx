// 책임: 자체 제작 SVG 도식. 원본 영상과 사진은 쓰지 않는다(A2 사양, 저작권 방어).
// 색은 전부 tokens 경유. 도식은 장식이 아니라 설명 수단이므로 라벨을 함께 둔다.
// SVG라 3840에서도 흐려지지 않는다(RESPONSIVE 3840 최소 요구 3).

import { colors, typography } from '../../tokens.js';
import { RULES } from '../../content/rules.js';

const label = {
  fontFamily: typography.family,
  fontSize: 13,
  fill: colors.text.dim,
  letterSpacing: '0.04em',
};

function Frame({ children, viewBox = '0 0 480 300', ...rest }) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      {...rest}
    >
      {children}
    </svg>
  );
}

/** 배경 섹션: 관람용 시각화에서 훈련 도구로 방향이 바뀐다는 계보 도식 */
export function LineageDiagram() {
  return (
    <Frame aria-label="검끝 궤적 시각화가 관람에서 훈련으로 옮겨가는 계보 도식">
      <line x1="40" y1="150" x2="440" y2="150" stroke={colors.line.default} strokeWidth="1" />
      {[
        { x: 90, t: '경기 중계', s: '관람' },
        { x: 240, t: '궤적 합성', s: '시각화' },
        { x: 390, t: '반복 훈련', s: '간합' },
      ].map((n, i) => (
        <g key={n.t}>
          <circle
            cx={n.x}
            cy="150"
            r={i === 2 ? 9 : 6}
            fill={i === 2 ? colors.red.light : colors.steel.mid}
          />
          <text x={n.x} y="126" textAnchor="middle" style={{ ...label, fill: colors.text.primary }}>
            {n.t}
          </text>
          <text x={n.x} y="180" textAnchor="middle" style={label}>
            {n.s}
          </text>
        </g>
      ))}
      {/* 마지막 구간만 레드로 물든다. 우리가 되돌리는 방향이다 */}
      <path d="M255 150 L 375 150" stroke={colors.red.light} strokeWidth="2" strokeLinecap="round" />
      <path d="M366 145 L 378 150 L 366 155" fill="none" stroke={colors.red.light} strokeWidth="2" strokeLinecap="round" />
    </Frame>
  );
}

/** 인사이트 섹션: 연속 궤적이 이산 데이터 포인트로 바뀌는 도식 */
export function TrajectoryToDataDiagram() {
  const path = 'M40 210 C 130 90, 250 250, 440 110';
  const dots = [
    [40, 210], [110, 152], [175, 155], [240, 190], [310, 175], [378, 138], [440, 110],
  ];
  return (
    <Frame aria-label="검끝의 연속 궤적이 학습 가능한 데이터 포인트로 변환되는 도식">
      <path d={path} fill="none" stroke={colors.red.glow} strokeWidth="10" strokeLinecap="round" />
      <path d={path} fill="none" stroke={colors.red.light} strokeWidth="2" strokeLinecap="round" />
      {dots.map(([x, y], i) => (
        <g key={x}>
          <circle cx={x} cy={y} r="4" fill={colors.bg.base} stroke={colors.steel.hi} strokeWidth="1.5" />
          {i % 2 === 0 ? (
            <text x={x} y={y - 14} textAnchor="middle" style={label}>
              {`t${i}`}
            </text>
          ) : null}
        </g>
      ))}
      <text x="40" y="264" style={label}>연속 궤적</text>
      <text x="440" y="264" textAnchor="end" style={{ ...label, fill: colors.text.primary }}>
        학습 가능한 정보
      </text>
    </Frame>
  );
}

/** 인터랙션 1. 블레이드 트래킹 */
export function BladeTrackingDiagram() {
  return (
    <Frame aria-label="내 검과 상대 검의 궤적이 소유 색으로 구분되는 도식">
      <path d="M40 200 C 150 120, 260 240, 430 140" fill="none" stroke={colors.trail.selfGlow} strokeWidth="12" strokeLinecap="round" />
      <path d="M40 200 C 150 120, 260 240, 430 140" fill="none" stroke={colors.trail.self} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M440 90 C 330 170, 210 60, 50 130" fill="none" stroke={colors.trail.aiGlow} strokeWidth="12" strokeLinecap="round" />
      <path d="M440 90 C 330 170, 210 60, 50 130" fill="none" stroke={colors.trail.ai} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="238" cy="163" r="7" fill={colors.trail.hit} />
      <text x="238" y="146" textAnchor="middle" style={{ ...label, fill: colors.text.primary }}>명중</text>
      <text x="40" y="264" style={{ ...label, fill: colors.red.light }}>내 검</text>
      <text x="440" y="264" textAnchor="end" style={{ ...label, fill: colors.blue.light }}>상대 검</text>
    </Frame>
  );
}

/** 인터랙션 2. 풋워크 판정. 유효 범위는 judge 사양값을 그대로 읽는다 */
export function DistanceGaugeDiagram() {
  const x = (v) => 40 + (v / RULES.D_MAX) * 400;
  return (
    <Frame aria-label="간합 게이지와 유효 범위 밴드 도식">
      <rect x="40" y="140" width="400" height="12" rx="6" fill={colors.bg.raised} stroke={colors.line.default} />
      <rect
        x={x(RULES.VALID_MIN)}
        y="140"
        width={x(RULES.VALID_MAX) - x(RULES.VALID_MIN)}
        height="12"
        fill={colors.red.glow}
      />
      <line x1={x(RULES.VALID_MIN)} y1="134" x2={x(RULES.VALID_MIN)} y2="158" stroke={colors.red.light} strokeWidth="2" />
      <line x1={x(RULES.VALID_MAX)} y1="134" x2={x(RULES.VALID_MAX)} y2="158" stroke={colors.red.light} strokeWidth="2" />
      <rect x={x(46) - 2} y="128" width="4" height="36" rx="2" fill={colors.text.primary} />
      <text x={x(RULES.VALID_MIN)} y="122" textAnchor="middle" style={label}>{RULES.VALID_MIN}</text>
      <text x={x(RULES.VALID_MAX)} y="122" textAnchor="middle" style={label}>{RULES.VALID_MAX}</text>
      <text x="40" y="196" style={label}>후퇴</text>
      <text x="440" y="196" textAnchor="end" style={label}>전진</text>
      <text x="240" y="228" textAnchor="middle" style={{ ...label, fill: colors.text.primary }}>
        유효 범위 안에서만 찌르기가 성립한다
      </text>
    </Frame>
  );
}

/** 인터랙션 3. 페인트 판독 분기 */
export function FeintBranchDiagram() {
  return (
    <Frame aria-label="예고 동작이 페인트와 실제 공격으로 갈리는 분기 도식">
      <circle cx="80" cy="150" r="10" fill={colors.blue.light} />
      <text x="80" y="128" textAnchor="middle" style={{ ...label, fill: colors.text.primary }}>예고</text>
      <path d="M96 144 L 230 96" stroke={colors.steel.shadow} strokeWidth="2" strokeLinecap="round" />
      <path d="M96 156 L 230 204" stroke={colors.red.light} strokeWidth="2" strokeLinecap="round" />
      <g>
        <text x="244" y="92" style={{ ...label, fill: colors.text.primary }}>페인트</text>
        <text x="244" y="112" style={label}>가드해도 페널티 없음</text>
      </g>
      <g>
        <text x="244" y="200" style={{ ...label, fill: colors.red.light }}>실제 공격</text>
        <text x="244" y="220" style={label}>가드하면 패리, 놓치면 실점</text>
      </g>
    </Frame>
  );
}

/** 인터랙션 4. 시간 팽창 비네트 미니어처 */
export function TimeDilationDiagram() {
  return (
    <Frame aria-label="최적 타이밍에서 시야가 슬로우모션으로 열리는 비네트 도식">
      <defs>
        <radialGradient id="dilation-vig" cx="50%" cy="50%" r="50%">
          <stop offset="42%" stopColor={colors.bg.deep} stopOpacity="0" />
          <stop offset="100%" stopColor={colors.bg.deep} stopOpacity="0.95" />
        </radialGradient>
      </defs>
      <rect x="40" y="40" width="400" height="220" rx="12" fill={colors.bg.raised} />
      <path d="M90 210 C 190 130, 290 230, 400 120" fill="none" stroke={colors.trail.self} strokeWidth="2.5" strokeLinecap="round" />
      {[0.25, 0.5, 0.75].map((t) => (
        <circle key={t} cx={90 + 310 * t} cy={210 - 70 * t} r="3" fill={colors.text.dim} />
      ))}
      <rect x="40" y="40" width="400" height="220" rx="12" fill="url(#dilation-vig)" />
      <text x="240" y="152" textAnchor="middle" style={{ ...label, fill: colors.text.primary, fontSize: 15 }}>
        {`x${RULES.DILATION_SCALE}`}
      </text>
      <text x="240" y="286" textAnchor="middle" style={label}>
        {`최대 ${RULES.DILATION_MAX_MS}ms, 쿨다운 ${RULES.DILATION_COOLDOWN_MS / 1000}초`}
      </text>
    </Frame>
  );
}
