import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/features";

export const Route = createFileRoute("/_public/forgot-password")({
  component: ForgotPasswordPage,
});
