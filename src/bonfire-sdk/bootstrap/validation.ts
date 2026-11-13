import { z } from "@/validation";
import { meSchema } from "../validation";

export const bootstrapResponseSchema = z.object({
  me: meSchema,
});

export type BootstrapResponse = z.infer<typeof bootstrapResponseSchema>;
