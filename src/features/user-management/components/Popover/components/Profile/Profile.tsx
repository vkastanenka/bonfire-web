import { Stack, Dialog } from "@mui/material";
import { Form } from "@/components";
import { Banner } from "../Banner";
import { labels, formFields } from "./constants";
import { useEditProfileForm } from "./hooks";
import { elIds } from "../../../constants";

export interface ProfileProps {
  open: boolean;
  handleClose: () => void;
}

export function Profile({ open, handleClose }: ProfileProps) {
  const {
    methods,
    onSubmit,
    isPending,
    watchedBannerColor,
    handleBannerColorChange,
  } = useEditProfileForm({ handleClose });

  return (
    <Dialog
      id={elIds.profile}
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: { width: 400 },
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
        <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
          <Form.TextField {...formFields.displayName} />
          <Form.TextField {...formFields.bio} />
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
}
