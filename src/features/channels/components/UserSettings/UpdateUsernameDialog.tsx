import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateUsernameRequest,
  updateUsernameRequestSchema,
  // useAuthStore,
  useUpdateUsername,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";
import { DialogHeader, Form } from "@/components";
import { Dialog, Stack, Typography } from "@mui/material";

const labels = {
  title: "Change your username",
  subtitle: "Enter a new username and your existing password.",
  username: "Username",
  currentPassword: "Current Password",
  submit: "Update Username",
};

const formFields = {
  username: {
    name: "username",
    id: "username-input",
    label: labels.username,
    required: true,
    autoComplete: "username",
  },
  currentPassword: {
    name: "currentPassword",
    id: "currentPassword-input",
    type: "currentPassword",
    label: labels.currentPassword,
    required: true,
    autoComplete: "current-password",
  },
};

interface UpdateUsernameDialogProps {
  open: boolean;
  handleClose: () => void;
  currentUsername: string;
}

export const UpdateUsernameDialog = ({
  open,
  handleClose,
  currentUsername,
}: UpdateUsernameDialogProps) => {
  const { methods, onSubmit, isPending } = useUpdateUsernameForm({
    currentUsername,
  });

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
        <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
          <Form.TextField {...formFields.username} />
          <Form.TextField {...formFields.currentPassword} />
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
};

const useUpdateUsernameForm = ({
  currentUsername,
}: {
  currentUsername: string;
}) => {
  // const me = useAuthStore((state) => state.me);

  const methods = useForm<UpdateUsernameRequest>({
    resolver: zodResolver(updateUsernameRequestSchema),
    defaultValues: {
      newUsername: currentUsername,
      password: "",
    },
  });

  const { mutate, isPending } = useUpdateUsername();

  const onSubmit = (data: UpdateUsernameRequest) => {
    mutate(data, {
      onError: (err) => {
        handleAipFieldViolations(err, methods);
      },
    });
  };

  return {
    methods,
    onSubmit,
    isPending,
  };
};
