import { createTheme } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

export const styles = {
  card: {
    p: 1,
    gap: 1,
    borderColor: "divider",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 2,
  },
} as const;

export const tokens = {
  spacing: {
    tight: 0.5,
    contained: 1,
    group: 1,
    stack: 2.5,
  },
} as const;

export const theme = createTheme({
  typography: {
    fontFamily: "Quicksand, sans-serif",
    button: {
      textTransform: "none",
    },
  },
  palette: {
    background: {
      default: "#ffffff",
      paper: grey[50],
    },
  },
  components: {
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
  },
  styles,
  tokens,
});

export type AppTheme = typeof theme;
