// S1 표지. 포스터 문법 + OGL Polyline 커서 궤적.
// 사진(정사각, 인물 중앙, 상단이 빈 블랙)이 화면 하단에 앉고 그 위에 레드 라인, 그 위에 텍스트.
//
// **사진 배경은 정확히 rgb(0,0,0)이고 섹션 배경은 #101010이다**(생블랙 금지 규칙).
// 그대로 얹으면 사진이 섹션보다 어두운 사각형으로 떠 경계가 드러난다(실측).
// 그래서 사진 레이어를 screen으로 합성한다. screen은 검정(0)에서 배경을 그대로 통과시키므로
// 사진의 검은 부분이 정확히 #101010이 되고 인물은 그대로 남는다. 그라디언트 오버레이는 쓰지 않는다.
//
// 초광폭(2560~3840)에서 정사각 사진의 좌우 여백이 크게 뜬다. 여백에 콘텐츠를 채우지 않고
// 인물 뒤에 아주 낮은 알파의 레드 radial 글로우를 깔아 여백이 결함으로 안 보이게 한다(VORTEX 연결).
//
// 기존 Tubes Cursor 배경은 이 섹션에서 뺐다. components/TubesBackground.jsx 파일은 보존한다.

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { colors, typography, motion } from '../tokens.js';
import { TITLE, COVER } from '../copy.js';
import AssetImage from '../components/AssetImage.jsx';
import VortexLine from '../components/VortexLine.jsx';

// 메탈릭 실버 그라디언트. 위는 밝은 실버, 아래로 어두워졌다가 바닥에서 살짝 반사광 → 깎인 금속 볼륨.
const METAL =
  'linear-gradient(180deg, #FFFFFF 0%, #EAF1F9 20%, #C3CDDA 44%, #8A96A8 63%, #6E7B92 80%, #AAB6C6 100%)';

// 입체감: 위 얇은 림 하이라이트 + 아래 어두운 엣지 + 소프트 드롭섀도우 + 옅은 레드 글로우.
const METAL_FILTER =
  'drop-shadow(0 -1px 0.5px rgba(255,255,255,0.42)) drop-shadow(0 2px 1px rgba(0,0,0,0.9)) drop-shadow(0 12px 26px rgba(0,0,0,0.55))';

const CORNER = {
  position: 'absolute',
  top: 'clamp(20px, 3.4vh, 44px)',
  zIndex: 3,
  fontFamily: typography.family,
  fontSize: 'clamp(0.66rem, 0.9vw, 0.82rem)',
  fontWeight: 500,
  letterSpacing: '0.16em',
  lineHeight: 1.6,
  color: colors.text.dim,
  pointerEvents: 'none',
};

export default function S1Cover({ active }) {
  const photoRef = useRef(null);
  const markRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const photo = photoRef.current;
    const mark = markRef.current;
    if (!photo || !mark) return undefined;

    if (reduced) {
      gsap.set([photo, mark], { opacity: 1, y: 0 });
      return undefined;
    }

    // 사진은 페이드만(위치 이동 없음), 워드마크 묶음은 0.3s 지연 페이드업. transform과 opacity만 만진다.
    gsap.set(photo, { opacity: 0 });
    gsap.set(mark, { opacity: 0, yPercent: 8 });
    const tl = gsap.timeline();
    tl.to(photo, { opacity: 1, duration: 1.2, ease: motion.gsapOut });
    tl.to(mark, { opacity: 1, yPercent: 0, duration: 0.9, ease: motion.gsapOut }, 0.3);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: colors.black }}>
      {/* 사진. 하단 정렬 contain이라 인물이 잘리지 않고 정사각 비율이 유지된다.
          screen 합성이라 사진의 검정(rgb 0,0,0)이 섹션 배경 #101010을 그대로 통과시킨다. */}
      <div
        ref={photoRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '86%',
          zIndex: 1,
          mixBlendMode: 'screen',
        }}
      >
        <AssetImage src="/images/cover/fencer.png" fit="contain" position="center bottom" />
      </div>

      {/* 인물 뒤 레드 radial 글로우. 초광폭(2560~3840) 좌우 검은 여백을 메우는 유일한 장치다.
          사진 아래에 깔면 사진 영역에서만 가려져 좌우에 하드한 세로 이음매가 생긴다(4K 실측).
          그래서 위에 얹고 screen으로 합성한다. screen은 흰 유니폼(1.0)을 그대로 두고
          검은 영역에만 값을 더하므로 사진 안팎이 한 덩어리로 이어진다. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          // 중심을 인물 머리 아래로 내린다. 머리 높이에 두면 마스크가 붉게 물들어 레드가 배경색이 된다(실측).
          top: '82%',
          width: 'min(210vh, 190vw)',
          height: 'min(210vh, 190vw)',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          mixBlendMode: 'screen',
          background: `radial-gradient(circle at 50% 50%, rgba(230,13,21,0.11) 0%, rgba(230,13,21,0.05) 32%, rgba(230,13,21,0.018) 54%, transparent 74%)`,
          pointerEvents: 'none',
        }}
      />

      {/* OGL Polyline 커서 궤적. 사진 위, 워드마크 아래(zIndex 3). 선이 텍스트를 가리지 않는다. */}
      <VortexLine active={active} />

      {/* 포스터 좌상단: 팀과 이름. 가운데점 대신 얇은 세로선으로 두 필드를 가른다. */}
      <div style={{ ...CORNER, left: 'clamp(20px, 3.4vw, 56px)', display: 'flex', gap: 10 }}>
        <span style={{ color: colors.text.secondary }}>{COVER.team}</span>
        <span aria-hidden="true" style={{ width: 1, background: colors.line.strong }} />
        <span>{COVER.members}</span>
      </div>

      {/* 포스터 우상단: 행사명 */}
      <div style={{ ...CORNER, right: 'clamp(20px, 3.4vw, 56px)', textAlign: 'right' }}>
        {COVER.event}
      </div>

      {/* 중앙 상단: 메탈릭 워드마크 + 서브카피 한 줄 */}
      <div
        ref={markRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 'clamp(76px, 13vh, 168px)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(10px, 1.8vh, 22px)',
          padding: '0 24px',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        {/* 워드마크 뒤 옅은 레드 글로우. 글자만 받친다. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-12%',
            width: 'min(70vw, 820px)',
            height: 'min(30vh, 260px)',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at 50% 50%, rgba(230,13,21,0.16) 0%, rgba(230,13,21,0.05) 44%, transparent 68%)`,
            filter: 'blur(26px)',
            pointerEvents: 'none',
          }}
        />
        <h1
          style={{
            margin: 0,
            position: 'relative',
            // 제목 폰트 미정. tokens.typography.displayFamily 한 키만 바꾸면 전부 교체된다.
            fontFamily: typography.displayFamily,
            fontSize: 'clamp(3rem, 10.5vw, 9.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 0.95,
            backgroundImage: METAL,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            filter: METAL_FILTER,
          }}
        >
          {TITLE}
        </h1>
        <div
          style={{
            position: 'relative',
            fontFamily: typography.family,
            fontSize: 'clamp(0.78rem, 1.5vw, 1.06rem)',
            fontWeight: 500,
            letterSpacing: '0.1em',
            color: colors.text.secondary,
            textShadow: '0 2px 24px rgba(0,0,0,0.8)',
          }}
        >
          {COVER.sub}
        </div>
      </div>
    </div>
  );
}
