// brand 루트. **사이트가 제품 5탭 페이지 하나다.**
//
// BrowserRouter를 쓴다. 데이터 라우터(createBrowserRouter)가 아니므로
// **ScrollRestoration은 쓸 수 없다**(데이터 라우터 전용이라 던진다). 스크롤은 아래 훅이 맡는다.
// 새로고침과 직접 진입은 brand/vercel.json의 SPA rewrite가 받는다.
//
// ── 라우트 ──────────────────────────────────────────────────────────────────
// **다섯 탭이 각자 독립 라우트다.** 예전에는 한 페이지 안의 앵커였고 탭을 누르면
// 스크롤이 움직였다. **Apple의 로컬 내비도 앵커가 아니라 라우트다**(실측:
// `/apple-vision-pro/`, `/apple-vision-pro/specs/`, `/os/visionos/`).
//
// **오버뷰가 루트다.** Apple도 제품의 대표 주소가 오버뷰이고 스펙과 OS가 그 아래
// 다른 주소로 갈린다. `/products` 같은 상위 마디를 두지 않는다. 사이트 전체가
// 이 제품이라 그 마디가 아무것도 안 가른다.
//
// 나갔던 주소는 리다이렉트로 살린다. 앵커 시절 주소(`/#mask`)는 해시라 서버에 안 가고
// 브라우저가 `/`로 연다. 그 자리는 아래 `HashRoute`가 받아 제 라우트로 넘긴다.
//
// 걷어낸 페이지들은 리다이렉트를 두지 않는다. 갈 자리가 없어진 것이라 없는 주소가 맞고,
// 조용히 홈으로 튕기면 주소가 틀렸다는 사실이 화면에 안 남는다(NotFound와 같은 규율).

import { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Navigate,
  NavigationType,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom';
import Lenis from 'lenis';
import { ScrollTrigger } from './lib/motion.js';
import { applyThemeVars } from './theme.js';
import Cursor from './components/Cursor.jsx';
import ScrollWarp from './components/ScrollWarp.jsx';
import { PRODUCT_NAV } from './copy.js';
import Overview from './pages/Overview.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Vision from './pages/Vision.jsx';
import ExperiencePage from './pages/ExperiencePage.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * 스무스 스크롤(실설치 lenis 1.3.26). **일반 스크롤이다.**
 * 방향키 셸을 두지 않는다. Lenis는 휠과 터치의 관성만 다듬고 스크롤 위치 자체는 문서가 쥔다.
 *
 * `autoRaf`로 Lenis가 자기 rAF를 돌린다(설치본 기본값은 false다).
 * 이 앱에는 묶어야 할 다른 시계가 없어 GSAP ticker 같은 외부 루프에 태우지 않는다.
 * 히어로 궤적은 자기 rAF를 따로 돌리고 둘은 서로를 기다리지 않는다.
 *
 * reduced motion은 Lenis가 `respectReducedMotion` 기본값(true)으로 스스로 처리한다.
 * 그때는 lerp가 1이 되어 입력에 1:1로 붙는다.
 */
function useSmoothScroll() {
  const lenisRef = useRef(null);
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    lenisRef.current = lenis;
    // **스크롤 잠금이 없다.** 프리로더 스플래시를 걷어서 멈춰 둘 이유가 사라졌다
    // **Lenis가 스크롤 위치를 쥐므로 ScrollTrigger에 진행을 알려 줘야 한다.**
    // 안 묶으면 pin 구간이 스크롤 중간 프레임을 놓쳐 계단처럼 끊긴다
    lenis.on('scroll', ScrollTrigger.update);
    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);
  return lenisRef;
}

/**
 * 라우트가 바뀌면 맨 위로. v6는 스크롤을 자동으로 되돌리지 않아, 탭을 눌러 다른 면으로
 * 가도 앞 면에서 보던 높이가 그대로 남는다. **각 면은 자기 최상단에서 시작해야 한다.**
 *
 * **뒤로 가기(POP)에서는 건드리지 않는다.** 브라우저가 복원해 둔 위치를 다시 지우면
 * 돌아왔을 때 보고 있던 자리가 아니라 맨 위가 나온다.
 *
 * **Lenis가 스크롤을 쥐고 있어도 `window.scrollTo`가 통한다**(우리 Lenis는 가상 이동
 * 래퍼 없이 네이티브 스크롤을 그대로 민다. ScrollWarp 주석의 실측 참고).
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

/**
 * 앵커 시절 주소를 제 라우트로 넘긴다. `/#mask`는 해시라 서버에 안 가고 브라우저가
 * `/`를 연 뒤 해시만 남긴다. 그때 `/mask`로 갈아탄다.
 *
 * **해시를 지운다.** 안 지우면 새 라우트에서도 해시가 남아 뒤로 가기가 꼬인다.
 */
function HashRoute() {
  const navigate = useNavigate();
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/' || !hash) return;
    const tab = PRODUCT_NAV.tabs.find((t) => t.key === hash.slice(1));
    if (tab) navigate(tab.to, { replace: true });
  }, [hash, pathname, navigate]);
  return null;
}

export default function App() {
  useSmoothScroll();
  // CSS 변수 주입. hover와 :active와 focus-visible이 이 값을 읽는다
  useEffect(() => applyThemeVars(), []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <HashRoute />
      {/* 커서는 라우트 밖에 둔다. 페이지가 갈려도 하나만 산다.
          **프리로더 스플래시를 걷었다.** 최초 로드에 히어로가 바로 선다.
          스크롤 잠금도 함께 사라져서 Lenis를 멈췄다 다시 켜는 배선이 없다 */}
      <Cursor />
      {/* 스크롤 워프는 **스크롤되는 콘텐츠에만** 건다. 위의 커서는 position fixed이고,
          transform이 걸린 조상 안에서는 fixed가 뷰포트 기준을 잃는다. 그래서 이 래퍼의
          형제로 남긴다(실측: main에 skew를 걸자 pin된 섹션이 뷰포트 top 0에서 -1836으로 날아갔다).
          **제품 서브내비는 안에 있어도 된다. sticky는 그 함정을 안 밟는다** */}
      <ScrollWarp>
        <Routes>
          {/* 다섯 탭. 목록은 copy.js의 PRODUCT_NAV.tabs가 원천이고 여기 경로와 1:1이다 */}
          <Route path="/" element={<Overview />} />
          <Route path="/mask" element={<ProductPage slug="mask" />} />
          <Route path="/controller" element={<ProductPage slug="controller" />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/experience" element={<ExperiencePage />} />

          {/* 나갔던 주소를 살린다 */}
          <Route path="/overview" element={<Navigate to="/" replace />} />
          <Route path="/products" element={<Navigate to="/" replace />} />
          <Route path="/product/mask" element={<Navigate to="/mask" replace />} />
          <Route path="/product/controller" element={<Navigate to="/controller" replace />} />

          {/* **홈으로 튕기지 않는다.** 주소가 틀렸다는 사실이 화면에 남아야 사람이 오타를 찾는다 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ScrollWarp>
    </BrowserRouter>
  );
}
