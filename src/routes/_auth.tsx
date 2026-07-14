// routes/_auth.tsx
import { meKeys, requireAuth, useGateway } from "@/api";
import { meManager, meService } from "@/api/me";
import { queryClient } from "@/main";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const meLoader = async () => {
  const data = await queryClient.ensureQueryData({
    queryKey: meKeys.get(),
    queryFn: () => meService.get(),
  });

  // console.log("meLoader", data);

  meManager.set(data);
  return data;
};

function AuthLayout() {
  useGateway();

  return <Outlet />;
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: requireAuth(),
  loader: meLoader,
  pendingComponent: () => <div>Restoring Session...</div>,
  component: () => <AuthLayout />,
});
