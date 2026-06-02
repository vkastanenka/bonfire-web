export const THEME_TOKENS = {
  spacingTokens: {
    group: 1,
    stack: 2.5,
  },
} as const;

export type ThemeTokensType = typeof THEME_TOKENS;
