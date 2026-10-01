// routes/_public.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireGuest } from "@/bonfire";

export const Route = createFileRoute("/_public")({
  beforeLoad: requireGuest(),
  component: () => <Outlet />,
});
