import { jwtString, z } from "@/validation";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { VerifyPage } from "@/features";
import { PATHS } from "@/constants";

const verifySearchSchema = z.object({
  token: jwtString,
});

export const Route = createFileRoute("/verify")({
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
  
  component: VerifyPage,
});
