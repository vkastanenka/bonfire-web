import { Form, Link } from "@/components";
import { PATHS } from "@/constants";
import { LABELS, FORM_FIELDS } from "./login.constants";
import { useLoginForm } from "./useLoginForm";

export const LoginForm = () => {
  const { methods, onSubmit } = useLoginForm();
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField {...FORM_FIELDS.email} />
      <Form.TextField {...FORM_FIELDS.password} type="password" />
      <Link.Text to={PATHS.forgotPassword}>{LABELS.forgotPassword}</Link.Text>
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
