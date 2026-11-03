import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateEmailRequest,
  updateEmailRequestSchema,
  // useAuthStore,
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
  email: {
    name: "email",
    id: "email-input",
    label: labels.email,
    required: true,
    autoComplete: "email",
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

interface UpdateEmailProps {
  open: boolean;
  handleClose: () => void;
  currentEmail: string;
}

export const UpdateEmail = ({
  open,
  handleClose,
  currentEmail,
}: UpdateEmailProps) => {
  const { methods, onSubmit, isPending } = useUpdateEmailForm({
    currentEmail,
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
          <Form.TextField {...formFields.email} />
          <Form.TextField {...formFields.currentPassword} />
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
};

const useUpdateEmailForm = ({ currentEmail }: { currentEmail: string }) => {
  // const me = useAuthStore((state) => state.me);

  const methods = useForm<UpdateEmailRequest>({
    resolver: zodResolver(updateEmailRequestSchema),
    defaultValues: {
      newEmail: currentEmail,
      password: "",
    },
  });

  const { mutate, isPending } = useUpdateEmail();

  const onSubmit = (data: UpdateEmailRequest) => {
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
