// routes/_public.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireGuest } from "@/api/http/guards";

export const Route = createFileRoute("/_public")({
  beforeLoad: requireGuest(),
  component: () => <Outlet />,
});
