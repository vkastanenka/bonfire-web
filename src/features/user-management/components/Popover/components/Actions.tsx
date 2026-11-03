import {
  Typography,
  Stack,
  Button,
  Divider,
  type ButtonProps,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { presenceLabels, presenceIcons } from "@/presence";
import { itemStyles } from "../constants";
import { Content } from "./Content";
import { useAuthStore, useGatewayStore } from "@/bonfire";

const labels = {
  editProfile: "Edit Profile",
  logOut: "Log Out",
};

export interface ActionsProps {
  presenceMenuButtonId: string;
  presenceMenuId: string;
  presenceOpen: boolean;
  onOpenPresenceMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
}

export const Actions = ({
  presenceMenuButtonId,
  presenceMenuId,
  presenceOpen,
  onOpenPresenceMenu,
  onEditProfile,
  onLogout,
}: ActionsProps) => {
  const me = useAuthStore((state) => state.me)!;
  const presence = useGatewayStore((state) => state.presence);

  const currentPresenceIcon = presenceIcons[presence];
  const currentPresenceLabel = presenceLabels[presence];

  return (
    <Stack sx={{ pt: 1, px: 2, pb: 2, gap: 2 }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
          {me.displayName}
        </Typography>
        <Typography variant="body2">{me.username}</Typography>
      </Stack>

      <Stack sx={(t) => ({ ...t.styles.card })}>
        <ActionButton icon={EditIcon} onClick={onEditProfile}>
          {labels.editProfile}
        </ActionButton>

        <Divider />

        <ActionButton
          icon={currentPresenceIcon.Icon}
          iconColor={currentPresenceIcon.color}
          hasSubmenu
          id={presenceMenuButtonId}
          aria-controls={presenceOpen ? presenceMenuId : undefined}
          aria-haspopup="true"
          aria-expanded={presenceOpen}
          onClick={onOpenPresenceMenu}
        >
          {currentPresenceLabel}
        </ActionButton>
      </Stack>

      <Button variant="contained" onClick={onLogout}>
        <Typography variant="body2">{labels.logOut}</Typography>
      </Button>
    </Stack>
  );
};

export interface ActionButtonProps extends ButtonProps {
  icon?: React.ElementType;
  iconColor?: string;
  hasSubmenu?: boolean;
}

const ActionButton = ({
  icon,
  iconColor,
  children,
  hasSubmenu,
  ...buttonProps
}: ActionButtonProps) => (
  <Button sx={itemStyles} {...buttonProps}>
    <Content icon={icon} iconColor={iconColor} hasSubmenu={hasSubmenu}>
      {children}
    </Content>
  </Button>
);
