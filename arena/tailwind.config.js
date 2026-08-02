import { colors, typography, breakpoints } from './src/tokens.js';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: Object.fromEntries(
      Object.entries(breakpoints).map(([k, v]) => [k, `${v}px`])
    ),
    extend: {
      colors: {
        bg: colors.bg, accent: colors.accent,
        trail: colors.trail, txt: colors.text, line: colors.line,
      },
      fontFamily: { sans: typography.family.split(',').map(s => s.trim()) },
    },
  },
  plugins: [],
};
