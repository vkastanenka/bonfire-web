import { Form } from "@/components";
import { LABELS, FORM_FIELDS } from "./forgot-password.constants";
import type { UseFormReturn } from "react-hook-form";
import type { ForgotPasswordRequest } from "@/api";

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
