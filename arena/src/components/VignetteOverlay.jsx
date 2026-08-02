// COMPONENTS.md: 시간 팽창 비네트. zIndex.overlay, opacity만 애니메이션.
// reduced motion에서는 engine이 팽창 자체를 끄므로 여기로 active가 오지 않는다.

import { colors, motion, zIndex } from '../tokens.js';

export default function VignetteOverlay({ active }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.overlay,
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        transition: `opacity ${motion.duration.modal}ms ${motion.easeOut}`,
        background: `radial-gradient(circle at 50% 52%, rgba(5,5,6,0) 34%, ${colors.bg.deep} 96%)`,
      }}
    />
  );
}
