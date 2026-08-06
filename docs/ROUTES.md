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

**다섯 탭이 각자 독립 라우트다.** Apple의 로컬 내비도 앵커가 아니라 라우트다(실측).

```jsx
<Routes>
  <Route path="/" element={<Overview />} />
  <Route path="/mask" element={<ProductPage slug="mask" />} />
  <Route path="/controller" element={<ProductPage slug="controller" />} />
  <Route path="/vision" element={<Vision />} />
  <Route path="/experience" element={<ExperiencePage />} />

  <Route path="/overview" element={<Navigate to="/" replace />} />
  <Route path="/products" element={<Navigate to="/" replace />} />
  <Route path="/product/mask" element={<Navigate to="/mask" replace />} />
  <Route path="/product/controller" element={<Navigate to="/controller" replace />} />

  <Route path="*" element={<NotFound />} />
</Routes>
```

**오버뷰가 루트다.** 사이트 전체가 이 제품이라 `/products` 같은 상위 마디가 아무것도 안 가른다.

경로 목록의 원천은 `copy.js`의 `PRODUCT_NAV.tabs`이고 각 항목의 `to`가 위 경로와 1:1이다. 내비는 그 배열로 링크를 세우고 현재 탭은 `useLocation().pathname`이 정한다.

앵커 시절 주소(`/#mask`)는 해시라 서버에 안 간다. 브라우저가 `/`를 연 뒤 `HashRoute`가 `/mask`로 갈아탄다. **해시는 지운다.** 안 지우면 새 라우트에서도 남아 뒤로 가기가 꼬인다.

`/about`, `/duelists`, 옛 제품 slug는 페이지째 사라져서 리다이렉트를 두지 않는다. **홈으로 튕기지 않고 NotFound가 뜬다.**

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
