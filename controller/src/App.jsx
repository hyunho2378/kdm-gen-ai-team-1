import { typography, spacing } from './tokens.js';

// SETUP 단계 최소 화면. 센서 구현은 sensors/와 net/에서 진행한다.
export default function App() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-bg-base text-txt-primary"
      style={{ gap: spacing.unit * 2 }}
    >
      <h1
        style={{
          fontSize: typography.title.size,
          fontWeight: typography.title.weight,
          letterSpacing: typography.title.tracking,
          lineHeight: typography.title.leading,
        }}
      >
        간합 컨트롤러
      </h1>
      <p className="text-txt-secondary" style={{ fontSize: typography.body.size }}>
        SETUP 완료
      </p>
    </main>
  );
}
