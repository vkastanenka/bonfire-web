import { Link } from "@/components";
import { PATHS } from "@/constants";
import { AuthLayout } from "../auth-layout";
import { LABELS } from "./reset-password.constants";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { useResetPasswordForm } from "./useResetPasswordForm";
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/_public/reset-password");

export const ResetPasswordPage = () => {
  const { token } = routeApi.useSearch();
  const { methods, onSubmit, isPending } = useResetPasswordForm(token || "");
  return (
    <AuthLayout title={LABELS.title} subtitle={LABELS.subtitle}>
      <ResetPasswordForm
        methods={methods}
        onSubmit={onSubmit}
        isPending={isPending}
      />
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};
