import Button from "@mui/material/Button";
import { Form, Link, TextInput } from "@/components";
import { AuthLayout } from "../auth-layout";
import { useLoginForm } from "./useLoginForm";
import { LABELS, PATHS } from "./login.constants";

type LoginViewProps = ReturnType<typeof useLoginForm>;

export const LoginView = ({
  control,
  handleSubmit,
  isSubmitting,
}: LoginViewProps) => {
  return (
    <AuthLayout
      title={LABELS.title}
      subtitle={LABELS.subtitle}
      footerLink={PATHS.register}
    >
      <Form onSubmit={handleSubmit}>
        <TextInput
          name="email"
          id="email-input"
          label={LABELS.email}
          control={control}
        />
        <TextInput
          name="password"
          id="password-input"
          type="password"
          label={LABELS.password}
          control={control}
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
