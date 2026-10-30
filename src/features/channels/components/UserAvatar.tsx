import { Avatar, Box } from "@mui/material";
import {
  type Presence,
  PRESENCE,
  PRESENCE_ICONS,
  PRESENCE_LABELS,
} from "@/presence";

export const userAvatarSizes = {
  sm: 32,
  md: 40,
  lg: 80,
  xl: 120,
} as const;

const userAvatarOutlineSizes = {
  sm: "2px",
  md: "2px",
  lg: "4px",
  xl: "4px",
} as const;

const userAvatarPresenceSizes = {
  sm: 12,
  md: 14,
  lg: 24,
  xl: 36,
} as const;

const userAvatarPresenceBorderSizes = {
  sm: "2px",
  md: "2px",
  lg: "3px",
  xl: "3px",
} as const;

const userAvatarPresenceOffsets = {
  sm: -1,
  md: -1,
  lg: 1,
  xl: 1,
} as const;

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
  surfaceColor = "background.default",
  presence,
  size = "sm",
  src,
}: UserAvatarProps) => {
  const wrapperDimension = userAvatarSizes[size];
  const outlineSize = userAvatarOutlineSizes[size];
  const presenceDimension = userAvatarPresenceSizes[size];
  const offset = userAvatarPresenceOffsets[size];
  const presenceIconBorderSize = userAvatarPresenceBorderSizes[size];
  const presenceIcon = presence ? PRESENCE_ICONS[presence] : undefined;

  const showPresence =
    presence && presence !== PRESENCE.OFFLINE && presenceIcon;

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
          outlineStyle: "solid",
          outlineWidth: outlineSize,
          outlineColor: "background.default",
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
          <presenceIcon.Icon
            sx={{
              width: "100%",
              height: "100%",
              color: presenceIcon.color,
              borderRadius: "50%",
              bgcolor: surfaceColor,
              border: `${presenceIconBorderSize} solid`,
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
    alt = `${alt}, ${PRESENCE_LABELS[presence]}`;
  }
  return alt;
};
