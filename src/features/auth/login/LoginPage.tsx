import { Link, Form } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { LABELS, FORM_FIELDS } from "./constants";
import { useLoginForm } from "./hooks";

export const LoginPage = () => {
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <LoginForm />
      <Link.Text to={PATHS.register}>{LABELS.register}</Link.Text>
    </AuthLayout>
  );
};

export const LoginForm = () => {
  const { methods, onSubmit, isPending } = useLoginForm();
  return (
    <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
      <Form.TextField {...FORM_FIELDS.email} />
      <Form.TextField {...FORM_FIELDS.password} />
      <Link.Text to={PATHS.forgotPassword}>{LABELS.forgotPassword}</Link.Text>
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
