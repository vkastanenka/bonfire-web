import { z } from "../validation";

export const presences = {
  online: "ONLINE",
  offline: "OFFLINE",
  idle: "IDLE",
  dnd: "DND",
  invisible: "INVISIBLE",
} as const;

export type Presence = (typeof presences)[keyof typeof presences];
export const presenceSchema = z.enum(presences);
