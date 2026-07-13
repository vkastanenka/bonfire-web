import { createFileRoute } from "@tanstack/react-router";
import { AppPage } from "@/features";

export const Route = createFileRoute("/_auth/app")({
  component: AppPage,
});
