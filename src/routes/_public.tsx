import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireGuest } from "@/app";

export const Route = createFileRoute("/_public")({
  beforeLoad: requireGuest(),
  component: () => <Outlet />,
});
