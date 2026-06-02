import { Form, Link } from "@/components";
import { useLoginForm } from "./useLoginForm";
import { LABELS, FORM_FIELDS, PATHS } from "./login.constants";

export const LoginForm = () => {
  const { methods, onSubmit } = useLoginForm();
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField {...FORM_FIELDS.email} />
      <Form.TextField {...FORM_FIELDS.password} type="password" />
      <Link.Text to={PATHS.forgotPassword.path}>
        {PATHS.forgotPassword.label}
      </Link.Text>
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
