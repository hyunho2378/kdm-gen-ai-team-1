// IA.md PAIRING: 방 코드와 QR, 연결 상태, 키보드로 건너뛰기 (C3).
//
// **여기서 막히면 안 된다.** 서버가 안 뜨거나 폰이 없어도 발표는 계속되어야 하므로
// 어느 상태에서든 키보드로 바로 시작하는 길이 항상 열려 있다(F9와 같은 취지).

import { colors, spacing, typography, zIndex } from '../tokens.js';
import { ButtonGhost } from '../components/ui/Button.jsx';
import ChromeText from '../components/ui/ChromeText.jsx';
import QRPanel, { RoomCode } from '../components/QRPanel.jsx';
import { LINK } from '../net/socket.js';

/** 상태마다 사람이 할 수 있는 다음 행동이 다르므로 문구를 따로 쓴다. */
const HINT = {
  [LINK.CONNECTING]: '서버를 깨우는 중이다. 무료 플랜은 첫 접속이 느리다.',
  [LINK.WAITING]: '폰으로 QR을 찍거나 코드를 입력한다.',
  [LINK.RECONNECTING]: '서버와 다시 붙는 중이다.',
  [LINK.ERROR]: '서버에 닿지 않는다. 키보드로 바로 시작할 수 있다.',
  [LINK.IDLE]: '서버 주소가 없다. 키보드로 바로 시작할 수 있다.',
};

export default function PairingScreen({ status, code, controllerUrl, calibrating = false, selected = null, onKeyboard }) {
  const joinUrl = controllerUrl && code ? `${controllerUrl.replace(/\/+$/, '')}/?room=${code}` : '';
  // 폰이 붙은 뒤에는 QR을 치운다. 이미 들어온 사람에게 들어오는 길을 계속 보여줄 이유가 없다
  const showCode = !calibrating && (status === LINK.WAITING || status === LINK.PAIRED);

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
      {/* 로비 워드마크. 폰이 붙기 전 이 화면이 발표장에 떠 있는 얼굴이다 */}
      {!calibrating ? (
        <ChromeText as="div" variant="title">
          VORTEX
        </ChromeText>
      ) : null}

      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.hud.size,
          fontWeight: typography.hud.weight,
          letterSpacing: typography.hud.tracking,
          color: colors.red.light,
        }}
      >
        {calibrating ? '폰 준비 중' : '폰을 검으로 연결'}
      </p>

      {/* 폰이 유파를 고르면 로비가 그것을 반영한다(표시 전용). */}
      {selected ? (
        <p
          style={{
            margin: 0,
            fontFamily: typography.family,
            fontSize: typography.body.size,
            color: colors.text.primary,
          }}
        >
          <span style={{ color: colors.text.dim }}>선택된 유파 </span>
          {selected}
        </p>
      ) : null}

      {showCode ? <RoomCode code={code} /> : null}
      {showCode && joinUrl ? <QRPanel url={joinUrl} /> : null}

      <p
        style={{
          margin: 0,
          fontFamily: typography.family,
          fontSize: typography.body.size,
          lineHeight: typography.body.leading,
          color: colors.text.secondary,
          maxWidth: 520,
          wordBreak: 'keep-all',
        }}
      >
        {calibrating ? '폰을 검처럼 쥐고 3초간 멈춘다. 그 자세가 기준이 된다.' : HINT[status] ?? '연결을 기다린다.'}
      </p>

      {showCode && !joinUrl ? (
        <p style={{ margin: 0, fontFamily: typography.family, fontSize: typography.caption.size, color: colors.text.dim }}>
          QR 주소가 설정되지 않았다. 폰에서 controller를 열고 위 코드를 입력한다.
        </p>
      ) : null}

      {/* 폰/서버가 없어도 발표는 계속된다. 키보드로 진행하면 유파 선택(1234) 화면으로 돌아간다 */}
      <ButtonGhost onClick={onKeyboard}>키보드로 진행 (유파 선택)</ButtonGhost>
    </section>
  );
}
