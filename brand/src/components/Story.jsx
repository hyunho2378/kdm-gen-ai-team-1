// 오버뷰 스토리 섹션 다섯. **팀이 실제로 만든 산출물을 사이트에 올리는 자리다.**
//
//   Problem     왜 필요한가. 패널 Background 절의 통계 둘(클럽 수, 참여 장벽)
//   Scenarios   어떻게 쓰는가. 사용 장면 네 장
//   Interface   시야에 무엇이 뜨는가. 대전 중 화면과 표시 넷
//   Process     어떻게 만들었는가. Midjourney 탐색, Vizcom 구체화
//   Finale      체험으로 넘기는 관문
//
// 문구와 경로는 전부 copy.js가 쥔다. 색과 간격은 tokens와 index.css의 변수만 읽는다.
// **막대는 transform: scaleX만 움직인다**(MOTION 규칙). 뷰포트에 들어올 때 한 번 자란다.
// 모션을 줄여 달라고 했으면 처음부터 다 자란 채로 서고 CSS의 reduce 분기가 전환을 끈다.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { colors, spacing } from '../tokens.js';
import { FINALE, INTERFACE, PROBLEM, PROCESS, SCENARIOS } from '../copy.js';
import Eyebrow from './Eyebrow.jsx';
import { bodyStyle, captionStyle, headingStyle, titleStyle } from './typo.js';

/** 섹션 머리. 아이브로우와 제목과 한 줄. */
function Head({ label, title, line }) {
  return (
    <div data-beat style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
      <Eyebrow en={label.en} />
      <h2 style={titleStyle}>{title}</h2>
      {line ? <p style={bodyStyle}>{line}</p> : null}
    </div>
  );
}

/** 뷰포트에 처음 들어오면 true. 한 번 켜지면 안 꺼진다(되감아도 막대가 줄지 않는다). */
function useSeen() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

/** 가로 막대 목록. hot이 true인 행만 강조색이고 나머지는 옅은 선색이다. */
function Bars({ rows, max, format, hot }) {
  const [ref, seen] = useSeen();
  return (
    <ul ref={ref} className="vx-bars">
      {rows.map((r, i) => (
        <li key={r.name} className="vx-bar-row">
          <span style={bodyStyle}>{r.name}</span>
          <span className="vx-bar-track" aria-hidden="true">
            <span
              className="vx-bar-fill"
              style={{
                // 아주 작은 값도 눈에 걸리게 바닥 폭을 둔다. 값 자체는 오른쪽 숫자가 말한다
                transform: `scaleX(${seen ? Math.max(r.value / max, 0.012) : 0})`,
                background: hot(r, i) ? colors.accent.base : colors.line.strong,
                transitionDelay: `${i * 90}ms`,
              }}
            />
          </span>
          <span className="vx-bar-value" style={{ ...headingStyle, fontWeight: 700 }}>{format(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export function Problem() {
  const { clubs, barriers } = PROBLEM;
  return (
    <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)', display: 'flex', flexDirection: 'column', gap: spacing.unit * 5 }}>
      <Head label={PROBLEM.eyebrow} title={PROBLEM.title} line={PROBLEM.line} />
      <div className="vx-problem-grid">
        <div data-beat className="vx-card vx-problem-card">
          <h3 style={headingStyle}>{clubs.label}</h3>
          <Bars
            rows={clubs.rows}
            max={Math.max(...clubs.rows.map((r) => r.value))}
            format={(v) => v.toLocaleString('en-US')}
            hot={(r) => r.name === 'Fencing'}
          />
          <p style={captionStyle}>{clubs.source}</p>
        </div>
        <div data-beat className="vx-card vx-problem-card">
          <h3 style={headingStyle}>{barriers.label}</h3>
          <Bars
            rows={barriers.rows}
            max={100}
            format={(v) => `${v.toFixed(1)}%`}
            hot={(r, i) => i < 3}
          />
          <p style={captionStyle}>{barriers.source}</p>
        </div>
      </div>
    </section>
  );
}

export function Scenarios() {
  return (
    <section className="vx-shell" style={{ paddingBottom: 'var(--section-gap)', display: 'flex', flexDirection: 'column', gap: spacing.unit * 6 }}>
      <Head label={SCENARIOS.eyebrow} title={SCENARIOS.title} />
      <ol className="vx-scenes">
        {SCENARIOS.items.map((s, i) => (
          <li key={s.n} data-beat className="vx-scene" data-flip={i % 2 === 1 ? 'true' : undefined}>
            <img className="vx-scene-img" src={s.src} alt={s.alt} loading="lazy" />
            <div className="vx-scene-copy">
              <span className="vx-scene-n" style={{ color: colors.accent.base }}>{s.n}</span>
              <h3 style={headingStyle}>{s.title}</h3>
              <p style={bodyStyle}>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function InterfaceShowcase() {
  return (
    <section className="vx-bleed vx-closing vx-iface" aria-label={INTERFACE.title}>
      <div className="vx-shell" style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 4 }}>
        <div data-beat style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit }}>
          <span className="vx-closing-en">{INTERFACE.eyebrow.en}</span>
          <h2 style={{ ...titleStyle, color: 'inherit' }}>{INTERFACE.title}</h2>
        </div>
        <img data-beat className="vx-iface-img" src={INTERFACE.src} alt={INTERFACE.alt} loading="lazy" />
        <ul data-beat className="vx-iface-list">
          {INTERFACE.items.map((it) => (
            <li key={it.title} className="vx-iface-item">
              <h3 style={{ ...headingStyle, color: 'inherit' }}>{it.title}</h3>
              <p style={{ ...bodyStyle, color: 'rgba(253, 253, 253, 0.78)' }}>{it.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="vx-shell" style={{ paddingBlock: 'var(--section-gap)', display: 'flex', flexDirection: 'column', gap: spacing.unit * 5 }}>
      <Head label={PROCESS.eyebrow} title={PROCESS.title} line={PROCESS.line} />
      <ul className="vx-process">
        {PROCESS.items.map((it) => (
          <li key={it.title} data-beat className="vx-process-item">
            <img className="vx-process-img" src={it.src} alt={it.alt} loading="lazy" />
            <div className="vx-process-cap">
              <span style={{ ...captionStyle, fontWeight: 700, color: colors.accent.base }}>{it.tool}</span>
              <h3 style={headingStyle}>{it.title}</h3>
              <p style={bodyStyle}>{it.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Finale() {
  return (
    <section className="vx-bleed vx-closing vx-finale" aria-label={FINALE.title}>
      <div className="vx-shell vx-finale-grid">
        <div data-beat style={{ display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 }}>
          <span className="vx-closing-en">{FINALE.eyebrow.en}</span>
          <h2 style={{ ...titleStyle, color: 'inherit' }}>{FINALE.title}</h2>
          <p style={{ ...bodyStyle, color: 'rgba(253, 253, 253, 0.78)' }}>{FINALE.line}</p>
          <Link to={FINALE.to} className="vx-finale-cta">
            {FINALE.cta}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <img data-beat className="vx-finale-img" src={FINALE.src} alt={FINALE.alt} loading="lazy" />
      </div>
    </section>
  );
}
