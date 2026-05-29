import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/features";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});
