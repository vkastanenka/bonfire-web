// routes/_auth.tsx
import { requireAuth } from "@/api/http/guards";
import { AuthProvider } from "@/api/react/AuthProvider";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: requireAuth(),
  pendingComponent: () => <div>Restoring Session...</div>,
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
});
