import { Avatar as MuiAvatar, Box } from "@mui/material";
import {
  type Presence,
  presences,
  presenceIcons,
  presenceLabels,
} from "@/presence";

export const sizes = {
  sm: 32,
  md: 40,
  lg: 80,
  xl: 120,
} as const;

const outlineSizes = {
  sm: "2px",
  md: "2px",
  lg: "4px",
  xl: "4px",
} as const;

const presenceSizes = {
  sm: 12,
  md: 14,
  lg: 24,
  xl: 36,
} as const;

const presenceBorderSizes = {
  sm: "2px",
  md: "2px",
  lg: "3px",
  xl: "3px",
} as const;

const presenceOffsets = {
  sm: -1,
  md: -1,
  lg: 1,
  xl: 1,
} as const;

export type AvatarSizeKey = keyof typeof sizes;
export type AvatarSizeValue = (typeof sizes)[AvatarSizeKey];

export interface AvatarProps {
  username?: string;
  bgColor?: string;
  presence?: Presence;
  size?: AvatarSizeKey;
  src?: string;
  surfaceColor?: string;
}

export const Avatar = ({
  username,
  bgColor = "primary.main",
  presence,
  size = "sm",
  src,
  surfaceColor = "background.default",
}: AvatarProps) => {
  const wrapperDimension = sizes[size];
  const outlineSize = outlineSizes[size];
  const presenceDimension = presenceSizes[size];
  const offset = presenceOffsets[size];
  const presenceIconBorderSize = presenceBorderSizes[size];
  const presenceIcon = presence ? presenceIcons[presence] : undefined;

  const showPresence =
    presence && presence !== presences.offline && presenceIcon;
  const resolvedAlt = resolveAlt(username, presence);

  return (
    <Box
      sx={{
        position: "relative",
        width: wrapperDimension,
        height: wrapperDimension,
      }}
    >
      <MuiAvatar
        {...(src &&
          resolvedAlt && {
            src,
            alt: resolvedAlt,
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

const resolveAlt = (
  username?: string,
  presence?: Presence,
): string | undefined => {
  if (!username && !presence) return;
  let alt = username;
  if (presence) {
    alt = `${alt}, ${presenceLabels[presence]}`;
  }
  return alt;
};
