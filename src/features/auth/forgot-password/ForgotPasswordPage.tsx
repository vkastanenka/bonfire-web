import { Link } from "@/components";
import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./forgot-password.constants";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const ForgotPasswordPage = () => {
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <ForgotPasswordForm />
      <Link.Text to={PATHS.login.path}>{PATHS.login.label}</Link.Text>
    </AuthLayout>
  );
};
