// 책임: 경기 기록 저장소. Postgres 하나만 본다.
//
// **DATABASE_URL이 없으면 기록 기능만 꺼진다.** 서버는 그대로 뜨고 중계도 그대로 돈다.
// 릴레이가 이 프로젝트의 본체이고 기록은 그 위에 얹힌 것이라, DB가 없다고 데모가
// 멈추면 안 된다(PATTERNS 8절 우아한 저하). 대신 그 사실을 기동 로그에 한 줄 남긴다.
//
// **비파괴 규율.** 이 파일에 DROP, TRUNCATE, DELETE가 없다. 스키마는 CREATE IF NOT EXISTS와
// ADD COLUMN IF NOT EXISTS로만 만들고, 쓰기는 append뿐이다. 서버를 몇 번 재시작해도
// 기존 행에 손대는 경로 자체가 존재하지 않는다.
//
// **판정과 무관하다.** 여기 있는 것은 이미 확정된 결과를 받아 적는 부수효과다.
// arena의 judge는 이 파일을 모르고, 쓰기가 실패해도 경기 진행에 영향이 없다.

import pg from 'pg';

let pool = null;
let ready = false;

/** DB를 쓸 수 있나. 라우트와 릴레이가 이걸 보고 조용히 건너뛴다. */
export function dbEnabled() {
  return ready;
}

/**
 * 기록 테이블. **컬럼은 결과 화면이 이미 내는 것에 맞춘다.**
 * 지표를 새로 만들지 않았다. arena가 sendResult로 보내는 필드가 그대로 열이다.
 *
 * 폰 통계(파워, 손떨림, 가드 수)는 여기 없다. 그 값들은 폰 안에서만 계산되고
 * 서버를 거치지 않아서, 저장하려면 폰이 직접 써넣는 경로를 열어야 한다.
 * 신뢰 경계를 지키려고 열지 않았다(사용자 확정: arena 것만 저장).
 */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS match_records (
     id           BIGSERIAL PRIMARY KEY,
     identity_id  TEXT        NOT NULL,
     school_name  TEXT,
     outcome      TEXT        NOT NULL,
     score_me     INTEGER     NOT NULL DEFAULT 0,
     score_ai     INTEGER     NOT NULL DEFAULT 0,
     thrusts      INTEGER     NOT NULL DEFAULT 0,
     hits         INTEGER     NOT NULL DEFAULT 0,
     ripostes     INTEGER     NOT NULL DEFAULT 0,
     piste_out    INTEGER     NOT NULL DEFAULT 0,
     duration_ms  INTEGER     NOT NULL DEFAULT 0,
     parts        JSONB       NOT NULL DEFAULT '{}'::jsonb,
     played_at    TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  // 이미 만들어진 테이블에도 안전하게 얹힌다. 열을 지우는 문장은 두지 않는다
  `ALTER TABLE match_records ADD COLUMN IF NOT EXISTS school_name TEXT`,
  `ALTER TABLE match_records ADD COLUMN IF NOT EXISTS thrusts     INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE match_records ADD COLUMN IF NOT EXISTS hits        INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE match_records ADD COLUMN IF NOT EXISTS ripostes    INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE match_records ADD COLUMN IF NOT EXISTS piste_out   INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE match_records ADD COLUMN IF NOT EXISTS duration_ms INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE match_records ADD COLUMN IF NOT EXISTS parts       JSONB NOT NULL DEFAULT '{}'::jsonb`,
  // 조회는 늘 "이 신원의 최근 것부터"라 그 모양 그대로 인덱스를 준다
  `CREATE INDEX IF NOT EXISTS match_records_identity_idx
     ON match_records (identity_id, played_at DESC)`,
];

/** 부트스트랩. 실패해도 던지지 않는다. 서버가 뜨는 것이 우선이다. */
export async function initDb() {
  const url = (process.env.DATABASE_URL ?? '').trim();
  if (!url) {
    console.log('[db] DATABASE_URL 없음. 기록 저장을 끄고 중계만 한다');
    return false;
  }
  try {
    // **인증서를 실제로 검증한다.** Neon 실물로 확인했다(엄격 검증 통과).
    // rejectUnauthorized를 끄면 중간자에게 문이 열리는데, 그것을 감수할 이유가 없었다.
    // 로컬 평문 접속만 sslmode=disable을 URL에 넣어 끈다.
    // 자체 서명 인증서를 쓰는 호스트로 옮기면 여기서 붙지 못하고, 그때는 조용히
    // 실패하지 않고 아래 catch가 사유를 로그에 남긴 뒤 기록만 꺼진다
    const ssl = /sslmode=disable/.test(url) ? false : true;
    pool = new pg.Pool({ connectionString: url, ssl, max: 4 });
    for (const stmt of SCHEMA) await pool.query(stmt);
    ready = true;
    console.log('[db] 기록 저장 준비됨');
    return true;
  } catch (err) {
    console.log(`[db] 연결 실패. 기록 저장을 끄고 중계만 한다 (${err.message})`);
    pool = null;
    ready = false;
    return false;
  }
}

/**
 * 경기 한 판을 append한다. **오직 삽입이다.**
 * 값은 arena가 확정해 보낸 것을 그대로 받아 적는다. 여기서 다시 계산하지 않는다.
 */
export async function insertRecord(identityId, r) {
  if (!ready || !identityId) return null;
  const score = Array.isArray(r?.score) ? r.score : [0, 0];
  const num = (v) => (Number.isFinite(v) ? Math.trunc(v) : 0);
  // winner가 비어 있는 경우만 무승부다. 그 외는 내가 이겼는지로 갈린다
  const outcome = r?.winner == null ? 'draw' : r.winner === 'ME' ? 'win' : 'loss';
  const { rows } = await pool.query(
    `INSERT INTO match_records
       (identity_id, school_name, outcome, score_me, score_ai,
        thrusts, hits, ripostes, piste_out, duration_ms, parts)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      identityId,
      typeof r?.schoolName === 'string' ? r.schoolName : null,
      outcome,
      num(score[0]),
      num(score[1]),
      num(r?.thrusts),
      num(r?.hits),
      num(r?.ripostes),
      num(r?.pisteOut),
      num(r?.durationMs),
      JSON.stringify(r?.parts && typeof r.parts === 'object' ? r.parts : {}),
    ]
  );
  return rows[0]?.id ?? null;
}

/** 한 신원의 누적 기록. 최근 것이 위로 온다. */
export async function listRecords(identityId, limit = 50) {
  if (!ready || !identityId) return [];
  const n = Math.min(200, Math.max(1, Math.trunc(limit) || 50));
  const { rows } = await pool.query(
    `SELECT id, school_name, outcome, score_me, score_ai,
            thrusts, hits, ripostes, piste_out, duration_ms, parts, played_at
       FROM match_records
      WHERE identity_id = $1
      ORDER BY played_at DESC, id DESC
      LIMIT $2`,
    [identityId, n]
  );
  // 선 위 이름은 앱이 쓰는 이름으로 맞춘다. 화면이 스네이크 케이스를 모르게 한다
  return rows.map((x) => ({
    id: String(x.id),
    schoolName: x.school_name,
    outcome: x.outcome,
    score: [x.score_me, x.score_ai],
    thrusts: x.thrusts,
    hits: x.hits,
    ripostes: x.ripostes,
    pisteOut: x.piste_out,
    durationMs: x.duration_ms,
    parts: x.parts ?? {},
    playedAt: x.played_at instanceof Date ? x.played_at.toISOString() : x.played_at,
  }));
}
