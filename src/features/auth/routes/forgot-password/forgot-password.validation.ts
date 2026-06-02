import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;
