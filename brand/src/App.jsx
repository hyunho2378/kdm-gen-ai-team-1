// brand 루트. React Router v6(실설치 6.30.4)로 랜딩과 상세 4종을 건다.
//
// BrowserRouter를 쓴다. 데이터 라우터(createBrowserRouter)가 아니므로
// **ScrollRestoration은 쓸 수 없다**(데이터 라우터 전용이라 던진다). 스크롤은 아래 훅이 맡는다.
// 새로고침과 직접 진입은 brand/vercel.json의 SPA rewrite가 받는다.
//
// 상세는 `/product/:slug` 하나로 받는다. 4종이 같은 골격이라 라우트를 넷으로 쪼갤 이유가 없고,
// 없는 slug일 때 빈 화면 대신 안내와 뒤로 가기를 낼 수 있다(BRAND_SITE_GUIDE 6절).

import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  NavigationType,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import ProductDetail from './pages/ProductDetail.jsx';

/**
 * 라우트가 바뀌면 맨 위로. v6는 스크롤을 자동으로 되돌리지 않아
 * 랜딩 중간에서 상세로 들어가면 상세도 중간부터 보인다.
 *
 * **뒤로 가기(POP)에서는 건드리지 않는다.** 브라우저가 복원해 둔 위치를 다시 지우면
 * 랜딩으로 돌아왔을 때 보고 있던 섹션이 아니라 맨 위가 나온다.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType === NavigationType.Pop) return;
    window.scrollTo(0, 0);
  }, [pathname, navType]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        {/* 그 밖의 주소는 랜딩으로. SPA rewrite가 모든 경로를 index.html로 보내므로 빈 화면을 남기지 않는다 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
