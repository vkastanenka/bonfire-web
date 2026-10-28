import { Box, Stack } from "@mui/material";
// import { router } from "@/app";
import {
  useAuthStore,
  useGatewayStore,
  // useLogout
} from "@/bonfire";
// import { Text } from "@/components";
// import { PATHS } from "@/constants";
import { Dashboard, Nav, SideBar, UserCard } from "../components";

export const MePage = () => {
  const me = useAuthStore((state) => state.me);
  const presence = useGatewayStore((state) => state.presence);

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
            <UserCard
              displayName={me.displayName}
              username={me.username}
              avatarSrc={me.avatarUrl}
              presence={presence}
            />
          </Box>
        </Stack>
        <Dashboard />
      </Stack>
    </Stack>
  );
};
