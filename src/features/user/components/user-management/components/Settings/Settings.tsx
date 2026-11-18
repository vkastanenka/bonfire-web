import { Dialog, IconButton, Stack, Typography } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { DialogHeader } from "@/components";
import { screenLabels, type ScreenLabelKey } from "./constants";
import {
  DeleteAccount,
  DisableAccount,
  UpdateEmail,
  UpdatePassword,
  UpdateUsername,
} from "./dialogs";
import { useSettings } from "./hooks";
import { Account, Devices } from "./screens";

const labels = {
  account: "Account",
};

export interface SettingsProps {
  open: boolean;
  handleClose: () => void;
}

export const Settings = ({ open, handleClose }: SettingsProps) => {
  const { screen, sessions, sessionsIsPending, navigate, dialogs } =
    useSettings({
      sessionQueryEnabled: open,
    });

  return (
    <>
      <Dialog onClose={handleClose} open={open}>
        <Header
          screen={screen}
          handleClose={handleClose}
          navigateHome={navigate.home}
        />
        <Stack sx={{ gap: 4, px: 4, py: 5 }}>
          {!screen && (
            <Account
              handleUpdateUsernameOpen={dialogs.username.handleOpen}
              handleUpdateEmailOpen={dialogs.email.handleOpen}
              handleUpdatePasswordOpen={dialogs.updatePassword.handleOpen}
              handleDisableAccountOpen={dialogs.disableAccount.handleOpen}
              handleDeleteAccountOpen={dialogs.deleteAccount.handleOpen}
              navigateDevices={navigate.devices}
              sessionsLength={sessions ? sessions.length : 0}
              sessionsIsPending={sessionsIsPending}
            />
          )}
          {screen === "devices" && <Devices sessions={sessions} />}
        </Stack>
      </Dialog>

      <UpdateUsername
        open={dialogs.username.open}
        handleClose={dialogs.username.handleClose}
      />

      <UpdateEmail
        open={dialogs.email.open}
        handleClose={dialogs.email.handleClose}
      />

      <UpdatePassword
        open={dialogs.updatePassword.open}
        handleClose={dialogs.updatePassword.handleClose}
      />

      <DisableAccount
        open={dialogs.disableAccount.open}
        handleClose={dialogs.disableAccount.handleClose}
      />

      <DeleteAccount
        open={dialogs.deleteAccount.open}
        handleClose={dialogs.deleteAccount.handleClose}
      />
    </>
  );
};

interface HeaderProps {
  screen?: ScreenLabelKey;
  handleClose: () => void;
  navigateHome: () => void;
}

const Header = ({ screen, handleClose, navigateHome }: HeaderProps) => {
  return (
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
  );
};

const formatBreadcrumbs = (screen: string): string => {
  return `${labels.account} / ${screen}`;
};
