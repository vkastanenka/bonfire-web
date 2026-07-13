import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features";

export const Route = createFileRoute("/_public/register")({
  component: RegisterPage,
});
