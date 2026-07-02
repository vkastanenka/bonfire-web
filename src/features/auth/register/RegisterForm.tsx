import { Form } from "@/components";
import { useRegisterForm } from "./useRegisterForm";
import { LABELS, FORM_FIELDS } from "./register.constants";

export const RegisterForm = () => {
  const { methods, onSubmit } = useRegisterForm();
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField {...FORM_FIELDS.email} />
      <Form.TextField {...FORM_FIELDS.display_name} />
      <Form.TextField {...FORM_FIELDS.username} />
      <Form.TextField {...FORM_FIELDS.password} type="password" />
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
 