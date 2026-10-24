import { Link, Text } from "@/components";
import Alert from "@mui/material/Alert";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { LABELS } from "./verify.constants";
import { getRouteApi } from "@tanstack/react-router";
import { useVerifyEmail } from "@/bonfire";
import { useEffect, useRef } from "react";

const routeApi = getRouteApi("/_public/verify");

export const VerifyPage = () => {
  const { token } = routeApi.useSearch();

  const { mutate, isPending, isSuccess } = useVerifyEmail();

  const hasTriggered = useRef(false);

  useEffect(() => {
    if (token && !hasTriggered.current) {
      hasTriggered.current = true;
      mutate({ token });
    }
  }, [token, mutate]);

  return (
    <AuthLayout title={LABELS.title}>
      {isPending && !isSuccess && <Text>Verifying your email address...</Text>}
      {isSuccess && <Alert severity="success">{LABELS.success}</Alert>}
      <Link.Text to={PATHS.login}>{LABELS.login}</Link.Text>
    </AuthLayout>
  );
};
