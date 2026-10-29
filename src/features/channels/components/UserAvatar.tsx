import { Avatar, Box } from "@mui/material";
import { PresenceLabels, Presence } from "@/bonfire";
import { presenceIcons } from "./Presence";

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
  sm: "2px",
  md: "2px",
  lg: "3px",
} as const;

const userAvatarPresenceOffsets = {
  sm: -1,
  md: -1,
  lg: 1,
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
  const presenceDimension = userAvatarPresenceSizes[size];
  const offset = userAvatarPresenceOffsets[size];
  const borderSize = userAvatarBorderSizes[size];
  const presenceIcon = presence ? presenceIcons[presence] : undefined;

  const showPresence =
    presence && presence !== Presence.offline && presenceIcon;

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
          borderColor: "background.default",
          borderWidth: 2,
          borderStyle: "solid",
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
