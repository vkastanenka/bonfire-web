import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { UserAvatar } from "./UserAvatar";
import { Presence, PresenceLabels } from "@/bonfire";

export interface UserCardProps {
  displayName: string;
  username: string;
  presence: Presence;
  avatarSrc?: string;
}

export const UserCard = ({
  displayName,
  username,
  presence,
  avatarSrc,
}: UserCardProps) => {
  return (
    <Stack
      direction="row"
      sx={{
        bgcolor: "background.default",
        borderColor: "divider",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 2,
        justifyContent: "space-between",
        alignItems: "center",
        padding: 1,
        gap: 1,
      }}
    >
      <Button
        sx={{
          justifyContent: "start",
          py: "3px",
          px: "4px",
          gap: 1,
          width: "100%",
        }}
      >
        <UserAvatar
          src={avatarSrc}
          username={username}
          presence={presence}
          size="sm"
        />
        <Stack spacing={0.25} sx={{ alignItems: "flex-start" }}>
          <Typography sx={{ fontWeight: 500, lineHeight: 1 }}>
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1 }}>
            {PresenceLabels[presence]}
          </Typography>
        </Stack>
      </Button>
      <Tooltip placement="top" title="User Settings">
        <IconButton>
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
