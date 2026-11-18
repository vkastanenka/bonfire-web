import {
  bootstrapKeys,
  useAuthStore,
  useBroadcaster,
  useGateway,
} from "@/features";
import { queryClient, requireAuth, bonfireSdk } from "@/app";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { usePresenceTracker } from "@/features/presence";
import { Layout, useUserGatewayEvents, useAuthGatewayEvents } from "@/features";

export const authLoader = async () => {
  const data = await queryClient.ensureQueryData({
    queryKey: bootstrapKeys.all,
    queryFn: () => bonfireSdk.bootstrap.bootstrap(),
  });

  if (data?.me) {
    useAuthStore.getState().setMe(data.me);
  }

  return data;
};

function AuthLayout() {
  useBroadcaster();
  usePresenceTracker();
  useGateway();
  useUserGatewayEvents();
  useAuthGatewayEvents();

  const me = useAuthStore((state) => state.me);

  if (!me) {
    return null;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: requireAuth(),
  loader: authLoader,
  pendingComponent: () => <div>Restoring Session...</div>,
  component: AuthLayout,
});
