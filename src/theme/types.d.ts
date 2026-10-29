import type { styles, tokens } from "./index";

declare module "@mui/material/styles" {
  interface Theme {
    styles: typeof styles;
    tokens: typeof tokens;
  }

  interface ThemeOptions {
    styles?: Partial<typeof styles>;
    tokens?: Partial<typeof tokens>;
  }
}
