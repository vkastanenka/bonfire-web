import { Link } from "@/components";
import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./reset-password.constants";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const ResetPasswordPage = () => {
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <ResetPasswordForm />
      <Link.Text to={PATHS.login.path}>{PATHS.login.label}</Link.Text>
    </AuthLayout>
  );
};
