// IA.md IDLE: 타이틀, [폰으로 연결], [경기 시작], [키보드 모드 F9].
//
// **입구를 라벨로 가른다.** [폰으로 연결]만 PAIRING(코드와 QR)으로 가고 [경기 시작]은 언제나
// 키보드 경기다. 전에는 [경기 시작] 하나가 서버 주소 유무로 갈려서, 주소가 없는 배포에서는
// 폰 연결을 시작할 방법이 아예 없고 주소가 있으면 키보드로 갈 방법이 버튼에 없었다.
//
// ── 유파 선택은 한 걸음 뒤다(개정) ─────────────────────────────────────────
// **진입 화면에 카드를 깔지 않는다.** 예전에는 첫 화면이 타이틀과 카드 넷과 버튼 셋을
// 한꺼번에 이고 있어서, 무엇을 먼저 눌러야 하는지가 안 읽혔다. 카드는 폰 없는 경로 전용인데
// 그 사실도 화면에서 안 보였다.
//
// 이제 `진입 -> 경기 시작 -> 모델 선택 -> 경기` 순이다. 경기 시작을 누른 뒤에야 카드가 뜬다.
//
// **폰으로 연결은 이 단계를 안 지난다.** 유파는 폰의 SELECT가 정하므로(소켓 select가
// engine.setSchool을 부른다) 그 경로는 곧장 PAIRING으로 간다.
//
// **숫자키 1~4는 그대로 산다.** 발표 비상 경로라 화면 단계와 무관하게 어느 국면에서든
// 그 유파로 경기가 시작된다(App의 attachKeyboard). 카드는 그것의 시각적 대응물이지
// 유일한 입구가 아니다.

import { useState } from 'react';
import { colors, spacing, typography, zIndex } from '../tokens.js';
import { BRAND } from '../copy.js';
import ChromeText from '../components/ui/ChromeText.jsx';
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button.jsx';
// 카드와 목록은 MatchEndScreen과 공유한다. 두 화면이 같은 유파를 가리켜야 한다
import { SCHOOL_OPTIONS, SchoolCard } from '../components/ui/SchoolCards.jsx';

export default function IdleScreen({ onPair, onStart, onKeyboard, onSelectSchool, selectedSchool }) {
  // 'home'이 진입, 'school'이 모델 선택. **경기 시작을 눌러야 뒤 단계가 뜬다.**
  const [step, setStep] = useState('home');
  const picking = step === 'school' && onSelectSchool;

  return (
    <section
      style={{
        position: 'fixed',
        inset: 0,
        // **메뉴는 네이비 판 위에 선다.** 이 화면은 경기가 아니라 UI라 캔버스가 그대로
        // 비치면 글자가 3D 위에 얹힌다(밝은 크롬 면이 지나가면 대비가 그 순간에만 무너진다).
        // 판은 DOM 층이고 캔버스 렌더는 안 건드린다(canvas/WebGL 예외는 그대로다)
        background: colors.bg.overlay,
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

      {picking ? (
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

      {/* 강조는 화면당 하나다(DESIGN 버튼 위계). 발표의 본 경로가 폰 연결이라 그것이 채움을 쥔다 */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {picking ? (
          <ButtonGhost onClick={() => setStep('home')}>뒤로</ButtonGhost>
        ) : (
          <>
            {onPair ? <ButtonPrimary onClick={onPair}>폰으로 연결</ButtonPrimary> : null}
            {/* **카드를 여는 것이 이 버튼의 일이다.** 유파를 안 고르고 시작할 수는 없다.
                선택 화면이 없는 배포(onSelectSchool 미주입)에서는 곧장 경기로 간다 */}
            <ButtonGhost onClick={() => (onSelectSchool ? setStep('school') : onStart())}>경기 시작</ButtonGhost>
            <ButtonGhost onClick={onKeyboard}>키보드 모드 F9</ButtonGhost>
          </>
        )}
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
        {picking
          ? '고른 유파로 키보드 경기가 곧장 시작한다. 숫자키 1~4로도 고를 수 있다.'
          : '폰으로 연결하면 코드와 QR이 뜨고 대전자는 폰에서 고른다. 경기 시작은 키보드 경기다.'}
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
