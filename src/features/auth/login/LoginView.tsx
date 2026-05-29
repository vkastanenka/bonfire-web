import { Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Typography,
  Stack,
  Link,
  InputLabel,
  SvgIcon,
} from "@mui/material";
import RawBfLogotype from "@/assets/icons/bonfire/logotype.svg?react";
import { useLoginForm } from "./useLoginForm";
import { LABELS } from "./login.constants";

type LoginViewProps = ReturnType<typeof useLoginForm>;

export const LoginView = ({
  control,
  handleSubmit,
  errors,
  isSubmitting,
}: LoginViewProps) => {
  return (
    <Stack spacing={2.5}>
      <SvgIcon
        component={RawBfLogotype}
        inheritViewBox
        sx={{
          fontSize: "inherit", // Prevents the default 1em/24px constraint
          height: "40px", // Set your desired height
          width: "auto", // Allows the aspect ratio from the viewBox to do its job
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
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Stack spacing={1}>
              <InputLabel
                htmlFor="email-input"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                {LABELS.email}
              </InputLabel>
              <TextField
                {...field}
                id="email-input"
                variant="outlined"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Stack>
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Stack spacing={1}>
              <InputLabel
                htmlFor="password-input"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                {LABELS.password}
              </InputLabel>
              <TextField
                {...field}
                id="password-input"
                type="password"
                variant="outlined"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Stack>
          )}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {LABELS.submit}
        </Button>
      </Stack>
      <Link underline="none" variant="body2">
        {LABELS.register}
      </Link>
    </Stack>
  );
};
