import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateUsernameRequest,
  updateUsernameRequestSchema,
  useAuthStore,
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

interface UpdateUsernameProps {
  open: boolean;
  handleClose: () => void;
}

export const UpdateUsername = ({ open, handleClose }: UpdateUsernameProps) => {
  const { methods, onSubmit, isPending } = useUpdateUsernameForm({
    handleClose,
  });

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
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
  handleClose,
}: {
  handleClose: () => void;
}) => {
  const me = useAuthStore((state) => state.me)!;

  const methods = useForm<UpdateUsernameRequest>({
    resolver: zodResolver(updateUsernameRequestSchema),
    defaultValues: {
      newUsername: me.username,
      password: "",
    },
  });

  const { mutate, isPending } = useUpdateUsername();

  const onSubmit = (data: UpdateUsernameRequest) => {
    mutate(data, {
      onSuccess: handleClose,
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
