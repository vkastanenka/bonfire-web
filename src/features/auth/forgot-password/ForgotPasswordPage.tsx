import type { UseFormReturn } from "react-hook-form";
import type { ForgotPasswordRequest } from "@/bonfire";
import { Link, Text, Form } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { FORM_FIELDS, LABELS } from "./forgot-password.constants";
import { useForgotPasswordForm } from "./useForgotPasswordForm";

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
        <Link.Text to={PATHS.login}>{LABELS.loginSuccess}</Link.Text>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <ForgotPasswordForm
        methods={methods}
        onSubmit={onSubmit}
        isPending={isPending}
      />
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};

interface ForgotPasswordFormProps {
  methods: UseFormReturn<ForgotPasswordRequest>;
  onSubmit: (data: ForgotPasswordRequest) => void;
  isPending: boolean;
}

export const ForgotPasswordForm = ({
  methods,
  onSubmit,
  isPending,
}: ForgotPasswordFormProps) => {
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Form.TextField {...FORM_FIELDS.email} disabled={isPending} />
      <Form.SubmitButton disabled={isPending}>
        {LABELS.submit}
      </Form.SubmitButton>
    </Form>
  );
};
