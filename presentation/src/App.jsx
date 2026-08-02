// presentation 루트. 섹션 8개가 스크롤 순서대로 이어진다. 화살표 넘김 없음(IA 2절).
// ROUTES.md: 섹션 이동은 라우트가 아니라 스크롤과 해시다.
// A1 단계는 골격까지다. 섹션 콘텐츠와 등장 연출은 A2, 스크롤 궤적 라인은 A3에서 붙인다.

import { useEffect } from 'react';
import { SECTIONS } from './content/sections.js';
import { initScroll, refreshScroll, scrollToId } from './lib/scroll.js';
import { subscribe } from './lib/motionMode.js';
import Section from './components/Section.jsx';
import ProgressRail from './components/ProgressRail.jsx';
import StageBackground from './components/StageBackground.jsx';
import ScrollTrail from './components/ScrollTrail.jsx';
import Preloader from './components/Preloader.jsx';
import Reveal from './components/Reveal.jsx';
import { LineageDiagram, TrajectoryToDataDiagram } from './components/diagrams/Diagrams.jsx';
import CoverSection from './sections/CoverSection.jsx';
import InteractionsSection from './sections/InteractionsSection.jsx';
import WorkflowSection from './sections/WorkflowSection.jsx';
import OutputsSection from './sections/OutputsSection.jsx';
import DemoSection from './sections/DemoSection.jsx';

// 섹션 id별 본문. cover는 제목 연출을 직접 소유하므로 Section의 기본 렌더를 쓰지 않는다.
const BODY = {
  background: () => (
    <Reveal style={{ marginTop: 40, maxWidth: 640 }}>
      <LineageDiagram />
    </Reveal>
  ),
  insight: () => (
    <Reveal style={{ marginTop: 40, maxWidth: 640 }}>
      <TrajectoryToDataDiagram />
    </Reveal>
  ),
  interactions: () => <InteractionsSection />,
  'ai-workflow': () => <WorkflowSection />,
  outputs: () => <OutputsSection />,
  demo: () => <DemoSection />,
};

export default function App() {
  useEffect(() => {
    let dispose = initScroll();

    // OS 모션 설정이 바뀌면 엔진을 갈아끼운다. 새로고침을 요구하지 않는다.
    const unsubscribe = subscribe(() => {
      dispose();
      dispose = initScroll();
    });

    // 폰트가 늦게 오면 섹션 높이가 변한다. 트리거 위치를 다시 잰다.
    document.fonts?.ready.then(refreshScroll);

    // 해시로 직접 진입한 경우 해당 섹션으로 즉시 보낸다(주소 공유와 발표 중 복귀용)
    const hash = window.location.hash.slice(1);
    if (hash) requestAnimationFrame(() => scrollToId(hash, { immediate: true }));

    return () => {
      unsubscribe();
      dispose();
    };
  }, []);

  return (
    <>
      <Preloader />
      <StageBackground />
      <ScrollTrail />
      <ProgressRail />
      <main>
        {SECTIONS.map((s) => {
          if (s.id === 'cover') {
            return (
              <Section key={s.id} id={s.id} label={s.label} renderTitle={() => <CoverSection data={s} />} />
            );
          }
          const Body = BODY[s.id];
          return (
            <Section key={s.id} id={s.id} label={s.label} title={s.title} lead={s.lead} reveal>
              {Body ? <Body /> : null}
            </Section>
          );
        })}
      </main>
    </>
  );
}
