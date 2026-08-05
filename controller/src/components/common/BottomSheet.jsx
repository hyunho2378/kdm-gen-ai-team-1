// common/BottomSheet.jsx — 강릉페이 BottomSheet 이식. 모달은 바텀시트(iOS HIG).
// **색만 VORTEX 다크로: 다크 카드(raised) + steel 저강도 보더, 오버레이는 딤.**
//
// Nielsen: #3 사용자 제어와 자유(오버레이 탭으로 닫힘), #4 일관성(모달=바텀시트).
// Shneiderman: #3 정보성 피드백, #6 되돌리기 쉬움.

import { colors, ig, motion, radius, typography } from '../../tokens.js';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* 딤 오버레이. 탭하면 닫힌다 */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: colors.bg.overlay }} />

      {/* 시트 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '390px',
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: colors.bg.raised,
          border: `1px solid ${colors.line.default}`,
          borderBottom: 'none',
          borderTopLeftRadius: radius.modal,
          borderTopRightRadius: radius.modal,
          maxHeight: '90vh',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: typography.family,
          animation: `slideUp 0.28s ${motion.easeDrawer}`,
        }}
      >
        {/* 핸들 바 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: title ? 8 : 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: radius.pill, backgroundColor: colors.line.strong }} />
        </div>

        {title && (
          <div style={{ padding: `0 16px 12px`, borderBottom: `1px solid ${colors.line.default}` }}>
            <span style={{ fontSize: ig.callout.size, fontWeight: 600, color: colors.text.primary }}>{title}</span>
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}
