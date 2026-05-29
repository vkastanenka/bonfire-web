import Button from "@mui/material/Button";
import { Form, Link } from "@/components";
import { AuthLayout } from "../auth-layout";
import { useLoginForm } from "./useLoginForm";
import { LABELS } from "./login.constants";
import { LoginTextField } from "./LoginTextField";

type LoginViewProps = ReturnType<typeof useLoginForm>;

export const LoginView = ({
  control,
  handleSubmit,
  // errors,
  isSubmitting,
}: LoginViewProps) => {
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <Form onSubmit={handleSubmit}>
        <LoginTextField
          name="email"
          id="email-input"
          label={LABELS.email}
          control={control}
        />
        <LoginTextField
          name="password"
          id="password-input"
          type="password"
          label={LABELS.password}
          control={control}
        />
        <Link.Text to="/forgot-password">{LABELS.forgotPassword}</Link.Text>
        <Button
          type="submit"
          variant="contained"
          loading={isSubmitting}
          aria-busy={isSubmitting}
        >
          {LABELS.submit}
        </Button>
      </Form>
      <Link.Text to="/register">{LABELS.register}</Link.Text>
    </AuthLayout>
  );
};
