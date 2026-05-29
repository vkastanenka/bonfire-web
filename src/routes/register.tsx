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
} from "@mui/material";

const formSchema = z.object({
  email: z.email(),
  displayName: z.string().min(6, "Display Name must be at least 6 characters long"),
  username: z.string().min(6, "Username must be at least 6 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormInputs = z.infer<typeof formSchema>;

const RegisterPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      username: "",
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
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        Create an account
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
          name="displayName"
          control={control}
          render={({ field }) => (
            <Stack spacing={1}>
              <InputLabel
                htmlFor="displayName-input"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                Display Name
              </InputLabel>
              <TextField
                {...field}
                id="displayName-input"
                variant="outlined"
                fullWidth
                error={!!errors.displayName}
                helperText={errors.displayName?.message}
              />
            </Stack>
          )}
        />
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <Stack spacing={1}>
              <InputLabel
                htmlFor="username-input"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                Username
              </InputLabel>
              <TextField
                {...field}
                id="username-input"
                variant="outlined"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
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
          Create Account
        </Button>
      </Stack>
      <Link underline="none" variant="body2">
        Already have an account? Log in
      </Link>
    </Stack>
  );
};

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});
