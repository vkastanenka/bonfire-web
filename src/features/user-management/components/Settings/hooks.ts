import { useState } from "react";
import { useListValidSessions } from "@/bonfire";
import { useDialog } from "@/hooks";
import { type ScreenLabelKey } from "./constants";

export const useSettings = ({
  sessionQueryEnabled,
}: {
  sessionQueryEnabled: boolean;
}) => {
  const { data: sessions, isPending: sessionsIsPending } = useListValidSessions(
    {
      enabled: sessionQueryEnabled,
    },
  );

  const [screen, setScreen] = useState<ScreenLabelKey | undefined>(undefined);

  const navigate = {
    home: () => {
      setScreen(undefined);
    },
    devices: () => {
      setScreen("devices");
    },
  };

  const username = useDialog();
  const email = useDialog();
  const updatePassword = useDialog();
  const disableAccount = useDialog();
  const deleteAccount = useDialog();

  const dialogs = {
    username,
    email,
    updatePassword,
    disableAccount,
    deleteAccount,
  };

  return {
    screen,
    sessions,
    sessionsIsPending,
    navigate,
    dialogs,
  };
};
