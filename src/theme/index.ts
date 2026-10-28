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
  ...THEME_TOKENS,
});

export { THEME_TOKENS };
