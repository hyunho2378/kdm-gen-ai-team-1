// IA.md IDLE: 타이틀, [경기 시작] 버튼, [키보드 모드 F9] 안내.
// C1에서는 서버 경로가 없으므로 [경기 시작]도 키보드 경기로 들어간다.

import { colors, spacing, typography, zIndex } from '../tokens.js';
import ChromeText from '../components/ui/ChromeText.jsx';
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button.jsx';

export default function IdleScreen({ onStart, onKeyboard }) {
  return (
    <section
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.header,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.unit * 3,
        padding: spacing.gutter,
        textAlign: 'center',
      }}
    >
      <ChromeText as="h1" variant="display">
        간합
      </ChromeText>
      <p
        style={{
          fontFamily: typography.family,
          fontSize: typography.body.size,
          lineHeight: typography.body.leading,
          color: colors.text.secondary,
          maxWidth: 560,
          wordBreak: 'keep-all',
        }}
      >
        거리와 타이밍을 겨루는 검술 대전. 방향키로 간합을 만들고, 시프트로 막고, 스페이스로 찌른다.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ButtonPrimary onClick={onStart}>경기 시작</ButtonPrimary>
        <ButtonGhost onClick={onKeyboard}>키보드 모드 F9</ButtonGhost>
      </div>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto',
          gap: '4px 16px',
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          color: colors.text.dim,
        }}
      >
        <dt>방향키</dt>
        <dd style={{ margin: 0, color: colors.text.secondary }}>전진과 후퇴</dd>
        <dt>스페이스</dt>
        <dd style={{ margin: 0, color: colors.text.secondary }}>찌르기</dd>
        <dt>시프트</dt>
        <dd style={{ margin: 0, color: colors.text.secondary }}>가드</dd>
        <dt>F9</dt>
        <dd style={{ margin: 0, color: colors.text.secondary }}>어느 국면에서든 키보드 경기로 전환</dd>
      </dl>
    </section>
  );
}
