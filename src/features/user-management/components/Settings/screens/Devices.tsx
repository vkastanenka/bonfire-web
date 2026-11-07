import { useRevokeAllSessions, type Session } from "@/bonfire";
import { Section, SubSection, Device } from "../components";
import { Button, Typography } from "@mui/material";

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
  noValidDevices: "No valid devices. Please refresh and try again.",
};

interface DevicesProps {
  sessions?: Session[];
}

export const Devices = ({ sessions }: DevicesProps) => {
  const { mutate, isPending } = useRevokeAllSessions();

  const logOutAll = async () => {
    mutate();
  };

  const currentSession = sessions?.find((session) => session.isCurrent);
  const otherSessions = sessions?.filter((session) => !session.isCurrent);
  const hasOtherSessions = otherSessions && otherSessions.length > 0;
  const hasSessions = currentSession || hasOtherSessions;

  return (
    <Section
      title={labels.loggedInDevices}
      subtitle={labels.loggedInDevicesDescription}
    >
      {!hasSessions && <Typography>{labels.noValidDevices}</Typography>}
      {currentSession && (
        <SubSection title={labels.currentDevice}>
          <Device session={currentSession} />
        </SubSection>
      )}
      {hasOtherSessions && (
        <SubSection title={labels.otherDevices}>
          {otherSessions.map((session: Session, i) => (
            <Device key={`logged-in-device-${i}`} session={session} />
          ))}
        </SubSection>
      )}
      {hasSessions && (
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
      )}
    </Section>
  );
};
