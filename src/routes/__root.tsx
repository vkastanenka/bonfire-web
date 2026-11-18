import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { type RouterContext } from "@/app";
import { theme } from "@/theme";
import { restoreSession } from "@/features/auth";

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

let hasRestored = false;

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    if (hasRestored) return;
    hasRestored = true;
    await restoreSession();
  },
  pendingComponent: () => <div>Restoring Session...</div>,
  component: RootLayout,
});
