import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/features";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});
