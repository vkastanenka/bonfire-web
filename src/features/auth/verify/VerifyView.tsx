import Alert from "@mui/material/Alert";
import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./verify.constants";

export const VerifyView = () => {
  return (
    <AuthLayout title={LABELS.title} footerLink={PATHS.login}>
      <Alert severity="success">{LABELS.success}</Alert>
    </AuthLayout>
  );
};
