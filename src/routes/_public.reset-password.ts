import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/features";

export const Route = createFileRoute("/_public/reset-password")({
  component: ResetPasswordPage,
});
