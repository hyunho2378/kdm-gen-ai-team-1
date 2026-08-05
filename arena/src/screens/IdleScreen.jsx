// IA.md IDLE: 타이틀, [폰으로 연결], [경기 시작], [키보드 모드 F9].
//
// **입구를 라벨로 가른다.** [폰으로 연결]만 PAIRING(코드와 QR)으로 가고 [경기 시작]은 언제나
// 키보드 경기다. 전에는 [경기 시작] 하나가 서버 주소 유무로 갈려서, 주소가 없는 배포에서는
// 폰 연결을 시작할 방법이 아예 없고 주소가 있으면 키보드로 갈 방법이 버튼에 없었다.
//
// 유파 선택(1/2/3/4): 로컬 키보드 폴백이 상시 보인다(HANDOVER 3절). 카드를 누르거나 숫자키를
// 치면 그 유파로 키보드 경기가 곧장 시작한다. **폰으로 연결하면 유파는 폰의 SELECT가 정한다**
// (소켓 select가 engine.setSchool을 부른다). 그래서 이 카드는 폰 없는 경로 전용이다.

import { colors, radius, spacing, typography, zIndex } from '../tokens.js';
import { SCHOOL } from '../../../shared/protocol.js';
import { BRAND } from '../copy.js';
import ChromeText from '../components/ui/ChromeText.jsx';
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button.jsx';

// VORTEX 유파 3.11 카피와 표기 일치. 4번은 세 스타일을 갈아타는 통합 모드.
const SCHOOL_OPTIONS = [
  { key: SCHOOL.SABRE, n: '1', name: '이탈리아 세이버', trait: '공격형' },
  { key: SCHOOL.EPEE, n: '2', name: '프랑스 에페', trait: '카운터형' },
  { key: SCHOOL.HUNGARIAN, n: '3', name: '헝가리안', trait: '심리전형' },
  { key: SCHOOL.MIXED, n: '4', name: '통합 MIXED', trait: '세 스타일 조합' },
];

function SchoolCard({ opt, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(opt.key)}
      aria-pressed={selected}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        minWidth: 128,
        minHeight: 44,
        padding: '10px 14px',
        borderRadius: radius.md,
        border: `1px solid ${selected ? colors.red.light : colors.line.default}`,
        background: colors.bg.raised,
        boxShadow: selected ? `0 0 16px ${colors.red.glow}` : 'none',
        cursor: 'pointer',
        fontFamily: typography.family,
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: typography.caption.size,
            fontWeight: 700,
            color: selected ? colors.red.light : colors.text.dim,
            border: `1px solid ${selected ? colors.red.light : colors.line.strong}`,
            borderRadius: radius.xs,
            width: 18,
            height: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {opt.n}
        </span>
        <span style={{ fontSize: typography.caption.size, color: colors.text.secondary, wordBreak: 'keep-all' }}>
          {opt.name}
        </span>
      </span>
      <span style={{ fontSize: typography.caption.size, color: colors.text.dim }}>{opt.trait}</span>
    </button>
  );
}

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
