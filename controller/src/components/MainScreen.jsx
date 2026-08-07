// MainScreen — 앱 셸. 상단 바 + 탭 내용 + 하단 3탭.
//
// **연결된 뒤에만 이 화면이 선다.** 예전에는 여기 들어온 다음 "대전 시작"을 눌러야
// 페어링으로 갔는데, 그러면 연결 전 세 탭이 아무 일도 못 하는 채로 서 있었다.
// 이제 흐름이 `HOME(게스트 로그인) -> CONNECT(방 코드) -> MAIN`이라 탭이 뜬 시점에
// 이미 arena와 붙어 있다.
//
// ── 세 탭이 하는 일 ─────────────────────────────────────────────────────────
//   RECORDS     승률 도넛 + 점수 추이 + 경기 이력
//   CONTROLLER  con1 제품 이미지 + 조작 설정과 보정. **대전 시작 버튼이 없다**
//   OPPONENT    유파 4종을 하나하나 보고 고른다. 목록과 상세가 한 탭 안에 있다
//
// **대전 시작은 상대를 고르는 것이 곧 시작이다.** 버튼 둘이 같은 일을 하던 것을 하나로 접었다.
//
// 카드는 bg.raised + line.default + radius.card로 강릉페이 카드 규칙과 같다. 색만 VORTEX 네이비.
// Nielsen: #1 상태 가시성(상단 연결 표시), #6 재인(탭 라벨 상시). Shneiderman: #1 일관성.

import { useState } from 'react';
import { Check, ChevronRight, Link2 } from 'lucide-react';
import { colors, ig, radius, typography } from '../tokens.js';
import { BRAND, MAIN, SAMPLE_RECORDS, SELECT } from '../copy.js';
import { ChartCard, DonutChart, TrendChart } from './Charts.jsx';
import TabBar from './TabBar.jsx';
import Button from './common/Button.jsx';

const SCROLL = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  padding: '16px 16px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export default function MainScreen({
  tab,
  onTab,
  records,
  recordsEnabled,
  paired,
  support,
  tapMode,
  calibrated,
  onCalibrate,
  onSelect,
  onFocus,
  picked,
}) {
  const title = MAIN.tabs.find((t) => t.key === tab)?.title ?? '';

  return (
    <>
      <AppBar title={title} paired={paired} />

      {tab === 'RECORDS' ? <RecordsTab records={records} enabled={recordsEnabled} /> : null}
      {tab === 'CONTROLLER' ? (
        <ControllerTab support={support} tapMode={tapMode} calibrated={calibrated} onCalibrate={onCalibrate} />
      ) : null}
      {tab === 'OPPONENT' ? <OpponentTab onSelect={onSelect} onFocus={onFocus} picked={picked} /> : null}

      <TabBar active={tab} onChange={onTab} />
    </>
  );
}

/** 상단 바. 로고와 연결 상태. **상태 표시가 이 바의 유일한 일이다.** */
function AppBar({ title, paired }) {
  return (
    <header
      style={{
        flexShrink: 0,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        borderBottom: `1px solid ${colors.line.default}`,
        background: colors.bg.base,
      }}
    >
      {/* presentation-v2에서 가져온 흰색 로고. 어두운 무대라 그대로 얹힌다 */}
      <img src="/logo.svg" alt={BRAND} style={{ height: 18, width: 'auto', display: 'block' }} />
      <span
        style={{
          flex: 1,
          fontFamily: typography.family,
          fontSize: ig.subhead.size,
          fontWeight: 600,
          color: colors.text.secondary,
        }}
      >
        {title}
      </span>
      {/* 연결 표시. **색만으로 말하지 않는다.** 아이콘과 글자가 함께 선다 */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: typography.family,
          fontSize: ig.caption2.size,
          color: paired ? colors.text.primary : colors.text.dim,
        }}
      >
        <Link2 size={14} color={paired ? colors.accent.base : colors.text.dim} aria-hidden="true" />
        {paired ? MAIN.connected : MAIN.connect}
      </span>
    </header>
  );
}

/**
 * RECORDS. 승률 도넛 + 점수 추이 + 경기 이력.
 *
 * **서버 기록이 없으면 예시 표본이 선다.** 빈 화면으로 두면 이 탭이 무엇을 보여줄지
 * 알 수 없는데, 그렇다고 저장된 것처럼 보이면 거짓말이다. 그래서 `예시` 배지와
 * 저장 안 됨 안내를 함께 세운다(N1 상태 가시성).
 */
function RecordsTab({ records, enabled }) {
  const real = Array.isArray(records) && records.length > 0;
  const rows = real ? records : SAMPLE_RECORDS;
  const sample = !real;

  const win = rows.filter((r) => r.outcome === 'win').length;
  const lose = rows.filter((r) => r.outcome === 'lose').length;
  const draw = rows.filter((r) => r.outcome === 'draw').length;
  const rate = rows.length > 0 ? Math.round((win / rows.length) * 100) : 0;

  const slices = [
    { key: 'win', label: MAIN.recordsWin, value: win, color: colors.text.primary },
    { key: 'lose', label: MAIN.recordsLose, value: lose, color: colors.primary.base },
    { key: 'draw', label: MAIN.recordsDraw, value: draw, color: colors.accent.dim },
  ];
  // 추이는 오래된 경기가 왼쪽이다. 서버는 최신순으로 주므로 뒤집는다
  const points = [...rows].reverse().map((r, i) => ({ key: `${r.id ?? i}`, value: r.score_me ?? 0 }));

  return (
    <div style={SCROLL}>
      {enabled && real ? (
        <p style={{ margin: 0, fontFamily: typography.family, fontSize: ig.caption1.size, color: colors.text.dim }}>
          {MAIN.recordsNote}
        </p>
      ) : (
        <Notice title={MAIN.recordsOffTitle} body={MAIN.recordsOffBody} />
      )}

      <ChartCard title={MAIN.recordsRateLabel} badge={sample ? MAIN.recordsSampleBadge : null}>
        <DonutChart slices={slices} centerLabel={MAIN.recordsRateLabel} centerValue={`${rate}%`} />
      </ChartCard>

      <ChartCard title={MAIN.recordsTrendLabel} badge={sample ? MAIN.recordsSampleBadge : null}>
        <TrendChart points={points} />
      </ChartCard>

      <ChartCard title={MAIN.recordsHistoryLabel} badge={sample ? MAIN.recordsSampleBadge : null}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
          {rows.map((r, i) => (
            <li
              key={r.id ?? i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 44,
                borderTop: i === 0 ? 'none' : `1px solid ${colors.line.default}`,
              }}
            >
              <OutcomeTag outcome={r.outcome} />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: typography.family,
                  fontSize: ig.footnote.size,
                  color: colors.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {r.school_name ?? ''}
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
                {r.score_me ?? 0} : {r.score_ai ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}

/** 승패 태그. **색 단독 구분이 아니다.** 글자가 결과를 그대로 말한다. */
function OutcomeTag({ outcome }) {
  const label = outcome === 'win' ? MAIN.recordsWin : outcome === 'lose' ? MAIN.recordsLose : MAIN.recordsDraw;
  const on = outcome === 'win';
  return (
    <span
      style={{
        flexShrink: 0,
        width: 26,
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.xs,
        background: on ? colors.primary.fill : 'transparent',
        border: `1px solid ${on ? colors.primary.fill : colors.line.strong}`,
        fontFamily: typography.family,
        fontSize: ig.caption2.size,
        fontWeight: 700,
        color: colors.text.primary,
      }}
    >
      {label}
    </span>
  );
}

/**
 * CONTROLLER. **조작 상세 설정 화면이다.** 대전 시작 버튼이 없다.
 *
 * 예전에는 제품 소개와 대전 시작 버튼이 있어 이 탭이 조작 화면인지 소개인지 불명확했다.
 * 이제 실제 컨트롤러 사진(con1) 아래로 설정과 보정과 조작 안내가 온다.
 */
function ControllerTab({ support, tapMode, calibrated, onCalibrate }) {
  return (
    <div style={SCROLL}>
      {/* 제품. **con1.png는 139x237이라 확대하지 않는다.** 늘리면 가장자리가 뭉갠다 */}
      <section
        style={{
          background: colors.bg.raised,
          border: `1px solid ${colors.line.default}`,
          borderRadius: radius.card,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <img
          src="/con1.png"
          alt=""
          width={139}
          height={237}
          style={{ width: 92, height: 'auto', flexShrink: 0, display: 'block' }}
        />
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: typography.family,
              fontSize: ig.caption2.size,
              letterSpacing: '0.1em',
              color: colors.accent.base,
            }}
          >
            {MAIN.productName}
          </span>
          <h2
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: ig.title3.size,
              fontWeight: 700,
              color: colors.text.primary,
              wordBreak: 'keep-all',
            }}
          >
            {MAIN.productLine}
          </h2>
          <p
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: ig.footnote.size,
              lineHeight: 1.6,
              color: colors.text.secondary,
              wordBreak: 'keep-all',
            }}
          >
            {MAIN.productBody}
          </p>
        </div>
      </section>

      {/* 설정. 값은 프로토콜과 파이프라인이 실제로 쓰는 것이고 지어낸 수치가 없다 */}
      <Panel title={MAIN.setupTitle}>
        {MAIN.productSpecs.map((s, i) => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              paddingBlock: 12,
              borderTop: i === 0 ? 'none' : `1px solid ${colors.line.default}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ flex: 1, fontFamily: typography.family, fontSize: ig.footnote.size, color: colors.text.dim }}>
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: ig.footnote.size,
                  fontWeight: 600,
                  color: colors.text.primary,
                }}
              >
                {s.value}
              </span>
            </div>
            <span style={{ fontFamily: typography.family, fontSize: ig.caption2.size, color: colors.text.dim, wordBreak: 'keep-all' }}>
              {s.note}
            </span>
          </div>
        ))}
      </Panel>

      {/* 보정. **이 탭의 유일한 액션이다.** 대전 시작이 아니라 기준 자세를 다시 잡는 일 */}
      <Panel title={MAIN.calibTitle}>
        <p
          style={{
            margin: '0 0 14px',
            fontFamily: typography.family,
            fontSize: ig.footnote.size,
            lineHeight: 1.6,
            color: colors.text.secondary,
            wordBreak: 'keep-all',
          }}
        >
          {MAIN.calibBody}
        </p>
        <Button variant={calibrated ? 'outlined' : 'filled'} onClick={onCalibrate}>
          {calibrated ? MAIN.calibDone : MAIN.calibAction}
        </Button>
      </Panel>

      <Panel title={MAIN.sensorTitle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} color={support === 'none' ? colors.text.dim : colors.accent.base} aria-hidden="true" />
          <span style={{ fontFamily: typography.family, fontSize: ig.footnote.size, color: colors.text.primary }}>
            {support === 'none' ? MAIN.sensorNone : String(support ?? '').toUpperCase()}
          </span>
        </div>
        {tapMode ? (
          <p style={{ margin: '10px 0 0', fontFamily: typography.family, fontSize: ig.caption2.size, color: colors.text.dim }}>
            {MAIN.tapModeLabel}. {MAIN.tapModeBody}
          </p>
        ) : null}
      </Panel>

      <Panel title={MAIN.guideTitle}>
        {MAIN.guides.map((g, i) => (
          <div
            key={g.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              paddingBlock: 12,
              borderTop: i === 0 ? 'none' : `1px solid ${colors.line.default}`,
            }}
          >
            <span style={{ fontFamily: typography.family, fontSize: ig.footnote.size, fontWeight: 600, color: colors.text.primary }}>
              {g.label}
            </span>
            <span style={{ fontFamily: typography.family, fontSize: ig.caption1.size, color: colors.text.secondary, wordBreak: 'keep-all' }}>
              {g.body}
            </span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

/**
 * OPPONENT. **목록과 상세가 한 탭 안에 있다.**
 *
 * 예전에는 보기만 되는 목록(이 탭)과 선택 화면(별도 phase)이 갈려 있어서, 같은 카드
 * 넷을 두 벌로 그리고 문구도 두 곳에서 갈렸다. 이제 카드를 탭하면 상세가 열리고
 * 거기서 대전을 시작한다. 뒤로가기로 목록에 돌아온다.
 *
 * **훑는 것과 고르는 것이 다르다.** 상세를 여는 것은 FOCUS(표시용)이고 대전 버튼이
 * SELECT(확정)다. 채널이 갈려 있어 훑는 동안 arena의 상대가 안 바뀐다(protocol.js).
 */
function OpponentTab({ onSelect, onFocus, picked }) {
  const [open, setOpen] = useState(null);
  const card = open ? SELECT.cards.find((c) => c.school === open) : null;

  if (card) {
    return (
      <div style={SCROLL}>
        <button
          type="button"
          onClick={() => {
            setOpen(null);
            onFocus?.(null);
          }}
          style={{
            alignSelf: 'flex-start',
            minHeight: 44,
            padding: '0 4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: typography.family,
            fontSize: ig.subhead.size,
            color: colors.text.secondary,
            touchAction: 'manipulation',
          }}
        >
          {SELECT.back}
        </button>

        <CardFace card={card} big picked={picked === card.school} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontFamily: typography.family, fontSize: ig.body.size, lineHeight: 1.6, color: colors.text.primary, wordBreak: 'keep-all' }}>
            {card.style}
          </p>
          <p style={{ margin: 0, fontFamily: typography.family, fontSize: ig.subhead.size, lineHeight: 1.6, color: colors.text.secondary, wordBreak: 'keep-all' }}>
            {card.quote}
          </p>
          <p style={{ margin: 0, fontFamily: typography.family, fontSize: ig.footnote.size, lineHeight: 1.6, color: colors.text.dim, wordBreak: 'keep-all' }}>
            {card.fact}
          </p>
        </div>

        <Button variant="filled" onClick={() => onSelect(card.school)}>
          {SELECT.duel}
        </Button>
        <p style={{ margin: 0, fontFamily: typography.family, fontSize: ig.caption2.size, color: colors.text.dim, textAlign: 'center' }}>
          {MAIN.opponentPickedNote}
        </p>
      </div>
    );
  }

  return (
    <div style={SCROLL}>
      <p style={{ margin: 0, fontFamily: typography.family, fontSize: ig.caption1.size, color: colors.text.dim }}>
        {MAIN.opponentNote}
      </p>
      {SELECT.cards.map((c) => (
        <button
          key={c.school}
          type="button"
          onClick={() => {
            setOpen(c.school);
            onFocus?.(c.school);
          }}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <CardFace card={c} picked={picked === c.school} />
        </button>
      ))}
    </div>
  );
}

/** 유파 카드 얼굴. 목록과 상세가 같은 것을 쓴다. `big`이면 상세용으로 커진다. */
function CardFace({ card, big, picked }) {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: radius.card,
        border: `1px solid ${picked ? colors.accent.base : colors.line.default}`,
        background: `linear-gradient(150deg, ${colors.bg.raised} 0%, ${colors.primary.tonal} 140%)`,
        padding: big ? 20 : 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minHeight: big ? 148 : 96,
        justifyContent: 'flex-end',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontFamily: typography.family,
            fontSize: ig.caption2.size,
            letterSpacing: '0.08em',
            color: colors.accent.base,
          }}
        >
          {card.badge}
        </span>
        {picked ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontFamily: typography.family,
              fontSize: ig.caption2.size,
              color: colors.text.primary,
            }}
          >
            <Check size={12} aria-hidden="true" />
            {SELECT.picked}
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3
          style={{
            margin: 0,
            flex: 1,
            fontFamily: typography.family,
            fontSize: big ? ig.title2.size : ig.callout.size,
            fontWeight: 700,
            color: colors.text.primary,
            wordBreak: 'keep-all',
          }}
        >
          {card.name}
        </h3>
        {big ? null : <ChevronRight size={18} color={colors.text.dim} aria-hidden="true" />}
      </div>
      {big ? null : (
        <p
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: ig.caption1.size,
            lineHeight: 1.5,
            color: colors.text.secondary,
            wordBreak: 'keep-all',
          }}
        >
          {card.style}
        </p>
      )}
    </div>
  );
}

/** 설정 판. 제목과 표면을 한 곳에서 정한다. */
function Panel({ title, children }) {
  return (
    <section
      style={{
        background: colors.bg.raised,
        border: `1px solid ${colors.line.default}`,
        borderRadius: radius.card,
        padding: 16,
      }}
    >
      <h3
        style={{
          margin: '0 0 8px',
          fontFamily: typography.family,
          fontSize: ig.subhead.size,
          fontWeight: 600,
          color: colors.text.primary,
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

/** 안내 배너. 저장이 꺼져 있다는 사실을 화면에 그대로 적는다(N1). */
function Notice({ title, body }) {
  return (
    <section
      style={{
        border: `1px solid ${colors.line.strong}`,
        borderRadius: radius.card,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span style={{ fontFamily: typography.family, fontSize: ig.footnote.size, fontWeight: 600, color: colors.text.primary }}>
        {title}
      </span>
      <span style={{ fontFamily: typography.family, fontSize: ig.caption1.size, lineHeight: 1.5, color: colors.text.secondary, wordBreak: 'keep-all' }}>
        {body}
      </span>
    </section>
  );
}
