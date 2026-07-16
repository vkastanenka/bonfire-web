import { Form } from "@/components";
import { LABELS, FORM_FIELDS } from "./reset-password.constants";
import type { UseFormReturn } from "react-hook-form";
import type { TResetPasswordForm } from "./useResetPasswordForm";

interface ResetPasswordFormProps {
  methods: UseFormReturn<TResetPasswordForm>;
  onSubmit: (data: TResetPasswordForm) => void;
  isPending: boolean;
}

export const ResetPasswordForm = ({
  methods,
  onSubmit,
  isPending,
}: ResetPasswordFormProps) => {
  return (
    <Form methods={methods} onSubmit={onSubmit}>
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
