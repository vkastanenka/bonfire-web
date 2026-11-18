import { useState } from "react";
import {
  presences,
  type Presence,
  type PreferredPresenceDuration,
} from "@/bonfire-sdk";
import { useMenu } from "@/hooks";
import { useUpdatePreferredPresence } from "@/features/user";
import { usePresenceStore } from "@/features/presence";

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
      usePresenceStore.setState({ presence: presences.online });
      mutate({
        presence: undefined,
        duration: undefined,
      });
      return;
    }

    setSelectedPresence(presence);
    durationMenu.handleOpen(event);
  };

  const selectDuration = (duration: PreferredPresenceDuration) => {
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
