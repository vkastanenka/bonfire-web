import { Stack } from "@mui/material";

import { AppNav } from "./AppNav";
import { AppSideNav } from "./AppSideNav";
import { AppSideBar } from "./AppSideBar";
import { AppDashboard } from "./AppDashboard";

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
          }}
        >
          <AppSideNav />
          <AppSideBar />
        </Stack>
        <AppDashboard />
      </Stack>
    </Stack>
  );
};
