import { z } from "@/validation";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { VerifyPage } from "@/features";
import { PATHS } from "@/constants";

const verifySearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/_public/verify")({
  validateSearch: (search) => verifySearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({
        to: PATHS.login,
        replace: true,
      });
    }
  },
  component: VerifyPage,
});
