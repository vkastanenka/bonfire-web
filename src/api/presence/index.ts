import { z } from "zod";

export const presenceSchema = z.enum([
  "online",
  "offline",
  "idle",
  "busy",
  "dnd",
  "invisible",
]);

export type Presence = z.infer<typeof presenceSchema>;
