import { Link, Form } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { LABELS, FORM_FIELDS } from "./constants";
import { useLoginForm } from "./hooks";

export const LoginPage = () => {
  const { methods, onSubmit, isPending } = useLoginForm();

  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
        <Form.TextField {...FORM_FIELDS.email} />
        <Form.TextField {...FORM_FIELDS.password} />
        <Link.Text to={PATHS.forgotPassword}>{LABELS.forgotPassword}</Link.Text>
        <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
      </Form>
      <Link.Text to={PATHS.register} disabled={isPending}>
        {LABELS.register}
      </Link.Text>
    </AuthLayout>
  );
};
