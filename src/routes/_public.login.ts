import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features";

export const Route = createFileRoute("/_public/login")({
  component: LoginPage,
});
