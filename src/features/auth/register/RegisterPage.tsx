import { Link } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../auth-layout";
import { LABELS } from "./register.constants";
import { RegisterForm } from "./RegisterForm";

export const RegisterPage = () => {
  return (
    <AuthLayout title={LABELS.title}>
      <RegisterForm />
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};
