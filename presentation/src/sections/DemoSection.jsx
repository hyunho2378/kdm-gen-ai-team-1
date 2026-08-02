// IA 2절 8번: 라이브 데모 진입. ROUTES.md 앱 간 이동 규칙에 따라 같은 탭으로 arena로 보낸다.
// PATTERNS 4절: 화면당 ButtonPrimary 하나. 주변을 비워 이 버튼이 섹션의 전부인 밀도를 만든다.

import { colors, spacing, typography } from '../tokens.js';
import { ButtonPrimary } from '../components/ui/Button.jsx';
import TrailDivider from '../components/ui/TrailDivider.jsx';
import Reveal from '../components/Reveal.jsx';

// 환경 변수 부재는 빌드 로그 경고로만 남긴다. 버튼을 비활성화하지 않는다(발표 흐름 우선).
const ARENA_URL = import.meta.env.VITE_ARENA_URL;
if (!ARENA_URL) {
  console.warn('[presentation] VITE_ARENA_URL 미설정. 데모 시작 버튼이 이동할 곳이 없다. 배포 전 설정할 것');
}

export default function DemoSection() {
  return (
    <Reveal
      style={{
        marginTop: spacing.unit * 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: spacing.unit * 4,
      }}
    >
      <div style={{ width: 'min(100%, 420px)' }}>
        <TrailDivider accent />
      </div>

      <ButtonPrimary
        large
        onClick={() => {
          if (ARENA_URL) window.location.href = ARENA_URL;
        }}
      >
        데모 시작
      </ButtonPrimary>

      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          letterSpacing: typography.caption.tracking,
          color: colors.text.dim,
          wordBreak: 'keep-all',
        }}
      >
        폰으로 QR을 찍으면 그 폰이 검이 된다
      </p>
    </Reveal>
  );
}
