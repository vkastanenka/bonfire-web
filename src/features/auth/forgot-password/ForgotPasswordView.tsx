import Button from "@mui/material/Button";
import { Form, TextInput } from "@/components";
import { AuthLayout } from "../auth-layout";
import { useForgotPasswordForm } from "./useForgotPasswordForm";
import { LABELS, PATHS } from "./forgot-password.constants";

type ForgotPasswordViewProps = ReturnType<typeof useForgotPasswordForm>;

export const ForgotPasswordView = ({
  control,
  handleSubmit,
  isSubmitting,
}: ForgotPasswordViewProps) => {
  return (
    <AuthLayout
      title={LABELS.title}
      subtitle={LABELS.subtitle}
      footerLink={PATHS.login}
    >
      <Form onSubmit={handleSubmit}>
        <TextInput
          name="email"
          id="email-input"
          label={LABELS.email}
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
