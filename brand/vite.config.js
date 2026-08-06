import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // **brand는 arena 파일을 하나 직접 import한다**(`components/HeroTrail.jsx` -> `arena/.../trail.js`,
  // BRAND_SITE_GUIDE 8절이 지시한 재사용이다). 그 arena 파일 안의 `import * as THREE from 'three'`가
  // **arena 폴더 기준으로 해석**돼서 `arena/node_modules/three`를 찾는다.
  //
  // 개발 기계에는 arena를 빌드해 본 적이 있어 그게 깔려 있지만 **clean 체크아웃에는 없다.**
  // 그래서 로컬은 통과하고 Vercel은 `Rolldown failed to resolve import "three"`로 죽었다(실측 재현).
  //
  // dedupe가 `three`를 이 프로젝트(brand) 기준 한 벌로 모아 준다. 해석 실패가 사라지고
  // 덤으로 `Multiple instances of Three.js` 경고도 없어진다(브랜드와 arena가 각자 한 벌씩 물던 것).
  resolve: { dedupe: ['three'] },
  server: {
    host: true,               // 같은 LAN에서 폰 접속용. 단 센서 권한은 배포 URL에서만 테스트
    port: 5176,
    fs: { allow: ['..'] },
  },
});
