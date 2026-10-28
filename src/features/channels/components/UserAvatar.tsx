import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material";
import { Avatar, Box } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import { green, yellow, red, grey } from "@mui/material/colors";
import { PresenceLabels, Presence } from "@/bonfire";

export const userAvatarSizes = {
  sm: 32,
  md: 40,
  lg: 80,
} as const;

const userAvatarPresenceSizes = {
  sm: 12,
  md: 14,
  lg: 24,
} as const;

const userAvatarBorderSizes = {
  sm: "1px",
  md: "1px",
  lg: "2px",
} as const;

const userAvatarPresenceOffsets = {
  sm: 0,
  md: 0,
  lg: 1,
} as const;

type IconComponent = ComponentType<SvgIconProps>;

const userAvatarPresenceIcons: Partial<Record<Presence, IconComponent>> = {
  [Presence.online]: CircleIcon,
  [Presence.idle]: DarkModeIcon,
  [Presence.dnd]: DoDisturbOnIcon,
  [Presence.invisible]: TripOriginIcon,
};

const userAvatarPresenceColors: Partial<Record<Presence, string>> = {
  [Presence.online]: green[500],
  [Presence.idle]: yellow[700],
  [Presence.dnd]: red[500],
  [Presence.invisible]: grey[500],
};

export type UserAvatarSize = keyof typeof userAvatarSizes;
export type UserAvatarSizeValue = (typeof userAvatarSizes)[UserAvatarSize];

export interface UserAvatarProps {
  username: string;
  bgColor?: string;
  surfaceColor?: string;
  presence?: Presence;
  size?: UserAvatarSize;
  src?: string;
}

export const UserAvatar = ({
  username,
  bgColor = "primary.main",
  surfaceColor = "grey.200",
  presence,
  size = "sm",
  src,
}: UserAvatarProps) => {
  const wrapperDimension = userAvatarSizes[size];
  const presenceDimension = userAvatarPresenceSizes[size];
  const offset = userAvatarPresenceOffsets[size];
  const borderSize = userAvatarBorderSizes[size];

  const Icon = presence ? userAvatarPresenceIcons[presence] : undefined;
  const color = presence ? userAvatarPresenceColors[presence] : undefined;

  const showPresence =
    presence && presence !== Presence.offline && Icon && color;

  return (
    <Box
      sx={{
        position: "relative",
        width: wrapperDimension,
        height: wrapperDimension,
      }}
    >
      <Avatar
        {...(src && {
          src,
          alt: resolveAlt(username, presence),
        })}
        sx={{
          bgcolor: bgColor,
          width: "100%",
          height: "100%",
        }}
      />

      {showPresence && (
        <Box
          sx={{
            position: "absolute",
            bottom: offset,
            right: offset,
            width: presenceDimension,
            height: presenceDimension,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            sx={{
              width: "100%",
              height: "100%",
              color: color,
              borderRadius: "50%",
              bgcolor: surfaceColor,
              border: `${borderSize} solid`,
              borderColor: surfaceColor,
              boxSizing: "content-box",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

const resolveAlt = (username: string, presence?: Presence) => {
  let alt = username;
  if (presence) {
    alt = `${alt}, ${PresenceLabels[presence]}`;
  }
  return alt;
};
