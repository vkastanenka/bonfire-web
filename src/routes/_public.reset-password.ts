import { z } from "zod";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { PATHS } from "@/constants";
import { ResetPasswordPage } from "@/features";

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/_public/reset-password")({
  validateSearch: (search) => resetPasswordSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({
        to: PATHS.login,
        replace: true,
      });
    }
  },
  component: ResetPasswordPage,
});
