import { bootstrapKeys, bootstrapService, useAuthStore, useGateway } from "@/bonfire";
import { queryClient, requireAuth } from "@/app";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { usePresence } from "@/presence";

export const authLoader = async () => {
  const data = await queryClient.ensureQueryData({
    queryKey: bootstrapKeys.all,
    queryFn: () => bootstrapService.bootstrap(),
  });

  if (data?.me) {
    useAuthStore.getState().setMe(data.me);
  }

  return data;
};

function AuthLayout() {
  usePresence();
  useGateway();

  const me = useAuthStore((state) => state.me);

  if (!me) {
    return null;
  }

  return <Outlet />;
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: requireAuth(),
  loader: authLoader,
  pendingComponent: () => <div>Restoring Session...</div>,
  component: AuthLayout,
});
