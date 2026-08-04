// S4 컨셉(유파). 3겹.
// 레이어2(주인공): 리퀴드 글래스 카드 3장(@ybouane/liquidglass, MIT). 실제 WebGL로 뒤 배경을 캡처해 굴절한다.
//   CSS 반투명 흉내가 아니다. 마우스 패럴랙스로 배경이 움직여 유리 굴절이 반응한다. GSAP stagger로 아래에서 부상.
// 레이어1: 블랙 바닥 + 굴절 대상 실버/레드 텍스처. (Pixel Distortion 풀 WebGL은 전역 질감 단계로 예약 — GLOBAL_TEXTURE.md)
// 레이어3: 상단 라벨 '유파', 각 카드에 유파 이름만. 다른 문구 금지.
//
// 성능: active(현재 섹션)일 때만 init하고 벗어나면 destroy한다(오프스크린 WebGL 정지).

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { LiquidGlass } from '@ybouane/liquidglass';
import { colors } from '../tokens.js';

const YUPA = [
  { key: 'saber', name: '이탈리아 세이버' },
  { key: 'epee', name: '프랑스 에페' },
  { key: 'master', name: '역사 속 검객' },
];

// 유리 설정. 얇고 정교한 애플식 유리(zRadius 낮춰 베벨을 얇게). tintStrength 0 = 쿨블루 배제(브랜드 유지).
const GLASS_CONFIG = {
  refraction: 0.62,
  blurAmount: 0.06, // 거의 맑은 유리(뒤 텍스처가 굴절되어 보이게)
  chromAberration: 0.09,
  edgeHighlight: 0.55, // 정교한 림 라이트
  specular: 0.6, // 반사 하이라이트
  fresnel: 1.25,
  distortion: 0.04, // 미세 유리 질감
  cornerRadius: 20,
  zRadius: 13, // 베벨 깊이 ↓ = 얇은 유리(기본 40은 두껍고 투박)
  saturation: 0,
  tintStrength: 0,
  shadowOpacity: 0.34,
  shadowSpread: 16,
  button: true, // 마우스 올리면 패널이 밝아진다(호버 반응)
};

export default function S4Concept({ active }) {
  const rootRef = useRef(null);
  const bgRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (!active) return undefined;
    const root = rootRef.current;
    const cards = cardsRef.current.filter(Boolean);
    if (!root || cards.length !== YUPA.length) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 아래에서 순차 부상(GSAP stagger).
    gsap.set(cards, reduced ? { opacity: 0 } : { opacity: 0, yPercent: 22 });
    const rise = gsap.to(cards, reduced
      ? { opacity: 1, duration: 0.3, ease: 'none' }
      : { opacity: 1, yPercent: 0, duration: 0.8, ease: 'power3.out', stagger: 0.16 });

    // 유리 초기화. 카드마다 config 지정 후 init.
    cards.forEach((c) => { c.dataset.config = JSON.stringify(GLASS_CONFIG); });
    let instance = null;
    let disposed = false;
    LiquidGlass.init({ root, glassElements: cards })
      .then((inst) => { if (disposed) inst.destroy(); else instance = inst; })
      .catch(() => {}); // 실패 시 카드는 반투명 폴백 스타일로 보인다(핵심 UI 인질 금지)

    // 마우스 패럴랙스: 배경이 살짝 움직여 유리 굴절이 반응한다(약한 왜곡 대체).
    const onMove = (e) => {
      if (reduced || !bgRef.current) return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      bgRef.current.style.transform = `translate(${nx * -26}px, ${ny * -26}px) scale(1.06)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      disposed = true;
      rise.kill();
      instance?.destroy();
      window.removeEventListener('pointermove', onMove);
    };
  }, [active]);

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: colors.black,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(16px, 3vw, 44px)',
      }}
    >
      {/* 굴절 대상 배경: 실제 이미지 텍스처(실버-시안 + 레드 궤적). img라 라이브러리가 drawImage로 확실히 캡처한다.
          data-dynamic: 마우스 패럴랙스로 움직이므로 매 프레임 재캡처(img라 drawImage로 저비용)해 굴절이 반응한다. */}
      <img
        ref={bgRef}
        aria-hidden="true"
        data-dynamic=""
        src="/textures/concept.webp"
        alt=""
        style={{
          position: 'absolute',
          inset: '-8%',
          width: '116%',
          height: '116%',
          objectFit: 'cover',
          zIndex: 0,
          transform: 'scale(1.04)',
          transition: 'transform 420ms cubic-bezier(0.23,1,0.32,1)',
        }}
      />

      {/* 상단 라벨 */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(48px, 12vh, 130px)',
          left: 0,
          right: 0,
          zIndex: 3,
          textAlign: 'center',
          pointerEvents: 'none',
          fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
          fontSize: 'clamp(0.8rem, 1.6vw, 1.05rem)',
          fontWeight: 600,
          letterSpacing: '0.3em',
          color: colors.text.dim,
        }}
      >
        유파
      </div>

      {/* 유리 카드 3장(root 직계 자식 = glassElements) */}
      {YUPA.map((y, i) => (
        <div
          key={y.key}
          ref={(el) => { cardsRef.current[i] = el; }}
          style={{
            position: 'relative',
            zIndex: 2,
            width: 'clamp(150px, 20vw, 250px)',
            height: 'clamp(220px, 34vh, 380px)',
            borderRadius: 20,
            // 청크 박스 금지: 배경·보더 없음. 유리 canvas가 카드의 전부다(실패해도 두꺼운 사각형이 안 남는다).
            background: 'transparent',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 'clamp(16px, 2vw, 26px)',
          }}
        >
          <span
            style={{
              position: 'relative',
              zIndex: 1, // 주입된 유리 canvas 위에 이름을 얹는다
              fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
              fontSize: 'clamp(0.95rem, 1.5vw, 1.2rem)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              color: colors.text.primary,
              textShadow: '0 2px 16px rgba(5,5,6,0.8)',
              textAlign: 'center',
              // 이름 위 얇은 레드 악센트(브랜드 포인트, 절제)
              borderTop: `2px solid ${colors.red}`,
              paddingTop: 10,
            }}
          >
            {y.name}
          </span>
        </div>
      ))}
    </div>
  );
}
