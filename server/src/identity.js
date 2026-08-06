// 책임: 익명 신원. 기록이 누구 것인지 가르는 유일한 기준이다.
//
// **httpOnly 쿠키 하나뿐이다.** localStorage와 sessionStorage는 프로젝트 금지 사항이고,
// 여기 값은 자바스크립트가 읽을 이유도 없다(앱은 "내 기록"만 물어보면 되고 id를 알 필요가 없다).
//
// 로그인은 아직 없다. 그래서 신원 종류를 나누지 않고 익명 id 하나로 누적한다
// (사용자 확정). 계정이 생기면 그때 이 파일이 승계 규칙을 갖는다.
//
// **cross-origin 배포 대비.** 폰은 Vercel, 서버는 Render라 도메인이 다르다. 그때는
// sameSite none과 secure가 둘 다 있어야 쿠키가 붙고, 프록시 뒤라 trust proxy도 필요하다.
// 로컬은 localhost끼리라 포트가 달라도 same-site로 쳐서 lax로 충분하다.

import { randomUUID } from 'node:crypto';

export const COOKIE_NAME = 'vx_id';
// 데모 기간을 넉넉히 덮는다. 폰을 다시 열어도 자기 기록이 남아 있어야 한다
const MAX_AGE_SEC = 60 * 60 * 24 * 365;

const isProd = () => process.env.NODE_ENV === 'production';

/** `a=1; b=2` 한 줄을 객체로. cookie-parser를 넣을 만한 일이 아니다. */
export function parseCookies(header) {
  const out = {};
  if (typeof header !== 'string') return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (!k) continue;
    out[k] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

/** 헤더에서 신원을 읽는다. 없으면 null이고 발급은 부르는 쪽이 정한다. */
export function identityFromHeaders(headers) {
  const id = parseCookies(headers?.cookie)[COOKIE_NAME];
  return typeof id === 'string' && id.length >= 8 ? id : null;
}

/**
 * 신원을 보장한다. 없으면 새로 발급하고 Set-Cookie를 건다.
 * **쿠키가 소켓보다 먼저 있어야 한다.** 소켓 핸드셰이크는 이미 있는 쿠키만 실어 나르므로
 * 앱은 접속 전에 이 경로를 한 번 때려서 신원을 받는다.
 */
export function ensureIdentity(req, res) {
  const existing = identityFromHeaders(req.headers);
  if (existing) return existing;
  const id = randomUUID();
  const parts = [
    `${COOKIE_NAME}=${id}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${MAX_AGE_SEC}`,
    `SameSite=${isProd() ? 'None' : 'Lax'}`,
  ];
  if (isProd()) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
  return id;
}
