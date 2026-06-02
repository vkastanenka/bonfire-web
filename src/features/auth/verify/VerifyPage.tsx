import { Link } from "@/components";
import Alert from "@mui/material/Alert";
import { PATHS } from "@/constants";
import { AuthLayout } from "../auth-layout";
import { LABELS } from "./verify.constants";

export const VerifyPage = () => {
  return (
    <AuthLayout title={LABELS.title}>
      <Alert severity="success">{LABELS.success}</Alert>
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};
