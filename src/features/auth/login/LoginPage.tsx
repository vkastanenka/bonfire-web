import { Link } from "@/components";
import { AuthLayout } from "../components";
import { LABELS, PATHS } from "./login.constants";
import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <LoginForm />
      <Link.Text to={PATHS.register.path}>{PATHS.register.label}</Link.Text>
    </AuthLayout>
  );
};
