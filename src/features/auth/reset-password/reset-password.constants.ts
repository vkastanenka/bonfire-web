export const LABELS = {
  title: "Reset your password",
  subtitle: "Enter a new password for your account.",
  password: "Password",
  submit: "Reset password",
} as const;

export const PATHS = {
  login: {
    label: "Don't need to reset your password? Log in",
    path: "/login",
  },
} as const;

export const VALIDATION_LABELS = {
  password: "Password must be at least 6 characters long",
} as const;
