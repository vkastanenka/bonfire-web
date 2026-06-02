import { Form } from "@/components";
import { useForgotPasswordForm } from "./useForgotPasswordForm";
import { LABELS } from "./forgot-password.constants";

export const ForgotPasswordForm = () => {
  const { methods, onSubmit } = useForgotPasswordForm();
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField name="email" id="email-input" label={LABELS.email} />
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
