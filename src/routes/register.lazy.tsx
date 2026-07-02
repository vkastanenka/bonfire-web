import { createLazyFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features";

export const Route = createLazyFileRoute("/register")({
  component: RegisterPage,
});
