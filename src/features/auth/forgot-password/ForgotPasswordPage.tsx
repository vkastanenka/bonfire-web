import { Link, Text, Form } from "@/components";
import { paths } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { FORM_FIELDS, LABELS } from "./constants";
import { useForgotPasswordForm } from "./hooks";

export const ForgotPasswordPage = () => {
  const { email, methods, onSubmit, isPending } = useForgotPasswordForm();

  if (email) {
    return (
      <AuthLayout title={LABELS.titleSuccess} subtitle={LABELS.subtitleSuccess}>
        <Text>
          If an account exists for <strong>{email}</strong>, we have sent
          instructions to reset your password. Please check your inbox (and your
          spam folder!).
        </Text>
        <Link.Text to={paths.login}>{LABELS.loginSuccess}</Link.Text>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
        <Form.TextField {...FORM_FIELDS.email} />
        <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
      </Form>
      <Link.Text to={paths.login} disabled={isPending}>
        {LABELS.login}
      </Link.Text>
    </AuthLayout>
  );
};
