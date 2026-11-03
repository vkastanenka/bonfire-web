import { useUpdatePreferredPresence } from "@/bonfire";
import { useMenu } from "@/hooks";
import { presences, type Presence, type PresenceDuration } from "@/presence";
import { useState } from "react";

export const usePresenceMenu = () => {
  const presenceMenu = useMenu();
  const durationMenu = useMenu();

  const { mutate } = useUpdatePreferredPresence();

  const [selectedPresence, setSelectedPresence] = useState<
    Presence | undefined
  >(undefined);

  const selectPresence = (
    event: React.MouseEvent<HTMLElement>,
    presence: Presence,
  ) => {
    if (presence === presences.online) {
      setSelectedPresence(undefined);
      mutate({
        presence: undefined,
        duration: undefined,
      });
      return;
    }

    setSelectedPresence(presence);
    durationMenu.handleOpen(event);
  };

  const selectDuration = (duration: PresenceDuration) => {
    if (
      !selectedPresence ||
      selectedPresence === presences.online ||
      selectedPresence === presences.offline
    ) {
      return;
    }

    mutate({
      presence: selectedPresence,
      duration,
    });
  };

  return {
    presenceMenu,
    durationMenu,
    selectPresence,
    selectDuration,
  };
};
