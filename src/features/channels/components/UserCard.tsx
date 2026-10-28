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
          flex: 1,
          minWidth: 0,
        }}
      >
        <UserAvatar
          src={avatarSrc}
          username={username}
          presence={presence}
          size="sm"
        />
        <Stack
          sx={{
            alignItems: "flex-start",
            justifyContent: "center",
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              lineHeight: 1.08,
              textAlign: "start",
            }}
          >
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1 }}>
            {PresenceLabels[presence]}
          </Typography>
        </Stack>
      </Button>
      <Tooltip placement="top" title="User Settings">
        <IconButton sx={{ flexShrink: 0 }}>
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
