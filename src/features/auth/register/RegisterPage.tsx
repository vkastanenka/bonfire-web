import { useRegisterForm } from "./useRegisterForm";
import { RegisterView } from "./RegisterView";

export const RegisterPage = () => {
  const formProps = useRegisterForm();
  return <RegisterView {...formProps} />;
};
