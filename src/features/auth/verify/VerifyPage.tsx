import { Link } from "@/components";
import Alert from "@mui/material/Alert";
import { AuthLayout } from "../auth-layout";
import { LABELS, PATHS } from "./verify.constants";

export const VerifyPage = () => {
  return (
    <AuthLayout title={LABELS.title}>
      <Alert severity="success">{LABELS.success}</Alert>
      <Link.Text to={PATHS.login.path}>{PATHS.login.label}</Link.Text>
    </AuthLayout>
  );
};
