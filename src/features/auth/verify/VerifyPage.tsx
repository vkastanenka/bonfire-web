import { Link, Text } from "@/components";
import Alert from "@mui/material/Alert";
import { PATHS } from "@/constants";
import { AuthLayout } from "../AuthLayout";
import { LABELS } from "./verify.constants";
import { getRouteApi } from "@tanstack/react-router";
import { useVerifyEmail } from "@/bonfire";
import { useEffect, useRef, useState } from "react";

const routeApi = getRouteApi("/verify");

export const VerifyPage = () => {
  const { token } = routeApi.useSearch();

  const [isPending, setIsPending] = useState<boolean>(!!token);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const { mutate } = useVerifyEmail({
    onMutate: () => setIsPending((prevState) => !prevState),
    onSuccess: () => setIsSuccess((prevState) => !prevState),
    onError: () => setIsError((prevState) => !prevState),
  });

  const hasTriggered = useRef(false);

  useEffect(() => {
    if (token && !hasTriggered.current) {
      hasTriggered.current = true;
      mutate({ token });
    }
  }, [token, mutate]);

  return (
    <AuthLayout title={LABELS.title}>
      {isPending && <Text>{LABELS.pending}</Text>}
      {isSuccess && <Alert severity="success">{LABELS.success}</Alert>}
      {isError && <Alert severity="error">{LABELS.error}</Alert>}
      {!token && <Alert severity="warning">{LABELS.missing}</Alert>}
      <Link.Text to={PATHS.login} disabled={isPending}>
        {LABELS.login}
      </Link.Text>
    </AuthLayout>
  );
};
