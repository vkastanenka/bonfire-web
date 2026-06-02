import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./register.constants";
import { RegisterForm } from "./RegisterForm";

export const RegisterPage = () => {
  return (
    <AuthLayout title={LABELS.title} footerLink={PATHS.login}>
      <RegisterForm />
    </AuthLayout>
  );
};
