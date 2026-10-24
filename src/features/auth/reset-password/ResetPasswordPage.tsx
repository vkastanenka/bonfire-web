// import { getRouteApi } from "@tanstack/react-router";
import { Link, Form } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { LABELS, FORM_FIELDS } from "./constants";
// import { useResetPasswordForm } from "./hooks";

// const routeApi = getRouteApi("/_public/reset-password");

export const ResetPasswordPage = () => {
  // const { token } = routeApi.useSearch();
  // const { methods, onSubmit, isPending } = useResetPasswordForm(token || "");
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      {/* <ResetPasswordForm
        methods={methods}
        onSubmit={onSubmit}
        isPending={isPending}
      /> */}
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};

import type { UseFormReturn } from "react-hook-form";
import type { TResetPasswordForm } from "./hooks";

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
