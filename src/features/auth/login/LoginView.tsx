import { AuthLayout } from "../components";
import { LABELS, PATHS } from "./login.constants";
import { LoginForm } from "./LoginForm";

export const LoginView = () => {
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
