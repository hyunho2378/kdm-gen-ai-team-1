import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // **`three` dedupe를 걷었다.** brand에 three를 쓰는 파일이 하나도 안 남았다.
  // 히어로 리본 캔버스(`HeroTrail`)는 표지 구도 세션에서, 제품 3D 뷰어(`ProductViewer`)는
  // 렌더 배치 세션에서 사라졌고 의존도 `npm uninstall three`로 걷었다.
  // 그 dedupe는 arena 파일을 직접 import하던 시절 clean 체크아웃에서 Vercel이
  // `Rolldown failed to resolve import "three"`로 죽는 것을 막던 장치였다. 이제 대상이 없다.
  server: {
    host: true,               // 같은 LAN에서 폰 접속용. 단 센서 권한은 배포 URL에서만 테스트
    port: 5176,
    fs: { allow: ['..'] },
  },
});
