import { z } from "zod";
import { identityEmail, identityUsername, profileDisplayName } from "../http";
import { presenceSchema } from "../presence";

export const meSchema = z.object({
  id: z.uuid(),
  email: identityEmail,
  username: identityUsername,
  display_name: profileDisplayName,
  avatar_url: z.url().nullable().optional(),
  presence: presenceSchema.nullable().optional(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type Me = z.infer<typeof meSchema>;
