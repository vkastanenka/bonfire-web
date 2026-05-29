import { useLoginForm } from "./useLoginForm";
import { LoginView } from "./LoginView";

export const LoginPage = () => {
  const formProps = useLoginForm();
  return <LoginView {...formProps} />;
};
