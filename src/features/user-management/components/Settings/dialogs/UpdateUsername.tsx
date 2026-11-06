import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Stack, Typography } from "@mui/material";
import {
  type UpdateUsernameRequest,
  updateUsernameRequestSchema,
  useMe,
  useUpdateUsername,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";
import { DialogHeader, Form } from "@/components";

const labels = {
  title: "Change your username",
  subtitle: "Enter a new username and your existing password.",
  username: "Username",
  currentPassword: "Current Password",
  submit: "Update Username",
};

const formFields = {
  newUsername: {
    name: "newUsername",
    id: "newUsername-input",
    label: labels.username,
    required: true,
    autoComplete: "newUsername",
  },
  password: {
    name: "password",
    id: "password-input",
    type: "password",
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
  const { methods, onSubmit, isPending, resetForm } = useUpdateUsernameForm({
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
        transition: {
          onExited: resetForm,
        },
      }}
    >
      <DialogHeader title={labels.title} handleClose={handleClose} />
      <Stack sx={{ gap: 3, p: 3 }}>
        <Typography>{labels.subtitle}</Typography>
        <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
          <Form.TextField {...formFields.newUsername} />
          <Form.TextField {...formFields.password} />
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
  const me = useMe();

  const defaultValues = {
    newUsername: me.username,
    password: "",
  };

  const methods = useForm<UpdateUsernameRequest>({
    resolver: zodResolver(updateUsernameRequestSchema),
    defaultValues,
  });

  const resetForm = () => {
    methods.reset(defaultValues);
  };

  const { mutate, isPending } = useUpdateUsername();

  const onSubmit = (data: UpdateUsernameRequest) => {
    if (data.newUsername === me.username) {
      handleClose();
      return;
    }

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
    resetForm,
  };
};
