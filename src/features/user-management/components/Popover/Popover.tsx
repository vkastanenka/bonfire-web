import * as React from "react";
import { Popover as MuiPopover, Box, Divider } from "@mui/material";
import { elIds } from "../constants";
import { Banner } from "./components/Banner";
import { durationOptions, presenceOptions } from "./constants";
import { useHandleEditProfile, usePresenceMenu } from "./hooks";
import { Actions, Menu, MenuItem } from "./components";

export interface PopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
}

export const Popover = ({ open, anchorEl, handleClose }: PopoverProps) => {
  const { ids, state, handlers } = usePresenceMenu(handleClose);

  const {
    // state: editProfileState,
    handlers: editProfileHandlers,
  } = useHandleEditProfile();

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
          presenceMenuButtonId={ids.presenceMenuButtonId}
          presenceMenuId={ids.presenceMenuId}
          presenceOpen={state.presenceOpen}
          onOpenPresenceMenu={handlers.handleOpenPresenceMenu}
          onEditProfile={editProfileHandlers.handleClickOpen}
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
        id={ids.presenceMenuId}
        buttonId={ids.presenceMenuButtonId}
        anchorEl={state.presenceAnchor}
        open={state.presenceOpen}
        handleClose={handlers.handleCloseMenus}
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
              onClick={(e) => handlers.handlePresenceItemClick(option, e)}
            />
          </React.Fragment>
        ))}
      </Menu>

      <Menu
        id={ids.durationMenuId}
        buttonId={ids.presenceMenuButtonId}
        anchorEl={state.durationAnchor}
        open={state.durationOpen}
        handleClose={() => handlers.setDurationAnchor(null)}
      >
        {durationOptions.map((duration) => (
          <MenuItem
            key={duration.key}
            label={duration.label}
            onClick={() => handlers.handleDurationSelect(duration.key)}
          />
        ))}
      </Menu>
    </MuiPopover>
  );
};
