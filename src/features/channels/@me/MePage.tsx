import { useAuthStore, useLogout } from "@/bonfire";
import Stack from "@mui/material/Stack";
import { Button } from "@mui/material";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { Text } from "@/components";
import { router } from "@/app";
import { PATHS } from "@/constants";

export const MePage = () => {
  const me = useAuthStore((state) => state.me);

  const { mutate, isPending } = useLogout({
    onSuccess: () => {
      router.navigate({ to: PATHS.login, replace: true });
    },
  });

  return (
    <AuthLayout
      title="Welcome to the app!"
      subtitle="User management is under development!"
    >
      {me && (
        <Stack>
          <Text>Email: {me.email}</Text>
          <Text>Username: {me.username}</Text>
          <Text>Display name: {me.displayName}</Text>
        </Stack>
      )}
      <Button
        type="submit"
        variant="contained"
        disabled={isPending}
        loading={isPending}
        aria-busy={isPending}
        onClick={() => mutate()}
      >
        Logout
      </Button>
    </AuthLayout>
  );
};
