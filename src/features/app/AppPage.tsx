import { Box, Stack } from "@mui/material";

import { AppNav } from "./AppNav";
import { AppSideNav } from "./AppSideNav";
import { AppSideBar } from "./AppSideBar";
import { AppDashboard } from "./AppDashboard";
import { AppUserNav } from "./AppUserNav";

export const AppPage = () => {
  return (
    <Stack>
      <AppNav />
      <Stack direction="row">
        <Stack
          direction="row"
          sx={{
            minHeight: "calc(100vh - 32px)",
            boxShadow: 1,
            position: "relative",
          }}
        >
          <AppSideNav />
          <AppSideBar />
          <Box sx={{ position: "absolute", bottom: 100, left: 8, right: 8 }}>
            <AppUserNav />
          </Box>
        </Stack>
        <AppDashboard />
      </Stack>
    </Stack>
  );
};
