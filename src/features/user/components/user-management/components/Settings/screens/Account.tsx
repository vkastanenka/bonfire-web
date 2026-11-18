import { Button, Divider, Skeleton, Typography } from "@mui/material";
import { useMe } from "@/bonfire";
import { Section, Setting, Edit, Censor, Navigate } from "../components";

const labels = {
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

  device: "device",
  devices: "devices",
};

export interface AccountProps {
  handleUpdateUsernameOpen: () => void;
  handleUpdateEmailOpen: () => void;
  handleUpdatePasswordOpen: () => void;
  handleDisableAccountOpen: () => void;
  handleDeleteAccountOpen: () => void;
  navigateDevices: () => void;
  sessionsLength?: number;
  sessionsIsPending: boolean;
}

export const Account = ({
  handleUpdateUsernameOpen,
  handleUpdateEmailOpen,
  handleUpdatePasswordOpen,
  handleDisableAccountOpen,
  handleDeleteAccountOpen,
  navigateDevices,
  sessionsLength = 0,
  sessionsIsPending,
}: AccountProps) => {
  const me = useMe();

  return (
    <>
      <Section title={labels.accountInfo}>
        <Setting title={labels.username}>
          <Edit onClick={handleUpdateUsernameOpen}>
            <Typography sx={{ fontWeight: 500 }}>{me.username}</Typography>
          </Edit>
        </Setting>
        <Setting title={labels.email}>
          <Edit onClick={handleUpdateEmailOpen}>
            <Censor value={me.email} censoredValue={censorEmail(me.email)} />
          </Edit>
        </Setting>
      </Section>
      <Divider />
      <Section title={labels.passwordSecurity}>
        <Setting title={labels.password}>
          <Edit onClick={handleUpdatePasswordOpen} />
        </Setting>
        {!sessionsIsPending ? (
          <Navigate title={labels.loggedInDevices} onClick={navigateDevices}>
            <Typography sx={{ fontWeight: 500 }}>
              {formatDevices(sessionsLength)}
            </Typography>
          </Navigate>
        ) : (
          <Skeleton height={40} />
        )}
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
