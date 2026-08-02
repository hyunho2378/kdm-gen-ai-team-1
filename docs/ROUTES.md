# ROUTES.md 간합 라우팅

IA.md와 1:1. 라우트 추가와 삭제는 IA.md 수정 후에만. 인증 없음, RequireAuth 없음. 네 앱 전부 vercel.json rewrites 필수(SPA 새로고침 404 방지).

---

## presentation

```jsx
<Routes>
  <Route path="/" element={<Presentation />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

섹션 이동은 라우트가 아니라 스크롤과 해시(#concept 등)로 한다. 진행 레일 클릭은 scrollIntoView.

## brand

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/products/:key" element={<ProductDetail />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

:key는 xr-glass, saber-controller, branding, demo-app 4종. 미상 key는 ProductDetail 내부에서 / 로 폴백. 데이터는 src/content/products.js 단일 원천.

## arena

```jsx
<Routes>
  <Route path="/" element={<Arena />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

phase 전환은 라우트가 아니라 게임 상태 머신(src/game/machine.js)이 소유한다. URL에 phase를 싣지 않는다.

## controller

```jsx
<Routes>
  <Route path="/" element={<Controller />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

방 코드는 ?room=CODE 쿼리 파라미터. localStorage 금지 규칙에 따라 상태는 URL과 서버 메모리로만.

---

## 앱 간 이동 규칙

- presentation → arena, brand → arena: `window.location.href = import.meta.env.VITE_ARENA_URL`. 같은 탭 이동(발표 흐름 유지).
- arena → controller: 이동이 아니라 QR 생성. `${import.meta.env.VITE_CONTROLLER_URL}?room=${code}`.
- 환경 변수 3종: VITE_ARENA_URL(presentation, brand), VITE_CONTROLLER_URL(arena), VITE_SERVER_URL(arena, controller). .env.example에 항상 최신 유지.

## 페이지 전환

brand 내부 이동은 크로스페이드 150~200ms(motion.duration.page). 슬라이드업 금지. 등장 애니메이션이 라우트 재진입마다 재실행되지 않게 한다.
