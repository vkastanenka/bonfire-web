import { useState, useCallback } from "react";
import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { UserAvatar } from "./UserAvatar";
import { UserPopover } from "./UserPopover";
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
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const stackRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setAnchorEl(node);
    }
  }, []);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Stack
        ref={stackRef}
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
          onClick={handleClick}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
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
                textAlign: "start",
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </Typography>
            <Typography sx={{ lineHeight: 1.2 }} variant="caption">
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

      <UserPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        displayName={displayName}
        username={username}
        presence={presence}
        avatarSrc={avatarSrc}
      />
    </>
  );
};
