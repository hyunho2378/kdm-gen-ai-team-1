// HomeScreen — VORTEX 폰 앱 랜딩(B0). 게스트 시작 + 로그인 스텁.
//
// Strategy: 첫 진입 명확한 단일 CTA.
// Nielsen: #8 심미성과 최소주의(워드마크 + 부제 + 버튼 하나), #10 도움말(로그인 스텁이 데모 성격을 정직히 안내).
// Shneiderman: #1 일관성, #3 정보성 피드백(로그인 누르면 데모 안내).
//
// 배경 펜서 사진은 라이선스 미확인이라 반입하지 않는다. 부재 시 네이비 그라디언트로 내려앉는다.
//
// **워드마크가 글자가 아니라 로고 파일이다.** presentation-v2의 `logo.svg`를 그대로 복사해 왔고
// 원본이 `fill="white"` 하나뿐이라 어두운 무대에 그대로 얹힌다(별도 흰색 변환이 필요 없었다).

import { useState } from 'react';
import { colors, glow, ig, typography } from '../tokens.js';
import { BRAND, HOME } from '../copy.js';
import Button from './common/Button.jsx';
import BottomSheet from './common/BottomSheet.jsx';

export default function HomeScreen({ onGuest }) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: colors.bg.base,
      }}
    >
      {/* 배경 플레이스홀더. 펜서 사진이 오면 이 자리에 다크 처리해 얹는다 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 80% at 50% 0%, ${colors.bg.raised} 0%, ${colors.bg.base} 55%, ${colors.bg.deep} 100%)`,
        }}
      />

      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '24px 16px',
          textAlign: 'center',
        }}
      >
        {/* 로고. **글자로 다시 그리지 않는다.** 브랜드 자산이 이미 파일로 있다 */}
        <img
          src="/logo.svg"
          alt={BRAND}
          style={{ width: 'min(62vw, 220px)', height: 'auto', display: 'block' }}
        />
        <p
          style={{
            margin: 0,
            maxWidth: 300,
            fontFamily: typography.family,
            fontSize: ig.callout.size,
            lineHeight: ig.callout.leading,
            letterSpacing: ig.callout.tracking,
            color: colors.text.secondary,
            wordBreak: 'keep-all',
          }}
        >
          {HOME.sub}
        </p>
      </div>

      {/* 하단 CTA 영역. 주 액션은 filled 하나(화면당 강조 1개) */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '0 16px 24px',
        }}
      >
        {/* **다음이 코드 입력이라는 것을 미리 말한다.** 버튼을 누르고 나서 알면 늦다(N1) */}
        <span
          style={{
            fontFamily: typography.family,
            fontSize: ig.caption1.size,
            color: colors.text.dim,
          }}
        >
          {HOME.guestHint}
        </span>
        <Button variant="filled" size="lg" onClick={onGuest} style={{ boxShadow: glow.primary }}>
          {HOME.guest}
        </Button>
        <Button variant="text" size="md" onClick={() => setLoginOpen(true)}>
          {HOME.login}
        </Button>
      </div>

      <BottomSheet isOpen={loginOpen} onClose={() => setLoginOpen(false)} title={HOME.loginSheetTitle}>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p
            style={{
              margin: 0,
              fontFamily: typography.family,
              fontSize: ig.body.size,
              lineHeight: ig.body.leading,
              letterSpacing: ig.body.tracking,
              color: colors.text.secondary,
              wordBreak: 'keep-all',
            }}
          >
            {HOME.loginSheetBody}
          </p>
          <Button variant="tonal" size="md" onClick={() => setLoginOpen(false)}>
            {HOME.loginSheetClose}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
