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
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { useState, type ReactElement, type ReactNode } from "react";
import {
  useListValidSessions,
  useRevokeSession,
  type Session,
} from "@/bonfire";

const labels = {
  account: "Account",
  accountInfo: "Account Info",
  username: "Username",
  email: "Email",

  passwordSecurity: "Password & Security",
  password: "Password",
  loggedInDevices: "Logged-in Devices",
  loggedInDevicesDescription:
    "These are all the devices that are currently logged-in with your Bonfire account. Log out of devices that you don't recognize.",
  currentDevice: "Current Device",
  otherDevices: "Other Devices",
  logOutOfAllDevicesTitle: "Log out of all known devices",
  logOutOfAllDevicesSubtitle:
    "You'll have to log back in on all logged out devices.",
  logOutOfAllDevicesButton: "Log Out All Known Devices",

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
  device: "device",
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
  const [screen, setScreen] = useState<ScreenLabelKey | undefined>("devices");

  const {
    data: validSessions,
    validSessionIsLoading,
    validSessionsError,
  } = useListValidSessions({ enabled: open });

  const navigateHome = () => {
    setScreen(undefined);
  };

  const navigateDevices = () => {
    setScreen("devices");
  };

  console.log(validSessions);

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
        {!screen && (
          <ContentAccount
            username={username}
            email={email}
            navigateDevices={navigateDevices}
            validSessions={validSessions}
          />
        )}
        {screen === "devices" && (
          <ContentDevices validSessions={validSessions} />
        )}
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

interface ContentAccountProps {
  username: string;
  email: string;
  navigateDevices: () => void;
  validSessions?: Session[];
}

const ContentAccount = ({
  username,
  email,
  navigateDevices,
  validSessions,
}: ContentAccountProps) => {
  return (
    <>
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
          <Typography sx={{ fontWeight: 500 }}>
            {formatDevices(validSessions ? validSessions.length : 0)}
          </Typography>
        </Navigate>
      </Section>
      <Divider />
      <Section title={labels.accountClosure}>
        <Setting title={labels.disableTitle} subtitle={labels.disableSubtitle}>
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
    </>
  );
};

interface ContentDevicesProps {
  validSessions?: Session[];
}

const ContentDevices = ({ validSessions }: ContentDevicesProps) => {
  if (!validSessions) {
    return <div>No valid sessions</div>;
  }

  const currentSession = validSessions?.find((session) => session.isCurrent);
  const otherSessions = validSessions.filter((session) => !session.isCurrent);

  return (
    <Section
      title={labels.loggedInDevices}
      subtitle={labels.loggedInDevicesDescription}
    >
      {currentSession && (
        <SubSection title={labels.currentDevice}>
          <Device session={currentSession} />
        </SubSection>
      )}
      {otherSessions && otherSessions.length > 0 && (
        <SubSection title={labels.otherDevices}>
          {otherSessions.map((session: Session, i) => (
            <Device key={`logged-in-device-${i}`} session={session} />
          ))}
        </SubSection>
      )}
    </Section>
  );
};

interface SubSectionProps {
  title: string;
  children: ReactNode;
}

const SubSection = ({ title, children }: SubSectionProps) => {
  return (
    <Stack sx={{ gap: 2 }}>
      <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
      {children}
    </Stack>
  );
};

interface DeviceProps {
  session: Session;
}

const Device = ({ session }: DeviceProps) => {
  const {
    mutate,
    // isPending
  } = useRevokeSession();

  let Icon = DesktopWindowsIcon;

  if (isMobileOS(session.os)) {
    Icon = SmartphoneIcon;
  }

  const logOut = async () => {
    await mutate({ id: session.id, isCurrent: session.isCurrent });
  };

  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        <Icon />
        <Stack>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Typography sx={{ fontWeight: 700 }}>{session.os}</Typography>
            <Typography>•</Typography>
            <Typography>{session.client}</Typography>
          </Stack>
          <Typography variant="body2">
            {formatLastSeen(session.lastSeenAt)}
          </Typography>
        </Stack>
      </Stack>
      <IconButton onClick={logOut}>
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};

const isMobileOS = (os: string): boolean => {
  const normalized = os.toLowerCase();
  return (
    normalized.includes("android") ||
    normalized.includes("ios") ||
    normalized.includes("iphone") ||
    normalized.includes("ipad")
  );
};

const formatLastSeen = (dateInput: string | Date): string => {
  const now = new Date().getTime();
  const past = new Date(dateInput).getTime();
  const diffMs = now - past;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffHours < 1) {
    return "less than an hour ago";
  }
  if (diffDays < 1) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffMonths < 1) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  if (diffYears < 1) {
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  }
  return "more than a year ago";
};

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const Section = ({ title, subtitle, children }: SectionProps) => {
  let titleEl = (
    <Typography variant="h6" sx={{ fontWeight: 500 }}>
      {title}
    </Typography>
  );

  if (subtitle) {
    titleEl = (
      <Stack>
        {titleEl}
        <Typography variant="body2">{subtitle}</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 4 }}>
      {titleEl}
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
  const label = numDevices === 1 ? labels.device : labels.devices;
  return `${numDevices} ${label}`;
};
