import type { ThemeTokensType } from "./tokens";

declare module "@mui/material/styles" {
  interface Theme {
    spacingTokens: ThemeTokensType["spacingTokens"];
  }

  interface ThemeOptions {
    spacingTokens?: Partial<ThemeTokensType["spacingTokens"]>;
  }
}
