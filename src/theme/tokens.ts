export const THEME_TOKENS = {
  spacingTokens: {
    tight: 0.5,
    contained: 1,
    group: 1,
    stack: 2.5,
  },
} as const;

export type ThemeTokensType = typeof THEME_TOKENS;
