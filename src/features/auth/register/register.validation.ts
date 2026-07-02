import { z } from "zod";
import { VALIDATION_LABELS } from "./register.constants";

export const registerSchema = z.object({
  email: z.email(),
  display_name: z.string().min(6, VALIDATION_LABELS.displayName),
  username: z.string().min(6, VALIDATION_LABELS.username),
  password: z.string().min(6, VALIDATION_LABELS.password),
});

export type RegisterInputs = z.infer<typeof registerSchema>;

export const registerResponseSchema = z.any();

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
