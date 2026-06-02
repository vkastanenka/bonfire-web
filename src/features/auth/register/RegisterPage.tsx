import { Link } from "@/components";
import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./register.constants";
import { RegisterForm } from "./RegisterForm";

export const RegisterPage = () => {
  return (
    <AuthLayout title={LABELS.title}>
      <RegisterForm />
      <Link.Text to={PATHS.login.path}>{PATHS.login.label}</Link.Text>
    </AuthLayout>
  );
};
