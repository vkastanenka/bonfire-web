import {
  presences,
  presenceLabels,
  presenceIcons,
  presenceDurationLabels,
} from "@/presence";

export const itemStyles = {
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
};

export const textVariants = {
  base: { name: "body2", weight: 500, height: 1.2 },
  sub: { name: "caption", weight: 400, height: 1.2 },
} as const;

export const iconVariants = {
  base: { size: 16 },
  sm: { size: 12 },
} as const;

export const presenceOptions = [
  {
    key: presences.online,
    label: presenceLabels[presences.online],
    icon: presenceIcons[presences.online].Icon,
    color: presenceIcons[presences.online].color,
    hasSubmenu: false,
  },
  {
    key: presences.idle,
    label: presenceLabels[presences.idle],
    icon: presenceIcons[presences.idle].Icon,
    color: presenceIcons[presences.idle].color,
    hasSubmenu: true,
  },
  {
    key: presences.dnd,
    label: presenceLabels[presences.dnd],
    icon: presenceIcons[presences.dnd].Icon,
    color: presenceIcons[presences.dnd].color,
    description: "You will not receive notifications",
    hasSubmenu: true,
  },
  {
    key: presences.invisible,
    label: presenceLabels[presences.invisible],
    icon: presenceIcons[presences.invisible].Icon,
    color: presenceIcons[presences.invisible].color,
    description: "You will appear offline",
    hasSubmenu: true,
  },
] as const;

export const durationOptions = Object.entries(presenceDurationLabels).map(
  ([key, label]) => ({ key, label }),
);
