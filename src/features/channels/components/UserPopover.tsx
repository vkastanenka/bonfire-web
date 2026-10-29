import {
  Popover,
  Box,
  Typography,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Presence, PresenceLabels } from "@/bonfire";
import { presenceIcons } from "./Presence";
import { UserAvatar } from "./UserAvatar";

export interface UserPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  displayName: string;
  username: string;
  presence: Presence;
  avatarSrc?: string;
  bannerColor?: string;
}

export const UserPopover = ({
  open,
  anchorEl,
  onClose,
  displayName,
  username,
  presence,
  bannerColor,
}: UserPopoverProps) => {
  const presenceIcon =
    presenceIcons[presence] || presenceIcons[Presence.online]!;

  return (
    <Popover
      id="user-profile-popover"
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: -8,
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      marginThreshold={0}
      elevation={4}
    >
      <Box sx={{ width: 300 }}>
        <Box sx={{ px: 1, pt: 6, position: "relative" }}>
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
          <UserAvatar src="" username="" presence="ONLINE" size="lg" />
        </Box>

        <Stack sx={{ pt: 1, px: 2, pb: 2, gap: 2 }}>
          {/* Name */}
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
              {displayName}
            </Typography>
            <Typography variant="body2">{username}</Typography>
          </Stack>

          {/* Options */}
          <Stack
            sx={{
              p: 1,
              gap: 1,
              borderColor: "divider",
              borderWidth: 1,
              borderStyle: "solid",
              borderRadius: 2,
              "& > *": {
                width: "100%",
                textAlign: "start",
              },
            }}
          >
            <Button sx={{ justifyContent: "space-between" }}>
              <Stack
                direction="row"
                sx={{ alignItems: "center", justifyContent: "center", gap: 1 }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Edit Profile
                </Typography>
              </Stack>
            </Button>
            <Divider />
            <Button sx={{ justifyContent: "space-between" }}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <presenceIcon.Icon
                    sx={{ color: presenceIcon.color, fontSize: 16 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {PresenceLabels[presence]}
                  </Typography>
                </Stack>
              </Stack>
              <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />
            </Button>
          </Stack>

          {/* Logout */}
          <Button variant="contained">
            <Typography variant="body2">Log Out</Typography>
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};
