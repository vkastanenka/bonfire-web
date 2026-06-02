import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/theme";
import { AppLayout } from "./AppLayout";

export const RootLayout = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppLayout>
      <Outlet />
    </AppLayout>
    <TanStackRouterDevtools />
  </ThemeProvider>
);
