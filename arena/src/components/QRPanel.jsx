// COMPONENTS.md QRPanel / PAIRING. 방 코드와 QR을 함께 낸다.
//
// QR은 qrcode-generator(MIT, Kazuhiko Arase, 의존성 0)로 모듈 배열만 받아
// **SVG 사각형으로 직접 그린다.** 이미지 파일도 canvas도 만들지 않으므로
// 4K에서도 선명하고 DPR 처리가 필요 없다. 라이브러리는 인코딩만 하고 그리기는 우리가 한다.
//
// 색은 tokens 경유다. QR 판독기는 명암 대비만 보므로 어두운 모듈을 전경색으로 둔다.
// **바탕은 반드시 밝아야 한다.** 블랙 무대 위에 어두운 QR을 얹으면 카메라가 못 읽는다.
// 이 흰 판이 화면에서 유일하게 밝은 면인 것은 의도이고, 읽히는 것이 최우선이다.

import { useMemo } from 'react';
import qrcode from 'qrcode-generator';
import { colors, radius, typography } from '../tokens.js';

/** 타입 0은 데이터 길이에 맞춰 자동으로 고른다. M은 25퍼센트 복원력이다. */
const TYPE_AUTO = 0;
const ERROR_LEVEL = 'M';
/** 조용한 여백(모듈 단위). QR 규격 최소가 4다. 이보다 좁으면 판독률이 떨어진다. */
const QUIET = 4;

export default function QRPanel({ url, size = 220 }) {
  const modules = useMemo(() => {
    if (!url) return null;
    try {
      const qr = qrcode(TYPE_AUTO, ERROR_LEVEL);
      qr.addData(url);
      qr.make();
      const n = qr.getModuleCount();
      const cells = [];
      for (let r = 0; r < n; r += 1) {
        for (let c = 0; c < n; c += 1) if (qr.isDark(r, c)) cells.push([c, r]);
      }
      return { n, cells };
    } catch {
      // 인코딩 실패는 화면을 죽이지 않는다. 코드 숫자만 남고 손으로 입력하면 된다
      return null;
    }
  }, [url]);

  if (!modules) return null;

  const span = modules.n + QUIET * 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${span} ${span}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="컨트롤러 접속 QR"
      style={{ borderRadius: radius.sm, background: colors.steel.hi }}
    >
      <g fill={colors.bg.base}>
        {modules.cells.map(([x, y]) => (
          <rect key={`${x},${y}`} x={x + QUIET} y={y + QUIET} width={1} height={1} />
        ))}
      </g>
    </svg>
  );
}

/** 방 코드 표기. 사람이 눈으로 읽고 손으로 넣는 경로다. QR이 안 찍힐 때의 유일한 길이다. */
export function RoomCode({ code }) {
  return (
    <span
      style={{
        fontFamily: typography.family,
        fontSize: typography.display.size,
        fontWeight: typography.display.weight,
        letterSpacing: '0.16em',
        lineHeight: 1,
        color: colors.text.primary,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {code || '----'}
    </span>
  );
}
