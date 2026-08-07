// SelectScreen — AI 대전자 선택(B2). 이 앱의 얼굴. 세로 스크롤 4카드.
//
// Strategy: 선택이 이 앱의 핵심 과업. 정보 위계(HIG)로 훑고 탭해 깊이 본다.
// Nielsen: #2 실세계 부합(유파 카피 원문), #6 인식 우선(카드에 정보 노출), #1 상태 가시성(선택 강조).
// Shneiderman: #5 오류 예방(확정 버튼 별도), #8 단기기억 부담 감소(카드에 다 보인다).
//
// 카피는 VORTEX 3.11 원문 그대로(copy.js SELECT). 사진은 라이선스 미확인이라 그라디언트 플레이스홀더.

import { useEffect, useState } from 'react';
import { colors, ig, radius, typography } from '../tokens.js';
import { SELECT } from '../copy.js';
import { TopBarBack } from './ui.jsx';
import Button from './common/Button.jsx';

function Eyebrow({ children }) {
  // red 아이브로우 문법: 작은 red 라벨 + 자간
  return (
    <span
      style={{
        fontFamily: typography.family,
        fontSize: ig.caption1.size,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: colors.accent.base,
      }}
    >
      {children}
    </span>
  );
}

function DuelistCard({ card, expanded, onToggle, onConfirm }) {
  return (
    <div
      style={{
        flexShrink: 0,
        borderRadius: radius.card,
        border: `1px solid ${expanded ? colors.accent.base : colors.line.default}`,
        background: colors.bg.raised,
        overflow: 'hidden',
        transition: 'border-color 160ms',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        style={{
          width: '100%',
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: typography.family,
          touchAction: 'manipulation',
        }}
      >
        {/* 사진 플레이스홀더(그라디언트). 실제 유파 사진이 오면 이 자리를 다크 처리해 얹는다 */}
        <div
          aria-hidden="true"
          style={{
            height: 96,
            background: `linear-gradient(135deg, ${colors.bg.raised} 0%, ${colors.bg.deep} 60%, ${colors.primary.tonal} 140%)`,
            borderBottom: `1px solid ${colors.line.default}`,
          }}
        />
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Eyebrow>{card.badge}</Eyebrow>
          <span style={{ fontSize: ig.title3.size, fontWeight: ig.title3.weight, color: colors.text.primary, letterSpacing: ig.title3.tracking }}>
            {card.name}
          </span>
          <span style={{ fontSize: ig.subhead.size, color: colors.text.secondary, lineHeight: ig.subhead.leading, wordBreak: 'keep-all' }}>
            {card.style}
          </span>
          <span style={{ fontSize: ig.footnote.size, color: colors.text.dim, lineHeight: ig.footnote.leading, wordBreak: 'keep-all' }}>
            {card.quote}
          </span>
        </div>
      </button>

      {expanded ? (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: typography.family, fontSize: ig.footnote.size, color: colors.text.secondary, lineHeight: 1.5, wordBreak: 'keep-all' }}>
            {card.fact}
          </span>
          <Button variant="filled" size="md" onClick={() => onConfirm(card.school)}>
            {SELECT.duel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function SelectScreen({ onConfirm, onFocus, onBack }) {
  const [expanded, setExpanded] = useState(0);

  // 펼친 카드가 곧 훑는 중인 유파다. **확정이 아니라 미리보기라서 arena는 불만 켠다.**
  // 접으면 null이 가고 하이라이트가 꺼진다. 첫 렌더의 0번도 같이 보낸다
  useEffect(() => {
    onFocus?.(SELECT.cards[expanded]?.school ?? null);
  }, [expanded, onFocus]);

  return (
    <>
      {onBack ? <TopBarBack title="AI 대전자" onBack={onBack} /> : null}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: colors.bg.base }}>
        <div style={{ padding: '16px 16px 8px' }}>
          <h1 style={{ margin: '0 0 4px', fontFamily: typography.family, fontSize: ig.title1.size, fontWeight: ig.title1.weight, letterSpacing: ig.title1.tracking, color: colors.text.primary }}>
            {SELECT.title}
          </h1>
          <p style={{ margin: 0, fontFamily: typography.family, fontSize: ig.subhead.size, color: colors.text.dim, lineHeight: ig.subhead.leading, wordBreak: 'keep-all' }}>
            {SELECT.sub}
          </p>
        </div>

        {/* 세로 스크롤 카드 리스트 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SELECT.cards.map((card, i) => (
            <DuelistCard
              key={card.school}
              card={card}
              expanded={expanded === i}
              onToggle={() => setExpanded((cur) => (cur === i ? -1 : i))}
              onConfirm={onConfirm}
            />
          ))}
        </div>
      </div>
    </>
  );
}
