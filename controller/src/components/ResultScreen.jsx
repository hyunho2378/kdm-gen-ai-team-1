// ResultScreen — 경기 결과 통계(B4). arena 결과 + 폰 센서 통계 합성.
//
// Strategy: 정직한 요약. arena 제공(점수/명중률/부위/리포스트/피스트아웃/시간) + 폰 자체 계산(손떨림/파워/가드).
// Nielsen: #1 상태 가시성(결과), #2 실세계 부합(등급 표현). Shneiderman: #3 정보성 피드백.
//
// 그래프는 라이브러리 없이 div 바. 카드 단위 정보 위계(HIG). 통계는 세션 메모리뿐임을 Footnote로 정직 명시.

import { colors, ig, radius, typography } from '../tokens.js';
import Button from './common/Button.jsx';

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}분 ${s % 60}초` : `${s}초`;
}
const pct = (x) => `${Math.round(x * 100)}%`;

function Card({ title, children }) {
  return (
    <div style={{ background: colors.bg.raised, border: `1px solid ${colors.line.default}`, borderRadius: radius.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontFamily: typography.family, fontSize: ig.footnote.size, fontWeight: 700, letterSpacing: '0.06em', color: colors.text.dim }}>{title}</span>
      {children}
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontFamily: typography.family, fontSize: ig.subhead.size, color: colors.text.secondary }}>{label}</span>
      <span style={{ fontFamily: typography.family, fontSize: ig.callout.size, fontWeight: 600, color: accent ? colors.red.light : colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function Bar({ label, value, max }) {
  const w = max > 0 ? value / max : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: typography.family, fontSize: ig.footnote.size, color: colors.text.secondary }}>
        <span>{label}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: colors.text.dim }}>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: radius.small, background: colors.bg.base, overflow: 'hidden' }}>
        <div style={{ width: pct(w), height: '100%', background: colors.red.fill, borderRadius: radius.small }} />
      </div>
    </div>
  );
}

export default function ResultScreen({ result, onAgain, onHome }) {
  const partEntries = result ? Object.entries(result.parts).filter(([, v]) => v > 0) : [];
  const partMax = partEntries.reduce((m, [, v]) => Math.max(m, v), 0);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: colors.bg.base }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 헤더: 승패 + 스코어 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ margin: 0, fontFamily: typography.family, fontSize: ig.largeTitle.size, fontWeight: ig.largeTitle.weight, letterSpacing: ig.largeTitle.tracking, color: result?.win ? colors.red.light : colors.text.primary }}>
            {result ? (result.win ? '승리' : '패배') : '경기 종료'}
          </h1>
          {result ? (
            <span style={{ fontFamily: typography.family, fontSize: ig.title2.size, fontWeight: 700, color: colors.text.secondary, fontVariantNumeric: 'tabular-nums' }}>
              {result.score[0]} : {result.score[1]}
            </span>
          ) : null}
        </div>

        {result ? (
          <>
            <Card title="경기">
              <Bar label="명중률" value={pct(result.accuracy)} max={1} />
              <Row label="리포스트 성공" value={`${result.ripostes}회`} />
              <Row label="피스트 아웃" value={`${result.pisteOut}회`} />
              <Row label="경기 시간" value={fmtDuration(result.durationMs)} />
            </Card>

            {partEntries.length > 0 ? (
              <Card title="부위 분포">
                {partEntries.map(([name, v]) => (
                  <Bar key={name} label={name} value={v} max={partMax} />
                ))}
              </Card>
            ) : null}

            <Card title="폰 통계">
              <Row
                label="자세 안정도"
                value={result.stability ? result.stability.grade : '센서 미사용'}
                accent={result.stability?.grade === '흔들림'}
              />
              <Row label="최대 찌르기 파워" value={result.maxPower > 0 ? pct(result.maxPower) : '—'} />
              <Row label="평균 찌르기 파워" value={result.avgPower > 0 ? pct(result.avgPower) : '—'} />
              <Row label="찌르기 수" value={`${result.phoneThrusts}회`} />
              <Row label="가드 수" value={`${result.guards}회`} />
            </Card>
          </>
        ) : (
          <span style={{ fontFamily: typography.family, fontSize: ig.body.size, color: colors.text.dim }}>결과를 불러오지 못했다.</span>
        )}
      </div>

      <div style={{ padding: '8px 16px calc(env(safe-area-inset-bottom) + 16px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outlined" size="md" onClick={onHome}>처음으로</Button>
          <Button variant="filled" size="md" onClick={onAgain}>다시 대전</Button>
        </div>
        <span style={{ textAlign: 'center', fontFamily: typography.family, fontSize: ig.caption1.size, color: colors.text.dim }}>
          이 경기는 RECORDS 탭에 쌓입니다. 서버 저장은 아직 없어 앱을 닫으면 사라집니다.
          손떨림은 자세 안정도의 근사 지표입니다.
        </span>
      </div>
    </div>
  );
}
