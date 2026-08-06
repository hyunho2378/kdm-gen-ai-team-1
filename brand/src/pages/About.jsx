// 브랜드 소개(REBOOT_PLAN 3.2). 네이밍 의미, 원칙, 팀 세 섹션.
//
// **무배경, 선/라인 없음.** R1 원칙의 연장이다. 구분은 여백과 타이포 스케일이 진다.
// 판도 보더도 구분선도 두지 않는다. 팀 이미지 자리는 빈 박스가 아니라 dim 문구다(2.1).
//
// 골격은 하위 페이지 공용 `.vx-shell .vx-page`를 그대로 쓴다(마진과 헤더 상단 여백 통일).
// **진입 애니메이션을 두지 않는다.** Experience/Duelists와 같은 결이고, 그래서 reduced motion도
// 자동으로 만족한다. R2 스플래시는 App의 Preloader가 마운트 1회 플래그로 재생을 막고,
// R3 워프와 커스텀 커서는 App 전역 계층이라 이 페이지에도 랜딩과 같게 적용된다.

import { colors, spacing, typography } from '../tokens.js';
import { ABOUT } from '../copy.js';
import Eyebrow from '../components/Eyebrow.jsx';

const { naming, principles, team } = ABOUT;

// 섹션 사이 세로 리듬. 8pt 배수(48px)로 세 블록이 서로 붙지 않게 벌린다
const SECTION_GAP = spacing.unit * 6;

const block = { display: 'flex', flexDirection: 'column', gap: spacing.unit * 2 };

const titleStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.title.size,
  fontWeight: typography.title.weight,
  letterSpacing: typography.title.tracking,
  lineHeight: typography.title.leading,
  color: colors.text.primary,
  maxWidth: spacing.maxContent,
  wordBreak: 'keep-all',
};

const bodyStyle = {
  margin: 0,
  fontFamily: typography.family,
  fontSize: typography.body.size,
  lineHeight: typography.body.leading,
  color: colors.text.secondary,
  maxWidth: 'var(--measure)',
  wordBreak: 'keep-all',
};

export default function About() {
  return (
    <main
      className="vx-shell vx-page"
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', gap: SECTION_GAP }}
    >
      {/* 1. 네이밍. 이 페이지의 유일한 아이브로우이자 h1이다 */}
      <section style={block}>
        <Eyebrow en={naming.eyebrow.en} ko={naming.eyebrow.ko} />
        <h1 style={titleStyle}>{naming.title}</h1>
        <p style={bodyStyle}>{naming.body}</p>
      </section>

      {/* 2. 원칙. 명사형 항목 셋. **불릿 원이나 선을 두지 않는다**(R1).
          존재감은 크기가 진다. 항목은 heading 스케일의 플랫 텍스트로 선다 */}
      <section style={block}>
        <h2 style={titleStyle}>{principles.title}</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: spacing.unit * 1.5 }}>
          {principles.items.map((item) => (
            <li
              key={item}
              style={{
                fontFamily: typography.family,
                fontSize: typography.heading.size,
                fontWeight: typography.heading.weight,
                lineHeight: typography.heading.leading,
                color: colors.text.primary,
                wordBreak: 'keep-all',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. 팀. 본문과 이미지 자리. 이미지 자리는 dim 문구뿐이다(빈 박스 금지) */}
      <section style={block}>
        <h2 style={titleStyle}>{team.title}</h2>
        <p style={bodyStyle}>{team.body}</p>
        <span
          style={{
            fontFamily: typography.family,
            fontSize: typography.caption.size,
            color: colors.text.dim,
          }}
        >
          {team.imagePending}
        </span>
      </section>
    </main>
  );
}
