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

// const EMAILS = ["username@gmail.com", "user02@gmail.com"] as const;

// export const useHandleEditProfile = () => {
//   const [open, setOpen] = React.useState(false);
//   const [selectedValue, setSelectedValue] = React.useState<string>(EMAILS[1]);

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = (value?: string) => {
//     setOpen(false);
//     if (value) {
//       setSelectedValue(value);
//     }
//   };

//   return {
//     state: {
//       open,
//       selectedValue,
//       emails: EMAILS,
//     },
//     handlers: {
//       handleClickOpen,
//       handleClose,
//     },
//   };
// };
