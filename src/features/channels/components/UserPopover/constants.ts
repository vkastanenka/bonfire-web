import {
  PRESENCE,
  PRESENCE_LABELS,
  PRESENCE_ICONS,
  PRESENCE_DURATION_LABELS,
} from "@/presence";

export const TEXT_VARIANTS = {
  BASE: { NAME: "body2", WEIGHT: 500, HEIGHT: 1.2 },
  SUB: { NAME: "caption", WEIGHT: 400, HEIGHT: 1.2 },
} as const;

export const ICON_VARIANTS = {
  BASE: { SIZE: 16 },
  SM: { SIZE: 12 },
} as const;

export const PRESENCE_OPTIONS = [
  {
    key: PRESENCE.ONLINE,
    label: PRESENCE_LABELS.ONLINE,
    icon: PRESENCE_ICONS.ONLINE.Icon,
    color: PRESENCE_ICONS.ONLINE.color,
    hasSubmenu: false,
  },
  {
    key: PRESENCE.IDLE,
    label: PRESENCE_LABELS.IDLE,
    icon: PRESENCE_ICONS.IDLE.Icon,
    color: PRESENCE_ICONS.IDLE.color,
    hasSubmenu: true,
  },
  {
    key: PRESENCE.DND,
    label: PRESENCE_LABELS.DND,
    icon: PRESENCE_ICONS.DND.Icon,
    color: PRESENCE_ICONS.DND.color,
    description: "You will not receive notifications",
    hasSubmenu: true,
  },
  {
    key: PRESENCE.INVISIBLE,
    label: PRESENCE_LABELS.INVISIBLE,
    icon: PRESENCE_ICONS.INVISIBLE.Icon,
    color: PRESENCE_ICONS.INVISIBLE.color,
    description: "You will appear offline",
    hasSubmenu: true,
  },
] as const;

export const DURATION_OPTIONS = Object.entries(PRESENCE_DURATION_LABELS).map(
  ([key, label]) => ({ key, label }),
);
