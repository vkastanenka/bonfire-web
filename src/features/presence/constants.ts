import {
  presences,
  type Presence,
  preferredPresenceDurations,
  type PreferredPresenceDuration,
} from "@/bonfire-sdk";
import CircleIcon from "@mui/icons-material/Circle";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import { green, yellow, red, grey } from "@mui/material/colors";

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

export const preferredPresenceDurationLabels: Record<
  PreferredPresenceDuration,
  string
> = {
  [preferredPresenceDurations.fifteenMin]: "For 15 Minutes",
  [preferredPresenceDurations.oneHour]: "For 1 Hour",
  [preferredPresenceDurations.eightHours]: "For 8 Hours",
  [preferredPresenceDurations.twentyFourHours]: "For 24 Hours",
  [preferredPresenceDurations.threeDays]: "For 3 Days",
  [preferredPresenceDurations.forever]: "Forever",
};
