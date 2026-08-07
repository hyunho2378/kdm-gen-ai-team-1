// S1 표지. **참조 frames/ref/1.svg(1920x1080) 재현.** 브라우저에 렌더해 좌표를 실측했다(DESIGN 15절 출처 계약).
//
// **표지는 어두운 예외다.** 나머지 슬라이드는 라이트(#F6F6F6)지만 표지는 블랙 포스터다(참조 배경 #000001,
// 좌우 실버 렌더가 순수 블랙 위에 떠 있어 라이트로 옮기면 렌더가 깨진다). 표지 성격상 예외로 판단·확정.
// **표지는 상단 표기를 넣는 유일한 슬라이드다**(다른 슬라이드는 상단 표기 제거, 표지만 예외).
//
// 실측 구도(1920x1080):
//   좌 인물 렌더  rect x40.5 y80 w919 h1000  → center (500, 580)      [person.png, 다크배경 실버 마스크]
//   우 컨트롤러   rect x960 y80 w919.5²        → center (1419.75, 539.75) [controller.png, 블랙배경 실버]
//   중앙 흰 로고  path bbox center (960,540) 497x243  ← logo.svg(흰 볼텍스 심볼) 정중앙
//   상단 표기 3블록(좌 x60 / 중 x798.4 / 우 x1682, 모두 start 정렬, y82.3/112.3, SUIT 20)
//   우하 카피라이트 x1612.7 y1022.3 SUIT 17.27
//   (fs100 '엔딩' 플레이스홀더는 블랙 위 블랙, 디자이너 메모라 건너뜀)
//
// 이미지 2개는 참조 1.svg에 base64로 임베드돼 있어(31MB) 스크립트로 추출·리사이즈(≤1400px)해
// public/images/cover/{person,controller}.png로 뽑았다. 좌표 매핑은 S3Concept와 동일한 contain 단위 REF
// (전체화면 종횡비가 16:9가 아니어도 구도가 통째로 들어와 무잘림).

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { COVER } from '../copy.js';

// 1 ref-px를 contain-fit 단위로(min 가로/세로 배율). 16:9에서 참조와 픽셀 일치.
const REF = 'min(100vw / 1920, 100vh / 1080)';
const vh = (refPx) => `calc(${refPx} * ${REF})`;
// 배경 렌더 블러. **로고와 텍스트는 제외** — 좌우 제품 렌더(person/controller)만 흐려
// 중앙 흰 심볼이 도드라지게(참조 톤: 형태는 알아보되 확실히 흐림). REF에 비례해 어느 뷰포트에서도
// 동일 인상(고정 px는 3840에서 약해 보임). vh(18)=min(18*100vw/1920, 18*100vh/1080)의 직접형
// (blur() 안에서 `number * min(length)` 곱은 일부 엔진이 0으로 죽여서 동치 min()으로 쓴다). 1920 기준 ≈18px.
const BG_BLUR = 'blur(min(0.9375vw, 1.667vh))';
// 중앙 앵커 + 자기중심 정렬(이미지/로고).
const at = (x, y) => ({
  position: 'absolute',
  left: `calc(50% + ${(x - 960).toFixed(3)} * ${REF})`,
  top: `calc(50% + ${(y - 540).toFixed(3)} * ${REF})`,
  transform: 'translate(-50%, -50%)',
});
// 좌측정렬 텍스트(start): 시작점 x를 좌상단에 앵커. yTop은 첫 줄 상단(베이스라인 - 20 근사).
const atL = (x, yTop) => ({
  position: 'absolute',
  left: `calc(50% + ${(x - 960).toFixed(3)} * ${REF})`,
  top: `calc(50% + ${(yTop - 540).toFixed(3)} * ${REF})`,
});

const markStyle = {
  fontFamily: typography.family,
  fontSize: vh(20),
  lineHeight: vh(30), // 두 줄 baseline 간격 30(82.3→112.3)
  fontWeight: 500,
  letterSpacing: '0em',
  color: colors.white,
  whiteSpace: 'pre',
};

export default function S1Cover() {
  const personRef = useRef(null);
  const controllerRef = useRef(null);
  const logoRef = useRef(null);
  const marksRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const person = personRef.current;
    const controller = controllerRef.current;
    const logo = logoRef.current;
    const marks = marksRef.current ? Array.from(marksRef.current.children) : [];
    if (!person || !controller || !logo) return undefined;

    if (reduced) {
      gsap.set([person, controller, logo, ...marks], { opacity: 1, scale: 1, y: 0 });
      return undefined;
    }

    gsap.set([person, controller], { opacity: 0, scale: 1.04, transformOrigin: '50% 50%' });
    gsap.set(logo, { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' });
    gsap.set(marks, { opacity: 0, y: 8 });

    const tl = gsap.timeline();
    // ① 좌우 렌더가 블랙에서 떠오른다.
    tl.to([person, controller], { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out', stagger: 0.12 });
    // ② 중앙 시그니처.
    tl.to(logo, { opacity: 1, scale: 1, duration: 0.8, ease: motion.gsapOut }, 0.5);
    // ③ 상단 표기 마지막.
    tl.to(marks, { opacity: 1, y: 0, duration: 0.6, ease: motion.gsapOut, stagger: 0.06 }, 0.9);

    return () => tl.kill();
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000001' }}>
      {/* 중앙 로고를 앉히는 아주 옅은 중앙 발광(참조 paint0_linear 0.1 근사). */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(60% 55% at 50% 50%, rgba(255,255,255,0.05), rgba(0,0,0,0) 70%)',
        }}
      />

      {/* 좌 인물 렌더 */}
      <img
        ref={personRef}
        src="/images/cover/person.png"
        alt=""
        draggable="false"
        style={{ ...at(500, 580), width: vh(919), height: vh(1000), objectFit: 'cover', filter: BG_BLUR, zIndex: 1, userSelect: 'none', willChange: 'transform, opacity' }}
      />
      {/* 우 컨트롤러 렌더 */}
      <img
        ref={controllerRef}
        src="/images/cover/controller.png"
        alt=""
        draggable="false"
        style={{ ...at(1419.75, 539.75), width: vh(919.5), height: vh(919.5), objectFit: 'cover', filter: BG_BLUR, zIndex: 1, userSelect: 'none', willChange: 'transform, opacity' }}
      />

      {/* 중앙 흰 볼텍스 심볼(logo.svg). path bbox center (960,540) w497. */}
      <img
        ref={logoRef}
        src="/images/assets/logo.svg"
        alt="VORTEX"
        draggable="false"
        style={{ ...at(960, 540), width: vh(497), height: 'auto', zIndex: 3, userSelect: 'none', willChange: 'transform, opacity' }}
      />

      {/* 상단/하단 표기(표지 전용). 참조 좌표대로. */}
      <div ref={marksRef}>
        <div style={{ ...atL(60, 62), ...markStyle, zIndex: 4 }}>
          {COVER.mark.topLeft.join('\n')}
        </div>
        <div style={{ ...atL(798.422, 62), ...markStyle, zIndex: 4 }}>
          {COVER.mark.topCenter.join('\n')}
        </div>
        <div style={{ ...atL(1682, 62), ...markStyle, zIndex: 4 }}>
          {COVER.mark.topRight.join('\n')}
        </div>
        <div style={{ ...atL(1612.73, 1002), ...markStyle, fontSize: vh(17.2736), zIndex: 4 }}>
          {COVER.mark.bottomRight}
        </div>
      </div>
    </div>
  );
}
