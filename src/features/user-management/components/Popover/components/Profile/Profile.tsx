import { Stack, Dialog } from "@mui/material";
import { useAuthStore, type UpdateProfileRequest } from "@/bonfire";
import { Form } from "@/components";
import { Banner } from "../Banner";
import { labels, formFields } from "./constants";
import { useEditProfileForm } from "./hooks";
import { elIds } from "../../../constants";

export interface ProfileProps {
  open: boolean;
  onClose: () => void;
}

export function Profile({ open, onClose }: ProfileProps) {
  const me = useAuthStore((state) => state.me)!;

  const { methods, onSubmit, isPending } = useEditProfileForm({
    displayName: me.displayName,
    avatarUrl: me.avatarUrl,
    bannerColor: me.bannerColor,
    bio: me.bio,
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
      id={elIds.profile}
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: { borderRadius: 4, width: 400 },
        },
      }}
    >
      <Banner
        canEdit
        avatarSize="xl"
        color={watchedBannerColor}
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
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
}
