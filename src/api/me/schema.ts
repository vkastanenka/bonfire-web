import { z } from "zod";
import { emailSchema, usernameSchema, displayNameSchema } from "../pkg";
import { presenceSchema } from "../presence";

export const meSchema = z.object({
  id: z.uuid(),
  email: emailSchema,
  username: usernameSchema,
  display_name: displayNameSchema,
  avatar_url: z.url().nullable().optional(),
  presence: presenceSchema.nullable().optional(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type Me = z.infer<typeof meSchema>;
