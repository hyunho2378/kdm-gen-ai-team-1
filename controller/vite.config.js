import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,               // 같은 LAN에서 폰 접속용. 단 센서 권한은 배포 URL에서만 테스트
    port: 5174,
    fs: { allow: ['..'] },
  },
});
