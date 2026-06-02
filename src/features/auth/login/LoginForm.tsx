import { Form, Link } from "@/components";
import { useLoginForm } from "./useLoginForm";
import { LABELS } from "./login.constants";

export const LoginForm = () => {
  const { methods, onSubmit } = useLoginForm();
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField name="email" id="email-input" label={LABELS.email} />
      <Form.TextField
        name="password"
        id="password-input"
        type="password"
        label={LABELS.password}
      />
      <Link.Text to="/forgot-password">{LABELS.forgotPassword}</Link.Text>
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
