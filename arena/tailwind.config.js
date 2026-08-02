import { colors, typography, breakpoints } from './src/tokens.js';

// steel.gradient는 linear-gradient 문자열이라 color 유틸리티로 쓰면 무효 CSS가 된다.
// 매핑에서 빼서 bg-steel-gradient 같은 함정 클래스가 생성되지 않게 한다.
const { gradient: _steelGradient, ...steelColors } = colors.steel;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: Object.fromEntries(
      Object.entries(breakpoints).map(([k, v]) => [k, `${v}px`])
    ),
    extend: {
      colors: {
        bg: colors.bg, red: colors.red, blue: colors.blue, steel: steelColors,
        trail: colors.trail, txt: colors.text, line: colors.line,
      },
      fontFamily: { sans: typography.family.split(',').map(s => s.trim()) },
    },
  },
  plugins: [],
};
