import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Stack, Typography } from "@mui/material";
import {
  disableRequestSchema,
  useAuthStore,
  useScheduleDeleteAccount,
  type DisableRequest,
} from "@/bonfire";
import { queryClient } from "@/app";
import { paths } from "@/constants";
import { DialogHeader, Form } from "@/components";
import { handleAipFieldViolations } from "@/errs";

const labels = {
  title: "Delete your account",
  subtitle:
    "Deleting means that other users will no longer be able to interact with your account. You will be logged out upon delete. Logging in re-enables your account. Failure to log in within 30 days after deleting will anonymize your account. Continue to delete your account?",
  password: "Password",
  submit: "Delete Account",
};

const formFields = [
  {
    name: "password",
    id: "password-input",
    type: "password",
    label: labels.password,
    required: true,
    autoComplete: "current-password",
  },
];

interface DeleteAccountProps {
  open: boolean;
  handleClose: () => void;
}

export const DeleteAccount = ({ open, handleClose }: DeleteAccountProps) => {
  const { methods, onSubmit, isPending, resetForm } = useDeleteAccountForm();

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
            <Form.TextField key={`delete-account-field-${i}`} {...field} />
          ))}
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
};

const useDeleteAccountForm = () => {
  const navigate = useNavigate();

  const defaultValues = {
    password: "",
  };

  const methods = useForm<DisableRequest>({
    resolver: zodResolver(disableRequestSchema),
    defaultValues,
  });

  const resetForm = () => {
    methods.reset(defaultValues);
  };

  const { mutate, isPending } = useScheduleDeleteAccount();

  const onSubmit = (data: DisableRequest) => {
    mutate(data, {
      onSuccess: () => {
        queryClient.clear();
        useAuthStore.getState().clearSession();
        navigate({ to: paths.login });
      },
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
