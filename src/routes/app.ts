import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/features";

export const Route = createFileRoute("/app")({
  component: App,
});
