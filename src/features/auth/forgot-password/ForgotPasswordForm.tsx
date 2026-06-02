import { Form } from "@/components";
import { useForgotPasswordForm } from "./useForgotPasswordForm";
import { LABELS, FORM_FIELDS } from "./forgot-password.constants";

export const ForgotPasswordForm = () => {
  const { methods, onSubmit } = useForgotPasswordForm();
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField {...FORM_FIELDS.email} />
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
