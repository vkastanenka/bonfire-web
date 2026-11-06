import {
  bootstrapKeys,
  bootstrapService,
  useAuthStore,
  useBootstrap,
  // useGateway,
} from "@/bonfire";
import { queryClient, requireAuth } from "@/app";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { usePresence } from "@/presence";
import { useEffect } from "react";
import { paths } from "@/constants";

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

  const me = useAuthStore((state) => state.me);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  useEffect(() => {
    if (!me || !accessToken) {
      clearSession();
      navigate({ to: paths.login });
    }
  }, [me, accessToken, clearSession, navigate]);

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
