import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateEmailRequest,
  updateEmailRequestSchema,
  useAuthStore,
  useUpdateEmail,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";
import { DialogHeader, Form } from "@/components";
import { Dialog, Stack, Typography } from "@mui/material";

const labels = {
  title: "Change your email",
  subtitle: "Enter a new email and your existing password.",
  email: "Email",
  currentPassword: "Current Password",
  submit: "Update Email",
};

const formFields = {
  newEmail: {
    name: "newEmail",
    id: "newEmail-input",
    label: labels.email,
    required: true,
    autoComplete: "newEmail",
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

interface UpdateEmailProps {
  open: boolean;
  handleClose: () => void;
}

export const UpdateEmail = ({ open, handleClose }: UpdateEmailProps) => {
  const { methods, onSubmit, isPending, resetForm } = useUpdateEmailForm({
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
          <Form.TextField {...formFields.newEmail} />
          <Form.TextField {...formFields.password} />
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
};

const useUpdateEmailForm = ({ handleClose }: { handleClose: () => void }) => {
  const me = useAuthStore((state) => state.me)!;

  const defaultValues = {
    newEmail: me.email,
    password: "",
  };

  const methods = useForm<UpdateEmailRequest>({
    resolver: zodResolver(updateEmailRequestSchema),
    defaultValues,
  });

  const resetForm = () => {
    methods.reset(defaultValues);
  };

  const { mutate, isPending } = useUpdateEmail();

  const onSubmit = (data: UpdateEmailRequest) => {
    if (data.newEmail === me.email) {
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
