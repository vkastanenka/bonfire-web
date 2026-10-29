import { createTheme } from "@mui/material/styles";
import { THEME_TOKENS } from "./tokens";
import { grey } from "@mui/material/colors";

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
          borderRadius: 8, // Set your desired border radius here (12px, '16px', '1rem', etc.)
        },
      },
    },
  },
  ...THEME_TOKENS,
});

export { THEME_TOKENS };
