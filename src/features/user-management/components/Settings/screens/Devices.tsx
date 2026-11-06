import { useAuthStore, useRevokeAllSessions, type Session } from "@/bonfire";
import { Section, SubSection, Device } from "../components";
import { Button } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { paths } from "@/constants";
import { queryClient } from "@/app";

const labels = {
  loggedInDevices: "Logged-in Devices",
  loggedInDevicesDescription:
    "These are all the devices that are currently logged-in with your Bonfire account. Log out of devices that you don't recognize.",
  currentDevice: "Current Device",
  otherDevices: "Other Devices",
  logOutOfAllDevicesTitle: "Log out of all known devices",
  logOutOfAllDevicesSubtitle:
    "You'll have to log back in on all logged out devices.",
  logOutOfAllDevicesButton: "Log Out All Known Devices",
};

interface DevicesProps {
  sessions?: Session[];
}

export const Devices = ({ sessions }: DevicesProps) => {
  const { mutate, isPending } = useRevokeAllSessions();
  const navigate = useNavigate();

  const logOutAll = async () => {
    mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        useAuthStore.getState().clearSession();
        navigate({ to: paths.login });
      },
    });
  };

  if (!sessions) {
    return <div>No valid sessions</div>;
  }

  const currentSession = sessions?.find((session) => session.isCurrent);
  const otherSessions = sessions.filter((session) => !session.isCurrent);

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
      <SubSection
        title={labels.logOutOfAllDevicesTitle}
        subtitle={labels.logOutOfAllDevicesSubtitle}
      >
        <Button
          variant="contained"
          color="error"
          sx={{ alignSelf: "flex-start" }}
          disabled={isPending}
          onClick={logOutAll}
        >
          {labels.logOutOfAllDevicesButton}
        </Button>
      </SubSection>
    </Section>
  );
};
