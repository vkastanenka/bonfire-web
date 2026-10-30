import * as React from "react";
import {
  Popover,
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  type ButtonProps,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { type Presence, PRESENCE_LABELS, PRESENCE_ICONS } from "@/presence";
import { useHandleEditProfile, usePresenceMenu } from "./hooks";
import { DURATION_OPTIONS, PRESENCE_OPTIONS } from "./constants";
import { EditProfileDialog } from "../EditProfile";
import { Banner } from "../Banner";

const itemStyles = {
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
};

export interface UserPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  displayName: string;
  username: string;
  presence: Presence;
  avatarSrc?: string;
  bannerColor?: string;
  bio?: string;
  onLogout?: () => void;
}

export const UserPopover = ({
  open,
  anchorEl,
  handleClose,
  displayName,
  username,
  presence,
  bannerColor,
  avatarSrc,
  bio,
  onLogout,
}: UserPopoverProps) => {
  const { ids, state, handlers } = usePresenceMenu(handleClose);

  const { state: editProfileState, handlers: editProfileHandlers } =
    useHandleEditProfile();

  return (
    <Popover
      id="user-profile-popover"
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: -8, horizontal: "left" }}
      transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      marginThreshold={0}
      elevation={4}
    >
      <Box sx={{ width: 300 }}>
        <Banner
          username={username}
          presence={presence}
          bannerColor={bannerColor}
          avatarSrc={avatarSrc}
        />

        <Actions
          displayName={displayName}
          username={username}
          presence={presence}
          presenceMenuButtonId={ids.presenceMenuButtonId}
          presenceMenuId={ids.presenceMenuId}
          presenceOpen={state.presenceOpen}
          onOpenPresenceMenu={handlers.handleOpenPresenceMenu}
          onEditProfile={editProfileHandlers.handleClickOpen}
          onLogout={onLogout}
        />
      </Box>

      <EditProfileDialog
        open={editProfileState.open}
        onClose={editProfileHandlers.handleClose}
        displayName={displayName}
        username={username}
        presence={presence}
        bannerColor={bannerColor}
        avatarSrc={avatarSrc}
        bio={bio}
      />

      <Menu
        id={ids.presenceMenuId}
        buttonId={ids.presenceMenuButtonId}
        anchorEl={state.presenceAnchor}
        open={state.presenceOpen}
        handleClose={handlers.handleCloseMenus}
      >
        {PRESENCE_OPTIONS.map((option, index) => (
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
        {DURATION_OPTIONS.map((duration) => (
          <MenuItem
            key={duration.key}
            label={duration.label}
            onClick={() => handlers.handleDurationSelect(duration.key)}
          />
        ))}
      </Menu>
    </Popover>
  );
};

interface ActionsProps {
  displayName: string;
  username: string;
  presence: Presence;
  presenceMenuButtonId: string;
  presenceMenuId: string;
  presenceOpen: boolean;
  onOpenPresenceMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
}

const Actions = ({
  displayName,
  username,
  presence,
  presenceMenuButtonId,
  presenceMenuId,
  presenceOpen,
  onOpenPresenceMenu,
  onEditProfile,
  onLogout,
}: ActionsProps) => {
  const currentPresenceIcon = PRESENCE_ICONS[presence];
  const currentPresenceLabel = PRESENCE_LABELS[presence];

  return (
    <Stack sx={{ pt: 1, px: 2, pb: 2, gap: 2 }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
          {displayName}
        </Typography>
        <Typography variant="body2">{username}</Typography>
      </Stack>

      <Stack sx={(t) => ({ ...t.styles.card })}>
        <ActionButton icon={EditIcon} onClick={onEditProfile}>
          Edit Profile
        </ActionButton>

        <Divider />

        <ActionButton
          icon={currentPresenceIcon.Icon}
          iconColor={currentPresenceIcon.color}
          hasSubmenu
          id={presenceMenuButtonId}
          aria-controls={presenceOpen ? presenceMenuId : undefined}
          aria-haspopup="true"
          aria-expanded={presenceOpen}
          onClick={onOpenPresenceMenu}
        >
          {currentPresenceLabel}
        </ActionButton>
      </Stack>

      <Button variant="contained" onClick={onLogout}>
        <Typography variant="body2">Log Out</Typography>
      </Button>
    </Stack>
  );
};

export interface ActionButtonProps extends ButtonProps {
  icon?: React.ElementType;
  iconColor?: string;
  hasSubmenu?: boolean;
}

const ActionButton = ({
  icon,
  iconColor,
  children,
  hasSubmenu,
  ...buttonProps
}: ActionButtonProps) => (
  <Button sx={itemStyles} {...buttonProps}>
    <ItemContent
      icon={icon}
      iconColor={iconColor}
      iconSize={16}
      gap={1}
      hasSubmenu={hasSubmenu}
    >
      {children}
    </ItemContent>
  </Button>
);

interface MenuProps {
  children: React.ReactNode;
  id: string;
  buttonId: string;
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
}

const Menu = ({
  children,
  id,
  buttonId,
  anchorEl,
  open,
  handleClose,
}: MenuProps) => {
  return (
    <MuiMenu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: { sx: { ml: 1 } },
        list: {
          "aria-labelledby": buttonId,
          sx: (t) => ({
            ...t.styles.card,
            minWidth: 200,
          }),
        },
      }}
    >
      {children}
    </MuiMenu>
  );
};

interface MenuItemProps {
  icon?: React.ElementType;
  color?: string;
  label: string;
  description?: string;
  hasSubmenu?: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const MenuItem = ({
  icon,
  color,
  label,
  description,
  hasSubmenu,
  onClick,
}: MenuItemProps) => (
  <MuiMenuItem onClick={onClick} sx={itemStyles}>
    <ItemContent
      icon={icon}
      iconColor={color}
      iconSize={12}
      gap={2}
      label={label}
      description={description}
      hasSubmenu={hasSubmenu}
    />
  </MuiMenuItem>
);

interface ItemContentProps {
  icon?: React.ElementType;
  iconColor?: string;
  iconSize?: number;
  gap?: number;
  children?: React.ReactNode;
  label?: string;
  description?: string;
  hasSubmenu?: boolean;
}

const ItemContent = ({
  icon: Icon,
  iconColor,
  iconSize = 16,
  gap = 1,
  children,
  label,
  description,
  hasSubmenu,
}: ItemContentProps) => (
  <React.Fragment>
    <Stack direction="row" sx={{ alignItems: "center", gap }}>
      {Icon && (
        <Icon
          sx={{
            fontSize: iconSize,
            ...(iconColor && { color: iconColor }),
          }}
        />
      )}
      {children ? (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {children}
        </Typography>
      ) : (
        <Stack>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          {description && (
            <Typography variant="caption">{description}</Typography>
          )}
        </Stack>
      )}
    </Stack>
    {hasSubmenu && <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />}
  </React.Fragment>
);
