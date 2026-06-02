import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./reset-password.constants";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const ResetPasswordPage = () => {
  return (
    <AuthLayout
      title={LABELS.title}
      subtitle={LABELS.subtitle}
      footerLink={PATHS.login}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};
