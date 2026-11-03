import { z } from "@/validation";
import CircleIcon from "@mui/icons-material/Circle";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import { green, yellow, red, grey } from "@mui/material/colors";

export const presences = {
  online: "ONLINE",
  offline: "OFFLINE",
  idle: "IDLE",
  dnd: "DND",
  invisible: "INVISIBLE",
} as const;

export type Presence = (typeof presences)[keyof typeof presences];

export const presenceLabels: Record<Presence, string> = {
  [presences.online]: "Online",
  [presences.offline]: "Offline",
  [presences.idle]: "Idle",
  [presences.dnd]: "Do Not Disturb",
  [presences.invisible]: "Invisible",
};

export const presenceIcons = {
  [presences.online]: { Icon: CircleIcon, color: green[500] },
  [presences.idle]: { Icon: DarkModeIcon, color: yellow[700] },
  [presences.dnd]: { Icon: DoDisturbOnIcon, color: red[500] },
  [presences.invisible]: { Icon: TripOriginIcon, color: grey[500] },
  [presences.offline]: { Icon: TripOriginIcon, color: grey[500] },
} as const;

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

export const presenceDurationLabels: Record<PresenceDuration, string> = {
  [presenceDurations.fifteenMin]: "For 15 Minutes",
  [presenceDurations.oneHour]: "For 1 Hour",
  [presenceDurations.eightHours]: "For 8 Hours",
  [presenceDurations.twentyFourHours]: "For 24 Hours",
  [presenceDurations.threeDays]: "For 3 Days",
  [presenceDurations.forever]: "Forever",
};

export const presenceDurationSchema = z.enum(presenceDurations);
