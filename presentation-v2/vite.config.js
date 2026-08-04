import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// presentation-v2. 기존 presentation(5175)과 포트를 나눈다.
// S3는 arena/src의 궤적 리본 모듈을 그대로 import한다(모노레포 내부). 그래서 상위 폴더 접근을 허용하고,
// three를 dedupe해 리본(arena)과 S3 하네스가 같은 three 인스턴스를 쓰게 한다(instanceof 깨짐 방지).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    fs: { allow: ['..'] }, // ../arena, ../shared 접근 허용
  },
  resolve: { dedupe: ['three'] },
});
