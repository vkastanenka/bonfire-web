import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    console.log("Checking if user is already logged in...");
  },
});
