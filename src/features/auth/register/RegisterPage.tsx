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
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField {...FORM_FIELDS.email} disabled={isPending} />
      <Form.TextField {...FORM_FIELDS.display_name} disabled={isPending} />
      <Form.TextField {...FORM_FIELDS.username} disabled={isPending} />
      <Form.TextField
        {...FORM_FIELDS.password}
        type="password"
        disabled={isPending}
      />
      <Form.SubmitButton disabled={isPending}>
        {LABELS.submit}
      </Form.SubmitButton>
    </Form>
  );
};
