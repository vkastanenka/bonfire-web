import { Form } from "@/components";
import { useRegisterForm } from "./useRegisterForm";
import { LABELS, FORM_FIELDS } from "./register.constants";

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
