# 간합

모션 컨트롤 검술 대전과 그 발표 자료를 하나의 저장소에서 관리하는 프로젝트. 프런트 4개 앱과 실시간 릴레이 서버 1개로 구성.

## 폴더 구조

| 폴더 | 역할 |
| --- | --- |
| `presentation/` | 발표용 스크롤 프레젠테이션 앱 |
| `brand/` | 브랜드 소개 사이트 |
| `arena/` | 게임 화면. 상태머신, 판정, 렌더러 |
| `controller/` | 폰 컨트롤러. 모션 센서, 화면 켜짐 유지 |
| `server/` | Express + Socket.io 릴레이 서버 |
| `shared/` | 디자인 토큰과 프로토콜 상수의 실체 |
| `docs/` | 진행 기록과 세션 헤더 |

## 실행

먼저 각 패키지에서 의존성을 설치.

```
npm --prefix presentation install
npm --prefix brand install
npm --prefix arena install
npm --prefix controller install
npm --prefix server install
```

저장소 루트에서 개별 앱을 기동.

```
npm run dev:arena          # http://localhost:5173
npm run dev:controller     # http://localhost:5174
npm run dev:presentation   # http://localhost:5175
npm run dev:brand          # http://localhost:5176
npm run dev:server         # http://localhost:3001
npm run build:all          # 4개 앱 프로덕션 빌드
```

포트는 각 앱의 `vite.config.js`에 고정. arena와 controller에 5173, 5174를 배정해 server의 기본 `CORS_ORIGINS` 값과 맞춘다.

각 앱의 `.env.example`을 `.env`로 복사한 뒤 값을 채운다.

## 규율

- 색상, 간격, 폰트, 모션 수치의 실체는 `shared/tokens.js` 하나. 각 앱의 `src/tokens.js`는 재수출 파일. 하드코딩 금지
- `localStorage`, `sessionStorage` 금지. 방 코드와 세션 상태는 서버 메모리와 URL 파라미터로만 유지
- TypeScript 금지. JSX만 사용
- 서버 상태는 메모리에만 존재. 프로세스 재시작 시 소멸을 전제

## 배포 대상

| 폴더 | 플랫폼 | 비고 |
| --- | --- | --- |
| `presentation/` | Vercel | Root Directory를 `presentation`으로 지정 |
| `brand/` | Vercel | Root Directory를 `brand`로 지정 |
| `arena/` | Vercel | Root Directory를 `arena`로 지정 |
| `controller/` | Vercel | Root Directory를 `controller`로 지정 |
| `server/` | Render | Root Directory `server`, Start Command `npm start` |

## 배포 메모

- Vercel 프로젝트를 4개 만든다. 각 프로젝트의 Root Directory를 `presentation`, `brand`, `arena`, `controller`로 지정한다
- 각 앱이 저장소 루트 밖 `shared/`를 import 하므로 Vercel 프로젝트 설정에서 "Include source files outside of the Root Directory" 옵션을 켠다
- Render 웹 서비스를 1개 만든다. Root Directory `server`, Start Command `npm start`, 환경 변수 `PORT`와 `CORS_ORIGINS`를 설정한다. `CORS_ORIGINS`에는 배포된 arena와 controller 오리진을 쉼표로 구분해 넣고 끝 슬래시를 붙이지 않는다
- 폰 실기기 센서 테스트는 Vercel 프리뷰 URL로만 한다. LAN IP 접속은 보안 컨텍스트가 아니어서 DeviceMotion 권한 요청이 뜨지 않는다
