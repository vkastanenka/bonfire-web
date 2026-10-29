import { z } from "@/validation";
import CircleIcon from "@mui/icons-material/Circle";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import { green, yellow, red, grey } from "@mui/material/colors";

export const PRESENCE = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  IDLE: "IDLE",
  DND: "DND",
  INVISIBLE: "INVISIBLE",
} as const;

export type Presence = (typeof PRESENCE)[keyof typeof PRESENCE];

export const PRESENCE_LABELS: Record<Presence, string> = {
  [PRESENCE.ONLINE]: "Online",
  [PRESENCE.OFFLINE]: "Offline",
  [PRESENCE.IDLE]: "Idle",
  [PRESENCE.DND]: "Do Not Disturb",
  [PRESENCE.INVISIBLE]: "Invisible",
};

export const PRESENCE_ICONS = {
  [PRESENCE.ONLINE]: { Icon: CircleIcon, color: green[500] },
  [PRESENCE.IDLE]: { Icon: DarkModeIcon, color: yellow[700] },
  [PRESENCE.DND]: { Icon: DoDisturbOnIcon, color: red[500] },
  [PRESENCE.INVISIBLE]: { Icon: TripOriginIcon, color: grey[500] },
  [PRESENCE.OFFLINE]: { Icon: TripOriginIcon, color: grey[500] },
} as const;

export const presenceSchema = z.enum(PRESENCE);

export const PRESENCE_DURATIONS = {
  "15_MIN": "15_MIN",
  "1_HOUR": "1_HOUR",
  "8_HOURS": "8_HOURS",
  "24_HOURS": "24_HOURS",
  "3_DAYS": "3_DAYS",
  FOREVER: "FOREVER",
} as const;

export const PRESENCE_DURATION_LABELS = {
  [PRESENCE_DURATIONS["15_MIN"]]: "For 15 Minutes",
  [PRESENCE_DURATIONS["1_HOUR"]]: "For 1 Hour",
  [PRESENCE_DURATIONS["8_HOURS"]]: "For 8 Hours",
  [PRESENCE_DURATIONS["24_HOURS"]]: "For 24 Hours",
  [PRESENCE_DURATIONS["3_DAYS"]]: "For 3 Days",
  [PRESENCE_DURATIONS.FOREVER]: "Forever",
} as const;

export {
  type PresenceListener,
  PresenceTracker,
  presenceTracker,
} from "./tracker";
