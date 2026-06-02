import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppLayout } from "./AppLayout";

const theme = createTheme({
  typography: {
    fontFamily: "Quicksand, sans-serif",
  },
  spacingTokens: {
    group: 1,
    stack: 2.5,
  },
});

export const RootLayout = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppLayout>
      <Outlet />
    </AppLayout>
    <TanStackRouterDevtools />
  </ThemeProvider>
);
