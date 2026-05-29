import { useLoginForm } from "@/features/auth/login/useLoginForm";
import { LoginView } from "@/features/auth/login/LoginView";

export const LoginPage = () => {
  const formProps = useLoginForm();
  return <LoginView {...formProps} />;
};
