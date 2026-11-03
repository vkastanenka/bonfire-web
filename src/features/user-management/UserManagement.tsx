import { useRef } from "react";
import { usePopup, useDialog } from "@/hooks";
import { Card, Popover } from "./components";
// import { UserSettingsDialog } from "./UserSettings";

export const UserManagement = () => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const popover = usePopup({ ref: cardRef });
  const settings = useDialog();

  return (
    <>
      <Card
        ref={cardRef}
        popoverOpen={popover.open}
        settingsOpen={settings.open}
        handlePopoverOpen={popover.handleOpen}
        handleSettingsOpen={settings.handleOpen}
      />

      <Popover
        anchorEl={popover.anchorEl}
        open={popover.open}
        handleClose={popover.handleClose}
      />

      {/* <UserSettingsDialog
        open={settings.open}
        handleClose={settings.handleClose}
      /> */}
    </>
  );
};
