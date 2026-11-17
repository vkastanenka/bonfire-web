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

export const presenceDurations = {
  fifteenMin: "15_MIN",
  oneHour: "1_HOUR",
  eightHours: "8_HOURS",
  twentyFourHours: "24_HOURS",
  threeDays: "3_DAYS",
  forever: "FOREVER",
} as const;

export type PresenceDuration =
  (typeof presenceDurations)[keyof typeof presenceDurations];

export const presenceDurationSchema = z.enum(presenceDurations);
