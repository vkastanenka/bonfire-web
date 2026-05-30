import Button from "@mui/material/Button";
import { Form, TextInput } from "@/components";
import { AuthLayout } from "../auth-layout";
import { useRegisterForm } from "./useRegisterForm";
import { LABELS, PATHS } from "./register.constants";

type RegisterViewProps = ReturnType<typeof useRegisterForm>;

export const RegisterView = ({
  control,
  handleSubmit,
  isSubmitting,
}: RegisterViewProps) => {
  return (
    <AuthLayout title={LABELS.title} footerLink={PATHS.login}>
      <Form onSubmit={handleSubmit}>
        <TextInput
          name="email"
          id="email-input"
          label={LABELS.email}
          control={control}
        />
        <TextInput
          name="displayName"
          id="displayName-input"
          label={LABELS.displayName}
          control={control}
        />
        <TextInput
          name="username"
          id="username-input"
          label={LABELS.username}
          control={control}
        />
        <TextInput
          name="password"
          id="password-input"
          type="password"
          label={LABELS.password}
          control={control}
        />
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
