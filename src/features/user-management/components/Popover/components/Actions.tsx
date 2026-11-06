import {
  Typography,
  Stack,
  Button,
  Divider,
  type ButtonProps,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { isValid, isAfter, isToday, isTomorrow, format } from "date-fns";
import { useAuthStore, useEffectivePresence, useLogout } from "@/bonfire";
import { presenceLabels, presenceIcons } from "@/presence";
import { itemStyles } from "../constants";
import { Content } from "./Content";
import { elIds } from "../../constants";
import { useNavigate } from "@tanstack/react-router";
import { queryClient } from "@/app";
import { paths } from "@/constants";

const labels = {
  editProfile: "Edit Profile",
  logOut: "Log Out",
};

export interface ActionsProps {
  profileOpen: boolean;
  handleOpenProfile?: () => void;
  presenceButtonId: string;
  presenceId: string;
  presenceOpen: boolean;
  handleOpenPresence: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
}

export const Actions = ({
  profileOpen,
  handleOpenProfile,
  presenceButtonId,
  presenceId,
  presenceOpen,
  handleOpenPresence,
}: ActionsProps) => {
  const me = useAuthStore((state) => state.me)!;
  const presence = useEffectivePresence();
  const currentPresenceIcon = presenceIcons[presence];

  const { mutate, isPending } = useLogout();
  const navigate = useNavigate();

  const logOut = async () => {
    mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        useAuthStore.getState().clearSession();
        navigate({ to: paths.login });
      },
    });
  };

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
          aria-label={labels.editProfile}
          aria-haspopup="dialog"
          aria-expanded={profileOpen}
          aria-controls={profileOpen ? elIds.profile : undefined}
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

      <Button variant="contained" onClick={logOut} disabled={isPending}>
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
