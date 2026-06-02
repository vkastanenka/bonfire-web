import { Form } from "@/components";
import { LABELS, FORM_FIELDS } from "./reset-password.constants";
import { useResetPasswordForm } from "./useResetPasswordForm";

export const ResetPasswordForm = () => {
  const { methods, onSubmit } = useResetPasswordForm();
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField {...FORM_FIELDS.password} type="password" />
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
