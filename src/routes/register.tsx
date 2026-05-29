import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});
