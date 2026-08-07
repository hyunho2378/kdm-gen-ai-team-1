// 목업 풀블리드. 컨트롤러 슬라이드 다음, 실사 목업 이미지가 **화면을 꽉 채우는 주인공**이다.
// 텍스트 없음(하이엔드 톤). 이미지는 1920x1080(정확 16:9)이라 object-fit cover로 어떤 종횡비에서도
// 여백 없이 채운다(좁은 비율에선 가장자리만 살짝 크롭). 진입 시 아주 옅은 스케일-인 한 번.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from '../tokens.js';

export default function SMockup({ src, active }) {
  const imgRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const img = imgRef.current;
    if (!img) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(img, { opacity: 1, scale: 1 });
      return undefined;
    }
    gsap.set(img, { opacity: 0, scale: 1.06, transformOrigin: '50% 50%' });
    const tw = gsap.to(img, { opacity: 1, scale: 1, duration: 1.4, ease: motion.gsapOut });
    return () => tw.kill();
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000001' }}>
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable="false"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', userSelect: 'none', willChange: 'transform, opacity',
        }}
      />
    </div>
  );
}
