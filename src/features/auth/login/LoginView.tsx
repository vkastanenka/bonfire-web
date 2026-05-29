import { Link as RouterLink } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import SvgIcon from "@mui/material/SvgIcon";
import RawBfLogotype from "@/assets/icons/bonfire/logotype.svg?react";
import { useLoginForm } from "./useLoginForm";
import { LABELS } from "./login.constants";
import { LoginTextField } from "./LoginTextField";

type LoginViewProps = ReturnType<typeof useLoginForm>;

export const LoginView = ({
  control,
  handleSubmit,
  // errors,
  isSubmitting,
}: LoginViewProps) => {
  return (
    <Stack spacing={2.5}>
      <SvgIcon
        component={RawBfLogotype}
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
        <LoginTextField
          name="email"
          id="email-input"
          label={LABELS.email}
          control={control}
        />
        <LoginTextField
          name="password"
          id="password-input"
          type="password"
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
      <Link component={RouterLink} to="/register" variant="body2">
        {LABELS.register}
      </Link>
    </Stack>
  );
};
