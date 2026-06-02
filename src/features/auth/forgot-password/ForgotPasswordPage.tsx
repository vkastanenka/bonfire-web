import { Link } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../auth-layout";
import { LABELS } from "./forgot-password.constants";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const ForgotPasswordPage = () => {
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <ForgotPasswordForm />
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};
