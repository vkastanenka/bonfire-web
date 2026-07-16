import { Link, Text } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../auth-layout";
import { LABELS } from "./forgot-password.constants";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useForgotPasswordForm } from "./useForgotPasswordForm";

export const ForgotPasswordPage = () => {
  const { email, methods, onSubmit, isPending } = useForgotPasswordForm();

  if (email) {
    return (
      <AuthLayout title={LABELS.titleSuccess} subtitle={LABELS.subtitleSuccess}>
        <Text>
          If an account exists for <strong>{email}</strong>, we have sent
          instructions to reset your password. Please check your inbox (and your
          spam folder!).
        </Text>
        <Link.Text to={PATHS.login}>{LABELS.loginSuccess}</Link.Text>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <ForgotPasswordForm
        methods={methods}
        onSubmit={onSubmit}
        isPending={isPending}
      />
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};
