import {
  Button,
  Dialog,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useState, type ReactElement, type ReactNode } from "react";

const labels = {
  account: "Account",
  accountInfo: "Account Info",
  username: "Username",
  email: "Email",

  passwordSecurity: "Password & Security",
  password: "Password",
  loggedInDevices: "Logged-in Devices",

  accountClosure: "Account Closure",
  disableTitle: "Disable your account",
  disableSubtitle: "Temporarily disable your account.",
  disableButton: "Disable Account",
  closeTitle: "Close your account",
  closeSubtitle: "Permanently close your account.",
  closeButton: "Delete Account",

  edit: "Edit",
  reveal: "Reveal",
  hide: "Hide",
  devices: "devices",
} as const;

const screenLabels = {
  devices: labels.loggedInDevices,
} as const;

type ScreenLabelKey = keyof typeof screenLabels;

export interface UserSettingsDialogProps {
  // Devices?
  open: boolean;
  handleClose: () => void;
  username: string;
  email: string;
}

export const UserSettingsDialog = ({
  open,
  handleClose,
  username,
  email,
}: UserSettingsDialogProps) => {
  const [screen, setScreen] = useState<ScreenLabelKey | undefined>(undefined);

  const navigateHome = () => {
    setScreen(undefined);
  };

  const navigateDevices = () => {
    setScreen("devices");
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            width: ["auto", "80%"],
            maxWidth: 1200,
            overflowX: "hidden",
          },
        },
      }}
    >
      <DialogHeader title={labels.account} handleClose={handleClose}>
        {screen && screenLabels[screen] ? (
          <Stack
            direction="row"
            sx={{ gap: 2, alignItems: "center", justifyContent: "center" }}
          >
            <IconButton onClick={navigateHome}>
              <KeyboardBackspaceIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontWeight: 500 }}>
              {formatBreadcrumbs(screenLabels[screen])}
            </Typography>
          </Stack>
        ) : undefined}
      </DialogHeader>
      <Stack sx={{ gap: 4, px: 4, py: 5 }}>
        <Section title={labels.accountInfo}>
          <Setting title={labels.username}>
            <Edit onClick={() => {}}>
              <Typography sx={{ fontWeight: 500 }}>{username}</Typography>
            </Edit>
          </Setting>
          <Setting title={labels.email}>
            <Edit onClick={() => {}}>
              <Censor value={email} censoredValue={censorEmail(email)} />
            </Edit>
          </Setting>
        </Section>
        <Divider />
        <Section title={labels.passwordSecurity}>
          <Setting title={labels.password}>
            <Edit onClick={() => {}} />
          </Setting>
          <Navigate title={labels.loggedInDevices} onClick={navigateDevices}>
            <Typography sx={{ fontWeight: 500 }}>{formatDevices(5)}</Typography>
          </Navigate>
        </Section>
        <Divider />
        <Section title={labels.accountClosure}>
          <Setting
            title={labels.disableTitle}
            subtitle={labels.disableSubtitle}
          >
            <Button variant="outlined" color="error" sx={{ fontSize: 16 }}>
              {labels.disableButton}
            </Button>
          </Setting>
          <Setting title={labels.closeTitle} subtitle={labels.closeSubtitle}>
            <Button variant="contained" color="error" sx={{ fontSize: 16 }}>
              {labels.closeButton}
            </Button>
          </Setting>
        </Section>
      </Stack>
    </Dialog>
  );
};

interface DialogHeaderProps {
  title?: string;
  children?: ReactElement;
  handleClose?: () => void;
}

const DialogHeader = ({ title, children, handleClose }: DialogHeaderProps) => {
  if (!title && !children && !handleClose) {
    return null;
  }

  return (
    <Stack
      direction="row"
      sx={{
        p: 2,
        gap: 2,
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {title && !children && (
        <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
      )}
      {children && children}
      {handleClose && (
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      )}
    </Stack>
  );
};

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section = ({ title, children }: SectionProps) => {
  return (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
};

interface SettingLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const Setting = ({ title, subtitle, children }: SettingLayoutProps) => {
  return (
    <Stack
      direction="row"
      sx={{
        gap: 2,
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Stack>
        <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
        <Typography variant="body2">{subtitle}</Typography>
      </Stack>
      {children}
    </Stack>
  );
};

interface SettingCensorProps {
  value: string;
  censoredValue: string;
}

const Censor = ({ value, censoredValue }: SettingCensorProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleClick = () => {
    setIsRevealed((prevState) => !prevState);
  };

  return (
    <Stack
      direction="row"
      sx={{
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          fontWeight: 500,
          overflowWrap: "anywhere",
        }}
      >
        {isRevealed ? value : censoredValue}
      </Typography>
      <Button onClick={handleClick} sx={{ fontSize: 16 }}>
        {isRevealed ? labels.hide : labels.reveal}
      </Button>
    </Stack>
  );
};

interface EditProps {
  onClick: () => void;
  children?: ReactElement;
}

const Edit = ({ onClick, children }: EditProps) => {
  const button = (
    <Button onClick={onClick} variant="contained" sx={{ fontSize: 16 }}>
      {labels.edit}
    </Button>
  );

  if (!children) {
    return button;
  }

  return (
    <Stack
      direction="row"
      sx={{ gap: 2, justifyContent: "center", alignItems: "center" }}
    >
      {children}
      {button}
    </Stack>
  );
};

interface NavigateProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onClick: () => void;
}

const Navigate = ({ title, subtitle, children, onClick }: NavigateProps) => {
  let icon = <ArrowForwardIosIcon />;

  if (children) {
    icon = (
      <Stack
        direction="row"
        sx={{ gap: 1, justifyContent: "center", alignItems: "center" }}
      >
        {children}
        <ArrowForwardIosIcon />
      </Stack>
    );
  }

  return (
    <Button
      onClick={onClick}
      color="inherit"
      sx={{ width: "calc(100% + 12px)", transform: "translateX(-6px)" }}
    >
      <Setting title={title} subtitle={subtitle}>
        {icon}
      </Setting>
    </Button>
  );
};

const formatBreadcrumbs = (screen: string): string => {
  return `${labels.account} / ${screen}`;
};

const censorEmail = (email: string): string => {
  const parts = email.split("@");

  if (parts.length !== 2) {
    return email;
  }

  const [localPart, domain] = parts;
  const censoredLocal = "*".repeat(localPart.length);

  return `${censoredLocal}@${domain}`;
};

const formatDevices = (numDevices: number): string => {
  return `${numDevices} ${labels.devices}`;
};
