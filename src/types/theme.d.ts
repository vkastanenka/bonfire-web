import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    spacingTokens: {
      group: number;
      stack: number;
    };
  }

  interface ThemeOptions {
    spacingTokens?: {
      group: number;
      stack: number;
    };
  }
}

export const theme = createTheme({
  typography: {
    fontFamily: "Quicksand, sans-serif",
  },
  tokens: {
    spacing: {
      group: 1,
      stack: 2.5,
    },
  },
});
