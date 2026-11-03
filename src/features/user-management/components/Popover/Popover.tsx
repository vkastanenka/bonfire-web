import * as React from "react";
import { Popover as MuiPopover, Box, Divider } from "@mui/material";
import { elIds } from "../constants";
import { Banner } from "./components/Banner";
import { durationOptions, presenceOptions } from "./constants";
// import { useHandleEditProfile, usePresenceMenu } from "./hooks";
import { Actions, Menu, MenuItem } from "./components";
import { usePresenceMenu } from "./hooks";

export interface PopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
}

export const Popover = ({ open, anchorEl, handleClose }: PopoverProps) => {
  const { presenceMenu, durationMenu, selectPresence, selectDuration } =
    usePresenceMenu();

  return (
    <MuiPopover
      id={elIds.popover}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: -8, horizontal: "left" }}
      transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      marginThreshold={0}
      elevation={4}
    >
      <Box sx={{ width: 300 }}>
        <Banner />

        <Actions
          presenceButtonId={presenceMenu.buttonId}
          presenceId={presenceMenu.menuId}
          presenceOpen={presenceMenu.open}
          handleOpenPresence={presenceMenu.handleOpen}
          // onEditProfile={editProfileHandlers.handleClickOpen}
        />
      </Box>

      {/* <Profile
        open={editProfileState.open}
        onClose={editProfileHandlers.handleClose}
        displayName={displayName}
        username={username}
        presence={presence}
        bannerColor={bannerColor}
        avatarSrc={avatarSrc}
        bio={bio}
      /> */}

      <Menu
        id={presenceMenu.menuId}
        buttonId={presenceMenu.buttonId}
        anchorEl={presenceMenu.anchorEl}
        open={presenceMenu.open}
        handleClose={presenceMenu.handleClose}
      >
        {presenceOptions.map((option, index) => (
          <React.Fragment key={option.key}>
            {index === 1 && <Divider sx={{ my: 1 }} />}
            <MenuItem
              icon={option.icon}
              color={option.color}
              label={option.label}
              description={
                "description" in option ? option.description : undefined
              }
              hasSubmenu={option.hasSubmenu}
              onClick={(e) => selectPresence(e, option.key)}
            />
          </React.Fragment>
        ))}
      </Menu>

      <Menu
        id={durationMenu.menuId}
        buttonId={durationMenu.buttonId}
        anchorEl={durationMenu.anchorEl}
        open={durationMenu.open}
        handleClose={durationMenu.handleClose}
      >
        {durationOptions.map((duration) => (
          <MenuItem
            key={duration.key}
            label={duration.label}
            onClick={() => selectDuration(duration.key)}
          />
        ))}
      </Menu>
    </MuiPopover>
  );
};
