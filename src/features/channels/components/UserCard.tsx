import { useState, useRef } from "react";
import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { UserAvatar } from "./UserAvatar";
import { UserPopover } from "./UserPopover";
import { type Presence, PRESENCE_LABELS } from "@/presence";

export interface UserCardProps {
  displayName: string;
  username: string;
  presence: Presence;
  createdAt: Date;
  bannerColor?: string;
  avatarSrc?: string;
  bio?: string;
}

export const UserCard = ({
  displayName,
  username,
  presence,
  bannerColor,
  avatarSrc,
  createdAt,
  bio,
}: UserCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const popoverOpen = Boolean(popoverAnchor);

  const handlePopoverOpen = () => {
    if (cardRef.current) {
      setPopoverAnchor(cardRef.current);
    }
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
  };

  return (
    <>
      <Stack
        ref={cardRef}
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
          onClick={handlePopoverOpen}
          aria-haspopup="true"
          aria-expanded={popoverOpen ? "true" : undefined}
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
              {PRESENCE_LABELS[presence]}
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
        anchorEl={popoverAnchor}
        open={popoverOpen}
        handleClose={handlePopoverClose}
        displayName={displayName}
        username={username}
        presence={presence}
        avatarSrc={avatarSrc}
        bannerColor={bannerColor}
        createdAt={createdAt}
        bio={bio}
      />
    </>
  );
};
