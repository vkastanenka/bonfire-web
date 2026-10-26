import { Form, Link } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { LABELS, FORM_FIELDS } from "./constants";
import { useRegisterForm } from "./hooks";

export const RegisterPage = () => {
  return (
    <AuthLayout title={LABELS.title}>
      <RegisterForm />
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};

export const RegisterForm = () => {
  const { methods, onSubmit, isPending } = useRegisterForm();
  return (
    <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
      <Form.TextField {...FORM_FIELDS.email} />
      <Form.TextField {...FORM_FIELDS.displayName} />
      <Form.TextField {...FORM_FIELDS.username} />
      <Form.TextField {...FORM_FIELDS.password} />
      <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
    </Form>
  );
};
