// 책임: 발표 도식이 인용하는 게임 규칙 수치.
//
// 주의. 이 파일은 사본이다. 원본은 arena/src/game/judge.js의 RULES와 COMPONENTS.md judge 항목이다.
// 앱은 독립 배포라 presentation이 arena를 import하지 않는다(COMPONENTS.md 서두).
// 시간 팽창 값은 shared/tokens.js가 단일 원천이므로 거기서 그대로 읽는다.
// 간합 유효 범위는 아직 shared에 없어 여기 적어 둔다. judge.js가 바뀌면 이 파일도 같이 고친다.
// shared/tokens.js로 승격 제안을 PROGRESS 미해결 이슈에 남겨 두었다.

import { motion } from '../tokens.js';

export const RULES = {
  D_MAX: 100,
  VALID_MIN: 35,
  VALID_MAX: 55,
  DILATION_SCALE: motion.timeDilation.scale,
  DILATION_MAX_MS: motion.timeDilation.maxMs,
  DILATION_COOLDOWN_MS: motion.timeDilation.cooldownMs,
};
