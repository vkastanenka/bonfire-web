import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { AppLayout } from "@/components";

console.log("RootLayout.tsx TODO: find better directory")

const theme = createTheme({
  typography: {
    fontFamily: "Quicksand, sans-serif",
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
