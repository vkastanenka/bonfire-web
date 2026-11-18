import { presences, preferredPresenceDurations } from "@/bonfire-sdk";
import {
  presenceLabels,
  presenceIcons,
  preferredPresenceDurationLabels,
} from "@/features/presence";

export const itemStyles = {
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  textAlign: "start",
};

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

export const durationOptions = [
  {
    key: preferredPresenceDurations.fifteenMin,
    label:
      preferredPresenceDurationLabels[preferredPresenceDurations.fifteenMin],
  },
  {
    key: preferredPresenceDurations.oneHour,
    label: preferredPresenceDurationLabels[preferredPresenceDurations.oneHour],
  },
  {
    key: preferredPresenceDurations.eightHours,
    label:
      preferredPresenceDurationLabels[preferredPresenceDurations.eightHours],
  },
  {
    key: preferredPresenceDurations.twentyFourHours,
    label:
      preferredPresenceDurationLabels[
        preferredPresenceDurations.twentyFourHours
      ],
  },
  {
    key: preferredPresenceDurations.threeDays,
    label:
      preferredPresenceDurationLabels[preferredPresenceDurations.threeDays],
  },
  {
    key: preferredPresenceDurations.forever,
    label: preferredPresenceDurationLabels[preferredPresenceDurations.forever],
  },
];
