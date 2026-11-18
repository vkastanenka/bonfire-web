import { Box, Stack } from "@mui/material";
import { Dashboard, Nav, SideBar } from ".";
import { UserManagement } from "@/features/user";
import type { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Stack>
      <Nav />
      <Stack direction="row">
        <Stack
          direction="row"
          sx={{
            minHeight: "calc(100vh - 32px)",
            boxShadow: 1,
            position: "relative",
          }}
        >
          <SideBar />
          <Box sx={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
            <UserManagement />
          </Box>
        </Stack>
        <Dashboard>{children}</Dashboard>
      </Stack>
    </Stack>
  );
};
