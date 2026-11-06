import {
  bootstrapKeys,
  bootstrapService,
  useBootstrap,
  // useGateway,
} from "@/bonfire";
import { queryClient, requireAuth } from "@/app";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { usePresence } from "@/presence";

export const authLoader = async () => {
  await queryClient.ensureQueryData({
    queryKey: bootstrapKeys.all,
    queryFn: () => bootstrapService.bootstrap(),
  });
};

function AuthLayout() {
  useBootstrap();
  usePresence();
  // useGateway();
  return <Outlet />;
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: requireAuth(),
  loader: authLoader,
  pendingComponent: () => <div>Restoring Session...</div>,
  component: AuthLayout,
});
