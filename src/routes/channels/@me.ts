import { createFileRoute } from "@tanstack/react-router";
import { MePage } from "@/features";

export const Route = createFileRoute("/channels/@me")({
  component: MePage,
});
