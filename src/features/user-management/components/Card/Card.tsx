import { forwardRef } from "react";
import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAuthStore, useGatewayStore } from "@/bonfire";
import { presenceLabels } from "@/presence";
import { Avatar } from "@/features/components";
import { elIds } from "../constants";

const labels = {
  userSettings: "User Settings",
};

export interface CardProps {
  popoverOpen: boolean;
  settingsOpen: boolean;
  handlePopoverOpen: () => void;
  handleSettingsOpen: () => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { popoverOpen, settingsOpen, handlePopoverOpen, handleSettingsOpen },
    ref,
  ) => {
    const me = useAuthStore((state) => state.me)!;
    const presence = useGatewayStore((state) => state.presence);

    return (
      <Stack
        ref={ref}
        direction="row"
        sx={(t) => ({
          ...t.styles.card,
          bgcolor: "background.default",
          justifyContent: "space-between",
          alignItems: "center",
        })}
      >
        <Button
          onClick={handlePopoverOpen}
          aria-haspopup="true"
          aria-expanded={popoverOpen}
          aria-controls={popoverOpen ? elIds.popover : undefined}
          sx={{
            justifyContent: "start",
            py: "3px",
            px: "4px",
            gap: 1,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Avatar
            src={me.avatarUrl}
            username={me.username}
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
              {me.displayName}
            </Typography>
            <Typography sx={{ lineHeight: 1.2 }} variant="caption">
              {presenceLabels[presence]}
            </Typography>
          </Stack>
        </Button>

        <Tooltip placement="top" title={labels.userSettings}>
          <IconButton
            onClick={handleSettingsOpen}
            aria-label={labels.userSettings}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            aria-controls={settingsOpen ? elIds.settings : undefined}
            sx={{ flexShrink: 0 }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  },
);
