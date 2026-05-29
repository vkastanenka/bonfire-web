import { Link as RouterLink } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import SvgIcon from "@mui/material/SvgIcon";
import BfLogotype from "@/assets/icons/bf-logotype.svg?react";
import { useForgotPasswordForm } from "./useForgotPasswordForm";
import { LABELS } from "./forgot-password.constants";
import { ForgotPasswordTextField } from "./ForgotPasswordTextField";

type ForgotPasswordViewProps = ReturnType<typeof useForgotPasswordForm>;

export const ForgotPasswordView = ({
  control,
  handleSubmit,
  // errors,
  isSubmitting,
}: ForgotPasswordViewProps) => {
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
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        {LABELS.title}
      </Typography>
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={handleSubmit}
        sx={{ width: "100%" }}
      >
        <ForgotPasswordTextField
          name="email"
          id="email-input"
          label={LABELS.email}
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
