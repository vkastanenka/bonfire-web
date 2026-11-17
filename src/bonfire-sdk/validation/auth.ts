import { z } from "./base";

export const sessionSchema = z.object({
  id: z.uuid(),
  isCurrent: z.boolean(),
  clientIp: z.string(),
  userAgent: z.string(),
  os: z.string(),
  client: z.string(),
  expiresAt: z.coerce.date(),
  lastSeenAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type Session = z.infer<typeof sessionSchema>;
