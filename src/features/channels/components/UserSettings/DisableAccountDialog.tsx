// import { useDisableAccount } from "@/bonfire";
import { DialogHeader } from "@/components";
import { Button, Dialog, Stack, Typography } from "@mui/material";

const labels = {
  title: "Disable your account",
  subtitle:
    "Disabling means that other users will no longer be able to interact with your account. You will be logged out upon disable. Logging in re-enables your account. Continue to disable your account?",
  submit: "Disable Account",
};

interface DisableAccountDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const DisableAccountDialog = ({
  open,
  handleClose,
}: DisableAccountDialogProps) => {
  //   const { mutate } = useDisableAccount();

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
