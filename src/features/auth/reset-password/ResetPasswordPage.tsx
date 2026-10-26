import { getRouteApi } from "@tanstack/react-router";
import { Link, Form } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { LABELS, FORM_FIELDS } from "./constants";
import { useResetPasswordForm } from "./hooks";

const routeApi = getRouteApi("/_public/reset-password");

export const ResetPasswordPage = () => {
  const { token } = routeApi.useSearch();
  const { methods, onSubmit, isPending } = useResetPasswordForm(token ?? "");
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
        <input
          disabled
          type="text"
          name="username"
          autoComplete="username"
          style={{ display: "none" }}
          aria-hidden="true"
          tabIndex={-1}
        />
        <Form.TextField {...FORM_FIELDS.password} />
        <Form.SubmitButton>{LABELS.submit}</Form.SubmitButton>
      </Form>
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};
