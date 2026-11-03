import { useState, type ReactElement, type ReactNode } from "react";
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
import {
  useAuthStore,
  useListValidSessions,
  useRevokeSession,
  type Session,
} from "@/bonfire";
import { DialogHeader } from "@/components";
import { labels, screenLabels, type ScreenLabelKey } from "./constants";
import {
  DeleteAccount,
  DisableAccount,
  UpdateEmail,
  UpdatePassword,
  UpdateUsername,
} from "./components";

export interface SettingsProps {
  // Devices?
  open: boolean;
  handleClose: () => void;
}

export const Settings = ({ open, handleClose }: SettingsProps) => {
  const me = useAuthStore((state) => state.me)!;

  const [screen, setScreen] = useState<ScreenLabelKey | undefined>(undefined);

  const {
    data: validSessions,
    // validSessionIsLoading,
    // validSessionsError,
  } = useListValidSessions({ enabled: open });

  const navigateHome = () => {
    setScreen(undefined);
  };

  const navigateDevices = () => {
    setScreen("devices");
  };

  const [updateUsernameOpen, setUpdateUsernameOpen] = useState(false);

  const handleUpdateUsernameOpen = () => {
    setUpdateUsernameOpen(true);
  };

  const handleUpdateUsernameClose = () => {
    setUpdateUsernameOpen(false);
  };

  const [updateEmailOpen, setUpdateEmailOpen] = useState(false);

  const handleUpdateEmailOpen = () => {
    setUpdateEmailOpen(true);
  };

  const handleUpdateEmailClose = () => {
    setUpdateEmailOpen(false);
  };

  const [updatePasswordOpen, setUpdatePasswordOpen] = useState(false);

  const handleUpdatePasswordOpen = () => {
    setUpdatePasswordOpen(true);
  };

  const handleUpdatePasswordClose = () => {
    setUpdatePasswordOpen(false);
  };

  const [disableAccountOpen, setDisableAccountOpen] = useState(false);

  const handleDisableAccountOpen = () => {
    setDisableAccountOpen(true);
  };

  const handleDisableAccountClose = () => {
    setDisableAccountOpen(false);
  };

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const handleDeleteAccountOpen = () => {
    setDeleteAccountOpen(true);
  };

  const handleDeleteAccountClose = () => {
    setDeleteAccountOpen(false);
  };

  return (
    <>
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
              username={me.username}
              email={me.email}
              handleUpdateUsernameOpen={handleUpdateUsernameOpen}
              handleUpdateEmailOpen={handleUpdateEmailOpen}
              handleUpdatePasswordOpen={handleUpdatePasswordOpen}
              handleDisableAccountOpen={handleDisableAccountOpen}
              handleDeleteAccountOpen={handleDeleteAccountOpen}
              navigateDevices={navigateDevices}
              validSessions={validSessions}
            />
          )}
          {screen === "devices" && (
            <ContentDevices validSessions={validSessions} />
          )}
        </Stack>
      </Dialog>

      <UpdateUsername
        open={updateUsernameOpen}
        handleClose={handleUpdateUsernameClose}
        currentUsername={me.username}
      />

      <UpdateEmail
        open={updateEmailOpen}
        handleClose={handleUpdateEmailClose}
        currentEmail={me.email}
      />

      <UpdatePassword
        open={updatePasswordOpen}
        handleClose={handleUpdatePasswordClose}
      />

      <DisableAccount
        open={disableAccountOpen}
        handleClose={handleDisableAccountClose}
      />

      <DeleteAccount
        open={deleteAccountOpen}
        handleClose={handleDeleteAccountClose}
      />
    </>
  );
};

interface ContentAccountProps {
  username: string;
  email: string;
  handleUpdateUsernameOpen: () => void;
  handleUpdateEmailOpen: () => void;
  handleUpdatePasswordOpen: () => void;
  handleDisableAccountOpen: () => void;
  handleDeleteAccountOpen: () => void;
  navigateDevices: () => void;
  validSessions?: Session[];
}

const ContentAccount = ({
  username,
  email,
  handleUpdateUsernameOpen,
  handleUpdateEmailOpen,
  handleUpdatePasswordOpen,
  handleDisableAccountOpen,
  handleDeleteAccountOpen,
  navigateDevices,
  validSessions,
}: ContentAccountProps) => {
  return (
    <>
      <Section title={labels.accountInfo}>
        <Setting title={labels.username}>
          <Edit onClick={handleUpdateUsernameOpen}>
            <Typography sx={{ fontWeight: 500 }}>{username}</Typography>
          </Edit>
        </Setting>
        <Setting title={labels.email}>
          <Edit onClick={handleUpdateEmailOpen}>
            <Censor value={email} censoredValue={censorEmail(email)} />
          </Edit>
        </Setting>
      </Section>
      <Divider />
      <Section title={labels.passwordSecurity}>
        <Setting title={labels.password}>
          <Edit onClick={handleUpdatePasswordOpen} />
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
          <Button
            variant="outlined"
            color="error"
            sx={{ fontSize: 16 }}
            onClick={handleDisableAccountOpen}
          >
            {labels.disableButton}
          </Button>
        </Setting>
        <Setting title={labels.closeTitle} subtitle={labels.closeSubtitle}>
          <Button
            variant="contained"
            color="error"
            sx={{ fontSize: 16 }}
            onClick={handleDeleteAccountOpen}
          >
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
