import { Form, Link } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { LABELS, FORM_FIELDS } from "./constants";
import { useRegisterForm } from "./hooks";

export const RegisterPage = () => {
  const { methods, onSubmit, isPending } = useRegisterForm();
  return (
    <AuthLayout title={LABELS.title}>
      <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
        <Form.TextField {...FORM_FIELDS.email} />
        <Form.TextField {...FORM_FIELDS.displayName} />
        <Form.TextField {...FORM_FIELDS.username} />
        <Form.TextField {...FORM_FIELDS.password} />
        <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
      </Form>
      <Link.Text to={PATHS.login} disabled={isPending}>
        {LABELS.login}
      </Link.Text>
    </AuthLayout>
  );
};
