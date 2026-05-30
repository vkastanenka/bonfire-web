import Button from "@mui/material/Button";
import { Form, TextInput } from "@/components";
import { AuthLayout } from "../auth-layout";
import { useResetPasswordForm } from "./useResetPasswordForm";
import { LABELS, PATHS } from "./reset-password.constants";

type ResetPasswordViewProps = ReturnType<typeof useResetPasswordForm>;

export const ResetPasswordView = ({
  control,
  handleSubmit,
  isSubmitting,
}: ResetPasswordViewProps) => {
  return (
    <AuthLayout
      title={LABELS.title}
      subtitle={LABELS.subtitle}
      footerLink={PATHS.login}
    >
      <Form onSubmit={handleSubmit}>
        <TextInput
          name="password"
          id="password-input"
          label={LABELS.password}
          control={control}
        />
        <Button
          type="submit"
          variant="contained"
          loading={isSubmitting}
          aria-busy={isSubmitting}
        >
          {LABELS.submit}
        </Button>
      </Form>
    </AuthLayout>
  );
};
