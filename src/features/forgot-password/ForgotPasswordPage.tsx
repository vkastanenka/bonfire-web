import { useForgotPasswordForm } from "./useForgotPasswordForm";
import { ForgotPasswordView } from "./ForgotPasswordView";

export const ForgotPasswordPage = () => {
  const formProps = useForgotPasswordForm();
  return <ForgotPasswordView {...formProps} />;
};
