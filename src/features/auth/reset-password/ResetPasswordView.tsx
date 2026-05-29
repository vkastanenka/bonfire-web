import { Link as RouterLink } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import SvgIcon from "@mui/material/SvgIcon";
import BfLogotype from "@/assets/icons/bf-logotype.svg?react";
import { useResetPasswordForm } from "./useResetPasswordForm";
import { LABELS } from "./reset-password.constants";
import { ResetPasswordTextField } from "./ResetPasswordTextField";

type ResetPasswordViewProps = ReturnType<typeof useResetPasswordForm>;

export const ResetPasswordView = ({
  control,
  handleSubmit,
  // errors,
  isSubmitting,
}: ResetPasswordViewProps) => {
  return (
    <Stack spacing={2.5}>
      <SvgIcon
        component={BfLogotype}
        inheritViewBox
        sx={{
          fontSize: "inherit",
          height: "40px",
          width: "auto",
        }}
      />
      <Stack spacing={1} sx={{ textAlign: "center" }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
          {LABELS.title}
        </Typography>
        <Typography>{LABELS.subtitle}</Typography>
      </Stack>
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={handleSubmit}
        sx={{ width: "100%" }}
      >
        <ResetPasswordTextField
          name="password"
          id="password-input"
          label={LABELS.password}
          control={control}
        />
        <Button
          type="submit"
          variant="contained"
          loading={isSubmitting}
          aria-busy={isSubmitting}
        >
          {LABELS.submit}
        </Button>
      </Stack>
      <Link component={RouterLink} to="/login" variant="body2">
        {LABELS.login}
      </Link>
    </Stack>
  );
};
