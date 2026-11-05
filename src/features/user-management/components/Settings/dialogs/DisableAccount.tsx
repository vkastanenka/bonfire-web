import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Stack, Typography } from "@mui/material";
import { queryClient } from "@/app";
import {
  disableRequestSchema,
  useAuthStore,
  useDisableAccount,
  type DisableRequest,
} from "@/bonfire";
import { paths } from "@/constants";
import { DialogHeader, Form } from "@/components";
import { handleAipFieldViolations } from "@/errs";

const labels = {
  title: "Disable your account",
  subtitle:
    "Disabling means that other users will no longer be able to interact with your account. You will be logged out upon disable. Logging in re-enables your account. Continue to disable your account?",
  password: "Password",
  submit: "Disable Account",
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

interface DisableAccountProps {
  open: boolean;
  handleClose: () => void;
}

export const DisableAccount = ({ open, handleClose }: DisableAccountProps) => {
  const { methods, onSubmit, isPending, resetForm } = useDisableAccountForm();

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
            <Form.TextField key={`disable-account-field-${i}`} {...field} />
          ))}
          <Form.SubmitButton>{labels.submit}</Form.SubmitButton>
        </Form>
      </Stack>
    </Dialog>
  );
};

const useDisableAccountForm = () => {
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

  const { mutate, isPending } = useDisableAccount();

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
