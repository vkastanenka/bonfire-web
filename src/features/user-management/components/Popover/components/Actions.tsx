import {
  Typography,
  Stack,
  Button,
  Divider,
  type ButtonProps,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { isValid, isAfter, isToday, isTomorrow, format } from "date-fns";
import { useAuthStore, useGatewayStore } from "@/bonfire";
import { presenceLabels, presenceIcons } from "@/presence";
import { itemStyles } from "../constants";
import { Content } from "./Content";

const labels = {
  editProfile: "Edit Profile",
  logOut: "Log Out",
};

export interface ActionsProps {
  presenceButtonId: string;
  presenceId: string;
  presenceOpen: boolean;
  handleOpenPresence: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleOpenProfile?: () => void;
}

export const Actions = ({
  presenceButtonId,
  presenceId,
  presenceOpen,
  handleOpenPresence,
  handleOpenProfile,
}: ActionsProps) => {
  const me = useAuthStore((state) => state.me)!;
  const presence = useGatewayStore((state) => state.presence);
  const currentPresenceIcon = presenceIcons[presence];

  return (
    <Stack sx={{ pt: 1, px: 2, pb: 2, gap: 2 }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
          {me.displayName}
        </Typography>
        <Typography variant="body2">{me.username}</Typography>
      </Stack>

      <Stack sx={(t) => ({ ...t.styles.card })}>
        <ActionButton
          icon={EditIcon}
          label={labels.editProfile}
          onClick={handleOpenProfile}
        />

        <Divider />

        <ActionButton
          icon={currentPresenceIcon.Icon}
          iconColor={currentPresenceIcon.color}
          hasSubmenu
          label={presenceLabels[presence]}
          description={formatPresenceUntil(me.preferredPresenceUntil)}
          id={presenceButtonId}
          aria-controls={presenceOpen ? presenceId : undefined}
          aria-haspopup="true"
          aria-expanded={presenceOpen}
          onClick={handleOpenPresence}
        />
      </Stack>

      <Button
        variant="contained"
        // onClick={onLogout}
      >
        <Typography variant="body2">{labels.logOut}</Typography>
      </Button>
    </Stack>
  );
};

export interface ActionButtonProps extends ButtonProps {
  icon?: React.ElementType;
  iconColor?: string;
  hasSubmenu?: boolean;
  label?: string;
  description?: string;
}

const ActionButton = ({
  icon,
  iconColor,
  hasSubmenu,
  label,
  description,
  ...buttonProps
}: ActionButtonProps) => (
  <Button sx={itemStyles} {...buttonProps}>
    <Content
      icon={icon}
      iconColor={iconColor}
      hasSubmenu={hasSubmenu}
      label={label}
      description={description}
    />
  </Button>
);

export const formatPresenceUntil = (
  dateInput?: string | Date | number | null,
): string | undefined => {
  if (!dateInput) return undefined;

  const targetDate = new Date(dateInput);
  const now = new Date();

  if (!isValid(targetDate) || !isAfter(targetDate, now)) {
    return undefined;
  }

  const timeString = format(targetDate, "h:mm a");

  if (isToday(targetDate)) {
    return `Until ${timeString}`;
  }

  if (isTomorrow(targetDate)) {
    return `Until tomorrow at ${timeString}`;
  }

  const dateString = format(targetDate, "MM/dd/yy");
  return `Until ${dateString} at ${timeString}`;
};
