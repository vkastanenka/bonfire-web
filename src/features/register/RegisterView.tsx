import { Link as RouterLink } from "@tanstack/react-router";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import SvgIcon from "@mui/material/SvgIcon";
import BfLogotype from "@/assets/icons/bf-logotype.svg?react";
import { useRegisterForm } from "./useRegisterForm";
import { LABELS } from "./register.constants";
import { RegisterTextField } from "./RegisterTextField";

type RegisterViewProps = ReturnType<typeof useRegisterForm>;

export const RegisterView = ({
  control,
  handleSubmit,
  // errors,
  isSubmitting,
}: RegisterViewProps) => {
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
        <RegisterTextField
          name="email"
          id="email-input"
          label={LABELS.email}
          control={control}
        />
        <RegisterTextField
          name="displayName"
          id="displayName-input"
          label={LABELS.displayName}
          control={control}
        />
        <RegisterTextField
          name="username"
          id="username-input"
          label={LABELS.username}
          control={control}
        />
        <RegisterTextField
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
      <Link component={RouterLink} to="/login" variant="body2">
        {LABELS.login}
      </Link>
    </Stack>
  );
};
