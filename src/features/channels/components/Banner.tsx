import { Box } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
import { type Presence } from "@/presence";
import { UserAvatar, type UserAvatarSize } from "./UserAvatar";

export interface BannerProps {
  username: string;
  presence: Presence;
  bannerColor?: string;
  avatarSrc?: string;
  avatarSize?: UserAvatarSize;
}

export const Banner = ({
  username,
  presence,
  bannerColor,
  avatarSrc,
  avatarSize = "lg",
}: BannerProps) => {
  return (
    <Box sx={{ px: 1.5, pt: 6, position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "70%",
          bgcolor: bannerColor ?? "primary.main",
        }}
      />
      <UserAvatar
        src={avatarSrc}
        username={username}
        presence={presence}
        size={avatarSize}
      />
    </Box>
  );
};
