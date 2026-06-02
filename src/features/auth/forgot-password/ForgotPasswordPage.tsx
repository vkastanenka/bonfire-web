import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./forgot-password.constants";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      title={LABELS.title}
      subtitle={LABELS.subtitle}
      footerLink={PATHS.login}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};
