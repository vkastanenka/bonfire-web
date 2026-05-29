import { z } from "zod";
import { VALIDATION_LABELS } from "./login.constants";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, VALIDATION_LABELS.password),
});

export type LoginInputs = z.infer<typeof loginSchema>;
