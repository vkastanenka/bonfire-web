import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import { green, yellow, red, grey } from "@mui/material/colors";
import { Presence } from "@/bonfire";

type IconComponent = ComponentType<SvgIconProps>;

type PresenceIcon = {
  color: string;
  Icon: IconComponent;
};

export const presenceIcons: Partial<Record<Presence, PresenceIcon>> = {
  [Presence.online]: { color: green[500], Icon: CircleIcon },
  [Presence.idle]: { color: yellow[700], Icon: DarkModeIcon },
  [Presence.dnd]: { color: red[500], Icon: DoDisturbOnIcon },
  [Presence.invisible]: { color: grey[500], Icon: TripOriginIcon },
};
