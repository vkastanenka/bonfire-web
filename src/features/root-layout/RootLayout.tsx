import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  typography: {
    fontFamily: "Quicksand, sans-serif",
  },
});

export const RootLayout = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Outlet />
    <TanStackRouterDevtools />
  </ThemeProvider>
);
