import { Link } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../auth-layout";
import { LABELS } from "./login.constants";
import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <LoginForm />
      <Link.Text to={PATHS.register}>{LABELS.register}</Link.Text>
    </AuthLayout>
  );
};
