import { z } from "@/validation";
import { meSchema } from "../user";

export const bootstrapResponseSchema = z.object({
  me: meSchema,
});

export type BootstrapResponse = z.infer<typeof bootstrapResponseSchema>;
