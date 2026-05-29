import { createFileRoute } from "@tanstack/react-router";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormInputs = z.infer<typeof formSchema>;

const LoginPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormInputs) => {
    // Fake API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form Data submitted successfully:", data);
  };

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
        Welcome back!
      </Typography>
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={handleSubmit(onSubmit)}
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
                Email Address
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
                Password
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
          Log In
        </Button>
      </Stack>
      <Link underline="none" variant="body2">
        Need an account? Register
      </Link>
    </Stack>
  );
};

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
