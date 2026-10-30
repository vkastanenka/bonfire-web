import { Stack, Dialog } from "@mui/material";
import type { Presence } from "@/presence";
import { Banner } from "../Banner";
import { Form } from "@/components";
import { LABELS, formFields } from "./constants";
import { useEditProfileForm } from "./hooks";
import type { UpdateProfileRequest } from "@/bonfire";

export interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  displayName: string;
  username: string;
  presence: Presence;
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
  bio,
}: EditProfileDialogProps) {
  const { methods, onSubmit, isPending } = useEditProfileForm({
    displayName,
    avatarUrl,
    bannerColor,
    bio,
  });

  const watchedBannerColor = methods.watch("bannerColor");

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  const handleBannerColorChange = (newColor: string) => {
    methods.setValue("bannerColor", newColor, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: { borderRadius: 4, width: 400, overflow: "hidden" },
        },
      }}
    >
      <Banner
        editable
        avatarSize="xl"
        username={username}
        presence={presence}
        bannerColor={watchedBannerColor}
        avatarSrc={avatarUrl}
        onColorChange={handleBannerColorChange}
      />

      <Stack sx={{ pt: 2, px: 2, pb: 2 }}>
        <Form
          methods={methods}
          onSubmit={(data: UpdateProfileRequest) => {
            onSubmit(data);
            onClose();
          }}
          disabled={isPending}
        >
          <Form.TextField {...formFields.displayName} />
          <Form.TextField {...formFields.bio} />
          <Form.SubmitButton>{LABELS.SUBMIT}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
}
