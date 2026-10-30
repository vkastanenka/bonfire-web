import { format } from "date-fns";
import { Stack, Typography, Dialog } from "@mui/material";
import type { Presence } from "@/presence";
import { Banner } from "../Banner";

import { Form } from "@/components";
import { LABELS, FORM_FIELDS } from "./constants";
import { useEditProfileForm } from "./hooks";

export interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  displayName: string;
  username: string;
  presence: Presence;
  createdAt: Date;
  bannerColor?: string;
  avatarSrc?: string;
  bio?: string;
}

export function EditProfileDialog({
  open,
  onClose,
  displayName,
  username,
  presence,
  bannerColor,
  avatarSrc: avatarUrl,
  createdAt,
  bio,
}: EditProfileDialogProps) {
  const { methods, onSubmit, isPending } = useEditProfileForm({
    displayName,
    avatarUrl,
    bannerColor,
    bio,
  });

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = () => {
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: { borderRadius: 4, width: 400 },
        },
      }}
    >
      <Banner
        username={username}
        presence={presence}
        bannerColor={bannerColor}
        avatarSrc={avatarUrl}
        avatarSize="xl"
      />
      <Stack sx={{ pt: 2, px: 2, pb: 2 }}>
        <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
          <Form.TextField {...FORM_FIELDS.displayName} />
          <Form.TextField {...FORM_FIELDS.bio} />
          <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
}
