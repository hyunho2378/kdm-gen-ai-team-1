// MainScreen — 앱 셸. 게이트를 지나면 여기가 홈이다.
//
// **QR과 코드 입력을 전면에서 걷어냈다.** 예전에는 게스트로 시작하면 곧장 코드 입력 화면이라
// 앱의 첫 얼굴이 페어링 폼이었다. 페어링 자체는 그대로 살아 있고 상단 연결 액션 뒤로 물러난다
// (?room= 자동 주입 경로도 그대로다). 첫 화면이 제품을 말하고, 연결은 필요할 때 꺼낸다.
//
// 구성은 강릉페이 홈의 골격 그대로다. 상단 앱바(제목 + 우측 액션), 스크롤 본문, 하단 탭바.
// 카드는 bg.raised + line.default + radius.card로 원본 카드 규칙과 같다. 색만 VORTEX.
//
// Nielsen: #1 상태 가시성(연결 상태를 상단에 상시 노출), #6 인식 우선(탭에 다 보인다),
// #8 심미성(화면당 주 액션 1개). Shneiderman: #2 숙련자 지름길(탭 직행), #8 단기기억 부담 감소.

import { Link2 } from 'lucide-react';
import { colors, glow, ig, radius, typography } from '../tokens.js';
import { MAIN, SELECT } from '../copy.js';
import Button from './common/Button.jsx';
import TabBar from './TabBar.jsx';

// 제품 히어로 이미지 자리. **값이 들어오면 여기 하나만 고치면 된다.**
// brand의 ProductViewer가 MODEL_URL을 비워 두고 플레이스홀더로 내려앉는 것과 같은 규약이다.
// 임의로 만들어 넣지 않는다. 없는 동안은 아래 스틸 그라디언트 무대가 대신 선다
const PRODUCT_IMAGE = null;

function Card({ children, style }) {
  return (
    <div
      style={{
        background: colors.bg.raised,
        border: `1px solid ${colors.line.default}`,
        borderRadius: radius.card,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }) {
  return (
    <span
      style={{
        fontFamily: typography.family,
        fontSize: ig.footnote.size,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: colors.text.dim,
      }}
    >
      {children}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontFamily: typography.family, fontSize: ig.subhead.size, color: colors.text.secondary }}>{label}</span>
      <span
        style={{
          fontFamily: typography.family,
          fontSize: ig.subhead.size,
          fontWeight: 600,
          color: colors.text.primary,
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
          wordBreak: 'keep-all',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** 제품 무대. 이미지가 오면 그 자리를 채우고, 없으면 스틸 그라디언트가 선다. */
function ProductStage() {
  return (
    <div
      style={{
        height: 176,
        borderRadius: radius.card,
        border: `1px solid ${colors.line.default}`,
        background: PRODUCT_IMAGE
          ? colors.bg.deep
          : `radial-gradient(90% 70% at 50% 30%, ${colors.bg.raised} 0%, ${colors.bg.deep} 70%, ${colors.bg.base} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {PRODUCT_IMAGE ? (
        <img
          src={PRODUCT_IMAGE}
          alt={MAIN.productName}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      ) : (
        // 이미지 부재 플레이스홀더. SelectScreen 카드가 쓰는 것과 같은 처리다
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 116,
            borderRadius: radius.md,
            border: `1px solid ${colors.line.strong}`,
            background: `linear-gradient(160deg, ${colors.bg.raised} 0%, ${colors.bg.deep} 60%, ${colors.red.tonal} 140%)`,
          }}
        />
      )}
    </div>
  );
}

const OUTCOME_LABEL = { win: MAIN.recordsWin, loss: MAIN.recordsLose, draw: MAIN.recordsDraw };

/** `2026-08-07T...` → `8월 7일 14:03`. 목록에서 판을 가르는 것은 시각이다. */
function fmtPlayedAt(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const two = (n) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${two(d.getHours())}:${two(d.getMinutes())}`;
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}분 ${s % 60}초` : `${s}초`;
}

function RecordsPanel({ records, enabled }) {
  // 서버가 기록을 못 받는 상태를 빈 목록으로 위장하지 않는다. 사유가 보여야 고칠 수 있다
  if (!enabled) {
    return (
      <Card style={{ gap: 6 }}>
        <span style={{ fontFamily: typography.family, fontSize: ig.body.size, color: colors.text.primary }}>
          {MAIN.recordsOffTitle}
        </span>
        <span
          style={{
            fontFamily: typography.family,
            fontSize: ig.footnote.size,
            lineHeight: ig.footnote.leading,
            color: colors.text.dim,
            wordBreak: 'keep-all',
          }}
        >
          {MAIN.recordsOffBody}
        </span>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card style={{ alignItems: 'center', textAlign: 'center', gap: 6, padding: '32px 16px' }}>
        <span style={{ fontFamily: typography.family, fontSize: ig.body.size, color: colors.text.secondary }}>
          {MAIN.recordsEmpty}
        </span>
        <span style={{ fontFamily: typography.family, fontSize: ig.footnote.size, color: colors.text.dim }}>
          {MAIN.recordsEmptyHint}
        </span>
      </Card>
    );
  }

  return (
    <>
      {records.map((r) => (
        <Card key={r.id} style={{ gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span
              style={{
                fontFamily: typography.family,
                fontSize: ig.title3.size,
                fontWeight: ig.title3.weight,
                color: r.outcome === 'win' ? colors.red.light : colors.text.primary,
              }}
            >
              {OUTCOME_LABEL[r.outcome] ?? r.outcome}
            </span>
            <span
              style={{
                fontFamily: typography.family,
                fontSize: ig.callout.size,
                fontWeight: 600,
                color: colors.text.secondary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {r.score[0]} : {r.score[1]}
            </span>
          </div>
          {r.schoolName ? <Row label="상대" value={r.schoolName} /> : null}
          <Row label="명중률" value={r.thrusts > 0 ? `${Math.round((r.hits / r.thrusts) * 100)}%` : '—'} />
          <Row label="리포스트" value={`${r.ripostes}회`} />
          <Row label="경기 시간" value={fmtDuration(r.durationMs)} />
          <span
            style={{
              fontFamily: typography.family,
              fontSize: ig.caption1.size,
              color: colors.text.dim,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmtPlayedAt(r.playedAt)}
          </span>
        </Card>
      ))}
      <span
        style={{
          fontFamily: typography.family,
          fontSize: ig.caption1.size,
          color: colors.text.dim,
          lineHeight: ig.caption1.leading,
          wordBreak: 'keep-all',
        }}
      >
        {MAIN.recordsNote}
      </span>
    </>
  );
}

function ControllerPanel() {
  return (
    <>
      <ProductStage />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontFamily: typography.family,
            fontSize: ig.title2.size,
            fontWeight: ig.title2.weight,
            letterSpacing: ig.title2.tracking,
            color: colors.text.primary,
          }}
        >
          {MAIN.productName}
        </span>
        {/* **red 위에 굵기 700과 20px가 붙는 이유는 대비다.** red.light는 bg.base 위 4.02:1이라
            본문 취급이면 4.5:1에 0.48 모자란다. 18.66px 이상 + 굵기 700이면 대형으로 쳐서
            기준이 3.0:1이 되어 통과한다(아이브로우 v2와 같은 근거) */}
        <span
          style={{
            fontFamily: typography.family,
            fontSize: ig.title3.size,
            fontWeight: 700,
            letterSpacing: ig.title3.tracking,
            color: colors.red.light,
          }}
        >
          {MAIN.productLine}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: ig.subhead.size,
          lineHeight: ig.subhead.leading,
          color: colors.text.secondary,
          wordBreak: 'keep-all',
        }}
      >
        {MAIN.productBody}
      </p>
      <Card>
        <CardLabel>사양</CardLabel>
        {MAIN.productSpecs.map((s) => (
          <Row key={s.label} label={s.label} value={s.value} />
        ))}
      </Card>
    </>
  );
}

function OpponentPanel() {
  return (
    <>
      <span
        style={{
          fontFamily: typography.family,
          fontSize: ig.subhead.size,
          color: colors.text.dim,
          wordBreak: 'keep-all',
        }}
      >
        {MAIN.opponentNote}
      </span>
      {SELECT.cards.map((card) => (
        <Card key={card.school} style={{ gap: 6 }}>
          {/* **여기 배지는 red가 아니다.** 12px에 red.light를 쓰면 4.02:1이라 본문 기준에
              미달하고, 12px는 굵기를 올려도 대형 텍스트가 못 된다. 목록의 보조 메타라
              text.dim으로 둔다(red 액센트는 탭 아이콘과 주 CTA가 이미 진다) */}
          <span
            style={{
              fontFamily: typography.family,
              fontSize: ig.caption1.size,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: colors.text.dim,
            }}
          >
            {card.badge}
          </span>
          <span
            style={{
              fontFamily: typography.family,
              fontSize: ig.title3.size,
              fontWeight: ig.title3.weight,
              letterSpacing: ig.title3.tracking,
              color: colors.text.primary,
            }}
          >
            {card.name}
          </span>
          <span
            style={{
              fontFamily: typography.family,
              fontSize: ig.subhead.size,
              lineHeight: ig.subhead.leading,
              color: colors.text.secondary,
              wordBreak: 'keep-all',
            }}
          >
            {card.style}
          </span>
        </Card>
      ))}
    </>
  );
}

export default function MainScreen({ tab, onTab, records, recordsEnabled, paired, onConnect, onStart }) {
  const title = MAIN.tabs.find((t) => t.key === tab)?.title ?? '';

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: colors.bg.base }}>
      {/* 상단 앱바. 좌측 제목, 우측이 연결 액션이다. 페어링은 이 뒤에 있다 */}
      <div
        style={{
          height: 44,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: ig.title3.size,
            fontWeight: ig.title3.weight,
            letterSpacing: ig.title3.tracking,
            color: colors.text.primary,
          }}
        >
          {title}
        </h1>
        <button
          type="button"
          onClick={onConnect}
          style={{
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 4px',
            border: 'none',
            background: 'transparent',
            color: paired ? colors.text.dim : colors.red.light,
            fontFamily: typography.family,
            fontSize: ig.footnote.size,
            fontWeight: 600,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <Link2 size={16} aria-hidden="true" />
          {paired ? MAIN.connected : MAIN.connect}
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tab === 'RECORDS' ? <RecordsPanel records={records} enabled={recordsEnabled} /> : null}
        {tab === 'CONTROLLER' ? <ControllerPanel /> : null}
        {tab === 'OPPONENT' ? <OpponentPanel /> : null}
      </div>

      {/* 주 액션은 화면당 하나. 연결 여부와 무관하게 여기서 대전이 시작된다
          (안 붙어 있으면 App이 코드 입력으로 먼저 보낸다) */}
      <div style={{ flexShrink: 0, padding: '0 16px 12px' }}>
        <Button variant="filled" size="lg" onClick={onStart} style={{ boxShadow: glow.red }}>
          {MAIN.start}
        </Button>
      </div>

      <TabBar active={tab} onChange={onTab} />
    </div>
  );
}
