import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdatePasswordRequest,
  updatePasswordRequestSchema,
  // useAuthStore,
  useUpdatePassword,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";
import { DialogHeader, Form } from "@/components";
import { Dialog, Stack, Typography } from "@mui/material";

const labels = {
  title: "Change your password",
  subtitle: "Enter a new password and confirm your existing password.",
  currentPassword: "Current Password",
  newPassword: "New Password",
  newPasswordConfirm: "Confirm New Password",
  submit: "Update Password",
};

const formFields = [
  {
    name: "currentPassword",
    id: "currentPassword-input",
    type: "currentPassword",
    label: labels.currentPassword,
    required: true,
    autoComplete: "current-password",
  },
  {
    name: "newPassword",
    id: "newPassword-input",
    type: "newPassword",
    label: labels.newPassword,
    required: true,
    autoComplete: "new-password",
  },
  {
    name: "newPasswordConfirm",
    id: "newPasswordConfirm-input",
    type: "newPasswordConfirm",
    label: labels.newPasswordConfirm,
    required: true,
    autoComplete: "new-password-confirm",
  },
];

interface UpdatePasswordDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const UpdatePasswordDialog = ({
  open,
  handleClose,
}: UpdatePasswordDialogProps) => {
  const { methods, onSubmit, isPending } = useUpdatePasswordForm();

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
          {formFields.map((field, i) => (
            <Form.TextField key={`update-password-field-${i}`} {...field} />
          ))}
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
};

const useUpdatePasswordForm = () => {
  const methods = useForm<UpdatePasswordRequest>({
    resolver: zodResolver(updatePasswordRequestSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  const { mutate, isPending } = useUpdatePassword();

  const onSubmit = (data: UpdatePasswordRequest) => {
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
