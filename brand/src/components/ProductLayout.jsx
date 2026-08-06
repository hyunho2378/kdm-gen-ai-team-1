// 다섯 탭 페이지가 공유하는 껍데기. **내비와 푸터는 어느 탭에서나 같다.**
//
// **탭이 독립 라우트가 되면서 생긴 자리다.** 예전에는 한 페이지가 내비와 다섯 섹션과
// 푸터를 전부 이고 있었다. 이제 페이지가 다섯이라 공통 층을 여기 한 벌만 둔다.
//
// 등장 트윈도 여기가 건다. 페이지마다 같은 배선을 다시 적을 이유가 없다.

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, isReduced } from '../lib/motion.js';
import Footer from './Footer.jsx';
import ProductNav from './ProductNav.jsx';

export default function ProductLayout({ children }) {
  const rootRef = useRef(null);

  /** 덩어리가 스크롤에 따라 하나씩 드러난다. transform과 opacity만 건드린다. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || isReduced()) return undefined;
    const ctx = gsap.context(() => {
      for (const el of root.querySelectorAll('[data-beat]')) {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: 'power3.out',
          // once라 되감아도 다시 사라지지 않는다. 되돌아갈 때 글자가 깜빡이며
          // 없어지는 것이 이 문법에서 가장 거슬리는 실패 모드다
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        });
      }
      ScrollTrigger.refresh();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <ProductNav />
      <main ref={rootRef}>{children}</main>
      {/* 랜딩이 사라지면서 갈 곳을 잃은 크레딧과 팀과 저작권이 여기로 내려왔다 */}
      <Footer />
    </>
  );
}
