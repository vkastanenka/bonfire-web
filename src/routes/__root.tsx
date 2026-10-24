import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { type RouterContext } from "@/app";
import { theme } from "@/theme";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
      }}
    >
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export const RootLayout = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppLayout>
      <Outlet />
    </AppLayout>
    {/* <TanStackRouterDevtools /> */}
  </ThemeProvider>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
