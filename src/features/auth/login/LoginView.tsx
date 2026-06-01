import Button from "@mui/material/Button";
import { Form, Link } from "@/components";
import { AuthLayout } from "../auth-layout";
import { useLoginForm } from "./useLoginForm";
import { LABELS, PATHS } from "./login.constants";

type LoginViewProps = ReturnType<typeof useLoginForm>;

export const LoginView = ({
  formMethods,
  formState: { isSubmitting },
  onSubmit,
}: LoginViewProps) => {
  return (
    <AuthLayout
      title={LABELS.title}
      subtitle={LABELS.subtitle}
      footerLink={PATHS.register}
    >
      <Form methods={formMethods} onSubmit={onSubmit}>
        <Form.TextField name="email" id="email-input" label={LABELS.email} />
        <Form.TextField
          name="password"
          id="password-input"
          type="password"
          label={LABELS.password}
        />
        <Link.Text to="/forgot-password">{LABELS.forgotPassword}</Link.Text>
        <Button
          type="submit"
          variant="contained"
          loading={isSubmitting}
          aria-busy={isSubmitting}
        >
          {LABELS.submit}
        </Button>
      </Form>
    </AuthLayout>
  );
};
