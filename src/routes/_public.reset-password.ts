import { jwtString, z } from "@/validation";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { PATHS } from "@/constants";
import { ResetPasswordPage } from "@/features";

const verifySearchSchema = z.object({
  token: jwtString,
});

export const Route = createFileRoute("/_public/reset-password")({
  validateSearch: (search) => {
    const result = verifySearchSchema.safeParse(search);
    if (!result.success) {
      return { token: "" };
    }
    return result.data;
  },

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
