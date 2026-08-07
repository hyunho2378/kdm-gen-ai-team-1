// 미디어 프레임 시퀀스. **GLB 아님. 이미지 시퀀스**(ffmpeg로 쪼갠 frame-000.webp ~).
// 영상 프레임을 스크롤 또는 진입 트리거에 매핑한다. 두 방식을 한 컴포넌트로 일반화한다.
//
//   mode='scroll' : 스크롤 진행 0~1을 프레임 0~N에 매핑(sticky 무대). blur→sharp 수렴 옵션.
//   mode='enter'  : 진입(IntersectionObserver) 시 흐림에서 선명으로 한 번 재생하고 마지막 프레임 고정.
//
// **sticky다. GSAP pin(fixed)이 아니다.** transform이 걸린 조상(R3 워프) 안에서 fixed는 뷰포트 기준을
// 잃는다(PITFALLS/MAPPING). scroll 모드는 바깥이 스크롤 길이를 만들고 안쪽이 sticky로 붙는다.
//
// 프레임은 프리로드해 끊김을 없앤다. reduced-motion이면 연출 없이 **마지막(선명) 프레임 하나**만.
// 실제 프레임은 slot(`frames` prop). 지금은 `placeholderFrames()`로 로직을 테스트한다.

import { useEffect, useRef, useState } from 'react';
import { isReduced } from '../lib/motion.js';

// 플레이스홀더 프레임 N장. SVG data-URI라 에셋 파일 없이 프레임 스왑 로직을 테스트한다.
// 실제 영상 프레임이 오면 이 대신 webp URL 배열을 넘긴다.
export function placeholderFrames(n = 24) {
  return Array.from({ length: n }, (_, i) => {
    const p = i / (n - 1);
    const hue = Math.round(210 + p * 6); // 네이비 근처
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='158' viewBox='0 0 320 158'>` +
      `<rect width='320' height='158' fill='hsl(${hue} 22% ${18 + p * 6}%)'/>` +
      `<text x='160' y='84' fill='rgba(255,255,255,${0.35 + p * 0.5})' font-family='SUIT,sans-serif' ` +
      `font-size='22' font-weight='700' text-anchor='middle'>frame ${String(i).padStart(3, '0')} / ${n - 1}</text>` +
      `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  });
}

// 진행률(0~1)에서 blur(px). 흐림→선명 수렴. 컴포넌트가 CSS로 얹어 실프레임/플레이스홀더 둘 다 적용된다.
const blurFor = (p) => `blur(${(1 - p) * 10}px)`;

export default function MediaSequence({ frames, mode = 'enter', fps = 24, pending, ratio = '320 / 158' }) {
  const list = frames && frames.length ? frames : placeholderFrames();
  const N = list.length;
  const imgRef = useRef(null);
  const wrapRef = useRef(null);
  const [idx, setIdx] = useState(mode === 'enter' ? 0 : 0);

  // 프리로드. 모든 프레임을 미리 디코드해 스왑이 끊기지 않게.
  useEffect(() => {
    const imgs = list.map((src) => {
      const im = new Image();
      im.src = src;
      return im;
    });
    return () => { imgs.length = 0; };
  }, [list]);

  // reduced-motion: 마지막(선명) 프레임 고정, 연출 없음.
  useEffect(() => {
    if (!isReduced()) return undefined;
    setIdx(N - 1);
    if (imgRef.current) imgRef.current.style.filter = 'none';
    return undefined;
  }, [N]);

  // 진입 1회 재생(blur→sharp). 마지막 프레임에서 멈춘다.
  useEffect(() => {
    if (mode !== 'enter' || isReduced()) return undefined;
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    let raf = 0, start = 0, played = false;
    const io = new IntersectionObserver(
      (ents) => {
        if (!ents[0].isIntersecting || played) return;
        played = true;
        io.disconnect();
        const dur = (N / fps) * 1000;
        const step = (t) => {
          if (!start) start = t;
          const p = Math.min(1, (t - start) / dur);
          const i = Math.min(N - 1, Math.floor(p * N));
          setIdx(i);
          if (imgRef.current) imgRef.current.style.filter = blurFor(p);
          if (p < 1) raf = requestAnimationFrame(step);
          else if (imgRef.current) imgRef.current.style.filter = 'none';
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.35 }
    );
    io.observe(wrap);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [mode, N, fps]);

  // 스크롤 매핑. sticky 무대의 진행 0~1을 프레임에 매핑. blur→sharp 함께.
  useEffect(() => {
    if (mode !== 'scroll' || isReduced()) return undefined;
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const pick = () => {
      const r = wrap.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      const i = Math.min(N - 1, Math.floor(p * N));
      setIdx(i);
      if (imgRef.current) imgRef.current.style.filter = blurFor(p);
    };
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    pick();
    return () => { window.removeEventListener('scroll', pick); window.removeEventListener('resize', pick); };
  }, [mode, N]);

  const img = (
    <img
      ref={imgRef}
      src={list[idx]}
      alt=""
      draggable="false"
      className="vx-seq-img"
      style={{ filter: mode === 'enter' ? blurFor(0) : undefined }}
    />
  );

  // scroll 모드: 바깥이 스크롤 길이(200dvh)를 만들고 안쪽 sticky가 붙는다.
  if (mode === 'scroll') {
    return (
      <div ref={wrapRef} className="vx-seq-scroll" style={{ height: '200dvh' }}>
        <div className="vx-seq-sticky" style={{ aspectRatio: ratio }}>
          {img}
          {pending ? <span className="vx-seq-pending">{pending}</span> : null}
        </div>
      </div>
    );
  }
  // enter 모드: 제자리에서 1회 재생.
  return (
    <div ref={wrapRef} className="vx-seq" style={{ aspectRatio: ratio }} data-beat>
      {img}
      {pending ? <span className="vx-seq-pending">{pending}</span> : null}
    </div>
  );
}
