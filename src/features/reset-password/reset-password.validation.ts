import { z } from "zod";
import { VALIDATION_LABELS } from "./reset-password.constants";

export const resetPasswordSchema = z.object({
  password: z.string().min(6, VALIDATION_LABELS.password),
});

export type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;
