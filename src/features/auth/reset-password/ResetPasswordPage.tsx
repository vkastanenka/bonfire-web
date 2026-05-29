import { useResetPasswordForm } from "./useResetPasswordForm";
import { ResetPasswordView } from "./ResetPasswordView";

export const ResetPasswordPage = () => {
  const formProps = useResetPasswordForm();
  return <ResetPasswordView {...formProps} />;
};
