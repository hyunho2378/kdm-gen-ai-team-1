// Apple 섹션 문법의 부품 넷. **다섯 라우트가 이것만 조립한다.**
//
// ── Apple 실측 (1440) ───────────────────────────────────────────────────────
//   와이드 미디어  1425x704 (2.024:1). 화면 폭을 꽉 채우는 가로 와이드
//   스펙 대표 이미지 747x432 (1.729:1). **풀블리드가 아니다.** 가운데 놓인다
//   스테이트먼트   전환 지점에 56px 큰 문장 하나짜리 섹션
//   딥다이브      7000~10000px. 그 동안 미디어가 고정되고 텍스트가 순차로 바뀐다
//
// **Apple의 이미지와 영상과 문구는 복제하지 않는다.** 자리의 치수와 스크롤 문법만 옮긴다.

import { useEffect, useRef, useState } from 'react';
import { spacing } from '../tokens.js';
import Eyebrow from './Eyebrow.jsx';
import { bodyStyle, captionStyle, displayStyle, headingStyle, titleStyle } from './typo.js';

/** 내비가 실측해 내보내는 바 높이. 붙는 자리와 판정선이 같은 값을 본다. */
export function navH() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pnav-h')) || 52;
}

/**
 * 전폭 와이드 미디어. **각 섹션의 주인공이다.**
 * `bare`면 판을 깔지 않는다(3D 캔버스가 투명해 페이지 배경이 비쳐야 하는 자리).
 */
export function WideMedia({ pending, bare, children, style }) {
  return (
    <div data-beat className={`vx-bleed vx-wide${bare ? ' vx-wide-bare' : ''}`} style={style}>
      {children ?? <span style={captionStyle}>{pending}</span>}
    </div>
  );
}

/**
 * 스펙 면의 대표 미디어. **전폭이 아니다.**
 * Apple 스펙 면의 대표 이미지가 747x432로 가운데 놓인다(실측). 오버뷰의 1425x704와
 * 다른 치수인 것이 그 면의 성격 차이라 그대로 옮긴다.
 */
export function SpecMedia({ pending }) {
  return (
    <div data-beat className="vx-spec-media">
      <span style={captionStyle}>{pending}</span>
    </div>
  );
}

/** 섹션 머리. 아이브로우 + 소제목 + 짧은 문장. 이 셋을 크게 벌리지 않는다. */
export function SectionHead({ label, title, line, as: Tag = 'h2' }) {
  return (
    <div
      className="vx-shell"
      data-beat
      style={{ marginTop: spacing.unit * 3, display: 'flex', flexDirection: 'column', gap: spacing.unit }}
    >
      {label ? <Eyebrow en={label.en} ko={label.ko} /> : null}
      <Tag style={headingStyle}>{title}</Tag>
      {line ? <p style={bodyStyle}>{line}</p> : null}
    </div>
  );
}

/**
 * 전환 스테이트먼트. **큰 문장 하나뿐인 섹션이다**(Apple 56px 자리).
 * 미디어도 부제도 두지 않는다. 그 비어 있음이 앞뒤를 갈라 준다.
 */
export function Statement({ line }) {
  return (
    <section className="vx-shell" style={{ paddingBlock: 'calc(var(--section-gap) * 1.4)' }}>
      <p data-beat style={displayStyle}>{line}</p>
    </section>
  );
}

/**
 * 딥다이브 한 편. **미디어가 고정되고 텍스트가 순차로 바뀐다.**
 *
 * 바깥이 `단계수 x 100dvh`로 스크롤 길이를 만들고 안쪽이 sticky로 붙는다. 진행률을
 * 단계 수로 나눠 지금 단계를 고르고 나머지는 불투명도 0으로 물러난다.
 *
 * **sticky다. GSAP pin이 아니다.** pin은 `fixed`를 만들고, transform이 걸린 조상
 * (R3 워프) 안에서 fixed는 뷰포트 기준을 잃는다(PITFALLS).
 *
 * **모든 단계가 DOM에 남는다.** 안 보이는 것은 불투명도가 0일 뿐이라 스크린리더는
 * 전부 읽는다. 순차는 눈에만 걸리는 연출이고 내용을 감추지 않는다.
 *
 * **글이 3D 위에 얹히지 않는다.** 뷰어는 상시 autoRotate라 밝은 크롬 면이 글자 뒤를
 * 지나가면 대비가 그 순간에만 무너진다. 미디어가 위, 글이 아래로 자리를 갈라
 * 배치 자체가 보증이 된다.
 */
export function Dive({ label, steps, media, bare, headingOnFirst }) {
  const ref = useRef(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const pick = () => {
      const r = el.getBoundingClientRect();
      const top = navH();
      // 무대가 붙어 있는 동안의 진행. 스크롤 길이에서 무대 한 벌을 뺀 것이 분모다
      const travel = r.height - (window.innerHeight - top);
      const p = travel > 0 ? (top - r.top) / travel : 0;
      setAt(Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length))));
    };
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    pick();
    return () => {
      window.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, [steps.length]);

  return (
    <div ref={ref} className="vx-bleed" style={{ height: `${steps.length * 100}dvh` }}>
      <div className="vx-stage-inner">
        <div className={`vx-wide${bare ? ' vx-wide-bare' : ''}`}>{media}</div>

        <div className="vx-shell">
          <div className="vx-stage-text">
            {steps.map((s, i) => (
              <div key={s.title} className="vx-stage-step" data-on={i === at ? 'true' : 'false'}>
                {/* 아이브로우는 첫 단계에만. 매 단계 되풀이하면 그것이 나열로 읽힌다 */}
                {i === 0 && label ? <Eyebrow en={label.en} ko={label.ko} /> : null}
                {s.kicker ? <p style={{ ...captionStyle, marginBottom: spacing.unit * 0.5 }}>{s.kicker}</p> : null}
                {i === 0 && headingOnFirst ? (
                  <h2 style={{ ...titleStyle, marginTop: spacing.unit }}>{s.title}</h2>
                ) : (
                  <h3 style={{ ...headingStyle, marginTop: i === 0 ? spacing.unit : 0 }}>{s.title}</h3>
                )}
                <p style={{ ...bodyStyle, marginTop: spacing.unit }}>{s.body}</p>
                {s.note ? <p style={{ ...captionStyle, marginTop: spacing.unit }}>{s.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
