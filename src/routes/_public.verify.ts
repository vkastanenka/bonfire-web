import { createFileRoute } from "@tanstack/react-router";
import { VerifyPage } from "@/features";

export const Route = createFileRoute("/_public/verify")({
  component: VerifyPage,
});
