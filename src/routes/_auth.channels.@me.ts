import { createFileRoute } from "@tanstack/react-router";
import { MePage } from "@/features/channels";

export const Route = createFileRoute("/_auth/channels/@me")({
  component: MePage,
});
