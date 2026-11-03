// import { useDeleteAccount } from "@/bonfire";
import { DialogHeader } from "@/components";
import { Button, Dialog, Stack, Typography } from "@mui/material";

const labels = {
  title: "Delete your account",
  subtitle:
    "Deleting means that other users will no longer be able to interact with your account. You will be logged out upon delete. Logging in re-enables your account. Failure to log in within 30 days after deleting will anonymize your account. Continue to delete your account?",
  submit: "Delete Account",
};

interface DeleteAccountProps {
  open: boolean;
  handleClose: () => void;
}

export const DeleteAccount = ({ open, handleClose }: DeleteAccountProps) => {
  //   const { mutate } = useDeleteAccount();

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            width: 400,
          },
        },
      }}
    >
      <DialogHeader title={labels.title} handleClose={handleClose} />
      <Stack sx={{ gap: 3, p: 3 }}>
        <Typography>{labels.subtitle}</Typography>
        <Button variant="contained" color="error" sx={{ fontSize: 16 }}>
          {labels.submit}
        </Button>
      </Stack>
    </Dialog>
  );
};
