// brand 루트. **사이트가 제품 5탭 페이지 하나다.**
//
// BrowserRouter를 쓴다. 데이터 라우터(createBrowserRouter)가 아니므로
// **ScrollRestoration은 쓸 수 없다**(데이터 라우터 전용이라 던진다). 스크롤은 아래 훅이 맡는다.
// 새로고침과 직접 진입은 brand/vercel.json의 SPA rewrite가 받는다.
//
// ── 라우트 (헤더 통합 세션) ─────────────────────────────────────────────────
// 랜딩과 `/about`과 `/duelists`와 `/experience`와 제품 상세를 전부 걷었다.
// **남은 화면이 하나뿐이라 그 화면이 루트다.** 사이트의 유일한 페이지가 하위 주소에 사는 것은
// 주소만 보고는 읽히지 않는다.
//
// 걷어낸 넷은 리다이렉트를 두지 않는다. 갈 자리가 없어진 것이라 없는 주소가 맞고,
// 조용히 홈으로 튕기면 주소가 틀렸다는 사실이 화면에 안 남는다(NotFound와 같은 규율).

import { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  NavigationType,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import Lenis from 'lenis';
import { ScrollTrigger } from './lib/motion.js';
import { applyThemeVars } from './theme.js';
import Cursor from './components/Cursor.jsx';
import ScrollWarp from './components/ScrollWarp.jsx';
import Products from './pages/Products.jsx';
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
  useSmoothScroll();
  // CSS 변수 주입. hover와 :active와 focus-visible이 이 값을 읽는다
  useEffect(() => applyThemeVars(), []);

  return (
    <BrowserRouter>
      <ScrollToTop />
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
          <Route path="/" element={<Products />} />
          <Route path="/products" element={<Products />} />
          {/* **홈으로 튕기지 않는다.** 주소가 틀렸다는 사실이 화면에 남아야 사람이 오타를 찾는다 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ScrollWarp>
    </BrowserRouter>
  );
}
