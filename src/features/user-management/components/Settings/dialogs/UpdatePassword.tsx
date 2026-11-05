import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdatePasswordRequest,
  updatePasswordRequestSchema,
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
    type: "password",
    label: labels.currentPassword,
    required: true,
    autoComplete: "current-password",
  },
  {
    name: "newPassword",
    id: "newPassword-input",
    type: "password",
    label: labels.newPassword,
    required: true,
    autoComplete: "new-password",
  },
  {
    name: "newPasswordConfirm",
    id: "newPasswordConfirm-input",
    type: "password",
    label: labels.newPasswordConfirm,
    required: true,
    autoComplete: "new-password-confirm",
  },
];

interface UpdatePasswordProps {
  open: boolean;
  handleClose: () => void;
}

export const UpdatePassword = ({ open, handleClose }: UpdatePasswordProps) => {
  const { methods, onSubmit, isPending, resetForm } = useUpdatePasswordForm({
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
          {formFields.map((field, i) => (
            <Form.TextField key={`update-password-field-${i}`} {...field} />
          ))}
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
};

const useUpdatePasswordForm = ({
  handleClose,
}: {
  handleClose: () => void;
}) => {
  const defaultValues = {
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  };

  const methods = useForm<UpdatePasswordRequest>({
    resolver: zodResolver(updatePasswordRequestSchema),
    defaultValues,
  });

  const resetForm = () => {
    methods.reset(defaultValues);
  };

  const { mutate, isPending } = useUpdatePassword();

  const onSubmit = (data: UpdatePasswordRequest) => {
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
