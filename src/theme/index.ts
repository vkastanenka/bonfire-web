import { createTheme } from "@mui/material/styles";
import { THEME_TOKENS } from "./tokens";

export const theme = createTheme({
  typography: {
    fontFamily: "Quicksand, sans-serif",
  },
  ...THEME_TOKENS,
});

export { THEME_TOKENS };
