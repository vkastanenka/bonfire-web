import { Link } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../../components";
import { LABELS } from "./reset-password.constants";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const ResetPasswordPage = () => {
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <ResetPasswordForm />
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};
