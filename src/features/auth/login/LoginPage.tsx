import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./login.constants";
import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
  return (
    <AuthLayout
      title={LABELS.title}
      subtitle={LABELS.subtitle}
      footerLink={PATHS.register}
    >
      <LoginForm />
    </AuthLayout>
  );
};
