import { Box, Stack } from "@mui/material";
// import { router } from "@/app";
import {
  useAuthStore,
  // useLogout
} from "@/bonfire";
// import { Text } from "@/components";
// import { PATHS } from "@/constants";
import { Dashboard, Nav, SideBar } from "../components";
import { UserManagement } from "@/features/user-management/UserManagement";

export const MePage = () => {
  const me = useAuthStore((state) => state.me);

  if (!me) return null;

  // const { mutate, isPending } = useLogout({
  //   onSuccess: () => {
  //     router.navigate({ to: PATHS.login, replace: true });
  //   },
  // });

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
        <Dashboard />
      </Stack>
    </Stack>
  );
};
