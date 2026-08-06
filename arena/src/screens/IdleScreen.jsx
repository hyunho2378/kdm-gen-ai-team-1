// IA.md IDLE: 타이틀, [폰으로 연결], [경기 시작], [키보드 모드 F9].
//
// **입구를 라벨로 가른다.** [폰으로 연결]만 PAIRING(코드와 QR)으로 가고 [경기 시작]은 언제나
// 키보드 경기다. 전에는 [경기 시작] 하나가 서버 주소 유무로 갈려서, 주소가 없는 배포에서는
// 폰 연결을 시작할 방법이 아예 없고 주소가 있으면 키보드로 갈 방법이 버튼에 없었다.
//
// 유파 선택(1/2/3/4): 로컬 키보드 폴백이 상시 보인다(HANDOVER 3절). 카드를 누르거나 숫자키를
// 치면 그 유파로 키보드 경기가 곧장 시작한다. **폰으로 연결하면 유파는 폰의 SELECT가 정한다**
// (소켓 select가 engine.setSchool을 부른다). 그래서 이 카드는 폰 없는 경로 전용이다.

import { colors, spacing, typography, zIndex } from '../tokens.js';
import { BRAND } from '../copy.js';
import ChromeText from '../components/ui/ChromeText.jsx';
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button.jsx';
// 카드와 목록은 MatchEndScreen과 공유한다. 두 화면이 같은 유파를 가리켜야 한다
import { SCHOOL_OPTIONS, SchoolCard } from '../components/ui/SchoolCards.jsx';

export default function IdleScreen({ onPair, onStart, onKeyboard, onSelectSchool, selectedSchool }) {
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
        {BRAND}
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
        거리와 타이밍을 겨루는 검술 대전. 방향키로 거리를 잡고, 시프트로 막고, 스페이스로 찌른다.
      </p>

      {onSelectSchool ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: typography.family,
              fontSize: typography.caption.size,
              letterSpacing: typography.hud.tracking,
              color: colors.text.dim,
            }}
          >
            AI 대전자 선택 (숫자키 1~4)
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {SCHOOL_OPTIONS.map((opt) => (
              <SchoolCard key={opt.key} opt={opt} selected={selectedSchool === opt.key} onSelect={onSelectSchool} />
            ))}
          </div>
        </div>
      ) : null}

      {/* 강조는 화면당 하나다(DESIGN 버튼 위계). 발표의 본 경로가 폰 연결이라 그것이 red를 쥔다 */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {onPair ? <ButtonPrimary onClick={onPair}>폰으로 연결</ButtonPrimary> : null}
        <ButtonGhost onClick={onStart}>경기 시작</ButtonGhost>
        <ButtonGhost onClick={onKeyboard}>키보드 모드 F9</ButtonGhost>
      </div>

      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.caption.size,
          color: colors.text.dim,
          maxWidth: 520,
          wordBreak: 'keep-all',
        }}
      >
        폰으로 연결하면 코드와 QR이 뜨고 대전자는 폰에서 고른다. 경기 시작은 키보드 경기다.
      </p>

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
